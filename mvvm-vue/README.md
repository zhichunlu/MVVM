1.jq和使用框架的区别
+ jq/vue实现todo-list 
  * jq改变DOM结构
  * Vue是数据改变
+ 数据和视图的分离，解耦
  * jq数据视图没有分离，混在一块儿
  * Vue中数据是独立的，数据驱动视图只关心数据的变化

2.对MVVM的理解
  + MVC
    * Model 数据源
    * View 视图、界面（视图和模型分离）
    * Controller 控制器、逻辑处理

  + MVVM
    * VM 连接器 连接Model和View
    * MVVM 框架、一个响应式的组件系统，通过把页面抽象成一个个组件来增加复用性、降低复杂性
    * 主要特色就是数据操纵视图变化，一旦数据变化自动更新所有关联组件
    * 一大特性就是一个数据响应系统、一个模板解析系统
_____

View ---> Dom
```
<div>
    <input v-model="title" />
    <button @click="add">submit</button>
</div>
<div>
    <ul>
        <li v-for="item in list">{{item}}</li>
    </ul>
</div>
```
______

Model ---> Plain Js Object
```
var data = {
    title: '',
    list: []
}
```
______
ViewModel ---> Dom Listeners/Data Bindings
```
var vm = new Vue({
    el: '#app',
    data,
    methods: {
        add(){
            this.list.push(this.title);
            this.title = '';
        }
    }
})
```
______

3.Vue中如何实现响应式，数据绑定
  + 什么是响应式
    * 修改data属性之后可以立刻监听到
    * data 属性被代理到vm上
  + Object.defineProperty 观察数据变化

4.模板编译
  + 模板是什么
    * 字符串 {{}}
    * 有逻辑v-if/v-for
    * 最终转换成html显示
  + render函数
    * with的用法
    * 模板中的信息都被render函数所包含
    * 模板中data属性，都变成js变量
    * 模板中的v-model,v-for,v-on都变成了js逻辑
    * render函数返回v-node
  + render函数与virtual-dom
    * dom操作是昂贵的，特别消耗性能
    * vdom，一棵模拟了DOM树的JavaScript树
    * snabbdom里的核心API，h函数、patch函数
      * h('<标签名>', {...属性...}, [...子元素...])
      * h('<标签名>', {...属性...}, '...')
      * patch(container, vnode)
      * [snabbdom源码学习一](https://segmentfault.com/a/1190000009017324)
      * [snabbdom源码学习二](https://segmentfault.com/a/1190000009017349)

5.vue的整个实现流程
  + 解析模板成render函数
    ```
    <div id="app">
        <div>
            <input v-model="title" />
            <button @click="add">submit</button>
        </div>
        <div>
            <ul>
                <li v-for="item in list">{{item}}</li>
            </ul>
        </div>
    </div>
    ```
    ```
    with(this) { //this就是VM
        return _c('div', {
            attrs: {
                "id": "app"
            }
        }, [_c('div', [_c('input', {
            directives: [{
                name: "model",
                rawName: "v-model",
                value: (title),
                expression: "title"
            }],
            domProps: {
                "value": (title)
            },
            on: {
                "input": function ($event) {
                    if ($event.target.composing) return;
                    title = $event.target.value
                }
            }
        }), _v(" "), _c('button', {
            on: {
                "click": add
            }
        }, [_v("submit")])]), _v(" "), _c('div', [_c('ul', _l((list), function (item) {
            return _c('li', [_v(_s(item))])
        }), 0)])])
    }
    ```
  + 响应式开始监听
    * 通过Object.defineProperty监听到属性的set和get
    * 将data的属性代理到vm上
  + 首次渲染，显示页面，且绑定依赖
    ```
    vm._update(vnode){
        const prevVnode = vm.vnode;
        vm._vnode = vnode;
        if(!prevVnode){
            vm.$el = vm.__patch__(vm.$el, vnode)
        } else {
            vm.$el = vm.__patch__(prevVnode, vnode)
        }
    }

    function updateComponent(){
        vm._update(vm._render());
    }
    ```
    * 首次渲染，执行updateComponent,执行vm.render()
    * 执行render函数，会访问到vm.list和vm.title
    * 会被响应式的get方法监听到
    * 执行updateComponent,会走到vdom的patch方法
    * patch将vnode渲染成DOM，首次渲染完成
  + data属性变化，重新触发render
    * 修改属性，被响应式的set监听到
    * set中执行updateComponent
    * updateComponent重新执行vm._render()
    * 生成的vnode和prevVnode,通过patch进行对比
    * 渲染到html中

###### Vue的双向数据绑定原理是什么？
vue.js 是采用数据劫持结合发布者-订阅者模式的方式，通过Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。
+ 实现思路
    * Watcher（观察者）
    * Compile（模板编译）
    * Observer（数据劫持）
> 具体步骤：
> * 第一步：需要observe的数据对象进行递归遍历，包括子属性对象的属性，都加上 setter和getter,这样的话，给这个对象的某个值赋值，就会触发setter，那么就能监听到了数据变化
> * 第二步：compile解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图
> * 第三步：Watcher订阅者是Observer和Compile之间通信的桥梁，主要做的事情是:
    1、在自身实例化时往属性订阅器(dep)里面添加自己
    2、自身必须有一个update()方法
    3、待属性变动dep.notice()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身退。  
> * 第四步：MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听自己的model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果。
[vue源码](http://www.cnblogs.com/yunshangwuyou/p/9638112.html)

[vue源码](https://github.com/vuejs/vue)
[mvvm-simple](https://github.com/bestvist/mvvm-simple)
[vue剖析Vue原理&实现双向绑定MVVM](https://segmentfault.com/a/1190000006599500#articleHeader6)

响应式系统本身是基于观察者模式的，也可以说是发布/订阅模式。 发布/订阅模式，就好比是你去找中介租房子。而观察者模式呢，就好比你直接去城中村找房东租房子。 发布/订阅模式比观察者模式多了个调度中心（中介)
