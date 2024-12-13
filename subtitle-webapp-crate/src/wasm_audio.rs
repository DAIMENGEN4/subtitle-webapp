use biquad::{Biquad, Coefficients, DirectForm2Transposed, ToHertz, Type};
use dasp::Signal;
use wasm_bindgen::prelude::*;
use crate::utils::{js_sys_utils, panic_utils, web_sys_utils};

#[wasm_bindgen]
pub async fn start_realtime_translate(url: &str) {
    panic_utils::set_panic_hook();
    let audio_context = web_sys_utils::audio_context();
    let audio_worklet = audio_context.audio_worklet().unwrap();
    js_sys_utils::try_into_result(audio_worklet.add_module(url)).await;
    let microphone_stream = get_audio_device_stream().await;
    let source_node = audio_context
        .create_media_stream_source(&microphone_stream)
        .unwrap();
    let audio_worklet_node = web_sys_utils::audio_worklet_node(&audio_context, "AudioTranslateProcessor");
    let message_port = audio_worklet_node.port().unwrap();
    let sample_rate = audio_context.sample_rate();
    let mut shared_data: Vec<f32> = Vec::new();
    let mut current_gain = 1f32;
    let mut max_gain = 20f32;
    let target_sample_rate = 16000f32;
    let closure = Closure::wrap(Box::new(move |event: web_sys::MessageEvent| {
        let data = js_sys::Float32Array::new(&event.data()).to_vec();
        shared_data.extend(data);
        if shared_data.len() >= 3072 {
            web_sys::console::log_2(&"Origin Shared data length: ".into(), &shared_data.len().into());
            // 重新采样到 16000Hz
            let mut resampled = if sample_rate != target_sample_rate {
                let interpolator = dasp::interpolate::linear::Linear::new(shared_data[0], shared_data[1]);
                let source = dasp::signal::from_iter(shared_data.iter().cloned());
                let resampled = source.from_hz_to_hz(
                    interpolator,
                    sample_rate as f64,
                    target_sample_rate as f64,
                );
                resampled.take(shared_data.len() * target_sample_rate as usize / sample_rate as usize).collect()
            } else {
                shared_data.to_vec()
            };
            web_sys::console::log_2(&"Resampled Shared data length: ".into(), &resampled.len().into());
            // 重置共享数据容器
            shared_data.clear();
            // 应用带通滤波器
            apply_bandpass_filter(&mut resampled, target_sample_rate as u32, 300.0, 3000.0, 2.0);
            web_sys::console::log_2(&"Filter Resampled Shared data length: ".into(), &resampled.len().into());
            let max_abs = resampled.iter().map(|arg0: &f32| f32::abs(*arg0)).fold(0.0f32, f32::max);
            // 更新增益
            if max_abs * current_gain > 1f32 {
                current_gain = max_gain.min(0.9f32 / max_abs);
            } else if max_abs * current_gain < 0.8f32 {
                current_gain = max_gain.min(current_gain * 1.1f32);
            }
            web_sys::console::log_2(&"Current Gain: ".into(), &current_gain.into());
            // 简单的噪声降低（你可能需要使用更复杂的方法）
            let noise_reduced: Vec<i16> = resampled
                .iter()
                .map(|&sample| {
                    //todo noise_reduced
                    // if sample.abs() >= 0.008 { trace!("sample:{}",sample); }
                    // if sample.abs() < 0.008 { 0i16 } else { (sample * i16::MAX as f32) as i16 }
                    (sample * current_gain * i16::MAX as f32) as i16 // 乘以增益, 对音量进行放大
                })
                .collect();
            web_sys::console::log_2(&"Noise Reduced Shared data length: ".into(), &noise_reduced.len().into());
        }
        // web_sys::console::log_2(&"Received message: ".into(), &array.into());
        // web_sys::console::log_2(&"Sample Rate: {}".into(), &JsValue::from(sample_rate));
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
}

pub async fn get_audio_device_stream() -> web_sys::MediaStream {
    let media_devices = web_sys_utils::media_devices();
    let constraints = web_sys_utils::media_stream_constraints();
    constraints.set_audio(&wasm_bindgen::JsValue::TRUE);
    let result = media_devices.get_user_media_with_constraints(&constraints);
    let value = js_sys_utils::try_into_result(result).await;
    let result = value.dyn_into::<web_sys::MediaStream>();
    match result {
        Ok(stream) => stream,
        Err(error) => panic!("Error: {:?}", error),
    }
}

fn apply_bandpass_filter(audio: &mut [f32], sr: u32, low_freq: f32, high_freq: f32, gain: f32) {
    // 计算采样率的一半（奈奎斯特频率）
    let nyquist = sr as f32 / 2.0;
    let low_freq = (low_freq / nyquist).hz();
    let high_freq = (high_freq / nyquist).hz();
    // 创建带通滤波器的系数
    let cuffs = Coefficients::<f32>::from_params(
        Type::BandPass,
        high_freq,
        low_freq,
        std::f32::consts::FRAC_1_SQRT_2, // Q值（选择性）
    ).unwrap();
    let mut filter = DirectForm2Transposed::<f32>::new(cuffs);
    // 应用滤波器并增加增益
    for sample in audio.iter_mut() {
        *sample = filter.run(*sample) * gain;
    }
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