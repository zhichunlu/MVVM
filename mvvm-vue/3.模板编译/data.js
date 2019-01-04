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