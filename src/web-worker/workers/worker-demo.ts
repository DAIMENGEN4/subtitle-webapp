import * as wasm from "subtitle-webapp-crate";

self.onmessage = (event) => {
    // 获取从主线程发送的数据
    const data = event.data;
    console.log("Data received from main thread:", data);
    // 执行你的后台任务
    wasm.using_worker_demo();
    // 将结果发送回主线程
    postMessage("end");
};
