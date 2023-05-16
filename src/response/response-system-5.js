/**
 * 避免回调函数里对响应数据既读取又赋值引发的死循环问题
 */
const bucket = new WeakMap();
let activeEffect = null;
const effectStack = [];
//入口
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(activeEffect); //新增
    fn();
    effectStack.pop(); //新增
    activeEffect = effectStack[effectStack.length - 1]; //新增
  };
  effectFn.deps = [];
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
  const depsNew = new Set(deps);
  depsNew.forEach((dep) => {
    if (dep !== activeEffect) {
      //新增
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

const data = { foo: true, bar: true };
const obj = ref(data);
let temp1, temp2;

effect(() => {
  console.log("外层执行");
  obj.foo++;
});
