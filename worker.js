const {parentPort,workerData}=require('worker_threads');
const calculateFactorial = (numArray) =>{
    const result = numArray.reduce((acc, val) => acc * val, 1n);
    return result;
}; 
parentPort.postMessage(calculateFactorial(workerData.segment));
