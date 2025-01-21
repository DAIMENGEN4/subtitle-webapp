use crate::utils::{js_sys_utils, panic_utils, web_sys_utils};
use std::collections::VecDeque;
use wasm_bindgen::closure::Closure;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::{JsCast, JsValue};

#[derive(serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProcessorOptions {
    target_frame_size: u32,
}

impl ProcessorOptions {
    pub fn new(target_frame_size: u32) -> Self {
        Self { target_frame_size }
    }
}

#[wasm_bindgen]
pub async fn start_realtime_translate(
    url: &str,
    vad_callback: js_sys::Function,
    send_callback: js_sys::Function,
) -> Result<JsValue, String> {
    panic_utils::set_panic_hook();

    let audio_context = web_sys_utils::audio_context();
    let audio_worklet = audio_context
        .audio_worklet()
        .map_err(|error| format!("Failed to get AudioWorklet. {:?}", error))?;
    js_sys_utils::try_into_result(audio_worklet.add_module(url)).await;

    let microphone_stream = get_audio_device_stream().await;
    let source_node = audio_context
        .create_media_stream_source(&microphone_stream)
        .map_err(|error| format!("Failed to create a media stream source. {:?}", error))?;

    let audio_worklet_node_options = web_sys_utils::audio_worklet_node_options();
    let processor_options = ProcessorOptions::new(512);
    let js_value_processor_options = serde_wasm_bindgen::to_value(&processor_options)
        .map_err(|error| format!("Failed to serialize ProcessorOptions. {:?}", error))?;
    audio_worklet_node_options.set_processor_options(Some(&js_value_processor_options.into()));
    let audio_worklet_node = web_sys_utils::audio_worklet_node_with_options(
        &audio_context,
        "AudioTranslateProcessor",
        &audio_worklet_node_options,
    );

    let message_port = audio_worklet_node
        .port()
        .map_err(|error| format!("Failed to get MessagePort. {:?}", error))?;
    attach_audio_frame_handler(
        message_port,
        capture_speech_frames(vad_callback, send_callback),
    );

    let destination_node = audio_context.destination();
    source_node
        .connect_with_audio_node(&audio_worklet_node)
        .map_err(|error| format!("Failed to connect source node. {:?}", error))?;
    audio_worklet_node
        .connect_with_audio_node(&destination_node)
        .map_err(|error| format!("Failed to connect audio worklet node. {:?}", error))?;
    Ok(JsValue::from(audio_context))
}

