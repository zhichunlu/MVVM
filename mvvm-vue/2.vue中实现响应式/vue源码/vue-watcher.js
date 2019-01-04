/* 
  https://github.com/vuejs/vue/blob/dev/src/core/observer/watcher.js
*/
export default class Watcher {
    constructor(
        vm: Component,
        expOrFn: string | Function,   // 要 watch 的属性名称
        cb: Function,    // 回调函数
        options?: ?Object,  
        isRenderWatcher?: boolean  // 是否是渲染函数观察者，Vue 初始化时，这个参数被设为 true
    ) {
        
        // 省略部分代码... 这里代码的作用是初始化一些变量
        
        
        // expOrFn 可以是 字符串 或者 函数
        // 字符串，例如 watch: { x: fn }, Vue内部会将 `x` 这个key 转化为字符串
        // 函数，例如 Vue 初始化时，就是传入的渲染函数 new Watcher(vm, updateComponent, ...);
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            // 当 expOrFn 不为函数时，可能是这种描述方式：watch: {'a.x'(){ //do } }，具体到了某个对象的属性
            // 这个时候，就需要通过 parsePath 方法，parsePath 方法返回一个函数
            // 函数内部会去获取 'a.x' 这个属性的值了
            this.getter = parsePath(expOrFn)
            
            // 省略部分代码...
        }
        
        // 这里调用了 this.get，也就意味着 new Watcher 时会调用 this.get
        // this.lazy 是修饰符，除非用户自己传入，不然都是 false。可以先不管它
        this.value = this.lazy
            ? undefined
            : this.get()
    }
    
    get () {
        // 将 当前 watcher 实例，赋值给 Dep.target 静态属性
        // 也就是说 执行了这行代码，Dep.target 的值就是 当前 watcher 实例
        // 并将 Dep.target 入栈 ，存入 targetStack 数组中
        pushTarget(this)
        // 省略部分代码...
        try {
            // 这里执行了 this.getter，获取到 属性的初始值
            // 如果是初始化时 传入的 updateComponent 函数，这个时候会返回 udnefined
            value = this.getter.call(vm, vm)
        } catch (e) {
            // 省略部分代码...
        } finally {
            // 省略部分代码...
            
            // 出栈
            popTarget()
            
            // 省略部分代码...
        }
        
        // 返回属性的值
        return value
    }
    
    // 这里再回顾一下
    // dep.depend 方法，会执行 Dep.target.addDep(dep) 其实也就是 watcher.addDep(dep)
    // watcher.addDep(dep) 会执行 dep.addSub(watcher)
    // 将当前 watcher 实例 添加到 dep 的 subs 数组 中，也就是收集依赖
    addDep (dep: Dep) {
        const id = dep.id
        // 只需要知道，这个方法 执行 了 dep.addSub(this)
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id)
            this.newDeps.push(dep)
            if (!this.depIds.has(id)) {
                // 将当前 watcher 实例添加到 dep 的 subs 数组中
                dep.addSub(this)
            }
        }
    }
    
    // 派发更新
    update () {
        // 如果用户定义了 lazy ，this.lazy 是描述符，我们这里可以先不管它
        if (this.lazy) {
            this.dirty = true
        // this.sync 表示是否改变了值之后立即触发回调。如果用户定义为true，则立即执行 this.run
        } else if (this.sync) {
            this.run()
        // queueWatcher 内部也是执行的 watcher实例的 run 方法，只不过内部调用了 nextTick 做性能优化。
        // 它会将当前 watcher 实例放入一个队列，在下一次事件循环时，遍历队列并执行每个 watcher实例的run() 方法
        } else {
            queueWatcher(this)
        }
    }
    
    run () {
        if (this.active) {
            // 获取新的属性值
            const value = this.get()
            if (
                // 如果新值不等于旧值
                value !== this.value ||
                // 如果新值是一个 引用 类型，那么一定要触发回调
                isObject(value) ||
                // 是否深度 watch 
                this.deep
            ) {
                // set new value
                const oldValue = this.value
                this.value = value
                // this.user 是一个标志符，如果开发者添加的 watch 选项，这个值默认为 true
                // 如果是用户自己添加的 watch ，就加一个 try catch。方便用户调试。否则直接执行回调。
                if (this.user) {
                    try {
                        // 触发回调，并将 新值和旧值 作为参数
                        // 这也就是为什么，我们写 watch 时，可以这样写： function (newVal, oldVal) { // do }
                        this.cb.call(this.vm, value, oldValue)
                    } catch (e) {
                        handleError(e, this.vm, `callback for watcher "${this.expression}"`)
                    }
                } else {
                    this.cb.call(this.vm, value, oldValue)
                }
            }
        }
    }
    
    // 省略部分代码...
    
    // 以下是 Watcher 类的其他方法
    cleanUpDeps() { }
    evaluate() { }
    depend() { }
    teardown() { }
}

/* 
  https://github.com/vuejs/vue/blob/dev/src/core/observer/scheduler.js
*/
export function queueWatcher (watcher: Watcher) {
    const id = watcher.id
    if (has[id] == null) {
      has[id] = true
      if (!flushing) {
        queue.push(watcher)
      } else {
        // if already flushing, splice the watcher based on its id
        // if already past its id, it will be run next immediately.
        let i = queue.length - 1
        while (i > index && queue[i].id > watcher.id) {
          i--
        }
        queue.splice(i + 1, 0, watcher)
      }
      // queue the flush
      if (!waiting) {
        waiting = true
  
        if (process.env.NODE_ENV !== 'production' && !config.async) {
          flushSchedulerQueue()
          return
        }
        //https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js
        nextTick(flushSchedulerQueue)
      }
    }
  }
  
  function flushSchedulerQueue () {
    flushing = true
    let watcher, id
  
    queue.sort((a, b) => a.id - b.id)
  
    // do not cache length because more watchers might be pushed
    // as we run existing watchers
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index]
      if (watcher.before) {
        watcher.before()
      }
      id = watcher.id
      has[id] = null
      watcher.run()
      // in dev build, check and stop circular updates.
      if (process.env.NODE_ENV !== 'production' && has[id] != null) {
        circular[id] = (circular[id] || 0) + 1
        if (circular[id] > MAX_UPDATE_COUNT) {
          warn(
            'You may have an infinite update loop ' + (
              watcher.user
                ? `in watcher with expression "${watcher.expression}"`
                : `in a component render function.`
            ),
            watcher.vm
          )
          break
        }
      }
    }