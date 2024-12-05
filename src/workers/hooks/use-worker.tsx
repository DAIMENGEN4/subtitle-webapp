import React, {useEffect, useState} from "react";

export const useWorker: React.FC<{
    workerPath: URL,
    initialData?: string
}> = ({workerPath, initialData}) => {
    const [result, setResult] = useState(null);
    useEffect(() => {
        const worker = new Worker(workerPath, {
            type: "module",
        });
        worker.onmessage = (event) => {
            setResult(event.data);
        };
        worker.postMessage(initialData);
        return () => {
            worker.terminate();
        };
    }, [workerPath, initialData]);
    return result;
}