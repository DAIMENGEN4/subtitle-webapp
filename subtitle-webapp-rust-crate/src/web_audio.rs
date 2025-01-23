use wasm_bindgen::prelude::wasm_bindgen;
#[wasm_bindgen]
pub fn is_decreasing(input: Vec<f64>, tolerance: usize) -> bool {
    let sum: f64 = input.iter().skip(tolerance).sum();
    let avg: f64 = sum / (input.len() as f64 - tolerance as f64);
    input[0..tolerance].iter().all(|&x| x <= avg * 0.75f64)
}