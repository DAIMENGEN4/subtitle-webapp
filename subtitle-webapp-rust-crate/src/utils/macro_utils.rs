#[macro_export]
macro_rules! console_log {
    // 处理一个参数
    ($arg1:expr) => {
        {
            use web_sys::console;
            let s1 = wasm_bindgen::JsValue::from_str(&format!("{}", $arg1));
            console::log_1(&s1);
        }
    };
    // 处理两个参数
    ($arg1:expr, $arg2:expr) => {
        {
            use web_sys::console;
            let s1 = wasm_bindgen::JsValue::from_str(&format!("{}", $arg1));
            let s2 = wasm_bindgen::JsValue::from_str(&format!("{}", $arg2));
            console::log_2(&s1, &s2);
        }
    };
    // 处理三个参数
    ($arg1:expr, $arg2:expr, $arg3:expr) => {
        {
            use web_sys::console;
            let s1 = wasm_bindgen::JsValue::from_str(&format!("{}", $arg1));
            let s2 = wasm_bindgen::JsValue::from_str(&format!("{}", $arg2));
            let s3 = wasm_bindgen::JsValue::from_str(&format!("{}", $arg3));
            console::log_3(&s1, &s2, &s3);
        }
    }
}
