const obj = {
  foot: 1,
  get bar() {
    return this.foot;
  },
};

const p = new Proxy(obj, {
  get(target, key) {
    console.log("run there");
    return target[key];
  },
});

p.bar;
