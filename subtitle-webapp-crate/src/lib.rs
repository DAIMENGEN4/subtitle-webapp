use utils::devices_utils;
use utils::panic_utils;
use wasm_bindgen::prelude::*;
use utils::web_sys_utils;
use crate::utils::js_sys_utils;

mod dependent_module;
mod utils;
mod wasm;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, subtitle-webapp-crate!");
}

/// 这是一个 Demo 方法，主要目的是把从麦克风输入的声音在传回给麦克风
#[wasm_bindgen]
pub async fn using_audio_demo() -> Result<web_sys::AudioNode, JsValue> {
    console_log!("using_audio_demo");
    // 创建 AudioContext 用于音频处理
    let audio_context = web_sys::AudioContext::new()?;
    // 获取麦克风流
    let microphone_stream = devices_utils::get_audio_device_stream().await;
    // 创建 MediaStreamSourceNode
    let source_node = audio_context.create_media_stream_source(&microphone_stream)?;
    // 创建 AnalyserNode
    let analyser_node = audio_context.create_analyser()?;
    // 创建 AudioDestinationNode
    let destination_node = audio_context.destination();
    // 将 MediaStreamSourceNode 连接到 AnalyserNode
    source_node.connect_with_audio_node(&analyser_node)?;
    // 将 AnalyserNode 连接到 AudioContext 的输出
    analyser_node.connect_with_audio_node(&destination_node)
}

/// 这是一个 Demo 方法，主要目的是演示如何在 WebAssembly 中使用 tokio 的消息传递的功能
#[wasm_bindgen]
pub fn using_worker_demo() {
    console_log!("using_worker_demo");
    // 创建一个消息通道
    let (tx, mut rx) = tokio::sync::mpsc::channel::<String>(32);

    // 创建一个异步任务，用于接收消息
    wasm_bindgen_futures::spawn_local(async move {
        while let Some(message) = rx.recv().await {
            console_log!("Received message: {}", message);
        }
    });

    // 创建一个异步任务，用于发送消息
    wasm_bindgen_futures::spawn_local(async move {
        loop {
            // 发送消息
            tx.send("Hello from Rust!".to_string()).await.unwrap();
        }
    });
}

#[wasm_bindgen]
pub async fn using_audio_stream() -> Result<web_sys::AudioNode, JsValue> {
    console_log!("using_audio_stream");
    panic_utils::set_panic_hook();
    let audio_context = web_sys::AudioContext::new()?;
    let worklet_url = dependent_module!("worklet.js")?;
    js_sys_utils::try_into_result(audio_context.audio_worklet()?.add_module(&worklet_url)).await;
    let worklet_node_options = web_sys_utils::audio_worklet_node_options();
    worklet_node_options.set_processor_options(Some(&js_sys::Array::of3(
        &wasm_bindgen::module(),
        &wasm_bindgen::memory(),
        &wasm::audio_processor::AudioProcessor(Box::new(move |buf| {
            console_log!("Processing audio buffer: ", buf.iter().map(|&x| format!("{:.2}", x)).collect::<Vec<String>>().join(", "));
            true
        })).pack().into(),
    )));
    let audio_worklet_node = web_sys_utils::audio_worklet_node_with_options(&audio_context, "AudioProcessor", &worklet_node_options);
    let microphone_stream = devices_utils::get_audio_device_stream().await;
    let source_node = audio_context.create_media_stream_source(&microphone_stream)?;
    let analyser_node = audio_context.create_analyser()?;
    let destination_node = audio_context.destination();
    source_node.connect_with_audio_node(&analyser_node)?;
    analyser_node.connect_with_audio_node(&audio_worklet_node)?;
    audio_worklet_node.connect_with_audio_node(&destination_node)
}
