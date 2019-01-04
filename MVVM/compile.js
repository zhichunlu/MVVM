class Compile {
  constructor(el, vm) {
    //el有可能是document,#app,body
    this.el = this.isElementNode(el) ? el:document.querySelector(el);
    this.vm = vm;

    if(this.el){
      //1.先把这些真实的DOM移入到内存中 fragment
      let fragment = this.node2fragment(this.el);
      //2.编译 => 提取想要的元素节点 v-model 和文本节点 {{}}
      this.compile(fragment);
      //3.把编译好的fragment再塞回到页面里去
      this.el.appendChild(fragment);
    }
  }

  //是不是元素节点
  isElementNode(node){
    return node.nodeType === 1;
  }

  //判断是不是指令
  isDirective(name){
    return name.includes('v-');
  }

  //编译元素
  compileElement(node){
    //取出当前节点的属性，类数组
    let attrs = node.attributes;
    Array.from(attrs).forEach(attr => {
      //判断属性名字是不是包含v-
      let attrName = attr.name;
      
      if(this.isDirective(attrName)){
        //如果是指令，取到该属性值得变量在 data 中对应得值，替换到节点中
        let expr = attr.value;

        //这里有可能是v-model, v-text所以要去除v-
        let [, type] = attrName.split('-');

        //调用指令对应得方法
        CompileUtil[type](node, this.vm, expr);
      }
    })
  }

  //编译文本 {{}}
  compileText(node){
    //取文本中的内容
    let text = node.textContent; 

    // 创建匹配 {{}} 的正则表达式,有可能是多个，{{a}} {{b}} {{c}}
    let reg = /\{\{([^}]+)\}\}/g;

    if(reg.test(text)){
      CompileUtil['text'](node, this.vm, text);
    }
  }

  compile(fragment){
    // 当前父节点节点的子节点，包含文本节点，类数组对象
    let childNodes = fragment.childNodes;

    // 转换成数组并循环判断每一个节点的类型
    Array.from(childNodes).forEach(node => {
      if(this.isElementNode(node)){
        //是元素节点,递归编译子节点
        this.compile(node);

        //这里需要编译元素
        this.compileElement(node);
      }else{
        //文本节点
        //这里需要编译文本
        this.compileText(node);
      }
    })
  }

  // 将根节点转移至文档碎片
  node2fragment(el){
    let fragment = document.createDocumentFragment();
    let firstChild;

    while (firstChild = el.firstChild) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }
}

//专门的编译方法
CompileUtil = {
  // 获取 data 值的方法
  getVal(vm, expr){
    // 将匹配的值用 . 分割开，如 vm.data.a.b
    expr = expr.split('.');

    return expr.reduce((prev, next) => {
      return prev[next];
    }, vm.$data)
  },

  //获取编译文本后的结果
  getTextVal(vm, expr){
    // 使用正则匹配出 {{ }} 间的变量名，再调用 getVal 获取值
    return expr.replace(/\{\{([^}]+)\}\}/g, (...args) => {
      return this.getVal(vm, args[1]);
    })
  },

  // 处理文本节点 {{}} 的方法
  text(node, vm, expr){
    // 获取赋值的方法
    let updateFn = this.updater['textUpdater'];
    
    // 获取 data 中对应的变量的值
    let value = this.getTextVal(vm, expr);

    // 通过正则替换，将取到数据中的值替换掉 {{ }}
    //这里的expr是{{a}} {{b}},分别处理{{a}}和{{b}}
    expr.replace(/\{\{([^}]+)\}\}/g, (...args) => {
      new Watcher(vm, args[1], (newValue) => {
        // 如果数据发生变化，重新获取新值
        updateFn && updateFn(node, newValue);
      })
    })
    
    // 第一次设置值
    updateFn && updateFn(node, value);
  },

  // 设置 data 值的方法
  setVal(vm, expr, value){
    expr = expr.split('.');
    return expr.reduce((prev, next, currentIndex) => {
      // 如果当前归并的为数组的最后一项，则将新值设置到该属性
      if(currentIndex === expr.length-1){
        return prev[next] = value;
      }
      return prev[next];
    }, vm.$data)
  },

  // 处理 v-model 指令的方法
  model(node, vm, expr){
    // 获取赋值的方法
    let updateFn = this.updater['modelUpdater'];

    // 获取 data 中对应的变量的值
    let value = this.getVal(vm, expr);

    // 添加观察者
    new Watcher(vm, expr, (newValue) => {
      updateFn && updateFn(node, newValue);
    });

    // v-model 双向数据绑定，对 input 添加事件监听
    node.addEventListener('input', (e) => {
      // 获取输入的新值
      let newValue = e.target.value;

      // 更新到节点
      this.setVal(vm, expr, newValue);
    })

    // 第一次设置值
    updateFn && updateFn(node, value);
  },
  updater:{
    //文本更新
    textUpdater(node, value){
      node.textContent = value;
    },
    //输入框更新
    modelUpdater(node, value){
      node.value = value;
    }
  }
}
