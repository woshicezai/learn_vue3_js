import { effect, ref } from "@vue/reactivity";

/**
 * 简易版本的渲染器
 * @param {*} domstring
 * @param {*} container
function renderer(domstring, container) {
  container.innerHTML = domstring;
}
let count = ref(1);
effect(() => {
  renderer(`<h1>${count.value}</h1>`, document.getElementById("app"));
});

document.getElementById("btn").addEventListener("click", function () {
  console.log("gggddd");
  count.value++;
});
 */

//++++++++++++++++++++++++++++++++++//
/**
 * 渲染器
 * @param {*} param0
 * @returns
 */
function createRenderer({ createElement, insert, setElementText }) {
  /**
   * 打补丁
   * @param {*} oldNode
   * @param {*} newNode
   * @param {*} container
   */
  function patch(oldNode, newNode, container) {
    if (!oldNode) {
      //意味着挂载
      mountElement(newNode, container);
    } else {
      //打补丁
    }
  }

  //挂载
  function mountElement(vnode, container) {
    const el = createElement(vnode.type);
    if (typeof vnode.children === "string") {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el);
      });
    }
    insert(el, container);
  }
  //渲染
  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container);
    } else if (container._vnode) {
      //卸载
      container.innerHTML = "";
    }
    container._vnode = vnode;
  }
  return {
    render,
  };
}

const vnode = {
  type: "div",
  children: [
    {
      type: "h1",
      children: "hello",
    },
    {
      type: "h2",
      children: "hi",
    },
  ],
};

const { render } = createRenderer({
  createElement: (tag) => document.createElement(tag),
  insert: (el, parent, anchor = null) => parent.insertBefore(el, anchor),
  setElementText: (el, text) => (el.textContent = text),
});

render(vnode, document.getElementById("app"));
