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
 */
const hero = ref({
  name: "超人",
  isSuperMan: true,
  abilitys: ["射线", "飞行", "力大无穷"],
});

effect(() => {
  const name = hero.isSuperMan ? hero.name : "不是超人";
  console.log("这个人是超人吗?", name);
});

setTimeout(() => {
  hero.isSuperMan = false;
}, 1000);

setTimeout(() => {
  hero.name = "蝙蝠侠";
}, 2000);
