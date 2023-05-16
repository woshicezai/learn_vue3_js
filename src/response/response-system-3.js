const bucket = new WeakMap();
let activeEffect = null;

//入口
function effect(fn) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    fn();
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
  depsNew.forEach((dep) => dep());
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
 * 外层执行 内层执行  内层执行
 * 原因是：前两个都是effect初始化时候运行输出的。
 * 原因是 activeEffect 这个全局变量，在内层effect函数执行的时候，被覆盖了，它指向的
 * 副作用函数是内层的回调。
 */

const data = { foo: true, bar: true };

const obj = ref(data);

let temp1, temp2;

effect(() => {
  console.log("外层执行");

  effect(() => {
    console.log("内层执行");
    temp2 = obj.bar;
  });

  temp1 = obj.foo;
});

setTimeout(() => {
  obj.foo = false;
}, 1000);
