// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy
//proxy 代理 也可以给属性重新设置set和get
// let p = new Proxy(target, handler);
// 支持数组 支持属性不存在的情况

let obj = {
    name: 'bsb'
};
let proxy = new Proxy(obj, {
    set(target, key, value){
        console.log('数据更新')
        return Reflect.set(target, key, value)
    },
    get(target, key){
        console.log('get')
        // return target[key];
        // reflect 反射
        return Reflect.get(target, key)
    }
})
proxy.name = 'xxx'
console.log(proxy.name)

/**------------------------------ */

/* let arr = ['bsb'];
let proxy = new Proxy(arr, {
    set(target, key, value){
        if(key === 'length') return true;
        console.log('数据更新')
        return Reflect.set(target, key, value)
    },
    get(target, key){
        console.log('get')
        return Reflect.get(target, key)
    }
})
proxy.push('byxf');
console.log(arr) */