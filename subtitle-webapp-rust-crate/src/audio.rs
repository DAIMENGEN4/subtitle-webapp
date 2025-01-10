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
    pub fn new(target_frame_size: u32) -> ProcessorOptions {
        ProcessorOptions { target_frame_size }
    }
}

#[wasm_bindgen]
pub async fn start_realtime_translate(
    url: &str,
    vad_callback: js_sys::Function,
    send_callback: js_sys::Function,
) -> Result<JsValue, String> {
    panic_utils::set_panic_hook();
    let (tx, mut rx) = tokio::sync::mpsc::channel::<Vec<f32>>(32);
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
            // web_sys::console::log_2(
            //     &"Audio buffer length: {}".into(),
            //     &audio_buffer.len().into(),
            // );
        }
    });
    let audio_context = web_sys_utils::audio_context();
    let audio_worklet = audio_context.audio_worklet().unwrap();
    js_sys_utils::try_into_result(audio_worklet.add_module(url)).await;
    let microphone_stream = get_audio_device_stream().await;
    let source_node = audio_context
        .create_media_stream_source(&microphone_stream)
        .unwrap();
    let audio_worklet_node_options = web_sys_utils::audio_worklet_node_options();
    let processor_options = ProcessorOptions::new(512);
    let js_value_processor_options = serde_wasm_bindgen::to_value(&processor_options).unwrap();
    audio_worklet_node_options.set_processor_options(Some(&js_value_processor_options.into()));
    let audio_worklet_node = web_sys_utils::audio_worklet_node_with_options(
        &audio_context,
        "AudioTranslateProcessor",
        &audio_worklet_node_options,
    );
    let message_port = audio_worklet_node.port().unwrap();
    let max_audio_gain = 2f32;
    let mut current_audio_gain = 1f32;
    let closure = Closure::wrap(Box::new(move |event: web_sys::MessageEvent| {
        let audio_frame = js_sys::Float32Array::new(&event.data()).to_vec();
        // 对当前帧进行增益
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
        // web_sys::console::log_1(&"send".into());
        tx.blocking_send(audio_frame).unwrap();
    }) as Box<dyn FnMut(_)>);
    message_port.set_onmessage(Some(closure.as_ref().unchecked_ref()));
    closure.forget();
    let destination_node = audio_context.destination();
    source_node
        .connect_with_audio_node(&audio_worklet_node)
        .unwrap();
    audio_worklet_node
        .connect_with_audio_node(&destination_node)
        .unwrap();
    Ok(JsValue::from(audio_context))
}

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

fn is_monotonically_decreasing(input: Vec<f64>, audio_tolerance: usize) -> bool {
    let n = audio_tolerance;
    let sum: f64 = input.iter().skip(n).sum();
    let avg: f64 = sum / (input.len() as f64 - n as f64);
    input[0..n].iter().all(|&x| x <= avg * 0.75f64)
}

// /// 创建一个用于处理 `web_sys::MessageEvent` 的闭包，并通过 `Closure::new` 封装返回。
// ///
// /// 1. 使用了较高级的 API `Closure::new`，内部会自动封装闭包并管理类型检查。
// /// 2. 闭包的逻辑与第一种实现相同：将 `MessageEvent` 的 `data` 属性解析为 `js_sys::Float32Array`，
// ///    并将其转换为 Rust 的 Vec，然后通过 `web_sys::console::log_2` 打印日志。
// /// 3. 返回的 `Closure` 同样是动态分发的，但是 `Closure::new` 提供了更安全和简洁的实现。
// ///
// /// # 优势
// /// - 减少了显式的 `Box::new` 调用，简化代码逻辑。
// /// - 默认更安全，适合大多数场景，不需要手动封装。
// ///
// /// # 注意
// /// - 需要确保 `Closure` 的生命周期与 JavaScript 使用闭包的生命周期一致。
// /// - 如果有更复杂的动态需求或内存管理需求，可以考虑使用 `Closure::wrap`。
// pub fn get_on_message_callback() -> Closure<dyn FnMut(web_sys::MessageEvent)> {
//     Closure::new(move |event: web_sys::MessageEvent| {
//         let data = event.data();
//         let array = js_sys::Float32Array::new(&data).to_vec();
//         web_sys::console::log_2(&"Received message: ".into(), &array.into());
//     })
// }

// /// 创建一个用于处理 `web_sys::MessageEvent` 的闭包，并通过 `Closure::wrap` 封装返回。
// ///
// /// 1. 使用了较低级的 API `Closure::wrap`，需要手动将闭包封装为 `Box`。
// /// 2. 闭包的逻辑是：将 `MessageEvent` 的 `data` 属性解析为 `js_sys::Float32Array`，
// ///    并将其转换为 Rust 的 Vec，然后通过 `web_sys::console::log_2` 打印日志。
// /// 3. 返回的 `Closure` 是动态分发的，需要正确管理其生命周期（通常要调用 `forget` 或确保它在 JavaScript 使用后被回收）。
// ///
// /// # 注意
// /// - `Closure::wrap` 通常用于手动管理内存的场景，需要开发者清楚闭包的生命周期。
// /// - 如果需要更安全的实现，推荐使用更高级的 API，如 `Closure::new`。
// pub fn get_on_message_callback() -> Closure<dyn FnMut(web_sys::MessageEvent)> {
//     Closure::wrap(Box::new(|event: web_sys::MessageEvent| {
//         let data = event.data();
//         let array = js_sys::Float32Array::new(&data).to_vec();
//         web_sys::console::log_2(&"Received message: ".into(), &array.into());
//     }))
// }
