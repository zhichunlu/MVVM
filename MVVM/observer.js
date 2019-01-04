class Observer {
  constructor(data) {
    this.observe(data);
  }

  // 添加数据监听
  observe(data){
    // 验证 data
    if(!data || typeof data !== 'object'){
      return;
    }

    //要将数据一一劫持 先将取到data的key和value
    // console.log(Object.keys(data)); //["message", "age"]
    Object.keys(data).forEach(key => {
      //劫持（实现数据响应式）
      this.defineReactive(data, key, data[key]);
      this.observe(data[key]);//深度劫持
    })
  }

  //数据响应式
  defineReactive(obj, key, value){
    let that = this;

    //每个变化的数据都会对应一个数组，这个数组是存放所有更新的操作
    let dep = new Dep();

    Object.defineProperty(obj, key, {
      enumerble: true,
      configurable: true,
      get(){
        // 当取值时调用的方法
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set(newValue){
        //当给data属性中设置值的时候，更改获取的属性的值
        if(newValue != value){
          that.observe(newValue);//如果是对象继续劫持
          value = newValue;
          dep.notify();//通知所有人数据更新了
        }
      }
    })
  }
}

class Dep {
  constructor() {
    this.subs = []
  }

  // 添加订阅
  addSub(watcher){
    this.subs.push(watcher);
  }

  //通知
  notify(){
    this.subs.forEach(watcher => watcher.update());
  }
}
