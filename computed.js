/**
 * computed
 */

const bucket = new WeakMap();
let activeEffect = null;
const effectStack = [];
//入口
function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(activeEffect);
    const res = fn(); //新增
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return res; //新增
  };
  effectFn.deps = [];
  effectFn.options = options;
  if (!options.lazyLoad) {
    //新增
    effectFn();
  }
  return effectFn; //新增
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

function computed(getter) {
  let value;
  let dirty = true; //用来标识是否需要重新计算，默认true为重新计算
  const effectFn = effect(getter, {
    //新增
    lazyLoad: true,
    scheduler(fn) {
      dirty = true;
      trigger(obj, "value");
    },
  });

  //这个就是计算属性
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn();
        dirty = false;
      }
      track(obj, "value"); //新增：将obj这个计算属性和 上面的effect执行时决定的副作用函数，即getter，关联到一起了。
      return value;
    },
  };
  return obj;
}

/**
 * demo
 */

const data = { foo: 1, bar: 2 };
const obj = ref(data);

const sumRes = computed(() => obj.foo + obj.bar);

console.log(sumRes.value);

effect(() => {
  console.log("执行sumRes的副作用回调" + sumRes.value);
});

obj.foo++;
