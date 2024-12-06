use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct AudioProcessor(pub Box<dyn FnMut(&mut [f32]) -> bool>);

#[wasm_bindgen]
impl AudioProcessor {

    // 处理音频样本的函数
    // `buf` 是一个可变引用，表示音频样本数据
    // 返回一个布尔值，表示处理是否成功
    pub fn process(&mut self, buf: &mut [f32]) -> bool {
        // 调用封装在闭包中的音频处理函数
        self.0(buf)
    }

    // 将当前的 `WasmAudioProcessor` 结构体打包成原始指针
    // 返回一个 `usize`，它是结构体的内存地址，通常用于跨界面传递（如 JS 和 Rust 之间）
    pub fn pack(self) -> usize {
        // 将结构体 `self` 放入一个 `Box` 中，并转换成原始指针
        Box::into_raw(Box::new(self)) as usize
    }

    // 从 `usize` 类型的原始指针恢复 `WasmAudioProcessor` 结构体
    // `val` 是一个 `usize`，表示一个结构体的内存地址
    // 这个方法是 `pack` 的逆操作
    pub unsafe fn unpack(val: usize) -> Self {
        // 从原始指针 `val` 恢复 `WasmAudioProcessor` 结构体
        *Box::from_raw(val as *mut _)
    }
}