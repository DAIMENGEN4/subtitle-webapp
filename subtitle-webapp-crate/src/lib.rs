use wasm_bindgen::prelude::*;
use web_sys::console;

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
