use wasm_bindgen::prelude::*;
pub async fn try_into_result(r: Result<js_sys::Promise, JsValue>) -> JsValue {
    wasm_bindgen_futures::JsFuture::from(r.unwrap())
        .await
        .unwrap()
}
