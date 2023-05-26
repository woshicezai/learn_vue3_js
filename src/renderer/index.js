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
function createRenderer({ createElement, insert, setElementText, patchProps }) {
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
    //处理children
    if (typeof vnode.children === "string") {
      setElementText(el, vnode.children);
    } else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el);
      });
    }
    //处理props
    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key]);
      }
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

//属性设置是否使用dom值设置
function shouldSetAsProps(el, key) {
  if (key === "form" && el.tagName === "INPUT") return false;
  return key in el;
}

const { render } = createRenderer({
  createElement: (tag) => document.createElement(tag),
  insert: (el, parent, anchor = null) => parent.insertBefore(el, anchor),
  setElementText: (el, text) => (el.textContent = text),
  patchProps: (el, key, preValue, nextValue) => {
    //优先对class做特殊处理
    if (key === "class") {
      el.className = nextValue || "";
    } else if (shouldSetAsProps(el, key)) {
      //优先使用dom属性进行设置
      const type = typeof el[key]; //判断在dom上，这个属性的类型是什么
      // const value = vnode.props[key];
      if (type === "boolean" && nextValue === "") {
        el[key] = true;
      } else {
        el[key] = nextValue;
      }
    } else {
      //如果该属性在dom上没有对应的，则设置html属性值
      el.setAttribute(key, nextValue);
    }
  },
});

render(vnode, document.getElementById("app"));