/// 该函数用于捕获语音帧，并通过回调函数处理和发送音频数据。
/// 它会接收音频帧并使用 VAD (语音活动检测) 来判断是否包含语音活动，如果检测到有效的语音活动，会将音频帧发送出去。
///
/// # 参数
/// - `vad_callback`: 一个 JavaScript 函数，用于对每个音频帧进行语音活动检测。
/// - `send_callback`: 一个 JavaScript 函数，用于发送处理后的音频数据。
///
/// # 返回值
/// 返回一个 `tokio::sync::mpsc::Sender<Vec<f32>>` 类型的发送器，用于发送音频帧。
///
/// # 处理流程
/// 1. 启动一个异步任务来接收和处理音频帧。
/// 2. 对每个接收到的音频帧，调用 `vad_callback` 进行语音活动检测，得到语音活动的阈值。
/// 3. 将检测到的阈值和音频帧存入 `audio_buffer` 队列中。
/// 4. 在队列中保持最小数量的音频帧，并根据语音活动阈值对其进行筛选，移除不包含语音活动的帧。
/// 5. 如果队列中的音频帧数超过最小阈值，并且语音活动数据符合条件，发送音频数据并清空队列。
/// 6. 使用 `send_callback` 将处理后的音频帧发送给 JavaScript 环境。
///
/// # 备注
/// - 该函数使用了一个 `VecDeque` 队列来缓存音频帧和语音活动的阈值，以便进行进一步的处理。
/// - 队列中保持的音频帧数量由 `min_speech_frames` 控制，且只有在语音活动阈值符合条件时才会触发音频帧的发送。
/// - `is_monotonically_decreasing` 用于判断音频帧是否呈单调递减趋势，从而决定是否发送音频数据。
fn capture_speech_frames(
    vad_callback: js_sys::Function,
    send_callback: js_sys::Function,
) -> tokio::sync::mpsc::Sender<Vec<f32>> {
    let (tx, mut rx) = tokio::sync::mpsc::channel::<Vec<f32>>(2048);
    wasm_bindgen_futures::spawn_local(async move {
        let min_speech_frames = 16;
        let positive_speech_threshold = 0.75f64;
        let mut audio_buffer = VecDeque::<(f64, Vec<f32>)>::new();
        while let Some(audio_frame) = rx.recv().await {
            // 预测当前音频帧是否包含语音活动
            let js_value = vad_callback
                .call1(&JsValue::NULL, &JsValue::from(audio_frame.clone()))
                .unwrap();
            let promise = js_sys::Promise::from(js_value);
            let speech_threshold = wasm_bindgen_futures::JsFuture::from(promise).await.unwrap();
            let speech_threshold = speech_threshold.as_f64().unwrap();
            // 将预测的结果和音频帧添加到队列中
            audio_buffer.push_front((speech_threshold, audio_frame));
            while audio_buffer.len() >= min_speech_frames
                && audio_buffer
                    .iter()
                    .skip(audio_buffer.len() - min_speech_frames)
                    .filter(|(a, _)| *a < positive_speech_threshold)
                    .count()
                    >= (min_speech_frames / 2)
            {
                audio_buffer.pop_back();
            }
            // 如果队列中的音频帧超过一定数量，且新进的音频帧的语音活动阈值小于阈值，则发送音频数据，并重置缓存音频帧的队列
            if audio_buffer.len() > min_speech_frames
                && is_monotonically_decreasing(
                    audio_buffer
                        .iter()
                        .take(min_speech_frames)
                        .map(|t| t.0)
                        .collect(),
                    5,
                )
            {
                let mut audio_data = Vec::<f32>::new();
                while !audio_buffer.is_empty() {
                    let samples = audio_buffer.pop_back().unwrap().1;
                    audio_data.extend(samples);
                }
                send_callback
                    .call1(&JsValue::NULL, &JsValue::from(audio_data))
                    .unwrap();
            }
        }
    });
    tx
}

/// 改函数用于处理音频帧，它接收来自于`MessagePort`音频数据，并将处理后的音频帧发送到指定的`Sender`中。
///
/// # 参数
/// - `message_port`: 用于接收音频数据的 `MessagePort`，该端口用于监听消息事件。
/// - `tx`: 一个 `tokio` 的异步通道发送器，用于将处理后的音频帧传递出去。
///
/// # 处理流程
/// 1. 从 `MessageEvent` 中提取音频数据，并将其转换为 `Vec<f32>`。
/// 2. 计算音频帧中的最大振幅，并根据当前的增益调整音频的增益。
/// 3. 如果增益调整后，最大振幅超过 1 或低于 0.5，调整增益以限制振幅。
/// 4. 通过 `tx` 发送处理后的音频帧。
///
/// # 备注
/// - 增益的调整确保音频帧的振幅不会超过 `1.0` 或低于 `0.5`，以避免失真或过小的信号。
/// - 该函数是一个闭包，使用了 `Closure::wrap` 进行绑定，确保能够传递到 JavaScript 环境中。
fn attach_audio_frame_handler(
    message_port: web_sys::MessagePort,
    tx: tokio::sync::mpsc::Sender<Vec<f32>>,
) {
    let max_audio_gain = 1f32;
    let mut current_audio_gain = 1f32;
    let closure = Closure::wrap(Box::new(move |event: web_sys::MessageEvent| {
        let audio_frame = js_sys::Float32Array::new(&event.data()).to_vec();
        let max_amplitude = audio_frame
            .iter()
            .max_by(|a, b| a.partial_cmp(b).unwrap())
            .unwrap();
        if max_amplitude * current_audio_gain > 1f32 {
            current_audio_gain = max_audio_gain.min(0.9f32 / max_amplitude);
        } else if max_amplitude * current_audio_gain < 0.5f32 {
            current_audio_gain = max_audio_gain.max(0.5f32 / max_amplitude);
        }
        let audio_frame = audio_frame
            .iter()
            .map(|x| x * current_audio_gain)
            .collect::<Vec<_>>();
        tx.blocking_send(audio_frame).unwrap();
    }) as Box<dyn FnMut(_)>);
    message_port.set_onmessage(Some(closure.as_ref().unchecked_ref()));
    closure.forget();
}

