/* 
{
    tag: 'ul',
    attr: {id: 'list'},
    children: [
        {
            tag: 'li',
            attrs: {className: 'item'},
            children: ['Item 1]
        }, {
            tag: 'li',
            attrs: {className: 'item'},
            children: ['Item 1]
        }
    ]
}
*/

function creatElement(vnode) {
    let tag = vnode.tag;
    let attrs = vnode.attrs || {};
    let children = vnode.children || [];

    if(!tag) return null;

    //创建真实的DOM元素
    let elem = document.createElement(tag);
    //属性
    let attrName;
    for(attrName in attrs){
        if(attrs.hasOwnProperty(attrName)){
            //给elem添加属性
            elem.setAttribuite(attrName, attrs[attrName])
        }
    }

    //子元素
    children.forEach(childVnode => {
        //给elem 添加子元素 递归
        elem.appenChild(creatElement(childVnode));
    });

    return elem;
}