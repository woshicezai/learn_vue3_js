const data = {};
const ojb = new Proxy(data, {
  get(target, key) {},
  set(target, key, newValue) {},
});

function track(target, key) {}
