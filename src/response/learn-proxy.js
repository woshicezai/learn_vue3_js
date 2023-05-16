let obj = {
  foot: 1,
  get bar() {
    console.error("getter", this);
    return this.foot;
  },
};

let obj_proxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.error("run here", target, key);
    // return target[key];
    return Reflect.get(target, key, receiver);
  },
  deleteProperty(target, key) {
    console.error("deleteProperty", target, key);
    // return delete target.key;
    return Reflect.deleteProperty(target, key);
  },
});

// obj_proxy.foot;
// obj_proxy.bar;
// delete obj_proxy.foot;
delete obj.foot;

console.error("end", obj, obj_proxy);
