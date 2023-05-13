/**
 * 可调度性
 */

const bucket = new WeakMap();
let activeEffect = null;
const effectStack = [];
//入口
function effect(fn, options) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(activeEffect); //新增
    fn();
    effectStack.pop(); //新增
    activeEffect = effectStack[effectStack.length - 1]; //新增
  };
  effectFn.deps = [];
  effectFn.options = options;
  effectFn();
}
/**
 * 将对象设置为响应对象
 * @param {*} obj
 * @returns
 */
function ref(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key);
      return target[key];
    },
    set(target, key, newValue) {
      target[key] = newValue;
      trigger(target, key);
    },
  });
}
/**
 * 收集依赖
 * @param {*} target
 * @param {*} key
 */
function track(target, key) {
  if (!activeEffect) {
    return;
  }
  let depsMap = bucket.get(target);
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  //新增
  activeEffect.deps.push(deps);
}

/**
 * 触发副作用函数运行
 * @param {*} target
 * @param {*} key
 * @returns
 */
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) {
    return;
  }
  const deps = depsMap.get(key);
  if (!deps) {
    return;
  }
  const depsNew = new Set();

  deps.forEach((dep) => {
    if (dep !== activeEffect) {
      depsNew.add(dep);
    }
  });

  depsNew.forEach((dep) => {
    if (dep.options && dep.options.scheduler) {
      //新增
      dep.options.scheduler(dep);
    } else {
      dep();
    }
  });
}

function cleanup(effectFn) {
  const depsArr = effectFn.deps;
  depsArr.forEach((deps) => {
    deps.delete(effectFn);
  });
  effectFn.deps.length = [];
}

/**
 * demo
 */

const data = { foo: 1 };
const obj = ref(data);
let temp1, temp2;

const jobQueue = new Set(); //重点
let isFlushing = false;
function flushJob() {
  if (isFlushing) return;
  isFlushing = true;
  Promise.resolve()
    .then(() => {
      jobQueue.forEach((job) => {
        job();
      });
    })
    .finally(() => {
      isFlushing = false;
    });
}

effect(
  () => {
    console.log("执行");
    temp1 = obj.foo++;
  },
  {
    scheduler(fn) {
      // setTimeout(fn);
      jobQueue.add(fn);
      flushJob();
    },
  }
);

obj.foo++;
obj.foo++;

console.log("end");
