use js_sys::Promise;
use wasm_bindgen::prelude::*;
use web_sys::{console, window, MediaStreamConstraints};

mod utils;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, subtitle-webapp-crate!");
}

#[wasm_bindgen]
pub fn using_web_sys_console_log_1(s: JsValue) {
    console::log_1(&s);
}

#[wasm_bindgen]
pub fn using_web_sys_console_log_2(s: JsValue, js: JsValue) {
    console::log_2(&s, &js);
}

#[wasm_bindgen]
pub fn using_web_sys_get_input_device() -> Promise {
    // 获取 `window` 对象
    let window = window().expect("window is not defined");
    // 获取媒体设备接口
    let media_devices = window.navigator().media_devices().unwrap();
    let promise = media_devices.enumerate_devices().expect("enumerate_devices failed");
    promise
}

#[wasm_bindgen]
pub fn using_web_sys_get_user_media() -> Promise {
    // 获取 `window` 对象
    let window = window().expect("window is not defined");
    // 获取媒体设备接口
    let media_devices = window.navigator().media_devices().unwrap();
     // 创建媒体流约束，请求音频权限
    let constraints = MediaStreamConstraints::new();
    constraints.set_audio(&JsValue::TRUE);
    // 获取用户媒体权限，并返回 Promise
    let promise = media_devices.get_user_media_with_constraints(&constraints).expect("getUserMedia failed");
    promise
}