//双向数据绑定 数据劫持把所有属性都定义一个set和get  模板编译  观察者模式
//数据劫持

function update() {
    console.log('数据改变了 刷新视图')
}

let obj = {
    name: 'bsb',
    age: {
        age: 2
    }
}

function observer(o) { // 把当前对象上的所有属性 都改写成 Object.defineProperty的形式
    if (typeof o !== 'object') {
        return o;
    }
    for (let key in o) {
        defineReactive(o, key, o[key]);
    }
}

function defineReactive(obj, key, value) {
    observer(value); // 只要是对象 就要不停的去监控
    Object.defineProperty(obj, key, {
        get() {
            return value;
        },
        set(val) {
            observer(val)
            if (val !== value) { // 保证设置的属性 和以前的值不一样才更新
                update();
                value = val;
            }
        }
    })
}

observer(obj);

obj.name = 'bsb1'
console.log(obj.name)

// obj.name = {
//     name: 'hello'
// }
// obj.name.name = 'world'; 
// console.log(obj.name.name)

// obj.age.age = 100;
