const bucket = new WeakMap();
let activeEffect = null;

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

function effect(fn) {
  activeEffect = fn;
  fn();
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
  deps.forEach((dep) => dep());
}

/**
 * demo
 */
const data = ref({
  name: "超人",
  abilitys: ["射线", "飞行", "力大无穷"],
});

effect(() => {
  const name = data.name;
  console.log("这个人的名字叫:", name);
});

setTimeout(() => {
  data.name = "蝙蝠侠";
}, 1000);
