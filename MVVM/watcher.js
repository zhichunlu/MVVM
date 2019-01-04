class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    
    // 更改前的值
    this.value = this.get();
  }

  getVal(vm, expr){
    //获取Data的最终属性，Data可能是message.a.b.c='kksas'
    expr = expr.split('.');//[a,v,c,s,a,w,r]
    return expr.reduce((prev, next) => {//vm.$data.a
      return prev[next];
    }, vm.$data)
  }
  
  get(){
    // 将当前的 watcher 添加到 Dep 类的静态属性上
    Dep.target = this;

    // 获取值触发数据劫持
    let value = this.getVal(this.vm, this.expr);

    // 清空 Dep 上的 Watcher，防止重复添加
    Dep.target = null;
    return value;
  }

  update(){
    // 获取新值
    let newValue = this.getVal(this.vm, this.expr);
    // 获取旧值
    let oldValue = this.value;

    //如果新值和旧值不相等，就执行 callback 对 dom 进行更新
    if(newValue != oldValue){
      this.cb(newValue)
    }
  }

}
