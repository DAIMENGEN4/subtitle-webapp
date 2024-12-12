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
    let closure = Closure::wrap(Box::new(|event: web_sys::MessageEvent| {
        let data = event.data();
        let array = js_sys::Float32Array::new(&data).to_vec();
        web_sys::console::log_2(&"Received message: ".into(), &array.into());
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