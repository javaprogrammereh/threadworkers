const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const os = require("os");

userCPUCount = os.cpus().length;

const calculateFactorialWithWorker = (number) => {
  if (number === 0) {
    return 1;
  }
  return new Promise(async (parentresolve, parentreject) => {
    const numbers = [];
    for (let i = 1n; i <= number; i++) {
      numbers.push(i);
    }
    const segmentSize = Math.ceil(numbers.length / userCPUCount);
    const segments = [];
    console.log(numbers.length, userCPUCount, segmentSize);
    for (let segmentIndex = 0; segmentIndex < userCPUCount; segmentIndex++) {
      const start = segmentIndex * segmentSize;
      const end = start + segmentSize;
      const segment = numbers.slice(start, end);
      segments.push(segment);
    }
    try {
      const result = await Promise.all(
        segments.map(
          (segment) =>
            new Promise((resolve, reject) => {
              const worker = new Worker("./worker.js", {
                workerData: { segment: segment },
              });
              worker.on("message", resolve);
              worker.on("error", reject);
              worker.on("exit", (code) => {
                if (code !== 0)
                  reject(new Error(`worker stopped with exit code ${code}`));
              });
            })
        )
      );
      const finalResult = result.reduce((acc, val) => acc * val, 1n);
      parentresolve(finalResult);
    } catch (e) {
      parentreject(e);
    }
  });
};

const calculateFactorial = (number) => {
  const numbers = [];
  for (let i = 1n; i <= number; i++) {
    numbers.push(i);
  }
  return numbers.reduce((acc, val) => acc * val, 1n);
};
const run = async () => {
  const NS_PER_SEC = 1e9;
  const startTime = process.hrtime();
  const diffTime =  process.hrtime(startTime);
  const time = diffTime[0] * NS_PER_SEC + diffTime[1];

  const timeMain = await calculateFactorial(BigInt(1000));
  console.log(`Result main : ${timeMain},done in ${time} `);

  const timeWorker = await calculateFactorialWithWorker(BigInt(1000));
  console.log(`Result worker : ${timeWorker},done in ${time}`);
  const diff = timeMain - timeWorker ;
  console.log(`Difference between main and worker: ${diff/1000n}ms `);

};
run();
