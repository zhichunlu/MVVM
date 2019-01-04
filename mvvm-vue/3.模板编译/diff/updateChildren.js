function updateChildren(vnode, newVnode){
    let chidren = vnode.chidren || [];
    let newChildren = newVnode.newChildren || [];

    chidren.forEach((chidVnode, index) => {
        let newChildVnode = newChildren[index];

        if(chidVnode.tag === newChildVnode.tag){
            //深层次对比，递归
            updateChildren(chidVnode, newChildVnode);
        } else {
            //替换
            replaceNode(chidVnode, newChildVnode);
        }
    });
}