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
    let closure = Closure::wrap(Box::new(move |event: web_sys::MessageEvent| {
        let data = event.data();
        let array = js_sys::Float32Array::new(&data).to_vec();
        web_sys::console::log_2(&"Received message: ".into(), &array.into());
        web_sys::console::log_2(&"Sample Rate: {}".into(), &JsValue::from(sample_rate));
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