/// 该异步函数用于获取音频设备的媒体流。
/// 它会请求浏览器权限获取用户的音频设备流，并返回一个 `MediaStream` 对象。
///
/// # 返回值
/// 返回一个 `web_sys::MediaStream` 对象，表示从音频设备捕获的媒体流。
///
/// # 处理流程
/// 1. 使用 `web_sys_utils::media_devices()` 获取媒体设备接口。
/// 2. 创建媒体流约束（`constraints`），设置音频流为 `TRUE`，以便请求音频设备。
/// 3. 调用 `get_user_media_with_constraints` 方法请求用户的媒体流，传入音频流约束。
/// 4. 等待该请求完成并获取结果，使用 `js_sys_utils::try_into_result` 处理返回的 Promise。
/// 5. 如果成功，将结果转换为 `MediaStream` 类型。
/// 6. 如果转换成功，返回 `MediaStream`；如果失败，触发 panic，输出错误信息。
///
/// # 备注
/// - 该函数会导致用户浏览器请求访问音频设备权限，且需要确保浏览器支持相关的 API。
/// - 异步操作过程中，函数会等待用户权限的响应，并在获取媒体流后返回。
async fn get_audio_device_stream() -> web_sys::MediaStream {
    let media_devices = web_sys_utils::media_devices();
    let constraints = web_sys_utils::media_stream_constraints();
    constraints.set_audio(&JsValue::TRUE);
    let result = media_devices.get_user_media_with_constraints(&constraints);
    let value = js_sys_utils::try_into_result(result).await;
    let result = value.dyn_into::<web_sys::MediaStream>();
    result.unwrap_or_else(|error| {
        panic!("Error: {:?}", error);
    })
}

/// 该函数用于检查给定的 `input` 向量的前 `n` 个元素是否单调递减。
/// 它通过与平均值比较，判断前 `n` 个元素是否小于平均值的 75% 来确定是否满足单调递减的条件。
///
/// # 参数
/// - `input`: 一个包含 `f64` 类型数值的向量，用于检查单调递减的条件。
/// - `audio_tolerance`: 一个整数，表示检查前多少个元素与平均值进行比较。
///
/// # 返回值
/// 返回一个布尔值，表示前 `n` 个元素是否单调递减。
///
/// # 处理流程
/// 1. 计算 `input` 向量从第 `n` 个元素开始的总和，得到 `sum`。
/// 2. 计算平均值 `avg`，即总和除以剩余元素的数量。
/// 3. 检查 `input` 中的前 `n` 个元素，是否都小于等于 `avg * 0.75`。
/// 4. 如果所有前 `n` 个元素满足条件，返回 `true`，否则返回 `false`。
///
/// # 备注
/// - 该函数用于检测音频数据的趋势，确保前 `n` 个元素的值在某个阈值以下，作为判断音频活动是否停止的依据。
/// - `audio_tolerance` 参数控制了检测的宽松程度，通过调整它可以改变判断的敏感度。
fn is_monotonically_decreasing(input: Vec<f64>, audio_tolerance: usize) -> bool {
    let n = audio_tolerance;
    let sum: f64 = input.iter().skip(n).sum();
    let avg: f64 = sum / (input.len() as f64 - n as f64);
    input[0..n].iter().all(|&x| x <= avg * 0.75f64)
}
