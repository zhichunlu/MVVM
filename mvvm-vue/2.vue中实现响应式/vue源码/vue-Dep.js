/* 
Vue 初始化时在哪里对数据进行观察
https://github.com/vuejs/vue/blob/dev/src/core/instance/lifecycle.js
*/

updateComponent = () => {
    // vm._render 会根据我们的html模板和vm上的数据生成一个 新的 VNode
    // vm._update 会将新的 VNode 与 旧的 Vnode 进行对比，执行 __patch__ 方法打补丁，并更新真实 dom
    // 初始化时，肯定没有旧的 Vnode 咯，这个时候就会全量更新 dom
    vm._update(vm._render(), hydrating) 
}

// 当 new Watcher 时，会执行 updateComponent ，
// 执行 updateComponent 函数会访问 data 中的数据，相当于触发 data 中数据的 get 属性
// 触发 data 中数据的 get 属性，就相当于触发了 依赖收集 
new Watcher(vm, updateComponent, noop, {
    before () {
        if (vm._isMounted) {
            callHook(vm, 'beforeUpdate')
        }
    }
}, true /* isRenderWatcher */)


/**
 dep是可观测的，可以有多个订阅它的指令
 Dep 是一个类，用于依赖收集和派发更新，也就是存放watcher实例和触发watcher实例上的update。https://github.com/vuejs/vue/blob/dev/src/core/observer/dep.js  */

export default class Dep {
    // 定义一个 subs 数组，这个数组是用来存放 watcher 实例的
    constructor () {
        this.id = uid++
        this.subs = []
    }

    // 将 watcher 实例添加到 subs 中
    addSub (sub: Watcher) {
        this.subs.push(sub)
    }

    // 从 subs 中移除对应的 watcher 实例。
    removeSub (sub: Watcher) {
        remove(this.subs, sub)
    }

    // 依赖收集，这就是我们之前看到的 dep.dpend 方法
    depend () {
        // Dep.target 是 watcher 实例
        if (Dep.target) {
        
        // 看到这里应该能明白 watcher 实例上 有一个 addDep&emsp;方法，参数是当前 dep 实例
        Dep.target.addDep(this)
        }
    }

    // 派发更新
    notify () {
        // stabilize the subscriber list first
        const subs = this.subs.slice()
        if (process.env.NODE_ENV !== 'production' && !config.async) {
        // subs aren't sorted in scheduler if not running async
        // we need to sort them now to make sure they fire in correct
        // order
        subs.sort((a, b) => a.id - b.id)
        }
        // 遍历 subs 数组，依次触发 watcher 实例的 update 
        for (let i = 0, l = subs.length; i < l; i++) {
        // 看到这里应该能明白 watcher 实例上 有一个 update&emsp;方法
        subs[i].update()
        }
    }
}
//Dep.target 表示当前正在计算的 Watcher，它是全局唯一的，因为在同一时间只能有一个 Watcher 被计算。
Dep.target = null

// 维护一个栈结构，用于存储和删除 Dep.target
const targetStack = []

// pushTarget 会在 new Watcher 时被调用
export function pushTarget (_target: ?Watcher) {
    if (Dep.target) targetStack.push(Dep.target)
    Dep.target = _target
}

// popTarget 会在 new Watcher 时被调用
export function popTarget () {
    Dep.target = targetStack.pop()
}