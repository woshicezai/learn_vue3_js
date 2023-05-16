/**
 * watch
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

function watch(respondValue, cb) {
  let getter;
  if (typeof respondValue === "function") {
    getter = respondValue;
  } else {
    getter = () => traverse(respondValue);
  }

  let oldValue, newValue;
  let cleanup;
  function onInvalidate(fn) {
    cleanup = fn;
  }
  const effectFn = effect(() => getter(), {
    lazyLoad: true, //新增
    scheduler(fn) {
      newValue = fn();
      if (cleanup) {
        cleanup();
      }
      cb(newValue, oldValue, onInvalidate); //新增
      oldValue = newValue; //新增
    },
  });

  oldValue = effectFn(); //新增
}

//进行递归的读取操作
function traverse(respondValue, seen = new Set()) {
  if (
    typeof respondValue !== "object" ||
    respondValue === null ||
    seen.has(respondValue)
  ) {
    return;
  }
  seen.add(respondValue);

  for (let key in respondValue) {
    traverse(respondValue[key], seen);
  }

  return respondValue;
}
/**
 * demo
 */

const data = { foo: 1, bar: 2 };
const obj = ref(data);

watch(
  () => obj.foo,
  (newValue, oldValue, onInvalidate) => {
    let isExpire = false;
    onInvalidate(() => {
      console.log("go there", newValue, oldValue);
      isExpire = true;
    });

    console.log("watch:" + newValue, oldValue);
  }
);

obj.foo++;
obj.foo++;

console.log(bucket.get(data));
