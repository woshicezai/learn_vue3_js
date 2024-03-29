const bucket = new WeakMap();
let activeEffect = null;

//入口
function effect(fn) {
  activeEffect = fn;
  fn();
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
const hero = ref({
  name: "超人",
  isSuperMan: true,
  abilitys: ["射线", "飞行", "力大无穷"],
});

effect(() => {
  const name = hero.isSuperMan ? hero.name : "不是超人";
  console.log("这个人是超人吗?", name, hero.name);
});

setTimeout(() => {
  hero.isSuperMan = false;
}, 1000);

setTimeout(() => {
  hero.name = "蝙蝠侠";
}, 2000);
