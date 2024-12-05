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

// /// https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame
// pub fn request_animation_frame(callback: &::js_sys::Function) {
//     let result = window().request_animation_frame(callback);
//     if let Err(error) = result {
//         panic!("Failed to request animation frame. {:?}", error);
//     }
// }