function getTarget (node = document.body) {
    if (node === true) return document.body
    return node instanceof window.Node ? node : document.querySelector(node)
}
const homes = new Map()

const directive_father = {
    inserted (el, { value }) {
        const { parentNode } = el
        const home = document.createComment('')
        let hasMovedOut = false

        if (value !== false) {
            parentNode.replaceChild(home, el)
            getTarget(value).appendChild(el)
            hasMovedOut = true
        }

        if (!homes.has(el)) homes.set(el, { parentNode, home, hasMovedOut })
    },
    componentUpdated (el, { value }) {
        const { parentNode, home, hasMovedOut } = homes.get(el)

        if (!hasMovedOut && value) {

            parentNode.replaceChild(home, el)
            getTarget(value).appendChild(el)

            homes.set(el, Object.assign({}, homes.get(el), { hasMovedOut: true }))
        } else if (hasMovedOut && value === false) {
            parentNode.replaceChild(el, home)
            homes.set(el, Object.assign({}, homes.get(el), { hasMovedOut: false }))
        } else if (value) {
            getTarget(value).appendChild(el)
        }
    },
    unbind (el) {
        homes.delete(el)
    }
}
const directive_brother = {
    inserted (el, { value }) {
        const { parentNode } = el;
        const home = document.createComment('');
        let hasMovedOut = false;
        if (value) {
            parentNode.replaceChild(home, el);
            // getTarget(value).appendChild(el);
            getTarget(value).parentNode.insertBefore(el, getTarget(value));
            hasMovedOut = true
        }
        if (!homes.has(el)) homes.set(el, { parentNode, home, hasMovedOut })
    },
    componentUpdated (el, { value }) {
        const { parentNode, home, hasMovedOut } = homes.get(el);

        if (!hasMovedOut && value) {
            // remove from document and leave placeholder
            parentNode.replaceChild(home, el);
            // append to target
            // getTarget(value).appendChild(el);
            getTarget(value).parentNode.insertBefore(el, getTarget(value));

            homes.set(el, Object.assign({}, homes.get(el), { hasMovedOut: true }));
        } else if (hasMovedOut && value === false) {
            // previously moved, coming back home
            parentNode.replaceChild(el, home);
            homes.set(el, Object.assign({}, homes.get(el), { hasMovedOut: false }))
        } else if (value) {
            // already moved, going somewhere else
            // getTarget(value).appendChild(el);
            getTarget(value).parentNode.insertBefore(el, getTarget(value));
        }
    },
    unbind (el) {
        homes.delete(el)
    }
}

function plugin (Vue) {
    Vue.directive('father-portal', directive_father)
    Vue.directive('brother-portal', directive_brother)
}

plugin.version = '0.1.6'

export default plugin

if (typeof window !== 'undefined' && window.Vue) {
    window.Vue.use(plugin)
}