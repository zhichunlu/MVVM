with(this) { //this就是VM
    return _c('div', {
        attrs: {
            "id": "app"
        }
    }, [_c('div', [_c('input', {
        directives: [{
            name: "model",
            rawName: "v-model",
            value: (title),
            expression: "title"
        }],
        domProps: {
            "value": (title)
        },
        on: {
            "input": function ($event) {
                if ($event.target.composing) return;
                title = $event.target.value
            }
        }
    }), _v(" "), _c('button', {
        on: {
            "click": add
        }
    }, [_v("submit")])]), _v(" "), _c('div', [_c('ul', _l((list), function (item) {
        return _c('li', [_v(_s(item))])
    }), 0)])])
}
// vm._c => ƒ (a, b, c, d) { return createElement(vm, a, b, c, d, false); }

/* vm._v 
ƒ createTextVNode(val) {
    return new VNode(undefined, undefined, undefined, String(val))
} 
*/

/* vm._l
ƒ renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < … 
*/

/* _s
ƒ toString (val) {
    return val == null
    ? ''
    : typeof val === 'object'
    ? JSON.stringify(val, null, 2)
    : String(val)
} 
*/