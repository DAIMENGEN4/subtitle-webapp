use wasm_bindgen::prelude::*;

/// 这是一种不太优雅的方法，用于在 Rust 中获取当前 bindgen ES 模块的 URL。
/// 这种方法在不是使用 ES 模块的 bindgen 目标上运行时会失败。
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen]
    type ImportMeta;

    #[wasm_bindgen(method, getter)]
    fn url(this: &ImportMeta) -> js_sys::JsString;

    #[wasm_bindgen(thread_local_v2, js_namespace = import, js_name = meta)]
    static IMPORT_META: ImportMeta;
}


pub fn on_the_fly(code: &str) -> Result<String, JsValue> {
    // Generate the import of the bindgen ES module
    let import_statement = format!("import init, * as bindgen from '{}';\n\n", IMPORT_META.with(ImportMeta::url));
    let options = web_sys::BlobPropertyBag::new();
    options.set_type("text/javascript");
    web_sys::Url::create_object_url_with_blob(&web_sys::Blob::new_with_str_sequence_and_options(
        &js_sys::Array::of2(&JsValue::from(import_statement.as_str()), &JsValue::from(code)),
        &options,
    )?)
}

/// `dependent_module!` 宏接受一个本地 JS 模块文件的文件名作为输入，
/// 并在运行时返回一个稍微修改过的模块的 URL。这个修改过的模块在头部
/// 添加了一个额外的 `import` 语句，用于导入当前的 `bindgen` JS 模块，
/// 并使用 `bindgen` 作为别名，同时包含一个独立的初始化函数。
/// 生成这个 URL 的方式对宏的使用者来说并不重要。`on_the_fly` 会在
/// 运行时创建一个 blob URL。一个更好、更复杂的解决方案是，
/// 在构建时通过 `wasm_bindgen` 支持将模块放到 `pkg/` 目录中，并
/// 返回指向这个文件的 URL（在 #3019 中有描述）。
#[macro_export]
macro_rules! dependent_module {
    ($file_name:expr) => {
        $crate::dependent_module::on_the_fly(include_str!($file_name))
    };
}
