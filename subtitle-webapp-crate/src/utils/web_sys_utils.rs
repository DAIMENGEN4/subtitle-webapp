/// https://developer.mozilla.org/zh-CN/docs/Web/API/Window
pub fn window() -> web_sys::Window {
    match web_sys::window() {
        Some(window) => window,
        None => panic!("Failed to access the window object; ensure this code runs in a browser context."),
    }
}

/// https://developer.mozilla.org/zh-CN/docs/Web/API/Navigator
pub fn navigator() -> web_sys::Navigator {
    window().navigator()
}

/// https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices
pub fn media_devices() -> web_sys::MediaDevices {
    let result = navigator().media_devices();
    match result {
        Ok(media_devices) => media_devices,
        Err(error) => panic!("Cannot retrieve media devices from the navigator. {:?}", error),
    }
}

/// https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia
pub fn media_stream_constraints() -> web_sys::MediaStreamConstraints {
    web_sys::MediaStreamConstraints::new()
}

/// https://developer.mozilla.org/zh-CN/docs/Web/API/AudioWorkletNode
pub fn audio_worklet_node(context: &web_sys::BaseAudioContext, name: &str) -> web_sys::AudioWorkletNode {
    let result = web_sys::AudioWorkletNode::new(context, name);
    match result {
        Ok(node) => node,
        Err(error) => panic!("Failed to create an AudioWorkletNode. {:?}", error),
    }
}

/// https://developer.mozilla.org/zh-CN/docs/Web/API/AudioWorkletNode
pub fn audio_worklet_node_with_options(context: &web_sys::BaseAudioContext, name: &str, options: &web_sys::AudioWorkletNodeOptions) -> web_sys::AudioWorkletNode {
    let result = web_sys::AudioWorkletNode::new_with_options(context, name, options);
    match result {
        Ok(node) => node,
        Err(error) => panic!("Failed to create an AudioWorkletNode. {:?}", error),
    }
}

/// https://udn.realityripple.com/docs/Web/API/AudioWorkletNodeOptions
/// https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode
pub fn audio_worklet_node_options() -> web_sys::AudioWorkletNodeOptions {
    web_sys::AudioWorkletNodeOptions::new()
}


/// https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext
pub fn audio_context() -> web_sys::AudioContext {
    let result = web_sys::AudioContext::new();
    match result {
        Ok(context) => context,
        Err(error) => panic!("Failed to create an AudioContext. {:?}", error),
    }
}