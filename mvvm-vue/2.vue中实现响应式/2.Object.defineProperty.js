//https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty

// Object.defineProperty 是 ES5 中一个无法 shim 的特性，这也就是为什么 Vue 不支持 IE8 以及更低版本浏览器。

/* Object.defineProperty(obj, prop, descriptor)
obj          要在其上定义属性的对象
prop         要定义或修改的属性的名称
descriptor   将被定义或修改的属性描述符
 */
let obj = {};
let _name = 'bsb';

Object.defineProperty(obj, "name", {
    get: function(){
        console.log('get');
        return _name;
    },
    set: function(newVal){
        console.log('set');
        _name = newVal;
    }
})

console.log(obj.name);
obj.name = 'hello';
console.log(obj.name)