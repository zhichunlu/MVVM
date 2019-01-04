/* let obj = {};
obj.name = 'hello World';//可枚举
for(let key in obj){
    console.log(obj[key]);
} */

/**-------------------- */

//如果设置get和set方法就不能设置value和writeable
/* let obj2 = {};
let temp = '';//临时变量
Object.defineProperty(obj2, 'name', { //属性描述器
    // value: 'bsb',   //默认为 undefined
    // writable: true, //是否可改写，默认false
    enumerable: true, //是否可枚举出来，默认false
    configurable: true, //是否可删除，默认false
    get(){
        console.log('get')
        return temp;
    },
    set(value){
        console.log('属性被修改')
        temp = value;
    }
})

obj2.name = '新世界'
console.log(obj2.name) */

/**-------------------- */

//简写
//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get
let o = { //setter,getter
    temp: '',
    get star(){
        return this.temp;
    },
    set star(val){
        this.temp = val;
    }
}
o.star = 'bsb'
console.log(o.star)


