/* 
https://github.com/vuejs/vue/blob/dev/src/core/instance/init.js */

/*初始化生命周期*/
initLifecycle(vm)
/*初始化事件*/
initEvents(vm)
/*初始化render*/
initRender(vm)
/*调用beforeCreate钩子函数并且触发beforeCreate钩子事件*/
callHook(vm, 'beforeCreate')
initInjections(vm) // resolve injections before data/props
/*初始化props、methods、data、computed与watch*/
initState(vm)
initProvide(vm) // resolve provide after data/props
/*调用created钩子函数并且触发created钩子事件*/
callHook(vm, 'created')

/* 
https://github.com/vuejs/vue/blob/dev/src/instance/internal/state.js */

/*初始化props、methods、data、computed与watch*/
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  /*初始化props*/
  if (opts.props) initProps(vm, opts.props)
  /*初始化方法*/
  if (opts.methods) initMethods(vm, opts.methods)
  /*初始化data*/
  if (opts.data) {
    initData(vm)
  } else {
    /*该组件没有data的时候绑定一个空对象*/
    observe(vm._data = {}, true /* asRootData */)
  }
  /*初始化computed*/
  if (opts.computed) initComputed(vm, opts.computed)
  /*初始化watchers*/
  if (opts.watch) initWatch(vm, opts.watch)
}

/*初始化data*/
function initData (vm: Component) {
    /*得到data数据*/
    let data = vm.$options.data
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {}
    if (!isPlainObject(data)) {
      data = {}
      process.env.NODE_ENV !== 'production' && warn(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      )
    }
    // proxy data on instance
    const keys = Object.keys(data)
    const props = vm.$options.props
    const methods = vm.$options.methods
    let i = keys.length
    //遍历data中的数据
    while (i--) {
      const key = keys[i]
      if (process.env.NODE_ENV !== 'production') {
        if (methods && hasOwn(methods, key)) {
          warn(
            `Method "${key}" has already been defined as a data property.`,
            vm
          )
        }
      }
      /*保证data中的key不与props中的key重复，props优先，如果有冲突会产生warning*/
      if (props && hasOwn(props, key)) {
        process.env.NODE_ENV !== 'production' && warn(
          `The data property "${key}" is already declared as a prop. ` +
          `Use prop default value instead.`,
          vm
        )
      } else if (!isReserved(key)) {
        //它的功能就是遍历 data 的 key，把 data 上的属性代理到 vm 实例上
        proxy(vm, `_data`, key)
      }
    }
    // observe data
  /*这里通过observe实例化Observe对象，开始对数据进行绑定，asRootData用来根数据，用来计算实例化根数据的个数，下面会进行递归observe进行对深层对象的绑定。则asRootData为非true*/
    observe(data, true /* asRootData */)
}

//proxy源码
export function proxy (target: Object, sourceKey: string, key: string) {
    sharedPropertyDefinition.get = function proxyGetter () {
      return this[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter (val) {
      this[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}

/**
 * observe(data, true /* asRootData 
 *   https://github.com/vuejs/vue/blob/dev/src/core/observer/index.js  */

export class Observer {
    value: any;
    dep: Dep;
    vmCount: number; // number of vms that have this object as root $data
  
    constructor (value: any) {
      this.value = value
      this.dep = new Dep()
      this.vmCount = 0
      // 每观察一个对象，就在对象上添加 __ob__ 属性，值为当前 Observer 实例
      // 当然，前提是 value 本身是一个数组或对象，而非基础数据类型，如数字，字符串等。
      def(value, '__ob__', this)

      if (Array.isArray(value)) {
        if (hasProto) {
          /*直接覆盖原型的方法来修改目标对象*/
          protoAugment(value, arrayMethods)
        } else {
          /*定义（覆盖）目标对象或数组的某一个方法*/
          copyAugment(value, arrayMethods, arrayKeys)
        }
        //对数组进行遍历，递归调用 observe 方法
        this.observeArray(value)
      } else {
        /*如果是对象则直接walk进行绑定*/
        this.walk(value)
      }
    }
  
    // 遍历对象并观察
    walk (obj: Object) {
      const keys = Object.keys(obj)
      for (let i = 0; i < keys.length; i++) {
        defineReactive(obj, keys[i]) 
      }
    }
  
    // 遍历数组并观察
    observeArray (items: Array<any>) {
      for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i])
      }
    }
}

export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 如果不是对象，或者是VNode实例，直接返回。
  if (!isObject(value) || value instanceof VNode) {
    return
  }

  // 定义一个 变量，用来存储 Observer 实例
  let ob: Observer | void

  // 如果对象已经被观察过，Vue会自动给对象加上一个 __ob__ 属性，避免重复观察
  // 如果对象上已经有 __ob__属性，表示已经被观察过，就直接返回 __ob__
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&  // 是否应该观察
    !isServerRendering() &&  // 非服务端渲染
    (Array.isArray(value) || isPlainObject(value)) &&  // 是数组或者Object对象
    Object.isExtensible(value) &&  // 对象是否可扩展，也就是是否可向对象添加新属性
    !value._isVue  // 非 Vue 实例
  ) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob  // 返回 Observer 实例
}

/*直接覆盖原型的方法来修改目标对象或数组*/
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/*定义（覆盖）目标对象或数组的某一个方法*/
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**https://github.com/vuejs/vue/blob/dev/src/core/util/lang.js
 * Define a property.
 */
export function def (obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    // 默认不可枚举，也就意味着正常情况，Vue帮我们在对象上添加的 __ob__属性，是遍历不到的
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive (
    obj: Object,         // 被观察对象
    key: string,         // 对象的属性
    val: any,            // 用户给属性赋值
    customSetter?: ?Function,  // 用户额外自定义的 set
    shallow?: boolean          // 是否深度观察
  ) {
    // 用于收集依赖
    const dep = new Dep()
    
    // 如果不可修改，直接返回
    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) {
      return
    }
  
    // 如果用户自己 未在对象上定义get 或 已在对象上定义set，且用户没有传入 val 参数
    // 则先计算对象的初始值，赋值给 val 参数
    const getter = property && property.get
    const setter = property && property.set
    if ((!getter || setter) && arguments.length === 2) {
      val = obj[key]
    }

    // !shallow 表示 深度观察，shallow 不为 true 的情况下，表示默认深度观察
    // 如果是深度观察，执行 observe 方法观察对象
    let childOb = !shallow && observe(val)
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        /*如果原本对象拥有getter方法则执行*/
        const value = getter ? getter.call(obj) : val
        if (Dep.target) {
          // 收集依赖
          dep.depend()
          if (childOb) {
            childOb.dep.depend()
            if (Array.isArray(value)) {
              dependArray(value)
            }
          }
        }
        // 返回对象的原有值
        return value
      },
      set: function reactiveSetter (newVal) {
        /*通过getter方法获取当前值，与新值进行比较，一致则不需要执行下面的操作*/
        const value = getter ? getter.call(obj) : val
        /* eslint-disable no-self-compare */
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        /* eslint-enable no-self-compare */
        if (process.env.NODE_ENV !== 'production' && customSetter) {
          customSetter()
        }
        // #7981: for accessor properties without setter
        if (getter && !setter) return
        if (setter) {
          /*如果原本对象拥有setter方法则执行setter*/
          setter.call(obj, newVal)
        } else {
          val = newVal
        }
        /*新的值需要重新进行observe，保证数据响应式*/
        childOb = !shallow && observe(newVal)
        /*dep对象通知所有的观察者*/
        dep.notify()
      }
    })
}




 

