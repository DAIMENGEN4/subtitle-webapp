use wasm_bindgen::prelude::*;
use web_sys::AudioNode;
use utils::devices_utils;

mod utils;

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
pub async fn using_audio_demo() -> Result<AudioNode, JsValue> {
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

// #[wasm_bindgen]
// pub async fn using_web_sys_start_recording() {
//     // 创建 AudioContext 用于音频处理
//     let context = web_sys::AudioContext::new()?;
//     // 获取麦克风流
//     let microphone_stream = media_devices_utils::get_audio_device_stream().await;
//
//     // 创建 MediaStreamSourceNode
//     let source_node = context.create_media_stream_source(&microphone_stream)?;
//
//     // 创建 AnalyserNode
//     let analyser_node = context.create_analyser()?;
//
//     // 将 MediaStreamSourceNode 连接到 AnalyserNode
//     source_node.connect_with_audio_node(&analyser_node)?;
//
//     // 将 AnalyserNode 连接到 AudioContext 的输出
//     analyser_node.connect_with_audio_node(&context.destination())?;
//
//     // 创建 Uint8Array 来存储频率数据
//     let frequency_data =
//         js_sys::Uint8Array::new_with_length(analyser_node.frequency_bin_count());
//
//     // 创建一个可变闭包的引用以实现递归调用
//     let closure: Rc<RefCell<Option<Closure<dyn FnMut()>>>> = Rc::new(RefCell::new(None));
//     let closure_clone = closure.clone();
//
//     *closure_clone.borrow_mut() = Some(Closure::wrap(Box::new(move || {
//         // 获取频率数据
//         analyser_node.get_byte_frequency_data_with_u8_array(&frequency_data);
//         // 打印频率数据
//         let length = frequency_data.length();
//         for i in 0..length {
//             let value = frequency_data.get_index(i);
//             web_sys::console::log_3(
//                 &"Frequency".into(),
//                 &JsValue::from(i),
//                 &JsValue::from(value),
//             );
//         }
//         web_sys::window()
//             .unwrap()
//             .request_animation_frame(closure.borrow().as_ref().unwrap().as_ref().unchecked_ref())
//             .unwrap();
//     }) as Box<dyn FnMut()>));
//
//     web_sys_utils::request_animation_frame(closure_clone
//         .borrow()
//         .as_ref()
//         .unwrap()
//         .as_ref()
//         .unchecked_ref())
// }
