(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Chessground = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var vnode_1 = require("./vnode");
var is = require("./is");
function addNS(data, children, sel) {
    data.ns = 'http://www.w3.org/2000/svg';
    if (sel !== 'foreignObject' && children !== undefined) {
        for (var i = 0; i < children.length; ++i) {
            var childData = children[i].data;
            if (childData !== undefined) {
                addNS(childData, children[i].children, children[i].sel);
            }
        }
    }
}
function h(sel, b, c) {
    var data = {}, children, text, i;
    if (c !== undefined) {
        data = b;
        if (is.array(c)) {
            children = c;
        }
        else if (is.primitive(c)) {
            text = c;
        }
        else if (c && c.sel) {
            children = [c];
        }
    }
    else if (b !== undefined) {
        if (is.array(b)) {
            children = b;
        }
        else if (is.primitive(b)) {
            text = b;
        }
        else if (b && b.sel) {
            children = [b];
        }
        else {
            data = b;
        }
    }
    if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
            if (is.primitive(children[i]))
                children[i] = vnode_1.vnode(undefined, undefined, undefined, children[i]);
        }
    }
    if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g' &&
        (sel.length === 3 || sel[3] === '.' || sel[3] === '#')) {
        addNS(data, children, sel);
    }
    return vnode_1.vnode(sel, data, children, text, undefined);
}
exports.h = h;
;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = h;

},{"./is":3,"./vnode":9}],2:[function(require,module,exports){
"use strict";
function createElement(tagName) {
    return document.createElement(tagName);
}
function createElementNS(namespaceURI, qualifiedName) {
    return document.createElementNS(namespaceURI, qualifiedName);
}
function createTextNode(text) {
    return document.createTextNode(text);
}
function createComment(text) {
    return document.createComment(text);
}
function insertBefore(parentNode, newNode, referenceNode) {
  // console.log('insert', newNode);
    parentNode.insertBefore(newNode, referenceNode);
}
function removeChild(node, child) {
  // console.log('remove', child);
    node.removeChild(child);
}
function appendChild(node, child) {
  // console.log('append', child);
    node.appendChild(child);
}
function parentNode(node) {
    return node.parentNode;
}
function nextSibling(node) {
    return node.nextSibling;
}
function tagName(elm) {
    return elm.tagName;
}
function setTextContent(node, text) {
    node.textContent = text;
}
function getTextContent(node) {
    return node.textContent;
}
function isElement(node) {
    return node.nodeType === 1;
}
function isText(node) {
    return node.nodeType === 3;
}
function isComment(node) {
    return node.nodeType === 8;
}
exports.htmlDomApi = {
    createElement: createElement,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    getTextContent: getTextContent,
    isElement: isElement,
    isText: isText,
    isComment: isComment,
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.htmlDomApi;


},{}],3:[function(require,module,exports){
"use strict";
exports.array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}
exports.primitive = primitive;

},{}],4:[function(require,module,exports){
"use strict";
var NamespaceURIs = {
    "xlink": "http://www.w3.org/1999/xlink"
};
var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
    "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable",
    "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple",
    "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
    "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
    "truespeed", "typemustmatch", "visible"];
var booleanAttrsDict = Object.create(null);
for (var i = 0, len = booleanAttrs.length; i < len; i++) {
    booleanAttrsDict[booleanAttrs[i]] = true;
}
function updateAttrs(oldVnode, vnode) {
    var key, cur, old, elm = vnode.elm, oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs, namespaceSplit;
    if (!oldAttrs && !attrs)
        return;
    if (oldAttrs === attrs)
        return;
    oldAttrs = oldAttrs || {};
    attrs = attrs || {};
    // update modified attributes, add new attributes
    for (key in attrs) {
        cur = attrs[key];
        old = oldAttrs[key];
        if (old !== cur) {
            if (!cur && booleanAttrsDict[key])
                elm.removeAttribute(key);
            else {
                namespaceSplit = key.split(":");
                if (namespaceSplit.length > 1 && NamespaceURIs.hasOwnProperty(namespaceSplit[0]))
                    elm.setAttributeNS(NamespaceURIs[namespaceSplit[0]], key, cur);
                else
                    elm.setAttribute(key, cur);
            }
        }
    }
    //remove removed attributes
    // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
    // the other option is to remove all attributes with value == undefined
    for (key in oldAttrs) {
        if (!(key in attrs)) {
            elm.removeAttribute(key);
        }
    }
}
exports.attributesModule = { create: updateAttrs, update: updateAttrs };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.attributesModule;

},{}],5:[function(require,module,exports){
"use strict";
function updateClass(oldVnode, vnode) {
    var cur, name, elm = vnode.elm, oldClass = oldVnode.data.class, klass = vnode.data.class;
    if (!oldClass && !klass)
        return;
    if (oldClass === klass)
        return;
    oldClass = oldClass || {};
    klass = klass || {};
    for (name in oldClass) {
        if (!klass[name]) {
            elm.classList.remove(name);
        }
    }
    for (name in klass) {
        cur = klass[name];
        if (cur !== oldClass[name]) {
            elm.classList[cur ? 'add' : 'remove'](name);
        }
    }
}
exports.classModule = { create: updateClass, update: updateClass };
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.classModule;

},{}],6:[function(require,module,exports){
"use strict";
var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
var nextFrame = function (fn) { raf(function () { raf(fn); }); };
function setNextFrame(obj, prop, val) {
    nextFrame(function () { obj[prop] = val; });
}
function updateStyle(oldVnode, vnode) {
    var cur, name, elm = vnode.elm, oldStyle = oldVnode.data.style, style = vnode.data.style;
    if (!oldStyle && !style)
        return;
    if (oldStyle === style)
        return;
    oldStyle = oldStyle || {};
    style = style || {};
    var oldHasDel = 'delayed' in oldStyle;
    for (name in oldStyle) {
        if (!style[name]) {
            if (name[0] === '-' && name[1] === '-') {
                elm.style.removeProperty(name);
            }
            else {
                elm.style[name] = '';
            }
        }
    }
    for (name in style) {
        cur = style[name];
        if (name === 'delayed') {
            for (name in style.delayed) {
                cur = style.delayed[name];
                if (!oldHasDel || cur !== oldStyle.delayed[name]) {
                    setNextFrame(elm.style, name, cur);
                }
            }
        }
        else if (name !== 'remove' && cur !== oldStyle[name]) {
            if (name[0] === '-' && name[1] === '-') {
                elm.style.setProperty(name, cur);
            }
            else {
                elm.style[name] = cur;
            }
        }
    }
}
function applyDestroyStyle(vnode) {
    var style, name, elm = vnode.elm, s = vnode.data.style;
    if (!s || !(style = s.destroy))
        return;
    for (name in style) {
        elm.style[name] = style[name];
    }
}
function applyRemoveStyle(vnode, rm) {
    var s = vnode.data.style;
    if (!s || !s.remove) {
        rm();
        return;
    }
    var name, elm = vnode.elm, i = 0, compStyle, style = s.remove, amount = 0, applied = [];
    for (name in style) {
        applied.push(name);
        elm.style[name] = style[name];
    }
    compStyle = getComputedStyle(elm);
    var props = compStyle['transition-property'].split(', ');
    for (; i < props.length; ++i) {
        if (applied.indexOf(props[i]) !== -1)
            amount++;
    }
    elm.addEventListener('transitionend', function (ev) {
        if (ev.target === elm)
            --amount;
        if (amount === 0)
            rm();
    });
}
exports.styleModule = {
    create: updateStyle,
    update: updateStyle,
    destroy: applyDestroyStyle,
    remove: applyRemoveStyle
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.styleModule;

},{}],7:[function(require,module,exports){
"use strict";
var vnode_1 = require("./vnode");
var is = require("./is");
var htmldomapi_1 = require("./htmldomapi");
function isUndef(s) { return s === undefined; }
function isDef(s) { return s !== undefined; }
var emptyNode = vnode_1.default('', {}, [], undefined, undefined);
function sameVnode(vnode1, vnode2) {
    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}
function isVnode(vnode) {
    return vnode.sel !== undefined;
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
    var i, map = {}, key, ch;
    for (i = beginIdx; i <= endIdx; ++i) {
        ch = children[i];
        if (ch != null) {
            key = ch.key;
            if (key !== undefined)
                map[key] = i;
        }
    }
    return map;
}
var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];
var h_1 = require("./h");
exports.h = h_1.h;
var thunk_1 = require("./thunk");
exports.thunk = thunk_1.thunk;
function init(modules, domApi) {
    var i, j, cbs = {};
    var api = domApi !== undefined ? domApi : htmldomapi_1.default;
    for (i = 0; i < hooks.length; ++i) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; ++j) {
            var hook = modules[j][hooks[i]];
            if (hook !== undefined) {
                cbs[hooks[i]].push(hook);
            }
        }
    }
    function emptyNodeAt(elm) {
        var id = elm.id ? '#' + elm.id : '';
        var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
        return vnode_1.default(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
    }
    function createRmCb(childElm, listeners) {
        return function rmCb() {
            if (--listeners === 0) {
                var parent_1 = api.parentNode(childElm);
                api.removeChild(parent_1, childElm);
            }
        };
    }
    function createElm(vnode, insertedVnodeQueue) {
        var i, data = vnode.data;
        if (data !== undefined) {
            if (isDef(i = data.hook) && isDef(i = i.init)) {
                i(vnode);
                data = vnode.data;
            }
        }
        var children = vnode.children, sel = vnode.sel;
        if (sel === '!') {
            if (isUndef(vnode.text)) {
                vnode.text = '';
            }
            vnode.elm = api.createComment(vnode.text);
        }
        else if (sel !== undefined) {
            // Parse selector
            var hashIdx = sel.indexOf('#');
            var dotIdx = sel.indexOf('.', hashIdx);
            var hash = hashIdx > 0 ? hashIdx : sel.length;
            var dot = dotIdx > 0 ? dotIdx : sel.length;
            var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
            var elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                : api.createElement(tag);
            if (hash < dot)
                elm.id = sel.slice(hash + 1, dot);
            if (dotIdx > 0)
                elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
            if (is.array(children)) {
                for (i = 0; i < children.length; ++i) {
                    var ch = children[i];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            }
            else if (is.primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
            for (i = 0; i < cbs.create.length; ++i)
                cbs.create[i](emptyNode, vnode);
            i = vnode.data.hook; // Reuse variable
            if (isDef(i)) {
                if (i.create)
                    i.create(emptyNode, vnode);
                if (i.insert)
                    insertedVnodeQueue.push(vnode);
            }
        }
        else {
            vnode.elm = api.createTextNode(vnode.text);
        }
        return vnode.elm;
    }
    function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            var ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }
    function invokeDestroyHook(vnode) {
        var i, j, data = vnode.data;
        if (data !== undefined) {
            if (isDef(i = data.hook) && isDef(i = i.destroy))
                i(vnode);
            for (i = 0; i < cbs.destroy.length; ++i)
                cbs.destroy[i](vnode);
            if (vnode.children !== undefined) {
                for (j = 0; j < vnode.children.length; ++j) {
                    i = vnode.children[j];
                    if (i != null && typeof i !== "string") {
                        invokeDestroyHook(i);
                    }
                }
            }
        }
    }
    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; ++startIdx) {
            var i_1 = void 0, listeners = void 0, rm = void 0, ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    invokeDestroyHook(ch);
                    listeners = cbs.remove.length + 1;
                    rm = createRmCb(ch.elm, listeners);
                    for (i_1 = 0; i_1 < cbs.remove.length; ++i_1)
                        cbs.remove[i_1](ch, rm);
                    if (isDef(i_1 = ch.data) && isDef(i_1 = i_1.hook) && isDef(i_1 = i_1.remove)) {
                        i_1(ch, rm);
                    }
                    else {
                        rm();
                    }
                }
                else {
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }
    }
    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        var oldStartIdx = 0, newStartIdx = 0;
        var oldEndIdx = oldCh.length - 1;
        var oldStartVnode = oldCh[0];
        var oldEndVnode = oldCh[oldEndIdx];
        var newEndIdx = newCh.length - 1;
        var newStartVnode = newCh[0];
        var newEndVnode = newCh[newEndIdx];
        var oldKeyToIdx;
        var idxInOld;
        var elmToMove;
        var before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx]; // Vnode might have been moved left
            }
            else if (oldEndVnode == null) {
                oldEndVnode = oldCh[--oldEndIdx];
            }
            else if (newStartVnode == null) {
                newStartVnode = newCh[++newStartIdx];
            }
            else if (newEndVnode == null) {
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldStartVnode, newEndVnode)) {
                patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
                oldStartVnode = oldCh[++oldStartIdx];
                newEndVnode = newCh[--newEndIdx];
            }
            else if (sameVnode(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
                api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                oldEndVnode = oldCh[--oldEndIdx];
                newStartVnode = newCh[++newStartIdx];
            }
            else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                }
                else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    }
                    else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }
        }
        if (oldStartIdx > oldEndIdx) {
            before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
            addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
        }
        else if (newStartIdx > newEndIdx) {
            removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
        }
    }
    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var i, hook;
        if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
            i(oldVnode, vnode);
        }
        var elm = vnode.elm = oldVnode.elm;
        var oldCh = oldVnode.children;
        var ch = vnode.children;
        if (oldVnode === vnode)
            return;
        if (vnode.data !== undefined) {
            for (i = 0; i < cbs.update.length; ++i)
                cbs.update[i](oldVnode, vnode);
            i = vnode.data.hook;
            if (isDef(i) && isDef(i = i.update))
                i(oldVnode, vnode);
        }
        if (isUndef(vnode.text)) {
            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch)
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
            }
            else if (isDef(ch)) {
                if (isDef(oldVnode.text))
                    api.setTextContent(elm, '');
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            }
            else if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            }
            else if (isDef(oldVnode.text)) {
                api.setTextContent(elm, '');
            }
        }
        else if (oldVnode.text !== vnode.text) {
            api.setTextContent(elm, vnode.text);
        }
        if (isDef(hook) && isDef(i = hook.postpatch)) {
            i(oldVnode, vnode);
        }
    }
    return function patch(oldVnode, vnode) {
        var i, elm, parent;
        var insertedVnodeQueue = [];
        for (i = 0; i < cbs.pre.length; ++i)
            cbs.pre[i]();
        if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        }
        else {
            elm = oldVnode.elm;
            parent = api.parentNode(elm);
            createElm(vnode, insertedVnodeQueue);
            if (parent !== null) {
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
                removeVnodes(parent, [oldVnode], 0, 0);
            }
        }
        for (i = 0; i < insertedVnodeQueue.length; ++i) {
            insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
        }
        for (i = 0; i < cbs.post.length; ++i)
            cbs.post[i]();
        return vnode;
    };
}
exports.init = init;

},{"./h":1,"./htmldomapi":2,"./is":3,"./thunk":8,"./vnode":9}],8:[function(require,module,exports){
"use strict";
var h_1 = require("./h");
function copyToThunk(vnode, thunk) {
    thunk.elm = vnode.elm;
    vnode.data.fn = thunk.data.fn;
    vnode.data.args = thunk.data.args;
    thunk.data = vnode.data;
    thunk.children = vnode.children;
    thunk.text = vnode.text;
    thunk.elm = vnode.elm;
}
function init(thunk) {
    var cur = thunk.data;
    var vnode = cur.fn.apply(undefined, cur.args);
    copyToThunk(vnode, thunk);
}
function prepatch(oldVnode, thunk) {
    var i, old = oldVnode.data, cur = thunk.data;
    var oldArgs = old.args, args = cur.args;
    if (old.fn !== cur.fn || oldArgs.length !== args.length) {
        copyToThunk(cur.fn.apply(undefined, args), thunk);
    }
    for (i = 0; i < args.length; ++i) {
        if (oldArgs[i] !== args[i]) {
            copyToThunk(cur.fn.apply(undefined, args), thunk);
            return;
        }
    }
    copyToThunk(oldVnode, thunk);
}
exports.thunk = function thunk(sel, key, fn, args) {
    if (args === undefined) {
        args = fn;
        fn = key;
        key = undefined;
    }
    return h_1.h(sel, {
        key: key,
        hook: { init: init, prepatch: prepatch },
        fn: fn,
        args: args
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.thunk;

},{"./h":1}],9:[function(require,module,exports){
"use strict";
function vnode(sel, data, children, text, elm) {
    var key = data === undefined ? undefined : data.key;
    return { sel: sel, data: data, children: children,
        text: text, elm: elm, key: key };
}
exports.vnode = vnode;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = vnode;

},{}],10:[function(require,module,exports){
"use strict";
var util = require("./util");
// transformation is a function
// accepts board state and any number of arguments,
// and mutates the board.
function default_1(mutation, state, skip) {
    if (state.animation.enabled && !skip)
        return animate(mutation, state);
    else {
        var result = mutation(state);
        state.dom.redraw();
        return result;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function makePiece(k, piece, invert) {
    var key = invert ? util.invertKey(k) : k;
    return {
        key: key,
        pos: util.key2pos(key),
        piece: piece
    };
}
function samePiece(p1, p2) {
    return p1.role === p2.role && p1.color === p2.color;
}
function closer(piece, pieces) {
    return pieces.sort(function (p1, p2) {
        return util.distance(piece.pos, p1.pos) - util.distance(piece.pos, p2.pos);
    })[0];
}
function computePlan(prev, current) {
    var width = current.dom.bounds.width / 8, height = current.dom.bounds.height / 8, anims = {}, animedOrigs = [], fadings = [], missings = [], news = [], invert = prev.orientation !== current.orientation, prePieces = {}, white = current.orientation === 'white', dropped = current.movable.dropped;
    var curP, preP, i, key, orig, dest, vector;
    for (i in prev.pieces) {
        prePieces[i] = makePiece(i, prev.pieces[i], invert);
    }
    for (i = 0; i < util.allKeys.length; i++) {
        key = util.allKeys[i];
        if (!dropped || key !== dropped[1]) {
            curP = current.pieces[key];
            preP = prePieces[key];
            if (curP) {
                if (preP) {
                    if (!samePiece(curP, preP.piece)) {
                        missings.push(preP);
                        news.push(makePiece(key, curP, false));
                    }
                }
                else
                    news.push(makePiece(key, curP, false));
            }
            else if (preP)
                missings.push(preP);
        }
    }
    news.forEach(function (newP) {
        preP = closer(newP, missings.filter(function (p) { return samePiece(newP.piece, p.piece); }));
        if (preP) {
            orig = white ? preP.pos : newP.pos;
            dest = white ? newP.pos : preP.pos;
            vector = [(orig[0] - dest[0]) * width, (dest[1] - orig[1]) * height];
            anims[newP.key] = [vector, vector];
            animedOrigs.push(preP.key);
        }
    });
    missings.forEach(function (p) {
        if ((!dropped || p.key !== dropped[0]) &&
            !util.containsX(animedOrigs, p.key) &&
            !(current.items ? current.items(p.pos, p.key) : false))
            fadings.push({
                pos: p.pos,
                piece: p.piece,
                opacity: 1
            });
    });
    return {
        anims: anims,
        fadings: fadings
    };
}
function roundBy(n, by) {
    return Math.round(n * by) / by;
}
function go(state) {
    if (!state.animation.current || !state.animation.current.start)
        return; // animation was canceled
    var rest = 1 - (new Date().getTime() - state.animation.current.start) / state.animation.current.duration;
    if (rest <= 0) {
        state.animation.current = undefined;
        state.dom.redraw();
    }
    else {
        var i = void 0;
        var ease = easing(rest);
        for (i in state.animation.current.plan.anims) {
            var cfg = state.animation.current.plan.anims[i];
            cfg[1] = [roundBy(cfg[0][0] * ease, 10), roundBy(cfg[0][1] * ease, 10)];
        }
        for (i in state.animation.current.plan.fadings) {
            state.animation.current.plan.fadings[i].opacity = roundBy(ease, 100);
        }
        state.dom.redraw();
        util.raf(function () { return go(state); });
    }
}
function animate(mutation, state) {
    // clone state before mutating it
    var prev = {
        orientation: state.orientation,
        pieces: {}
    };
    // clone pieces
    for (var key in state.pieces) {
        prev.pieces[key] = {
            role: state.pieces[key].role,
            color: state.pieces[key].color
        };
    }
    var result = mutation(state);
    if (state.animation.enabled) {
        var plan = computePlan(prev, state);
        if (!isObjectEmpty(plan.anims) || !isObjectEmpty(plan.fadings)) {
            var alreadyRunning = state.animation.current && state.animation.current.start;
            state.animation.current = {
                start: new Date().getTime(),
                duration: state.animation.duration,
                plan: plan
            };
            if (!alreadyRunning)
                go(state);
        }
        else {
            // don't animate, just render right away
            state.dom.redraw();
        }
    }
    else {
        // animations are now disabled
        state.dom.redraw();
    }
    return result;
}
function isObjectEmpty(o) {
    for (var _ in o)
        return false;
    return true;
}
// https://gist.github.com/gre/1650294
function easing(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

},{"./util":26}],11:[function(require,module,exports){
"use strict";
var board = require("./board");
var fen_1 = require("./fen");
var configure_1 = require("./configure");
var anim_1 = require("./anim");
var drag_1 = require("./drag");
var explosion_1 = require("./explosion");
// see API types and documentations in dts/api.d.ts
function default_1(state) {
    return {
        set: function (config) {
            anim_1.default(function (state) { return configure_1.default(state, config); }, state);
        },
        state: state,
        getFen: function () { return fen_1.write(state.pieces); },
        getMaterialDiff: function () { return board.getMaterialDiff(state); },
        toggleOrientation: function () {
            anim_1.default(board.toggleOrientation, state);
            // if (this.state.redrawCoords) this.state.redrawCoords(this.state.orientation);
        },
        setPieces: function (pieces) {
            anim_1.default(function (state) { return board.setPieces(state, pieces); }, state);
        },
        selectSquare: function (key) {
            anim_1.default(function (state) { return board.selectSquare(state, key); }, state, true);
        },
        move: function (orig, dest) {
            anim_1.default(function (state) { return board.baseMove(state, orig, dest); }, state);
        },
        newPiece: function (piece, key) {
            anim_1.default(function (state) { return board.baseNewPiece(state, piece, key); }, state);
        },
        playPremove: function () {
            anim_1.default(board.playPremove, state);
        },
        playPredrop: function (validate) {
            anim_1.default(function (state) { return board.playPredrop(state, validate); }, state);
        },
        cancelPremove: function () {
            anim_1.default(board.unsetPremove, state, true);
        },
        cancelPredrop: function () {
            anim_1.default(board.unsetPredrop, state, true);
        },
        cancelMove: function () {
            anim_1.default(function (state) { board.cancelMove(state); drag_1.cancel(state); }, state, true);
        },
        stop: function () {
            anim_1.default(function (state) { board.stop(state); drag_1.cancel(state); }, state, true);
        },
        explode: function (keys) {
            explosion_1.default(state, keys);
        },
        setAutoShapes: function (shapes) {
            anim_1.default(function (state) { return state.drawable.autoShapes = shapes; }, state);
        },
        setShapes: function (shapes) {
            anim_1.default(function (state) { return state.drawable.shapes = shapes; }, state);
        }
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;

},{"./anim":10,"./board":12,"./configure":13,"./drag":16,"./explosion":19,"./fen":20}],12:[function(require,module,exports){
"use strict";
var util_1 = require("./util");
var premove_1 = require("./premove");
var hold = require("./hold");
function callUserFunction(f) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (f)
        setTimeout(function () { return f.apply(void 0, args); }, 1);
}
function toggleOrientation(state) {
    state.orientation = util_1.opposite(state.orientation);
}
exports.toggleOrientation = toggleOrientation;
function reset(state) {
    state.lastMove = undefined;
    unselect(state);
    unsetPremove(state);
    unsetPredrop(state);
}
exports.reset = reset;
function setPieces(state, pieces) {
    for (var key in pieces) {
        if (pieces[key])
            state.pieces[key] = pieces[key];
        else
            delete state.pieces[key];
    }
    state.movable.dropped = undefined;
}
exports.setPieces = setPieces;
function setCheck(state, color) {
    if (color === true)
        color = state.turnColor;
    if (!color)
        state.check = undefined;
    else
        for (var k in state.pieces) {
            if (state.pieces[k].role === 'king' && state.pieces[k].color === color) {
                state.check = k;
            }
        }
}
exports.setCheck = setCheck;
function setPremove(state, orig, dest, meta) {
    unsetPredrop(state);
    state.premovable.current = [orig, dest];
    callUserFunction(state.premovable.events.set, orig, dest, meta);
}
function unsetPremove(state) {
    if (state.premovable.current) {
        state.premovable.current = undefined;
        callUserFunction(state.premovable.events.unset);
    }
}
exports.unsetPremove = unsetPremove;
function setPredrop(state, role, key) {
    unsetPremove(state);
    state.predroppable.current = {
        role: role,
        key: key
    };
    callUserFunction(state.predroppable.events.set, role, key);
}
function unsetPredrop(state) {
    var pd = state.predroppable;
    if (pd.current) {
        pd.current = undefined;
        callUserFunction(pd.events.unset);
    }
}
exports.unsetPredrop = unsetPredrop;
function tryAutoCastle(state, orig, dest) {
    if (!state.autoCastle)
        return;
    var king = state.pieces[dest];
    if (king.role !== 'king')
        return;
    var origPos = util_1.key2pos(orig);
    if (origPos[0] !== 5)
        return;
    if (origPos[1] !== 1 && origPos[1] !== 8)
        return;
    var destPos = util_1.key2pos(dest);
    var oldRookPos, newRookPos, newKingPos;
    if (destPos[0] === 7 || destPos[0] === 8) {
        oldRookPos = util_1.pos2key([8, origPos[1]]);
        newRookPos = util_1.pos2key([6, origPos[1]]);
        newKingPos = util_1.pos2key([7, origPos[1]]);
    }
    else if (destPos[0] === 3 || destPos[0] === 1) {
        oldRookPos = util_1.pos2key([1, origPos[1]]);
        newRookPos = util_1.pos2key([4, origPos[1]]);
        newKingPos = util_1.pos2key([3, origPos[1]]);
    }
    else
        return;
    delete state.pieces[orig];
    delete state.pieces[dest];
    delete state.pieces[oldRookPos];
    state.pieces[newKingPos] = {
        role: 'king',
        color: king.color
    };
    state.pieces[newRookPos] = {
        role: 'rook',
        color: king.color
    };
}
function baseMove(state, orig, dest) {
    if (orig === dest || !state.pieces[orig])
        return false;
    var captured = (state.pieces[dest] &&
        state.pieces[dest].color !== state.pieces[orig].color) ? state.pieces[dest] : undefined;
    callUserFunction(state.events.move, orig, dest, captured);
    state.pieces[dest] = state.pieces[orig];
    delete state.pieces[orig];
    state.lastMove = [orig, dest];
    state.check = undefined;
    tryAutoCastle(state, orig, dest);
    callUserFunction(state.events.change);
    state.movable.dropped = undefined;
    return true;
}
exports.baseMove = baseMove;
function baseNewPiece(state, piece, key, force) {
    if (state.pieces[key]) {
        if (force)
            delete state.pieces[key];
        else
            return false;
    }
    callUserFunction(state.events.dropNewPiece, piece, key);
    state.pieces[key] = piece;
    state.lastMove = [key, key];
    state.check = undefined;
    callUserFunction(state.events.change);
    state.movable.dropped = undefined;
    state.movable.dests = undefined;
    state.turnColor = util_1.opposite(state.turnColor);
    return true;
}
exports.baseNewPiece = baseNewPiece;
function baseUserMove(state, orig, dest) {
    var result = baseMove(state, orig, dest);
    if (result) {
        state.movable.dests = {};
        state.turnColor = util_1.opposite(state.turnColor);
    }
    return result;
}
function userMove(state, orig, dest) {
    if (canMove(state, orig, dest)) {
        if (baseUserMove(state, orig, dest)) {
            var holdTime = hold.stop();
            unselect(state);
            var metadata = {
                premove: false,
                ctrlKey: state.stats.ctrlKey,
                holdTime: holdTime
            };
            callUserFunction(state.movable.events.after, orig, dest, metadata);
            return true;
        }
    }
    else if (canPremove(state, orig, dest)) {
        setPremove(state, orig, dest, {
            ctrlKey: state.stats.ctrlKey
        });
        unselect(state);
    }
    else if (isMovable(state, dest) || isPremovable(state, dest)) {
        setSelected(state, dest);
        hold.start();
    }
    else
        unselect(state);
    return false;
}
exports.userMove = userMove;
function dropNewPiece(state, orig, dest, force) {
    if (canDrop(state, orig, dest) || force) {
        var piece = state.pieces[orig];
        delete state.pieces[orig];
        baseNewPiece(state, piece, dest, force);
        state.movable.dropped = undefined;
        callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
            predrop: false
        });
    }
    else if (canPredrop(state, orig, dest)) {
        setPredrop(state, state.pieces[orig].role, dest);
    }
    else {
        unsetPremove(state);
        unsetPredrop(state);
    }
    delete state.pieces[orig];
    unselect(state);
}
exports.dropNewPiece = dropNewPiece;
function selectSquare(state, key, force) {
    if (state.selected) {
        if (state.selected === key && !state.draggable.enabled) {
            unselect(state);
            hold.cancel();
        }
        else if ((state.selectable.enabled || force) && state.selected !== key) {
            if (userMove(state, state.selected, key))
                state.stats.dragged = false;
        }
        else
            hold.start();
    }
    else if (isMovable(state, key) || isPremovable(state, key)) {
        setSelected(state, key);
        hold.start();
    }
    if (key)
        callUserFunction(state.events.select, key);
}
exports.selectSquare = selectSquare;
function setSelected(state, key) {
    state.selected = key;
    if (isPremovable(state, key)) {
        state.premovable.dests = premove_1.default(state.pieces, key, state.premovable.castle);
    }
    else
        state.premovable.dests = undefined;
}
exports.setSelected = setSelected;
function unselect(state) {
    state.selected = undefined;
    state.premovable.dests = undefined;
    hold.cancel();
}
exports.unselect = unselect;
function isMovable(state, orig) {
    var piece = state.pieces[orig];
    return piece && (state.movable.color === 'both' || (state.movable.color === piece.color &&
        state.turnColor === piece.color));
}
function canMove(state, orig, dest) {
    return orig !== dest && isMovable(state, orig) && (state.movable.free || (!!state.movable.dests && util_1.containsX(state.movable.dests[orig], dest)));
}
function canDrop(state, orig, dest) {
    var piece = state.pieces[orig];
    return piece && dest && (orig === dest || !state.pieces[dest]) && (state.movable.color === 'both' || (state.movable.color === piece.color &&
        state.turnColor === piece.color));
}
function isPremovable(state, orig) {
    var piece = state.pieces[orig];
    return piece && state.premovable.enabled &&
        state.movable.color === piece.color &&
        state.turnColor !== piece.color;
}
function canPremove(state, orig, dest) {
    return orig !== dest &&
        isPremovable(state, orig) &&
        util_1.containsX(premove_1.default(state.pieces, orig, state.premovable.castle), dest);
}
function canPredrop(state, orig, dest) {
    var piece = state.pieces[orig];
    return piece && dest &&
        (!state.pieces[dest] || state.pieces[dest].color !== state.movable.color) &&
        state.predroppable.enabled &&
        (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
        state.movable.color === piece.color &&
        state.turnColor !== piece.color;
}
function isDraggable(state, orig) {
    var piece = state.pieces[orig];
    return piece && state.draggable.enabled && (state.movable.color === 'both' || (state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled)));
}
exports.isDraggable = isDraggable;
function playPremove(state) {
    var move = state.premovable.current;
    if (!move)
        return false;
    var orig = move[0], dest = move[1];
    var success = false;
    if (canMove(state, orig, dest)) {
        if (baseUserMove(state, orig, dest)) {
            var metadata = { premove: true };
            callUserFunction(state.movable.events.after, orig, dest, metadata);
            success = true;
        }
    }
    unsetPremove(state);
    return success;
}
exports.playPremove = playPremove;
function playPredrop(state, validate) {
    var drop = state.predroppable.current, success = false;
    if (!drop)
        return false;
    if (validate(drop)) {
        var piece = {
            role: drop.role,
            color: state.movable.color
        };
        if (baseNewPiece(state, piece, drop.key)) {
            callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
                predrop: true
            });
            success = true;
        }
    }
    unsetPredrop(state);
    return success;
}
exports.playPredrop = playPredrop;
function cancelMove(state) {
    unsetPremove(state);
    unsetPredrop(state);
    unselect(state);
}
exports.cancelMove = cancelMove;
function stop(state) {
    state.movable.color = undefined;
    state.movable.dests = undefined;
    cancelMove(state);
}
exports.stop = stop;
function getKeyAtDomPos(state, pos) {
    var file = Math.ceil(8 * ((pos[0] - state.dom.bounds.left) / state.dom.bounds.width));
    file = state.orientation === 'white' ? file : 9 - file;
    var rank = Math.ceil(8 - (8 * ((pos[1] - state.dom.bounds.top) / state.dom.bounds.height)));
    rank = state.orientation === 'white' ? rank : 9 - rank;
    return (file > 0 && file < 9 && rank > 0 && rank < 9) ? util_1.pos2key([file, rank]) : undefined;
}
exports.getKeyAtDomPos = getKeyAtDomPos;
// {white: {pawn: 3 queen: 1}, black: {bishop: 2}}
function getMaterialDiff(state) {
    var counts = {
        king: 0,
        queen: 0,
        rook: 0,
        bishop: 0,
        knight: 0,
        pawn: 0
    }, p, role, c;
    for (var k in state.pieces) {
        p = state.pieces[k];
        counts[p.role] += ((p.color === 'white') ? 1 : -1);
    }
    var diff = {
        white: {},
        black: {}
    };
    for (role in counts) {
        c = counts[role];
        if (c > 0)
            diff.white[role] = c;
        else if (c < 0)
            diff.black[role] = -c;
    }
    return diff;
}
exports.getMaterialDiff = getMaterialDiff;
var pieceScores = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0
};
function getScore(state) {
    var score = 0;
    for (var k in state.pieces) {
        score += pieceScores[state.pieces[k].role] * (state.pieces[k].color === 'white' ? 1 : -1);
    }
    return score;
}
exports.getScore = getScore;

},{"./hold":21,"./premove":24,"./util":26}],13:[function(require,module,exports){
"use strict";
var board_1 = require("./board");
var fen_1 = require("./fen");
function default_1(state, config) {
    // don't merge destinations. Just override.
    if (config.movable && config.movable.dests)
        state.movable.dests = undefined;
    var configCheck = config.check;
    delete config.check;
    merge(state, config);
    // if a fen was provided, replace the pieces
    if (config.fen) {
        state.pieces = fen_1.read(config.fen);
        state.drawable.shapes = [];
    }
    if (configCheck !== undefined)
        board_1.setCheck(state, configCheck);
    // forget about the last dropped piece
    state.movable.dropped = undefined;
    // fix move/premove dests
    if (state.selected)
        board_1.setSelected(state, state.selected);
    // no need for such short animations
    if (!state.animation.duration || state.animation.duration < 40)
        state.animation.enabled = false;
    if (!state.movable.rookCastle && state.movable.dests) {
        var rank_1 = state.movable.color === 'white' ? 1 : 8;
        var kingStartPos = 'e' + rank_1;
        var dests_1 = state.movable.dests[kingStartPos];
        if (!dests_1 || state.pieces[kingStartPos].role !== 'king')
            return;
        state.movable.dests[kingStartPos] = dests_1.filter(function (d) {
            if ((d === 'a' + rank_1) && dests_1.indexOf('c' + rank_1) !== -1)
                return false;
            if ((d === 'h' + rank_1) && dests_1.indexOf('g' + rank_1) !== -1)
                return false;
            return true;
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;
function merge(base, extend) {
    for (var key in extend) {
        if (isObject(base[key]) && isObject(extend[key]))
            merge(base[key], extend[key]);
        else
            base[key] = extend[key];
    }
}
function isObject(o) {
    return typeof o === 'object';
}

},{"./board":12,"./fen":20}],14:[function(require,module,exports){
"use strict";
var util_1 = require("./util");
function renderCoords(elems, klass) {
    var el = document.createElement('coords');
    el.className = klass;
    var f;
    for (var i in elems) {
        f = document.createElement('coord');
        f.textContent = elems[i];
        el.appendChild(f);
    }
    return el;
}
function default_1(state) {
    if (!state.coordinates)
        return function () { };
    var orientation = state.orientation;
    var coords = document.createDocumentFragment();
    var orientClass = orientation === 'black' ? ' black' : '';
    coords.appendChild(renderCoords(util_1.ranks, 'ranks' + orientClass));
    coords.appendChild(renderCoords(util_1.files, 'files' + orientClass));
    state.dom.element.appendChild(coords);
    return function () {
        if (state.orientation === orientation)
            return;
        orientation = state.orientation;
        var coords = state.dom.element.querySelectorAll('coords');
        for (var i = 0; i < coords.length; ++i)
            coords[i].classList.toggle('black', orientation === 'black');
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;

},{"./util":26}],15:[function(require,module,exports){
"use strict";
var fen = require("./fen");
// see dts/state.d.ts for documentation on the State type
function default_1() {
    return {
        pieces: fen.read(fen.initial),
        orientation: 'white',
        turnColor: 'white',
        coordinates: true,
        autoCastle: false,
        viewOnly: false,
        disableContextMenu: false,
        resizable: true,
        pieceKey: false,
        highlight: {
            lastMove: true,
            check: true,
            dragOver: true
        },
        animation: {
            enabled: true,
            duration: 200
        },
        movable: {
            free: true,
            color: 'both',
            dropOff: 'revert',
            showDests: true,
            events: {},
            rookCastle: true
        },
        premovable: {
            enabled: true,
            showDests: true,
            castle: true,
            events: {}
        },
        predroppable: {
            enabled: false,
            events: {}
        },
        draggable: {
            enabled: true,
            distance: 3,
            autoDistance: true,
            centerPiece: true,
            showGhost: true
        },
        selectable: {
            enabled: true
        },
        stats: {
            dragged: !('ontouchstart' in window)
        },
        events: {},
        drawable: {
            enabled: true,
            eraseOnClick: true,
            shapes: [],
            autoShapes: [],
            brushes: {
                green: { key: 'g', color: '#15781B', opacity: 1, lineWidth: 10 },
                red: { key: 'r', color: '#882020', opacity: 1, lineWidth: 10 },
                blue: { key: 'b', color: '#003088', opacity: 1, lineWidth: 10 },
                yellow: { key: 'y', color: '#e68f00', opacity: 1, lineWidth: 10 },
                paleBlue: { key: 'pb', color: '#003088', opacity: 0.4, lineWidth: 15 },
                paleGreen: { key: 'pg', color: '#15781B', opacity: 0.4, lineWidth: 15 },
                paleRed: { key: 'pr', color: '#882020', opacity: 0.4, lineWidth: 15 },
                paleGrey: { key: 'pgr', color: '#4a4a4a', opacity: 0.35, lineWidth: 15 }
            },
            pieces: {
                baseUrl: 'https://lichess1.org/assets/piece/cburnett/'
            }
        },
        editable: {
            enabled: false,
            selected: 'pointer'
        }
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;

},{"./fen":20}],16:[function(require,module,exports){
"use strict";
var board = require("./board");
var util = require("./util");
var draw = require("./draw");
var originTarget;
function hashPiece(piece) {
    return piece ? piece.color + piece.role : '';
}
function computeSquareBounds(state, key) {
    var pos = util.key2pos(key), bounds = state.dom.bounds;
    if (state.orientation !== 'white') {
        pos[0] = 9 - pos[0];
        pos[1] = 9 - pos[1];
    }
    return {
        left: bounds.left + bounds.width * (pos[0] - 1) / 8,
        top: bounds.top + bounds.height * (8 - pos[1]) / 8,
        width: bounds.width / 8,
        height: bounds.height / 8
    };
}
function start(state, e) {
    if (e.button !== undefined && e.button !== 0)
        return; // only touch or left click
    if (e.touches && e.touches.length > 1)
        return; // support one finger touch only
    e.stopPropagation();
    e.preventDefault();
    originTarget = e.target;
    var previouslySelected = state.selected;
    var position = util.eventPosition(e);
    var orig = board.getKeyAtDomPos(state, position);
    if (!orig)
        return;
    var piece = state.pieces[orig];
    if (!previouslySelected && (state.drawable.eraseOnClick || (!piece || piece.color !== state.turnColor)))
        draw.clear(state);
    if (state.viewOnly)
        return;
    var hadPremove = !!state.premovable.current;
    var hadPredrop = !!state.predroppable.current;
    state.stats.ctrlKey = e.ctrlKey;
    board.selectSquare(state, orig);
    var stillSelected = state.selected === orig;
    if (piece && stillSelected && board.isDraggable(state, orig)) {
        var squareBounds = computeSquareBounds(state, orig);
        state.draggable.current = {
            previouslySelected: previouslySelected,
            orig: orig,
            pieceHash: hashPiece(piece),
            rel: position,
            epos: position,
            pos: [0, 0],
            dec: state.draggable.centerPiece ? [
                position[0] - (squareBounds.left + squareBounds.width / 2),
                position[1] - (squareBounds.top + squareBounds.height / 2)
            ] : [0, 0],
            started: state.draggable.autoDistance && state.stats.dragged
        };
    }
    else {
        if (hadPremove)
            board.unsetPremove(state);
        if (hadPredrop)
            board.unsetPredrop(state);
    }
    processDrag(state);
}
exports.start = start;
function processDrag(state) {
    util.raf(function () {
        var cur = state.draggable.current;
        if (cur) {
            // cancel animations while dragging
            if (state.animation.current && state.animation.current.plan.anims[cur.orig])
                state.animation.current = undefined;
            // if moving piece is gone, cancel
            if (hashPiece(state.pieces[cur.orig]) !== cur.pieceHash)
                cancel(state);
            else {
                if (!cur.started && util.distance(cur.epos, cur.rel) >= state.draggable.distance)
                    cur.started = true;
                if (cur.started) {
                    cur.pos = [
                        cur.epos[0] - cur.rel[0],
                        cur.epos[1] - cur.rel[1]
                    ];
                    cur.over = board.getKeyAtDomPos(state, cur.epos);
                }
            }
        }
        state.dom.redraw();
        if (cur)
            processDrag(state);
    });
}
function move(state, e) {
    if (e.touches && e.touches.length > 1)
        return; // support one finger touch only
    if (state.draggable.current)
        state.draggable.current.epos = util.eventPosition(e);
}
exports.move = move;
function end(state, e) {
    var cur = state.draggable.current;
    if (!cur && (!state.editable.enabled || state.editable.selected === 'pointer'))
        return;
    // comparing with the origin target is an easy way to test that the end event
    // has the same touch origin
    if (e.type === 'touchend' && originTarget !== e.target && cur && !cur.newPiece) {
        state.draggable.current = undefined;
        return;
    }
    board.unsetPremove(state);
    board.unsetPredrop(state);
    var eventPos = util.eventPosition(e);
    var dest = board.getKeyAtDomPos(state, eventPos);
    if (dest) {
        if (state.editable.enabled && state.editable.selected !== 'pointer') {
            if (state.editable.selected === 'trash') {
                delete state.pieces[dest];
                state.dom.redraw();
            }
            else {
                // where pieces to be dropped live. Fix me.
                var key = 'a0';
                state.pieces[key] = state.editable.selected;
                board.dropNewPiece(state, key, dest, true);
            }
        }
        else if (cur && cur.started) {
            if (cur.newPiece)
                board.dropNewPiece(state, cur.orig, dest);
            else {
                if (cur.orig !== dest)
                    state.movable.dropped = [cur.orig, dest];
                state.stats.ctrlKey = e.ctrlKey;
                if (board.userMove(state, cur.orig, dest))
                    state.stats.dragged = true;
            }
        }
    }
    if (cur && cur.orig === cur.previouslySelected && (cur.orig === dest || !dest))
        board.unselect(state);
    else if (!state.selectable.enabled)
        board.unselect(state);
    state.draggable.current = undefined;
}
exports.end = end;
function cancel(state) {
    if (state.draggable.current) {
        state.draggable.current = undefined;
        board.unselect(state);
    }
}
exports.cancel = cancel;

},{"./board":12,"./draw":17,"./util":26}],17:[function(require,module,exports){
"use strict";
var board = require("./board");
var util = require("./util");
var brushes = ['green', 'red', 'blue', 'yellow'];
function eventBrush(e) {
    var a = e.shiftKey && util.isRightButton(e) ? 1 : 0;
    var b = e.altKey ? 2 : 0;
    return brushes[a + b];
}
function start(state, e) {
    if (e.touches && e.touches.length > 1)
        return; // support one finger touch only
    e.stopPropagation();
    e.preventDefault();
    board.cancelMove(state);
    var position = util.eventPosition(e);
    var orig = board.getKeyAtDomPos(state, position);
    if (!orig)
        return;
    state.drawable.current = {
        orig: orig,
        dest: undefined,
        pos: position,
        brush: eventBrush(e)
    };
    processDraw(state);
}
exports.start = start;
function processDraw(state) {
    util.raf(function () {
        var cur = state.drawable.current;
        if (cur) {
            var dest = board.getKeyAtDomPos(state, cur.pos);
            if (cur.orig === dest)
                cur.dest = undefined;
            else
                cur.dest = dest;
        }
        state.dom.redraw();
        if (cur)
            processDraw(state);
    });
}
exports.processDraw = processDraw;
function move(state, e) {
    if (state.drawable.current)
        state.drawable.current.pos = util.eventPosition(e);
}
exports.move = move;
function end(state) {
    var cur = state.drawable.current;
    if (!cur)
        return;
    if (cur.dest)
        addLine(state.drawable, cur, cur.dest);
    else
        addCircle(state.drawable, cur);
    state.drawable.current = undefined;
    state.dom.redraw();
}
exports.end = end;
function cancel(state) {
    if (state.drawable.current)
        state.drawable.current = undefined;
}
exports.cancel = cancel;
function clear(state) {
    if (state.drawable.shapes.length) {
        state.drawable.shapes = [];
        state.dom.redraw();
        onChange(state.drawable);
    }
}
exports.clear = clear;
function not(f) {
    return function (x) { return !f(x); };
}
function addCircle(drawable, cur) {
    var orig = cur.orig;
    var sameCircle = function (s) { return s.orig === orig && !s.dest; };
    var similar = drawable.shapes.filter(sameCircle)[0];
    if (similar)
        drawable.shapes = drawable.shapes.filter(not(sameCircle));
    if (!similar || similar.brush !== cur.brush)
        drawable.shapes.push({
            brush: cur.brush,
            orig: orig
        });
    onChange(drawable);
}
function addLine(drawable, cur, dest) {
    var orig = cur.orig;
    var sameLine = function (s) {
        return !!s.dest && ((s.orig === orig && s.dest === dest) || (s.dest === orig && s.orig === dest));
    };
    var exists = drawable.shapes.filter(sameLine).length > 0;
    if (exists)
        drawable.shapes = drawable.shapes.filter(not(sameLine));
    else
        drawable.shapes.push({
            brush: cur.brush,
            orig: orig,
            dest: dest
        });
    onChange(drawable);
}
function onChange(drawable) {
    if (drawable.onChange)
        drawable.onChange(drawable.shapes);
}

},{"./board":12,"./util":26}],18:[function(require,module,exports){
"use strict";
var drag = require("./drag");
var draw = require("./draw");
var util_1 = require("./util");
var startEvents = ['touchstart', 'mousedown'];
var moveEvents = ['touchmove', 'mousemove'];
var endEvents = ['touchend', 'mouseup'];
// returns the unbind function
function default_1(d) {
    var start = startDragOrDraw(d);
    var move = dragOrDraw(d, drag.move, draw.move);
    var end = dragOrDraw(d, drag.end, draw.end);
    var onstart, onmove, onend;
    if (d.editable.enabled) {
        onstart = function (e) {
            if (d.editable.selected === 'pointer') {
                if (e.type !== 'mousemove')
                    start(e);
            }
            else if (e.type !== 'mousemove' || util_1.isLeftButton(e))
                end(e);
        };
        onmove = function (e) {
            if (d.editable.selected === 'pointer')
                move(e);
        };
        onend = function (e) {
            if (d.editable.selected === 'pointer')
                end(e);
        };
        startEvents.push('mousemove');
    }
    else {
        onstart = start;
        onmove = move;
        onend = end;
    }
    startEvents.forEach(function (ev) { return d.dom.element.addEventListener(ev, onstart); });
    moveEvents.forEach(function (ev) { return document.addEventListener(ev, onmove); });
    endEvents.forEach(function (ev) { return document.addEventListener(ev, onend); });
    bindResize(d);
    var onContextMenu = function (e) {
        if (d.disableContextMenu || d.drawable.enabled) {
            e.preventDefault();
            return false;
        }
        return true;
    };
    d.dom.element.addEventListener('contextmenu', onContextMenu);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function startDragOrDraw(d) {
    return function (e) {
        if (util_1.isRightButton(e) && d.draggable.current) {
            if (d.draggable.current.newPiece)
                delete d.pieces[d.draggable.current.orig];
            d.draggable.current = undefined;
            d.selected = undefined;
        }
        else if ((e.shiftKey || util_1.isRightButton(e)) && d.drawable.enabled)
            draw.start(d, e);
        else
            drag.start(d, e);
    };
}
function dragOrDraw(d, withDrag, withDraw) {
    return function (e) {
        if ((e.shiftKey || util_1.isRightButton(e)) && d.drawable.enabled)
            withDraw(d, e);
        else if (!d.viewOnly)
            withDrag(d, e);
    };
}
function bindResize(d) {
    if (!d.resizable)
        return;
    function recomputeBounds() {
        d.dom.bounds = d.dom.element.getBoundingClientRect();
        d.dom.redraw();
    }
    ['onscroll', 'onresize'].forEach(function (n) {
        var prev = window[n];
        window[n] = function (e) {
            prev && prev.apply(window, e);
            recomputeBounds();
        };
    });
    document.body.addEventListener('chessground.resize', recomputeBounds, false);
}

},{"./drag":16,"./draw":17,"./util":26}],19:[function(require,module,exports){
"use strict";
function default_1(state, keys) {
    state.exploding = {
        stage: 1,
        keys: keys
    };
    state.dom.redraw();
    setTimeout(function () {
        setStage(state, 2);
        setTimeout(function () { return setStage(state, undefined); }, 120);
    }, 120);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function setStage(state, stage) {
    if (state.exploding) {
        if (stage)
            state.exploding.stage = stage;
        else
            state.exploding = undefined;
        state.dom.redraw();
    }
}

},{}],20:[function(require,module,exports){
"use strict";
var util_1 = require("./util");
exports.initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
var roles = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };
var letters = { pawn: 'p', rook: 'r', knight: 'n', bishop: 'b', queen: 'q', king: 'k' };
var flagsRegex = / .+$/;
var zhRegex = /~/g;
function read(fen) {
    if (fen === 'start')
        fen = exports.initial;
    var pieces = {}, x, nb, role;
    fen.replace(flagsRegex, '').replace(zhRegex, '').split('/').forEach(function (row, y) {
        x = 0;
        row.split('').forEach(function (v) {
            nb = parseInt(v);
            if (nb)
                x += nb;
            else {
                ++x;
                role = v.toLowerCase();
                pieces[util_1.pos2key([x, 8 - y])] = {
                    role: roles[role],
                    color: (v === role ? 'black' : 'white')
                };
            }
        });
    });
    return pieces;
}
exports.read = read;
function write(pieces) {
    var piece, letter;
    return [8, 7, 6, 5, 4, 3, 2].reduce(function (str, nb) { return str.replace(new RegExp(Array(nb + 1).join('1'), 'g'), nb); }, util_1.invRanks.map(function (y) {
        return util_1.ranks.map(function (x) {
            piece = pieces[util_1.pos2key([x, y])];
            if (piece) {
                letter = letters[piece.role];
                return piece.color === 'white' ? letter.toUpperCase() : letter;
            }
            else
                return '1';
        }).join('');
    }).join('/'));
}
exports.write = write;

},{"./util":26}],21:[function(require,module,exports){
"use strict";
var startAt;
function start() {
    startAt = new Date();
}
exports.start = start;
function cancel() {
    startAt = undefined;
}
exports.cancel = cancel;
;
function stop() {
    if (!startAt)
        return 0;
    var time = new Date().getTime() - startAt.getTime();
    startAt = undefined;
    return time;
}
exports.stop = stop;
;

},{}],22:[function(require,module,exports){
module.exports = require('./main').default;

},{"./main":23}],23:[function(require,module,exports){
/// <reference path="./dts/index.d.ts" />
"use strict";
var snabbdom_1 = require("snabbdom");
var api_1 = require("./api");
var view_1 = require("./view");
var configure_1 = require("./configure");
var defaults_1 = require("./defaults");
var events_1 = require("./events");
var coords_1 = require("./coords");
var class_1 = require("snabbdom/modules/class");
var attributes_1 = require("snabbdom/modules/attributes");
var style_1 = require("snabbdom/modules/style");
var patch = snabbdom_1.init([class_1.default, attributes_1.default, style_1.default]);
function Chessground(container, config) {
    var placeholder = document.createElement('div');
    container.appendChild(placeholder);
    var state = defaults_1.default();
    configure_1.default(state, config || {});
    state.dom = {
        element: placeholder,
        bounds: container.getBoundingClientRect(),
        redraw: function () { }
    };
    var updateCoords = coords_1.default(state);
    var vnode;
    function redraw() {
        vnode = patch(vnode, view_1.default(api.state));
        updateCoords();
    }
    var api = api_1.default(state);
    vnode = patch(placeholder, view_1.default(api.state));
    state.dom.element = vnode.elm;
    state.dom.redraw = redraw;
    events_1.default(state);
    return api;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Chessground;
;

},{"./api":11,"./configure":13,"./coords":14,"./defaults":15,"./events":18,"./view":27,"snabbdom":7,"snabbdom/modules/attributes":4,"snabbdom/modules/class":5,"snabbdom/modules/style":6}],24:[function(require,module,exports){
"use strict";
var util = require("./util");
function diff(a, b) {
    return Math.abs(a - b);
}
function pawn(color) {
    return function (x1, x2, y1, y2) { return diff(x1, x2) < 2 && (color === 'white' ? (
    // allow 2 squares from 1 and 8, for horde
    y2 === y1 + 1 || (y1 <= 2 && y2 === (y1 + 2) && x1 === x2)) : (y2 === y1 - 1 || (y1 >= 7 && y2 === (y1 - 2) && x1 === x2))); };
}
var knight = function (x1, x2, y1, y2) {
    var xd = diff(x1, x2);
    var yd = diff(y1, y2);
    return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
};
var bishop = function (x1, x2, y1, y2) {
    return diff(x1, x2) === diff(y1, y2);
};
var rook = function (x1, x2, y1, y2) {
    return x1 === x2 || y1 === y2;
};
var queen = function (x1, x2, y1, y2) {
    return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
};
function king(color, rookFiles, canCastle) {
    return function (x1, x2, y1, y2) { return (diff(x1, x2) < 2 && diff(y1, y2) < 2) || (canCastle && y1 === y2 && y1 === (color === 'white' ? 1 : 8) && ((x1 === 5 && (x2 === 3 || x2 === 7)) || util.containsX(rookFiles, x2))); };
}
function rookFilesOf(pieces, color) {
    var piece;
    return Object.keys(pieces).filter(function (key) {
        piece = pieces[key];
        return piece && piece.color === color && piece.role === 'rook';
    }).map(function (key) { return util.key2pos(key)[0]; });
}
function default_1(pieces, key, canCastle) {
    var piece = pieces[key];
    var pos = util.key2pos(key);
    var mobility;
    switch (piece.role) {
        case 'pawn':
            mobility = pawn(piece.color);
            break;
        case 'knight':
            mobility = knight;
            break;
        case 'bishop':
            mobility = bishop;
            break;
        case 'rook':
            mobility = rook;
            break;
        case 'queen':
            mobility = queen;
            break;
        case 'king':
            mobility = king(piece.color, rookFilesOf(pieces, piece.color), canCastle);
            break;
    }
    return util.allPos.filter(function (pos2) {
        return (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]);
    }).map(util.pos2key);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;

},{"./util":26}],25:[function(require,module,exports){
"use strict";
var snabbdom_1 = require("snabbdom");
var util_1 = require("./util");
function default_1(state) {
    var d = state.drawable;
    var allShapes = d.shapes.concat(d.autoShapes);
    if (!allShapes.length && !d.current)
        return;
    if (state.dom.bounds.width !== state.dom.bounds.height)
        return;
    var usedBrushes = computeUsedBrushes(d, allShapes, d.current);
    var renderedShapes = allShapes.map(function (s, i) { return renderShape(state, false, s, i); });
    if (d.current)
        renderedShapes.push(renderShape(state, true, d.current, 9999));
    return snabbdom_1.h('svg', { key: 'svg' }, [defs(usedBrushes)].concat(renderedShapes));
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function circle(brush, pos, current, bounds) {
    var o = pos2px(pos, bounds);
    var width = circleWidth(current, bounds);
    var radius = bounds.width / 16;
    return snabbdom_1.h('circle', {
        attrs: {
            stroke: brush.color,
            'stroke-width': width,
            fill: 'none',
            opacity: opacity(brush, current),
            cx: o[0],
            cy: o[1],
            r: radius - width / 2
        }
    });
}
function arrow(brush, orig, dest, current, bounds) {
    var m = arrowMargin(current, bounds), a = pos2px(orig, bounds), b = pos2px(dest, bounds), dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
    return snabbdom_1.h('line', {
        attrs: {
            stroke: brush.color,
            'stroke-width': lineWidth(brush, current, bounds),
            'stroke-linecap': 'round',
            'marker-end': util_1.isTrident() ? null : 'url(#arrowhead-' + brush.key + ')',
            opacity: opacity(brush, current),
            x1: a[0],
            y1: a[1],
            x2: b[0] - xo,
            y2: b[1] - yo
        }
    });
}
function piece(baseUrl, pos, piece, bounds) {
    var o = pos2px(pos, bounds);
    var size = bounds.width / 8 * (piece.scale || 1);
    var name = piece.color[0] + (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase();
    return snabbdom_1.h('image', {
        attrs: {
            class: piece.color + " " + piece.role,
            x: o[0] - size / 2,
            y: o[1] - size / 2,
            width: size,
            height: size,
            href: baseUrl + name + '.svg'
        }
    });
}
function defs(brushes) {
    return snabbdom_1.h('defs', brushes.map(marker));
}
function marker(brush) {
    return snabbdom_1.h('marker', {
        attrs: {
            id: 'arrowhead-' + brush.key,
            orient: 'auto',
            markerWidth: 4,
            markerHeight: 8,
            refX: 2.05,
            refY: 2.01
        }
    }, [
        snabbdom_1.h('path', {
            attrs: {
                d: 'M0,0 V4 L3,2 Z',
                fill: brush.color
            }
        })
    ]);
}
function orient(pos, color) {
    return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}
function renderShape(state, current, shape, i) {
    if (shape.piece)
        return piece(state.drawable.pieces.baseUrl, orient(util_1.key2pos(shape.orig), state.orientation), shape.piece, state.dom.bounds);
    else {
        var brush = state.drawable.brushes[shape.brush];
        if (shape.brushModifiers)
            brush = makeCustomBrush(brush, shape.brushModifiers, i);
        var orig = orient(util_1.key2pos(shape.orig), state.orientation);
        if (shape.orig && shape.dest)
            return arrow(brush, orig, orient(util_1.key2pos(shape.dest), state.orientation), current, state.dom.bounds);
        else
            return circle(brush, orig, current, state.dom.bounds);
    }
}
function makeCustomBrush(base, modifiers, i) {
    return {
        key: 'cb_' + i,
        color: modifiers.color || base.color,
        opacity: modifiers.opacity || base.opacity,
        lineWidth: modifiers.lineWidth || base.lineWidth
    };
}
function computeUsedBrushes(d, drawn, current) {
    var brushes = [], keys = [], shapes = (current && current.dest) ? drawn.concat(current) : drawn;
    var i, shape, brushKey;
    for (i in shapes) {
        shape = shapes[i];
        if (!shape.dest)
            continue;
        brushKey = shape.brush;
        if (shape.brushModifiers)
            brushes.push(makeCustomBrush(d.brushes[brushKey], shape.brushModifiers, i));
        else if (keys.indexOf(brushKey) === -1) {
            brushes.push(d.brushes[brushKey]);
            keys.push(brushKey);
        }
    }
    return brushes;
}
function circleWidth(current, bounds) {
    return (current ? 3 : 4) / 512 * bounds.width;
}
function lineWidth(brush, current, bounds) {
    return (brush.lineWidth || 10) * (current ? 0.85 : 1) / 512 * bounds.width;
}
function opacity(brush, current) {
    return (brush.opacity || 1) * (current ? 0.9 : 1);
}
function arrowMargin(current, bounds) {
    return util_1.isTrident() ? 0 : ((current ? 10 : 20) / 512 * bounds.width);
}
function pos2px(pos, bounds) {
    var squareSize = bounds.width / 8;
    return [(pos[0] - 0.5) * squareSize, (8.5 - pos[1]) * squareSize];
}

},{"./util":26,"snabbdom":7}],26:[function(require,module,exports){
"use strict";
exports.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
exports.ranks = [1, 2, 3, 4, 5, 6, 7, 8];
exports.invRanks = [8, 7, 6, 5, 4, 3, 2, 1];
exports.fileNumbers = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8
};
function pos2key(pos) {
    return exports.files[pos[0] - 1] + pos[1];
}
exports.pos2key = pos2key;
function key2pos(key) {
    return [exports.fileNumbers[key[0]], parseInt(key[1])];
}
exports.key2pos = key2pos;
function invertKey(key) {
    return exports.files[8 - exports.fileNumbers[key[0]]] + (9 - parseInt(key[1]));
}
exports.invertKey = invertKey;
exports.allPos = [];
exports.allKeys = [];
for (var y = 8; y > 0; --y) {
    for (var x = 1; x < 9; ++x) {
        var pos = [x, y];
        exports.allPos.push(pos);
        exports.allKeys.push(pos2key(pos));
    }
}
exports.invKeys = exports.allKeys.slice(0).reverse();
function opposite(color) {
    return color === 'white' ? 'black' : 'white';
}
exports.opposite = opposite;
function containsX(xs, x) {
    return xs && xs.indexOf(x) !== -1;
}
exports.containsX = containsX;
function distance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
}
exports.distance = distance;
// this must be cached because of the access to document.body.style
var cachedTransformProp;
function computeTransformProp() {
    return 'transform' in document.body.style ?
        'transform' : 'webkitTransform' in document.body.style ?
        'webkitTransform' : 'mozTransform' in document.body.style ?
        'mozTransform' : 'oTransform' in document.body.style ?
        'oTransform' : 'msTransform';
}
function transformProp() {
    if (!cachedTransformProp)
        cachedTransformProp = computeTransformProp();
    return cachedTransformProp;
}
exports.transformProp = transformProp;
var cachedIsTrident;
function isTrident() {
    if (cachedIsTrident === undefined)
        cachedIsTrident = window.navigator.userAgent.indexOf('Trident/') > -1;
    return cachedIsTrident;
}
exports.isTrident = isTrident;
function translate(pos) {
    return 'translate(' + pos[0] + 'px,' + pos[1] + 'px)';
}
exports.translate = translate;
function eventPosition(e) {
    if (e.clientX || e.clientX === 0)
        return [e.clientX, e.clientY];
    if (e.touches && e.targetTouches[0])
        return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    throw 'Cannot find position of event ' + e;
}
exports.eventPosition = eventPosition;
// function partialApply(fn, args) {
//   return fn.bind.apply(fn, [null].concat(args));
// }
// function partial() {
//   return partialApply(arguments[0], Array.prototype.slice.call(arguments, 1));
// }
function isLeftButton(e) {
    return e.buttons === 1 || e.button === 1;
}
exports.isLeftButton = isLeftButton;
function isRightButton(e) {
    return e.buttons === 2 || e.button === 2;
}
exports.isRightButton = isRightButton;
exports.raf = (window.requestAnimationFrame || window.setTimeout).bind(window);

},{}],27:[function(require,module,exports){
"use strict";
var snabbdom_1 = require("snabbdom");
var util = require("./util");
var svg_1 = require("./svg");
function default_1(d) {
    return snabbdom_1.h('div', {
        class: (_a = {
                'cg-board-wrap': true
            },
            _a['orientation-' + d.orientation] = true,
            _a['view-only'] = d.viewOnly,
            _a['manipulable'] = !d.viewOnly,
            _a)
    }, [
        snabbdom_1.h('div', {
            class: {
                'cg-board': true
            }
        }, renderContent(d))
    ]);
    var _a;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
;
function renderPiece(d, key, ctx) {
    var classes = pieceClasses(d.pieces[key]), translate = posToTranslate(util.key2pos(key), ctx), draggable = d.draggable.current, anim = d.animation.current;
    if (draggable && draggable.orig === key && draggable.started) {
        translate[0] += draggable.pos[0] + draggable.dec[0];
        translate[1] += draggable.pos[1] + draggable.dec[1];
        classes['dragging'] = true;
    }
    else if (anim) {
        var myAnim = anim.plan.anims[key];
        if (myAnim) {
            translate[0] += myAnim[1][0];
            translate[1] += myAnim[1][1];
        }
    }
    return snabbdom_1.h(pieceTag, {
        key: 'p' + key,
        class: pieceClasses(d.pieces[key]),
        style: (_a = {}, _a[ctx.transformProp] = util.translate(translate), _a),
    });
    var _a;
}
function renderSquare(key, classes, ctx) {
    return snabbdom_1.h(squareTag, {
        key: 's' + key,
        class: classes,
        style: (_a = {}, _a[ctx.transformProp] = util.translate(posToTranslate(util.key2pos(key), ctx)), _a)
    });
    var _a;
}
function posToTranslate(pos, ctx) {
    return [
        (ctx.asWhite ? pos[0] - 1 : 8 - pos[0]) * ctx.bounds.width / 8,
        (ctx.asWhite ? 8 - pos[1] : pos[1] - 1) * ctx.bounds.height / 8
    ];
}
function renderGhost(key, piece, ctx) {
    var classes = pieceClasses(piece);
    classes['ghost'] = true;
    return snabbdom_1.h(pieceTag, {
        key: 'g' + key,
        class: classes,
        style: (_a = {}, _a[ctx.transformProp] = util.translate(posToTranslate(util.key2pos(key), ctx)), _a)
    });
    var _a;
}
function renderFading(fading, ctx) {
    var classes = pieceClasses(fading.piece);
    classes['fading'] = true;
    return snabbdom_1.h(pieceTag, {
        key: 'f' + util.pos2key(fading.pos),
        class: classes,
        style: (_a = {},
            _a[ctx.transformProp] = util.translate(posToTranslate(fading.pos, ctx)),
            _a.opacity = fading.opacity,
            _a)
    });
    var _a;
}
function addSquare(squares, key, klass) {
    if (squares[key])
        squares[key][klass] = true;
    else
        squares[key] = (_a = {}, _a[klass] = true, _a);
    var _a;
}
function renderSquares(d, ctx) {
    var squares = {};
    var i, k;
    if (d.lastMove && d.highlight.lastMove)
        for (i in d.lastMove) {
            addSquare(squares, d.lastMove[i], 'last-move');
        }
    if (d.check && d.highlight.check)
        addSquare(squares, d.check, 'check');
    if (d.selected) {
        addSquare(squares, d.selected, 'selected');
        var over = d.draggable.current && d.draggable.current.over, dests = d.movable.dests && d.movable.dests[d.selected];
        if (dests)
            for (i in dests) {
                k = dests[i];
                if (d.movable.showDests)
                    addSquare(squares, k, 'move-dest');
                if (k === over)
                    addSquare(squares, k, 'drag-over');
                else if (d.movable.showDests && d.pieces[k])
                    addSquare(squares, k, 'oc');
            }
        var pDests = d.premovable.dests;
        if (pDests)
            for (i in pDests) {
                k = pDests[i];
                if (d.movable.showDests)
                    addSquare(squares, k, 'premove-dest');
                if (k === over)
                    addSquare(squares, k, 'drag-over');
                else if (d.movable.showDests && d.pieces[k])
                    addSquare(squares, k, 'oc');
            }
    }
    var premove = d.premovable.current;
    if (premove)
        for (i in premove)
            addSquare(squares, premove[i], 'current-premove');
    else if (d.predroppable.current)
        addSquare(squares, d.predroppable.current.key, 'current-premove');
    var o = d.exploding;
    if (o)
        for (i in o.keys)
            addSquare(squares, o.keys[i], 'exploding' + o.stage);
    var nodes = [];
    // if (d.items) {
    //   let key: Key, square: SquareClasses | undefined, item: Item;
    //   for (i = 0; i < 64; i++) {
    //     key = util.allKeys[i];
    //     square = squares[key];
    //     item = d.items(util.key2pos(key), key);
    //     if (square || item) {
    //       var sq = renderSquare(key, square ? square.join(' ') + (item ? ' has-item' : '') : 'has-item', ctx);
    //       if (item) sq.children = [item];
    //       dom.push(sq);
    //     }
    //   }
    // }
    for (i in squares)
        nodes.push(renderSquare(i, squares[i], ctx));
    return nodes;
}
function renderContent(d) {
    var ctx = {
        asWhite: d.orientation === 'white',
        bounds: d.dom.bounds,
        transformProp: util.transformProp()
    }, animation = d.animation.current, nodes = renderSquares(d, ctx), fadings = animation && animation.plan.fadings, draggable = d.draggable.current;
    var i;
    if (fadings)
        for (i in fadings)
            nodes.push(renderFading(fadings[i], ctx));
    // must insert pieces in the right order
    // for 3D to display correctly
    var keys = ctx.asWhite ? util.allKeys : util.invKeys;
    if (d.items) {
    }
    else {
        for (i = 0; i < 64; i++) {
            if (d.pieces[keys[i]])
                nodes.push(renderPiece(d, keys[i], ctx));
        }
        // the hack to drag new pieces on the board (editor and crazyhouse)
        // is to put it on a0 then set it as being dragged
        if (draggable && draggable.newPiece)
            nodes.push(renderPiece(d, 'a0', ctx));
    }
    if (draggable && d.draggable.showGhost && !draggable.newPiece) {
        nodes.push(renderGhost(draggable.orig, d.pieces[draggable.orig], ctx));
    }
    if (d.drawable.enabled) {
        var node = svg_1.default(d);
        if (node)
            nodes.push(node);
    }
    return nodes;
}
var pieceTag = 'piece';
var squareTag = 'square';
function pieceClasses(p) {
    return _a = {},
        _a[p.role] = true,
        _a[p.color] = true,
        _a;
    var _a;
}

},{"./svg":25,"./util":26,"snabbdom":7}]},{},[22])(22)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvc3R5bGUuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdGh1bmsuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCJzcmMvYW5pbS50cyIsInNyYy9hcGkudHMiLCJzcmMvYm9hcmQudHMiLCJzcmMvY29uZmlndXJlLnRzIiwic3JjL2Nvb3Jkcy50cyIsInNyYy9kZWZhdWx0cy50cyIsInNyYy9kcmFnLnRzIiwic3JjL2RyYXcudHMiLCJzcmMvZXZlbnRzLnRzIiwic3JjL2V4cGxvc2lvbi50cyIsInNyYy9mZW4udHMiLCJzcmMvaG9sZC50cyIsInNyYy9pbmRleC5qcyIsInNyYy9tYWluLnRzIiwic3JjL3ByZW1vdmUudHMiLCJzcmMvc3ZnLnRzIiwic3JjL3V0aWwudHMiLCJzcmMvdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztJQUMzRyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztRQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLElBQUksQ0FBQyxTQUFLLENBQUM7UUFDWCxJQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBQ0QsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQy9DLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsTUFB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QUFDLEtBQUssQ0FBQztZQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNiLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDO29CQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUM1RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDO29CQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMzRSxDQUFDO1FBQ0QsSUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDbEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2QsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUM7b0JBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7b0JBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzNFLENBQUM7SUFDSCxDQUFDO0lBQ0QsSUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7SUFDckMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLE9BQU8sQ0FBQztZQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDbEYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDO1FBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUVuRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFOUUsSUFBTSxLQUFLLEdBQVksRUFBRSxDQUFDO0lBRTFCLGlCQUFpQjtJQUNqQixpRUFBaUU7SUFDakUsK0JBQStCO0lBQy9CLDZCQUE2QjtJQUM3Qiw2QkFBNkI7SUFDN0IsOENBQThDO0lBQzlDLDRCQUE0QjtJQUM1Qiw2R0FBNkc7SUFDN0csd0NBQXdDO0lBQ3hDLHNCQUFzQjtJQUN0QixRQUFRO0lBQ1IsTUFBTTtJQUNOLElBQUk7SUFFSixHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDO1FBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsdUJBQXVCLENBQVE7SUFDN0IsSUFBTSxHQUFHLEdBQVE7UUFDZixPQUFPLEVBQUUsQ0FBQyxDQUFDLFdBQVcsS0FBSyxPQUFPO1FBQ2xDLE1BQU0sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU07UUFDcEIsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUU7S0FDcEMsRUFDRCxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQy9CLEtBQUssR0FBWSxhQUFhLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUN0QyxPQUFPLEdBQUcsU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUM3QyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7SUFDaEMsSUFBSSxDQUFNLENBQUM7SUFFWCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDO1lBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFMUUsd0NBQXdDO0lBQ3hDLDhCQUE4QjtJQUM5QixJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN2RCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUtaLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFDRCxtRUFBbUU7UUFDbkUsa0RBQWtEO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM5RCxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLElBQUksR0FBRyxhQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBRUQsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3pCLElBQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUUzQixzQkFBc0IsQ0FBUTtJQUM1QixNQUFNO1FBQ0osR0FBQyxDQUFDLENBQUMsSUFBSSxJQUFHLElBQUk7UUFDZCxHQUFDLENBQUMsQ0FBQyxLQUFLLElBQUcsSUFBSTtXQUNmOztBQUNKLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG5mdW5jdGlvbiBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKSB7XG4gICAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG4gICAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGNoaWxkRGF0YSA9IGNoaWxkcmVuW2ldLmRhdGE7XG4gICAgICAgICAgICBpZiAoY2hpbGREYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhZGROUyhjaGlsZERhdGEsIGNoaWxkcmVuW2ldLmNoaWxkcmVuLCBjaGlsZHJlbltpXS5zZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gaChzZWwsIGIsIGMpIHtcbiAgICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgICBpZiAoYyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRhdGEgPSBiO1xuICAgICAgICBpZiAoaXMuYXJyYXkoYykpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHtcbiAgICAgICAgICAgIHRleHQgPSBjO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMgJiYgYy5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2NdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoaXMuYXJyYXkoYikpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYikpIHtcbiAgICAgICAgICAgIHRleHQgPSBiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGIgJiYgYi5zZWwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gW2JdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YSA9IGI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChpcy5wcmltaXRpdmUoY2hpbGRyZW5baV0pKVxuICAgICAgICAgICAgICAgIGNoaWxkcmVuW2ldID0gdm5vZGVfMS52bm9kZSh1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNlbFswXSA9PT0gJ3MnICYmIHNlbFsxXSA9PT0gJ3YnICYmIHNlbFsyXSA9PT0gJ2cnICYmXG4gICAgICAgIChzZWwubGVuZ3RoID09PSAzIHx8IHNlbFszXSA9PT0gJy4nIHx8IHNlbFszXSA9PT0gJyMnKSkge1xuICAgICAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlXzEudm5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn1cbmV4cG9ydHMuaCA9IGg7XG47XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBoO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xufVxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHRleHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5mdW5jdGlvbiBjcmVhdGVDb21tZW50KHRleHQpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCh0ZXh0KTtcbn1cbmZ1bmN0aW9uIGluc2VydEJlZm9yZShwYXJlbnROb2RlLCBuZXdOb2RlLCByZWZlcmVuY2VOb2RlKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdpbnNlcnQnLCBuZXdOb2RlKTtcbiAgICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdyZW1vdmUnLCBjaGlsZCk7XG4gICAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCkge1xuICAvLyBjb25zb2xlLmxvZygnYXBwZW5kJywgY2hpbGQpO1xuICAgIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuZnVuY3Rpb24gcGFyZW50Tm9kZShub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUucGFyZW50Tm9kZTtcbn1cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cbmZ1bmN0aW9uIHRhZ05hbWUoZWxtKSB7XG4gICAgcmV0dXJuIGVsbS50YWdOYW1lO1xufVxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCkge1xuICAgIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuZnVuY3Rpb24gZ2V0VGV4dENvbnRlbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLnRleHRDb250ZW50O1xufVxuZnVuY3Rpb24gaXNFbGVtZW50KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMTtcbn1cbmZ1bmN0aW9uIGlzVGV4dChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDM7XG59XG5mdW5jdGlvbiBpc0NvbW1lbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSA4O1xufVxuZXhwb3J0cy5odG1sRG9tQXBpID0ge1xuICAgIGNyZWF0ZUVsZW1lbnQ6IGNyZWF0ZUVsZW1lbnQsXG4gICAgY3JlYXRlRWxlbWVudE5TOiBjcmVhdGVFbGVtZW50TlMsXG4gICAgY3JlYXRlVGV4dE5vZGU6IGNyZWF0ZVRleHROb2RlLFxuICAgIGNyZWF0ZUNvbW1lbnQ6IGNyZWF0ZUNvbW1lbnQsXG4gICAgaW5zZXJ0QmVmb3JlOiBpbnNlcnRCZWZvcmUsXG4gICAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICAgIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICAgIG5leHRTaWJsaW5nOiBuZXh0U2libGluZyxcbiAgICB0YWdOYW1lOiB0YWdOYW1lLFxuICAgIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudCxcbiAgICBnZXRUZXh0Q29udGVudDogZ2V0VGV4dENvbnRlbnQsXG4gICAgaXNFbGVtZW50OiBpc0VsZW1lbnQsXG4gICAgaXNUZXh0OiBpc1RleHQsXG4gICAgaXNDb21tZW50OiBpc0NvbW1lbnQsXG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5odG1sRG9tQXBpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aHRtbGRvbWFwaS5qcy5tYXBcbiIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0cy5hcnJheSA9IEFycmF5LmlzQXJyYXk7XG5mdW5jdGlvbiBwcmltaXRpdmUocykge1xuICAgIHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5wcmltaXRpdmUgPSBwcmltaXRpdmU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBOYW1lc3BhY2VVUklzID0ge1xuICAgIFwieGxpbmtcIjogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCJcbn07XG52YXIgYm9vbGVhbkF0dHJzID0gW1wiYWxsb3dmdWxsc2NyZWVuXCIsIFwiYXN5bmNcIiwgXCJhdXRvZm9jdXNcIiwgXCJhdXRvcGxheVwiLCBcImNoZWNrZWRcIiwgXCJjb21wYWN0XCIsIFwiY29udHJvbHNcIiwgXCJkZWNsYXJlXCIsXG4gICAgXCJkZWZhdWx0XCIsIFwiZGVmYXVsdGNoZWNrZWRcIiwgXCJkZWZhdWx0bXV0ZWRcIiwgXCJkZWZhdWx0c2VsZWN0ZWRcIiwgXCJkZWZlclwiLCBcImRpc2FibGVkXCIsIFwiZHJhZ2dhYmxlXCIsXG4gICAgXCJlbmFibGVkXCIsIFwiZm9ybW5vdmFsaWRhdGVcIiwgXCJoaWRkZW5cIiwgXCJpbmRldGVybWluYXRlXCIsIFwiaW5lcnRcIiwgXCJpc21hcFwiLCBcIml0ZW1zY29wZVwiLCBcImxvb3BcIiwgXCJtdWx0aXBsZVwiLFxuICAgIFwibXV0ZWRcIiwgXCJub2hyZWZcIiwgXCJub3Jlc2l6ZVwiLCBcIm5vc2hhZGVcIiwgXCJub3ZhbGlkYXRlXCIsIFwibm93cmFwXCIsIFwib3BlblwiLCBcInBhdXNlb25leGl0XCIsIFwicmVhZG9ubHlcIixcbiAgICBcInJlcXVpcmVkXCIsIFwicmV2ZXJzZWRcIiwgXCJzY29wZWRcIiwgXCJzZWFtbGVzc1wiLCBcInNlbGVjdGVkXCIsIFwic29ydGFibGVcIiwgXCJzcGVsbGNoZWNrXCIsIFwidHJhbnNsYXRlXCIsXG4gICAgXCJ0cnVlc3BlZWRcIiwgXCJ0eXBlbXVzdG1hdGNoXCIsIFwidmlzaWJsZVwiXTtcbnZhciBib29sZWFuQXR0cnNEaWN0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBib29sZWFuQXR0cnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBib29sZWFuQXR0cnNEaWN0W2Jvb2xlYW5BdHRyc1tpXV0gPSB0cnVlO1xufVxuZnVuY3Rpb24gdXBkYXRlQXR0cnMob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSwgb2xkQXR0cnMgPSBvbGRWbm9kZS5kYXRhLmF0dHJzLCBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnMsIG5hbWVzcGFjZVNwbGl0O1xuICAgIGlmICghb2xkQXR0cnMgJiYgIWF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZEF0dHJzID09PSBhdHRycylcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZEF0dHJzID0gb2xkQXR0cnMgfHwge307XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fTtcbiAgICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gICAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgY3VyID0gYXR0cnNba2V5XTtcbiAgICAgICAgb2xkID0gb2xkQXR0cnNba2V5XTtcbiAgICAgICAgaWYgKG9sZCAhPT0gY3VyKSB7XG4gICAgICAgICAgICBpZiAoIWN1ciAmJiBib29sZWFuQXR0cnNEaWN0W2tleV0pXG4gICAgICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbmFtZXNwYWNlU3BsaXQgPSBrZXkuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lc3BhY2VTcGxpdC5sZW5ndGggPiAxICYmIE5hbWVzcGFjZVVSSXMuaGFzT3duUHJvcGVydHkobmFtZXNwYWNlU3BsaXRbMF0pKVxuICAgICAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlTlMoTmFtZXNwYWNlVVJJc1tuYW1lc3BhY2VTcGxpdFswXV0sIGtleSwgY3VyKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBjdXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vcmVtb3ZlIHJlbW92ZWQgYXR0cmlidXRlc1xuICAgIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICAgIGZvciAoa2V5IGluIG9sZEF0dHJzKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuYXR0cmlidXRlc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRycyB9O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLCBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3M7XG4gICAgaWYgKCFvbGRDbGFzcyAmJiAha2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ2xhc3MgPT09IGtsYXNzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQ2xhc3MgPSBvbGRDbGFzcyB8fCB7fTtcbiAgICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuICAgIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgICAgICBpZiAoIWtsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICAgICAgY3VyID0ga2xhc3NbbmFtZV07XG4gICAgICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jbGFzc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzcyB9O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jbGFzc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsYXNzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIHJhZiA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB8fCBzZXRUaW1lb3V0O1xudmFyIG5leHRGcmFtZSA9IGZ1bmN0aW9uIChmbikgeyByYWYoZnVuY3Rpb24gKCkgeyByYWYoZm4pOyB9KTsgfTtcbmZ1bmN0aW9uIHNldE5leHRGcmFtZShvYmosIHByb3AsIHZhbCkge1xuICAgIG5leHRGcmFtZShmdW5jdGlvbiAoKSB7IG9ialtwcm9wXSA9IHZhbDsgfSk7XG59XG5mdW5jdGlvbiB1cGRhdGVTdHlsZShvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIgY3VyLCBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sIG9sZFN0eWxlID0gb2xkVm5vZGUuZGF0YS5zdHlsZSwgc3R5bGUgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICAgIGlmICghb2xkU3R5bGUgJiYgIXN0eWxlKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZFN0eWxlID09PSBzdHlsZSlcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZFN0eWxlID0gb2xkU3R5bGUgfHwge307XG4gICAgc3R5bGUgPSBzdHlsZSB8fCB7fTtcbiAgICB2YXIgb2xkSGFzRGVsID0gJ2RlbGF5ZWQnIGluIG9sZFN0eWxlO1xuICAgIGZvciAobmFtZSBpbiBvbGRTdHlsZSkge1xuICAgICAgICBpZiAoIXN0eWxlW25hbWVdKSB7XG4gICAgICAgICAgICBpZiAobmFtZVswXSA9PT0gJy0nICYmIG5hbWVbMV0gPT09ICctJykge1xuICAgICAgICAgICAgICAgIGVsbS5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsbS5zdHlsZVtuYW1lXSA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgICAgICBjdXIgPSBzdHlsZVtuYW1lXTtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdkZWxheWVkJykge1xuICAgICAgICAgICAgZm9yIChuYW1lIGluIHN0eWxlLmRlbGF5ZWQpIHtcbiAgICAgICAgICAgICAgICBjdXIgPSBzdHlsZS5kZWxheWVkW25hbWVdO1xuICAgICAgICAgICAgICAgIGlmICghb2xkSGFzRGVsIHx8IGN1ciAhPT0gb2xkU3R5bGUuZGVsYXllZFtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBzZXROZXh0RnJhbWUoZWxtLnN0eWxlLCBuYW1lLCBjdXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChuYW1lICE9PSAncmVtb3ZlJyAmJiBjdXIgIT09IG9sZFN0eWxlW25hbWVdKSB7XG4gICAgICAgICAgICBpZiAobmFtZVswXSA9PT0gJy0nICYmIG5hbWVbMV0gPT09ICctJykge1xuICAgICAgICAgICAgICAgIGVsbS5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCBjdXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxtLnN0eWxlW25hbWVdID0gY3VyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYXBwbHlEZXN0cm95U3R5bGUodm5vZGUpIHtcbiAgICB2YXIgc3R5bGUsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgcyA9IHZub2RlLmRhdGEuc3R5bGU7XG4gICAgaWYgKCFzIHx8ICEoc3R5bGUgPSBzLmRlc3Ryb3kpKVxuICAgICAgICByZXR1cm47XG4gICAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgICAgIGVsbS5zdHlsZVtuYW1lXSA9IHN0eWxlW25hbWVdO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFwcGx5UmVtb3ZlU3R5bGUodm5vZGUsIHJtKSB7XG4gICAgdmFyIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICAgIGlmICghcyB8fCAhcy5yZW1vdmUpIHtcbiAgICAgICAgcm0oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgbmFtZSwgZWxtID0gdm5vZGUuZWxtLCBpID0gMCwgY29tcFN0eWxlLCBzdHlsZSA9IHMucmVtb3ZlLCBhbW91bnQgPSAwLCBhcHBsaWVkID0gW107XG4gICAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgICAgIGFwcGxpZWQucHVzaChuYW1lKTtcbiAgICAgICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gICAgfVxuICAgIGNvbXBTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxtKTtcbiAgICB2YXIgcHJvcHMgPSBjb21wU3R5bGVbJ3RyYW5zaXRpb24tcHJvcGVydHknXS5zcGxpdCgnLCAnKTtcbiAgICBmb3IgKDsgaSA8IHByb3BzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChhcHBsaWVkLmluZGV4T2YocHJvcHNbaV0pICE9PSAtMSlcbiAgICAgICAgICAgIGFtb3VudCsrO1xuICAgIH1cbiAgICBlbG0uYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uIChldikge1xuICAgICAgICBpZiAoZXYudGFyZ2V0ID09PSBlbG0pXG4gICAgICAgICAgICAtLWFtb3VudDtcbiAgICAgICAgaWYgKGFtb3VudCA9PT0gMClcbiAgICAgICAgICAgIHJtKCk7XG4gICAgfSk7XG59XG5leHBvcnRzLnN0eWxlTW9kdWxlID0ge1xuICAgIGNyZWF0ZTogdXBkYXRlU3R5bGUsXG4gICAgdXBkYXRlOiB1cGRhdGVTdHlsZSxcbiAgICBkZXN0cm95OiBhcHBseURlc3Ryb3lTdHlsZSxcbiAgICByZW1vdmU6IGFwcGx5UmVtb3ZlU3R5bGVcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLnN0eWxlTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c3R5bGUuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgdm5vZGVfMSA9IHJlcXVpcmUoXCIuL3Zub2RlXCIpO1xudmFyIGlzID0gcmVxdWlyZShcIi4vaXNcIik7XG52YXIgaHRtbGRvbWFwaV8xID0gcmVxdWlyZShcIi4vaHRtbGRvbWFwaVwiKTtcbmZ1bmN0aW9uIGlzVW5kZWYocykgeyByZXR1cm4gcyA9PT0gdW5kZWZpbmVkOyB9XG5mdW5jdGlvbiBpc0RlZihzKSB7IHJldHVybiBzICE9PSB1bmRlZmluZWQ7IH1cbnZhciBlbXB0eU5vZGUgPSB2bm9kZV8xLmRlZmF1bHQoJycsIHt9LCBbXSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuZnVuY3Rpb24gc2FtZVZub2RlKHZub2RlMSwgdm5vZGUyKSB7XG4gICAgcmV0dXJuIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiYgdm5vZGUxLnNlbCA9PT0gdm5vZGUyLnNlbDtcbn1cbmZ1bmN0aW9uIGlzVm5vZGUodm5vZGUpIHtcbiAgICByZXR1cm4gdm5vZGUuc2VsICE9PSB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBjcmVhdGVLZXlUb09sZElkeChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICAgIHZhciBpLCBtYXAgPSB7fSwga2V5LCBjaDtcbiAgICBmb3IgKGkgPSBiZWdpbklkeDsgaSA8PSBlbmRJZHg7ICsraSkge1xuICAgICAgICBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAga2V5ID0gY2gua2V5O1xuICAgICAgICAgICAgaWYgKGtleSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIG1hcFtrZXldID0gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxudmFyIGhvb2tzID0gWydjcmVhdGUnLCAndXBkYXRlJywgJ3JlbW92ZScsICdkZXN0cm95JywgJ3ByZScsICdwb3N0J107XG52YXIgaF8xID0gcmVxdWlyZShcIi4vaFwiKTtcbmV4cG9ydHMuaCA9IGhfMS5oO1xudmFyIHRodW5rXzEgPSByZXF1aXJlKFwiLi90aHVua1wiKTtcbmV4cG9ydHMudGh1bmsgPSB0aHVua18xLnRodW5rO1xuZnVuY3Rpb24gaW5pdChtb2R1bGVzLCBkb21BcGkpIHtcbiAgICB2YXIgaSwgaiwgY2JzID0ge307XG4gICAgdmFyIGFwaSA9IGRvbUFwaSAhPT0gdW5kZWZpbmVkID8gZG9tQXBpIDogaHRtbGRvbWFwaV8xLmRlZmF1bHQ7XG4gICAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNic1tob29rc1tpXV0gPSBbXTtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICAgIHZhciBob29rID0gbW9kdWxlc1tqXVtob29rc1tpXV07XG4gICAgICAgICAgICBpZiAoaG9vayAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY2JzW2hvb2tzW2ldXS5wdXNoKGhvb2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICAgICAgICB2YXIgaWQgPSBlbG0uaWQgPyAnIycgKyBlbG0uaWQgOiAnJztcbiAgICAgICAgdmFyIGMgPSBlbG0uY2xhc3NOYW1lID8gJy4nICsgZWxtLmNsYXNzTmFtZS5zcGxpdCgnICcpLmpvaW4oJy4nKSA6ICcnO1xuICAgICAgICByZXR1cm4gdm5vZGVfMS5kZWZhdWx0KGFwaS50YWdOYW1lKGVsbSkudG9Mb3dlckNhc2UoKSArIGlkICsgYywge30sIFtdLCB1bmRlZmluZWQsIGVsbSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZVJtQ2IoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcm1DYigpIHtcbiAgICAgICAgICAgIGlmICgtLWxpc3RlbmVycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciBwYXJlbnRfMSA9IGFwaS5wYXJlbnROb2RlKGNoaWxkRWxtKTtcbiAgICAgICAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50XzEsIGNoaWxkRWxtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgICAgdmFyIGksIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgICAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuaW5pdCkpIHtcbiAgICAgICAgICAgICAgICBpKHZub2RlKTtcbiAgICAgICAgICAgICAgICBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbiwgc2VsID0gdm5vZGUuc2VsO1xuICAgICAgICBpZiAoc2VsID09PSAnIScpIHtcbiAgICAgICAgICAgIGlmIChpc1VuZGVmKHZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgdm5vZGUudGV4dCA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdm5vZGUuZWxtID0gYXBpLmNyZWF0ZUNvbW1lbnQodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2VsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIFBhcnNlIHNlbGVjdG9yXG4gICAgICAgICAgICB2YXIgaGFzaElkeCA9IHNlbC5pbmRleE9mKCcjJyk7XG4gICAgICAgICAgICB2YXIgZG90SWR4ID0gc2VsLmluZGV4T2YoJy4nLCBoYXNoSWR4KTtcbiAgICAgICAgICAgIHZhciBoYXNoID0gaGFzaElkeCA+IDAgPyBoYXNoSWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkb3QgPSBkb3RJZHggPiAwID8gZG90SWR4IDogc2VsLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciB0YWcgPSBoYXNoSWR4ICE9PSAtMSB8fCBkb3RJZHggIT09IC0xID8gc2VsLnNsaWNlKDAsIE1hdGgubWluKGhhc2gsIGRvdCkpIDogc2VsO1xuICAgICAgICAgICAgdmFyIGVsbSA9IHZub2RlLmVsbSA9IGlzRGVmKGRhdGEpICYmIGlzRGVmKGkgPSBkYXRhLm5zKSA/IGFwaS5jcmVhdGVFbGVtZW50TlMoaSwgdGFnKVxuICAgICAgICAgICAgICAgIDogYXBpLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgICAgICAgIGlmIChoYXNoIDwgZG90KVxuICAgICAgICAgICAgICAgIGVsbS5pZCA9IHNlbC5zbGljZShoYXNoICsgMSwgZG90KTtcbiAgICAgICAgICAgIGlmIChkb3RJZHggPiAwKVxuICAgICAgICAgICAgICAgIGVsbS5jbGFzc05hbWUgPSBzZWwuc2xpY2UoZG90ICsgMSkucmVwbGFjZSgvXFwuL2csICcgJyk7XG4gICAgICAgICAgICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzLnByaW1pdGl2ZSh2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgICAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICAgICAgICAgIGlmIChpLmNyZWF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaS5jcmVhdGUoZW1wdHlOb2RlLCB2bm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKGkuaW5zZXJ0KVxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2bm9kZS5lbG0gPSBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKGNoLCBpbnNlcnRlZFZub2RlUXVldWUpLCBiZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludm9rZURlc3Ryb3lIb29rKHZub2RlKSB7XG4gICAgICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmRlc3Ryb3kpKVxuICAgICAgICAgICAgICAgIGkodm5vZGUpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgICAgICAgIGlmICh2bm9kZS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHZub2RlLmNoaWxkcmVuLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICAgICAgICAgIGkgPSB2bm9kZS5jaGlsZHJlbltqXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT0gbnVsbCAmJiB0eXBlb2YgaSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4KSB7XG4gICAgICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgICAgICAgIHZhciBpXzEgPSB2b2lkIDAsIGxpc3RlbmVycyA9IHZvaWQgMCwgcm0gPSB2b2lkIDAsIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKGNoLnNlbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJtID0gY3JlYXRlUm1DYihjaC5lbG0sIGxpc3RlbmVycyk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaV8xID0gMDsgaV8xIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraV8xKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2JzLnJlbW92ZVtpXzFdKGNoLCBybSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZihpXzEgPSBjaC5kYXRhKSAmJiBpc0RlZihpXzEgPSBpXzEuaG9vaykgJiYgaXNEZWYoaV8xID0gaV8xLnJlbW92ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlfMShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgICAgIHZhciBvbGRFbmRJZHggPSBvbGRDaC5sZW5ndGggLSAxO1xuICAgICAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgICAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgICAgICB2YXIgbmV3RW5kSWR4ID0gbmV3Q2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICAgICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICAgICAgdmFyIG9sZEtleVRvSWR4O1xuICAgICAgICB2YXIgaWR4SW5PbGQ7XG4gICAgICAgIHZhciBlbG1Ub01vdmU7XG4gICAgICAgIHZhciBiZWZvcmU7XG4gICAgICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICBpZiAob2xkU3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdOyAvLyBWbm9kZSBtaWdodCBoYXZlIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAob2xkRW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3U3RhcnRWbm9kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobmV3RW5kVm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgICAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChvbGRLZXlUb0lkeCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoaXNVbmRlZihpZHhJbk9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbVRvTW92ZS5zZWwgIT09IG5ld1N0YXJ0Vm5vZGUuc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSksIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUoZWxtVG9Nb3ZlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgICAgICAgYmVmb3JlID0gbmV3Q2hbbmV3RW5kSWR4ICsgMV0gPT0gbnVsbCA/IG51bGwgOiBuZXdDaFtuZXdFbmRJZHggKyAxXS5lbG07XG4gICAgICAgICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0SWR4ID4gbmV3RW5kSWR4KSB7XG4gICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBvbGRDaCwgb2xkU3RhcnRJZHgsIG9sZEVuZElkeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgICAgICB2YXIgaSwgaG9vaztcbiAgICAgICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgICAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICB2YXIgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgdmFyIGNoID0gdm5vZGUuY2hpbGRyZW47XG4gICAgICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGlmICh2bm9kZS5kYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMudXBkYXRlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgICAgIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSlcbiAgICAgICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVW5kZWYodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihvbGRDaCkgJiYgaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZENoICE9PSBjaClcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihjaCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpXG4gICAgICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHBhdGNoKG9sZFZub2RlLCB2bm9kZSkge1xuICAgICAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgICAgIHZhciBpbnNlcnRlZFZub2RlUXVldWUgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucHJlW2ldKCk7XG4gICAgICAgIGlmICghaXNWbm9kZShvbGRWbm9kZSkpIHtcbiAgICAgICAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICAgICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuICAgICAgICAgICAgY3JlYXRlRWxtKHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50LCB2bm9kZS5lbG0sIGFwaS5uZXh0U2libGluZyhlbG0pKTtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgIGNicy5wb3N0W2ldKCk7XG4gICAgICAgIHJldHVybiB2bm9kZTtcbiAgICB9O1xufVxuZXhwb3J0cy5pbml0ID0gaW5pdDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNuYWJiZG9tLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5mdW5jdGlvbiBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspIHtcbiAgICB0aHVuay5lbG0gPSB2bm9kZS5lbG07XG4gICAgdm5vZGUuZGF0YS5mbiA9IHRodW5rLmRhdGEuZm47XG4gICAgdm5vZGUuZGF0YS5hcmdzID0gdGh1bmsuZGF0YS5hcmdzO1xuICAgIHRodW5rLmRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIHRodW5rLmNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW47XG4gICAgdGh1bmsudGV4dCA9IHZub2RlLnRleHQ7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xufVxuZnVuY3Rpb24gaW5pdCh0aHVuaykge1xuICAgIHZhciBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciB2bm9kZSA9IGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGN1ci5hcmdzKTtcbiAgICBjb3B5VG9UaHVuayh2bm9kZSwgdGh1bmspO1xufVxuZnVuY3Rpb24gcHJlcGF0Y2gob2xkVm5vZGUsIHRodW5rKSB7XG4gICAgdmFyIGksIG9sZCA9IG9sZFZub2RlLmRhdGEsIGN1ciA9IHRodW5rLmRhdGE7XG4gICAgdmFyIG9sZEFyZ3MgPSBvbGQuYXJncywgYXJncyA9IGN1ci5hcmdzO1xuICAgIGlmIChvbGQuZm4gIT09IGN1ci5mbiB8fCBvbGRBcmdzLmxlbmd0aCAhPT0gYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29weVRvVGh1bmsoY3VyLmZuLmFwcGx5KHVuZGVmaW5lZCwgYXJncyksIHRodW5rKTtcbiAgICB9XG4gICAgZm9yIChpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgaWYgKG9sZEFyZ3NbaV0gIT09IGFyZ3NbaV0pIHtcbiAgICAgICAgICAgIGNvcHlUb1RodW5rKGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGFyZ3MpLCB0aHVuayk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29weVRvVGh1bmsob2xkVm5vZGUsIHRodW5rKTtcbn1cbmV4cG9ydHMudGh1bmsgPSBmdW5jdGlvbiB0aHVuayhzZWwsIGtleSwgZm4sIGFyZ3MpIHtcbiAgICBpZiAoYXJncyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGFyZ3MgPSBmbjtcbiAgICAgICAgZm4gPSBrZXk7XG4gICAgICAgIGtleSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgcmV0dXJuIGhfMS5oKHNlbCwge1xuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgaG9vazogeyBpbml0OiBpbml0LCBwcmVwYXRjaDogcHJlcGF0Y2ggfSxcbiAgICAgICAgZm46IGZuLFxuICAgICAgICBhcmdzOiBhcmdzXG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy50aHVuaztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXRodW5rLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gdm5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgZWxtKSB7XG4gICAgdmFyIGtleSA9IGRhdGEgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGRhdGEua2V5O1xuICAgIHJldHVybiB7IHNlbDogc2VsLCBkYXRhOiBkYXRhLCBjaGlsZHJlbjogY2hpbGRyZW4sXG4gICAgICAgIHRleHQ6IHRleHQsIGVsbTogZWxtLCBrZXk6IGtleSB9O1xufVxuZXhwb3J0cy52bm9kZSA9IHZub2RlO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm5vZGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD12bm9kZS5qcy5tYXAiLCJpbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcblxudHlwZSBNdXRhdGlvbjxBPiA9IChzdGF0ZTogU3RhdGUpID0+IEE7XG5cbi8vIHRyYW5zZm9ybWF0aW9uIGlzIGEgZnVuY3Rpb25cbi8vIGFjY2VwdHMgYm9hcmQgc3RhdGUgYW5kIGFueSBudW1iZXIgb2YgYXJndW1lbnRzLFxuLy8gYW5kIG11dGF0ZXMgdGhlIGJvYXJkLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb248QT4obXV0YXRpb246IE11dGF0aW9uPEE+LCBzdGF0ZTogU3RhdGUsIHNraXA/OiBib29sZWFuKTogQSB7XG4gIGlmIChzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCAmJiAhc2tpcCkgcmV0dXJuIGFuaW1hdGUobXV0YXRpb24sIHN0YXRlKTtcbiAgZWxzZSB7XG4gICAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG5cbmludGVyZmFjZSBNaW5pU3RhdGUge1xuICBvcmllbnRhdGlvbjogQ29sb3I7XG4gIHBpZWNlczogUGllY2VzO1xufVxuaW50ZXJmYWNlIEFuaW1QaWVjZSB7XG4gIGtleTogS2V5O1xuICBwb3M6IFBvcztcbiAgcGllY2U6IFBpZWNlO1xufVxuaW50ZXJmYWNlIEFuaW1QaWVjZXMge1xuICBba2V5OiBzdHJpbmddOiBBbmltUGllY2Vcbn1cblxuZnVuY3Rpb24gbWFrZVBpZWNlKGs6IEtleSwgcGllY2U6IFBpZWNlLCBpbnZlcnQ6IGJvb2xlYW4pOiBBbmltUGllY2Uge1xuICBjb25zdCBrZXkgPSBpbnZlcnQgPyB1dGlsLmludmVydEtleShrKSA6IGs7XG4gIHJldHVybiB7XG4gICAga2V5OiBrZXksXG4gICAgcG9zOiB1dGlsLmtleTJwb3Moa2V5KSxcbiAgICBwaWVjZTogcGllY2VcbiAgfTtcbn1cblxuZnVuY3Rpb24gc2FtZVBpZWNlKHAxOiBQaWVjZSwgcDI6IFBpZWNlKTogYm9vbGVhbiB7XG4gIHJldHVybiBwMS5yb2xlID09PSBwMi5yb2xlICYmIHAxLmNvbG9yID09PSBwMi5jb2xvcjtcbn1cblxuZnVuY3Rpb24gY2xvc2VyKHBpZWNlOiBBbmltUGllY2UsIHBpZWNlczogQW5pbVBpZWNlW10pOiBBbmltUGllY2Uge1xuICByZXR1cm4gcGllY2VzLnNvcnQoKHAxLCBwMikgPT4ge1xuICAgIHJldHVybiB1dGlsLmRpc3RhbmNlKHBpZWNlLnBvcywgcDEucG9zKSAtIHV0aWwuZGlzdGFuY2UocGllY2UucG9zLCBwMi5wb3MpO1xuICB9KVswXTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVBsYW4ocHJldjogTWluaVN0YXRlLCBjdXJyZW50OiBTdGF0ZSk6IEFuaW1QbGFuIHtcbiAgY29uc3Qgd2lkdGggPSBjdXJyZW50LmRvbS5ib3VuZHMud2lkdGggLyA4LFxuICBoZWlnaHQgPSBjdXJyZW50LmRvbS5ib3VuZHMuaGVpZ2h0IC8gOCxcbiAgYW5pbXM6IEFuaW1WZWN0b3JzID0ge30sXG4gIGFuaW1lZE9yaWdzOiBLZXlbXSA9IFtdLFxuICBmYWRpbmdzOiBBbmltRmFkaW5nW10gPSBbXSxcbiAgbWlzc2luZ3M6IEFuaW1QaWVjZVtdID0gW10sXG4gIG5ld3M6IEFuaW1QaWVjZVtdID0gW10sXG4gIGludmVydCA9IHByZXYub3JpZW50YXRpb24gIT09IGN1cnJlbnQub3JpZW50YXRpb24sXG4gIHByZVBpZWNlczogQW5pbVBpZWNlcyA9IHt9LFxuICB3aGl0ZSA9IGN1cnJlbnQub3JpZW50YXRpb24gPT09ICd3aGl0ZScsXG4gIGRyb3BwZWQgPSBjdXJyZW50Lm1vdmFibGUuZHJvcHBlZDtcbiAgbGV0IGN1clA6IFBpZWNlLCBwcmVQOiBBbmltUGllY2UsIGk6IGFueSwga2V5OiBLZXksIG9yaWc6IFBvcywgZGVzdDogUG9zLCB2ZWN0b3I6IE51bWJlclBhaXI7XG4gIGZvciAoaSBpbiBwcmV2LnBpZWNlcykge1xuICAgIHByZVBpZWNlc1tpXSA9IG1ha2VQaWVjZShpIGFzIEtleSwgcHJldi5waWVjZXNbaV0sIGludmVydCk7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IHV0aWwuYWxsS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIGtleSA9IHV0aWwuYWxsS2V5c1tpXTtcbiAgICBpZiAoIWRyb3BwZWQgfHwga2V5ICE9PSBkcm9wcGVkWzFdKSB7XG4gICAgICBjdXJQID0gY3VycmVudC5waWVjZXNba2V5XTtcbiAgICAgIHByZVAgPSBwcmVQaWVjZXNba2V5XTtcbiAgICAgIGlmIChjdXJQKSB7XG4gICAgICAgIGlmIChwcmVQKSB7XG4gICAgICAgICAgaWYgKCFzYW1lUGllY2UoY3VyUCwgcHJlUC5waWVjZSkpIHtcbiAgICAgICAgICAgIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gICAgICAgICAgICBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCwgZmFsc2UpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZVxuICAgICAgICBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCwgZmFsc2UpKTtcbiAgICAgIH0gZWxzZSBpZiAocHJlUClcbiAgICAgIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gICAgfVxuICB9XG4gIG5ld3MuZm9yRWFjaChuZXdQID0+IHtcbiAgICBwcmVQID0gY2xvc2VyKG5ld1AsIG1pc3NpbmdzLmZpbHRlcihwID0+IHNhbWVQaWVjZShuZXdQLnBpZWNlLCBwLnBpZWNlKSkpO1xuICAgIGlmIChwcmVQKSB7XG4gICAgICBvcmlnID0gd2hpdGUgPyBwcmVQLnBvcyA6IG5ld1AucG9zO1xuICAgICAgZGVzdCA9IHdoaXRlID8gbmV3UC5wb3MgOiBwcmVQLnBvcztcbiAgICAgIHZlY3RvciA9IFsob3JpZ1swXSAtIGRlc3RbMF0pICogd2lkdGgsIChkZXN0WzFdIC0gb3JpZ1sxXSkgKiBoZWlnaHRdO1xuICAgICAgYW5pbXNbbmV3UC5rZXldID0gW3ZlY3RvciwgdmVjdG9yXTtcbiAgICAgIGFuaW1lZE9yaWdzLnB1c2gocHJlUC5rZXkpO1xuICAgIH1cbiAgfSk7XG4gIG1pc3NpbmdzLmZvckVhY2gocCA9PiB7XG4gICAgaWYgKFxuICAgICAgKCFkcm9wcGVkIHx8IHAua2V5ICE9PSBkcm9wcGVkWzBdKSAmJlxuICAgICAgIXV0aWwuY29udGFpbnNYKGFuaW1lZE9yaWdzLCBwLmtleSkgJiZcbiAgICAgICEoY3VycmVudC5pdGVtcyA/IGN1cnJlbnQuaXRlbXMocC5wb3MsIHAua2V5KSA6IGZhbHNlKVxuICAgIClcbiAgICBmYWRpbmdzLnB1c2goe1xuICAgICAgcG9zOiBwLnBvcyxcbiAgICAgIHBpZWNlOiBwLnBpZWNlLFxuICAgICAgb3BhY2l0eTogMVxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGFuaW1zOiBhbmltcyxcbiAgICBmYWRpbmdzOiBmYWRpbmdzXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJvdW5kQnkobjogbnVtYmVyLCBieTogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIE1hdGgucm91bmQobiAqIGJ5KSAvIGJ5O1xufVxuXG5mdW5jdGlvbiBnbyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKCFzdGF0ZS5hbmltYXRpb24uY3VycmVudCB8fCAhc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQuc3RhcnQpIHJldHVybjsgLy8gYW5pbWF0aW9uIHdhcyBjYW5jZWxlZFxuICBjb25zdCByZXN0ID0gMSAtIChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50LnN0YXJ0KSAvIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50LmR1cmF0aW9uO1xuICBpZiAocmVzdCA8PSAwKSB7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9IGVsc2Uge1xuICAgIGxldCBpOiBhbnk7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGkgaW4gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQucGxhbi5hbmltcykge1xuICAgICAgY29uc3QgY2ZnID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQucGxhbi5hbmltc1tpXTtcbiAgICAgIGNmZ1sxXSA9IFtyb3VuZEJ5KGNmZ1swXVswXSAqIGVhc2UsIDEwKSwgcm91bmRCeShjZmdbMF1bMV0gKiBlYXNlLCAxMCldO1xuICAgIH1cbiAgICBmb3IgKGkgaW4gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQucGxhbi5mYWRpbmdzKSB7XG4gICAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudC5wbGFuLmZhZGluZ3NbaV0ub3BhY2l0eSA9IHJvdW5kQnkoZWFzZSwgMTAwKTtcbiAgICB9XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgIHV0aWwucmFmKCgpID0+IGdvKHN0YXRlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldjogTWluaVN0YXRlID0ge1xuICAgIG9yaWVudGF0aW9uOiBzdGF0ZS5vcmllbnRhdGlvbixcbiAgICBwaWVjZXM6IHt9IGFzIFBpZWNlc1xuICB9O1xuICAvLyBjbG9uZSBwaWVjZXNcbiAgZm9yIChsZXQga2V5IGluIHN0YXRlLnBpZWNlcykge1xuICAgIHByZXYucGllY2VzW2tleV0gPSB7XG4gICAgICByb2xlOiBzdGF0ZS5waWVjZXNba2V5XS5yb2xlLFxuICAgICAgY29sb3I6IHN0YXRlLnBpZWNlc1trZXldLmNvbG9yXG4gICAgfTtcbiAgfVxuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIGlmIChzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCkge1xuICAgIGNvbnN0IHBsYW4gPSBjb21wdXRlUGxhbihwcmV2LCBzdGF0ZSk7XG4gICAgaWYgKCFpc09iamVjdEVtcHR5KHBsYW4uYW5pbXMpIHx8ICFpc09iamVjdEVtcHR5KHBsYW4uZmFkaW5ncykpIHtcbiAgICAgIGNvbnN0IGFscmVhZHlSdW5uaW5nID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgJiYgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQuc3RhcnQ7XG4gICAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHtcbiAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICBkdXJhdGlvbjogc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uLFxuICAgICAgICBwbGFuOiBwbGFuXG4gICAgICB9O1xuICAgICAgaWYgKCFhbHJlYWR5UnVubmluZykgZ28oc3RhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkb24ndCBhbmltYXRlLCBqdXN0IHJlbmRlciByaWdodCBhd2F5XG4gICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIGFuaW1hdGlvbnMgYXJlIG5vdyBkaXNhYmxlZFxuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc09iamVjdEVtcHR5KG86IGFueSk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBfIGluIG8pIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuZnVuY3Rpb24gZWFzaW5nKHQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6ICh0IC0gMSkgKiAoMiAqIHQgLSAyKSAqICgyICogdCAtIDIpICsgMTtcbn1cbiIsImltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyB3cml0ZSBhcyBmZW5Xcml0ZSB9IGZyb20gJy4vZmVuJ1xuaW1wb3J0IGNvbmZpZ3VyZSBmcm9tICcuL2NvbmZpZ3VyZSdcbmltcG9ydCBhbmltIGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IGNhbmNlbCBhcyBkcmFnQ2FuY2VsIH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0IGV4cGxvc2lvbiBmcm9tICcuL2V4cGxvc2lvbidcblxuLy8gc2VlIEFQSSB0eXBlcyBhbmQgZG9jdW1lbnRhdGlvbnMgaW4gZHRzL2FwaS5kLnRzXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzdGF0ZTogU3RhdGUpOiBBcGkge1xuXG4gIHJldHVybiB7XG5cbiAgICBzZXQoY29uZmlnKSB7XG4gICAgICBhbmltKHN0YXRlID0+IGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzdGF0ZSxcblxuICAgIGdldEZlbjogKCkgPT4gZmVuV3JpdGUoc3RhdGUucGllY2VzKSxcblxuICAgIGdldE1hdGVyaWFsRGlmZjogKCkgPT4gYm9hcmQuZ2V0TWF0ZXJpYWxEaWZmKHN0YXRlKSxcblxuICAgIHRvZ2dsZU9yaWVudGF0aW9uKCkge1xuICAgICAgYW5pbShib2FyZC50b2dnbGVPcmllbnRhdGlvbiwgc3RhdGUpO1xuICAgICAgLy8gaWYgKHRoaXMuc3RhdGUucmVkcmF3Q29vcmRzKSB0aGlzLnN0YXRlLnJlZHJhd0Nvb3Jkcyh0aGlzLnN0YXRlLm9yaWVudGF0aW9uKTtcbiAgICAgIH0sXG5cbiAgICBzZXRQaWVjZXMocGllY2VzKSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLnNldFBpZWNlcyhzdGF0ZSwgcGllY2VzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZWxlY3RTcXVhcmUoa2V5KSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLnNlbGVjdFNxdWFyZShzdGF0ZSwga2V5KSwgc3RhdGUsIHRydWUpO1xuICAgIH0sXG5cbiAgICBtb3ZlKG9yaWcsIGRlc3QpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIG5ld1BpZWNlKHBpZWNlLCBrZXkpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwga2V5KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBwbGF5UHJlbW92ZSgpIHtcbiAgICAgIGFuaW0oYm9hcmQucGxheVByZW1vdmUsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgcGxheVByZWRyb3AodmFsaWRhdGUpIHtcbiAgICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQucGxheVByZWRyb3Aoc3RhdGUsIHZhbGlkYXRlKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVtb3ZlKCkge1xuICAgICAgYW5pbShib2FyZC51bnNldFByZW1vdmUsIHN0YXRlLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlZHJvcCgpIHtcbiAgICAgIGFuaW0oYm9hcmQudW5zZXRQcmVkcm9wLCBzdGF0ZSwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIGNhbmNlbE1vdmUoKSB7XG4gICAgICBhbmltKHN0YXRlID0+IHsgYm9hcmQuY2FuY2VsTW92ZShzdGF0ZSk7IGRyYWdDYW5jZWwoc3RhdGUpOyB9LCBzdGF0ZSwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIHN0b3AoKSB7XG4gICAgICBhbmltKHN0YXRlID0+IHsgYm9hcmQuc3RvcChzdGF0ZSk7IGRyYWdDYW5jZWwoc3RhdGUpOyB9LCBzdGF0ZSwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIGV4cGxvZGUoa2V5czogS2V5W10pIHtcbiAgICAgIGV4cGxvc2lvbihzdGF0ZSwga2V5cyk7XG4gICAgfSxcblxuICAgIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBTaGFwZVtdKSB7XG4gICAgICBhbmltKHN0YXRlID0+IHN0YXRlLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBzaGFwZXMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U2hhcGVzKHNoYXBlczogU2hhcGVbXSkge1xuICAgICAgYW5pbShzdGF0ZSA9PiBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBzaGFwZXMsIHN0YXRlKTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBwb3Mya2V5LCBrZXkycG9zLCBvcHBvc2l0ZSwgY29udGFpbnNYIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHByZW1vdmUgZnJvbSAnLi9wcmVtb3ZlJ1xuaW1wb3J0ICogYXMgaG9sZCBmcm9tICcuL2hvbGQnXG5cbnR5cGUgQ2FsbGJhY2sgPSAoLi4uYXJnczogYW55W10pID0+IHZvaWQ7XG5cbmZ1bmN0aW9uIGNhbGxVc2VyRnVuY3Rpb24oZjogQ2FsbGJhY2sgfCB1bmRlZmluZWQsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXQoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLmxhc3RNb3ZlID0gdW5kZWZpbmVkO1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQaWVjZXMoc3RhdGU6IFN0YXRlLCBwaWVjZXM6IFBpZWNlcyk6IHZvaWQge1xuICBmb3IgKGxldCBrZXkgaW4gcGllY2VzKSB7XG4gICAgaWYgKHBpZWNlc1trZXldKSBzdGF0ZS5waWVjZXNba2V5XSA9IHBpZWNlc1trZXldO1xuICAgIGVsc2UgZGVsZXRlIHN0YXRlLnBpZWNlc1trZXldO1xuICB9XG4gIHN0YXRlLm1vdmFibGUuZHJvcHBlZCA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENoZWNrKHN0YXRlOiBTdGF0ZSwgY29sb3I6IENvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBpZiAoY29sb3IgPT09IHRydWUpIGNvbG9yID0gc3RhdGUudHVybkNvbG9yO1xuICBpZiAoIWNvbG9yKSBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgZWxzZSBmb3IgKGxldCBrIGluIHN0YXRlLnBpZWNlcykge1xuICAgIGlmIChzdGF0ZS5waWVjZXNba10ucm9sZSA9PT0gJ2tpbmcnICYmIHN0YXRlLnBpZWNlc1trXS5jb2xvciA9PT0gY29sb3IpIHtcbiAgICAgIHN0YXRlLmNoZWNrID0gayBhcyBLZXk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBLZXksIGRlc3Q6IEtleSwgbWV0YTogYW55KTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IFtvcmlnLCBkZXN0XTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy5zZXQsIG9yaWcsIGRlc3QsIG1ldGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVtb3ZlKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlbW92YWJsZS5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZWRyb3Aoc3RhdGU6IFN0YXRlLCByb2xlOiBSb2xlLCBrZXk6IEtleSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHtcbiAgICByb2xlOiByb2xlLFxuICAgIGtleToga2V5XG4gIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHJvbGUsIGtleSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZWRyb3Aoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IHBkID0gc3RhdGUucHJlZHJvcHBhYmxlO1xuICBpZiAocGQuY3VycmVudCkge1xuICAgIHBkLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihwZC5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyeUF1dG9DYXN0bGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBLZXksIGRlc3Q6IEtleSk6IHZvaWQge1xuICBpZiAoIXN0YXRlLmF1dG9DYXN0bGUpIHJldHVybjtcbiAgY29uc3Qga2luZyA9IHN0YXRlLnBpZWNlc1tkZXN0XTtcbiAgaWYgKGtpbmcucm9sZSAhPT0gJ2tpbmcnKSByZXR1cm47XG4gIGNvbnN0IG9yaWdQb3MgPSBrZXkycG9zKG9yaWcpO1xuICBpZiAob3JpZ1Bvc1swXSAhPT0gNSkgcmV0dXJuO1xuICBpZiAob3JpZ1Bvc1sxXSAhPT0gMSAmJiBvcmlnUG9zWzFdICE9PSA4KSByZXR1cm47XG4gIGNvbnN0IGRlc3RQb3MgPSBrZXkycG9zKGRlc3QpO1xuICBsZXQgb2xkUm9va1BvcywgbmV3Um9va1BvcywgbmV3S2luZ1BvcztcbiAgaWYgKGRlc3RQb3NbMF0gPT09IDcgfHwgZGVzdFBvc1swXSA9PT0gOCkge1xuICAgIG9sZFJvb2tQb3MgPSBwb3Mya2V5KFs4LCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3Um9va1BvcyA9IHBvczJrZXkoWzYsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gcG9zMmtleShbNywgb3JpZ1Bvc1sxXV0pO1xuICB9IGVsc2UgaWYgKGRlc3RQb3NbMF0gPT09IDMgfHwgZGVzdFBvc1swXSA9PT0gMSkge1xuICAgIG9sZFJvb2tQb3MgPSBwb3Mya2V5KFsxLCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3Um9va1BvcyA9IHBvczJrZXkoWzQsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gcG9zMmtleShbMywgb3JpZ1Bvc1sxXV0pO1xuICB9IGVsc2UgcmV0dXJuO1xuICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICBkZWxldGUgc3RhdGUucGllY2VzW2Rlc3RdO1xuICBkZWxldGUgc3RhdGUucGllY2VzW29sZFJvb2tQb3NdO1xuICBzdGF0ZS5waWVjZXNbbmV3S2luZ1Bvc10gPSB7XG4gICAgcm9sZTogJ2tpbmcnLFxuICAgIGNvbG9yOiBraW5nLmNvbG9yXG4gIH07XG4gIHN0YXRlLnBpZWNlc1tuZXdSb29rUG9zXSA9IHtcbiAgICByb2xlOiAncm9vaycsXG4gICAgY29sb3I6IGtpbmcuY29sb3JcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogS2V5LCBkZXN0OiBLZXkpOiBib29sZWFuIHtcbiAgaWYgKG9yaWcgPT09IGRlc3QgfHwgIXN0YXRlLnBpZWNlc1tvcmlnXSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBjYXB0dXJlZDogUGllY2UgfCB1bmRlZmluZWQgPSAoXG4gICAgc3RhdGUucGllY2VzW2Rlc3RdICYmXG4gICAgc3RhdGUucGllY2VzW2Rlc3RdLmNvbG9yICE9PSBzdGF0ZS5waWVjZXNbb3JpZ10uY29sb3JcbiAgKSA/IHN0YXRlLnBpZWNlc1tkZXN0XSA6IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMubW92ZSwgb3JpZywgZGVzdCwgY2FwdHVyZWQpO1xuICBzdGF0ZS5waWVjZXNbZGVzdF0gPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHN0YXRlLmxhc3RNb3ZlID0gW29yaWcsIGRlc3RdO1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgdHJ5QXV0b0Nhc3RsZShzdGF0ZSwgb3JpZywgZGVzdCk7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHN0YXRlLm1vdmFibGUuZHJvcHBlZCA9IHVuZGVmaW5lZDtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBwaWVjZTogUGllY2UsIGtleTogS2V5LCBmb3JjZT86IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgaWYgKHN0YXRlLnBpZWNlc1trZXldKSB7XG4gICAgaWYgKGZvcmNlKSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuZHJvcE5ld1BpZWNlLCBwaWVjZSwga2V5KTtcbiAgc3RhdGUucGllY2VzW2tleV0gPSBwaWVjZTtcbiAgc3RhdGUubGFzdE1vdmUgPSBba2V5LCBrZXldO1xuICBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuY2hhbmdlKTtcbiAgc3RhdGUubW92YWJsZS5kcm9wcGVkID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBzdGF0ZS50dXJuQ29sb3IgPSBvcHBvc2l0ZShzdGF0ZS50dXJuQ29sb3IpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogS2V5LCBkZXN0OiBLZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gYmFzZU1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICBpZiAocmVzdWx0KSB7XG4gICAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHt9O1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogS2V5LCBkZXN0OiBLZXkpOiBib29sZWFuIHtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgaWYgKGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICAgIGNvbnN0IGhvbGRUaW1lID0gaG9sZC5zdG9wKCk7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBjb25zdCBtZXRhZGF0YTogTW92ZU1ldGFkYXRhID0ge1xuICAgICAgICBwcmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgY3RybEtleTogc3RhdGUuc3RhdHMuY3RybEtleSxcbiAgICAgICAgaG9sZFRpbWU6IGhvbGRUaW1lXG4gICAgICB9O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgbWV0YWRhdGEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgc2V0UHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCwge1xuICAgICAgY3RybEtleTogc3RhdGUuc3RhdHMuY3RybEtleVxuICAgIH0pO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgfSBlbHNlIGlmIChpc01vdmFibGUoc3RhdGUsIGRlc3QpIHx8IGlzUHJlbW92YWJsZShzdGF0ZSwgZGVzdCkpIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwgZGVzdCk7XG4gICAgaG9sZC5zdGFydCgpO1xuICB9IGVsc2UgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBvcmlnOiBLZXksIGRlc3Q6IEtleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBmb3JjZSkge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICAgIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gICAgYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZGVzdCwgZm9yY2UpO1xuICAgIHN0YXRlLm1vdmFibGUuZHJvcHBlZCA9IHVuZGVmaW5lZDtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyTmV3UGllY2UsIHBpZWNlLnJvbGUsIGRlc3QsIHtcbiAgICAgIHByZWRyb3A6IGZhbHNlXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBzdGF0ZS5waWVjZXNbb3JpZ10ucm9sZSwgZGVzdCk7XG4gIH0gZWxzZSB7XG4gICAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB9XG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHVuc2VsZWN0KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFNxdWFyZShzdGF0ZTogU3RhdGUsIGtleTogS2V5LCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkIHtcbiAgaWYgKHN0YXRlLnNlbGVjdGVkKSB7XG4gICAgaWYgKHN0YXRlLnNlbGVjdGVkID09PSBrZXkgJiYgIXN0YXRlLmRyYWdnYWJsZS5lbmFibGVkKSB7XG4gICAgICB1bnNlbGVjdChzdGF0ZSk7XG4gICAgICBob2xkLmNhbmNlbCgpO1xuICAgIH0gZWxzZSBpZiAoKHN0YXRlLnNlbGVjdGFibGUuZW5hYmxlZCB8fCBmb3JjZSkgJiYgc3RhdGUuc2VsZWN0ZWQgIT09IGtleSkge1xuICAgICAgaWYgKHVzZXJNb3ZlKHN0YXRlLCBzdGF0ZS5zZWxlY3RlZCwga2V5KSkgc3RhdGUuc3RhdHMuZHJhZ2dlZCA9IGZhbHNlO1xuICAgIH0gZWxzZSBob2xkLnN0YXJ0KCk7XG4gIH0gZWxzZSBpZiAoaXNNb3ZhYmxlKHN0YXRlLCBrZXkpIHx8IGlzUHJlbW92YWJsZShzdGF0ZSwga2V5KSkge1xuICAgIHNldFNlbGVjdGVkKHN0YXRlLCBrZXkpO1xuICAgIGhvbGQuc3RhcnQoKTtcbiAgfVxuICBpZiAoa2V5KSBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5zZWxlY3QsIGtleSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZWxlY3RlZChzdGF0ZTogU3RhdGUsIGtleTogS2V5KTogdm9pZCB7XG4gIHN0YXRlLnNlbGVjdGVkID0ga2V5O1xuICBpZiAoaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKSB7XG4gICAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHByZW1vdmUoc3RhdGUucGllY2VzLCBrZXksIHN0YXRlLnByZW1vdmFibGUuY2FzdGxlKTtcbiAgfVxuICBlbHNlIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNlbGVjdChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG4gIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG4gIGhvbGQuY2FuY2VsKCk7XG59XG5cbmZ1bmN0aW9uIGlzTW92YWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IEtleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuIHBpZWNlICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvclxuICAgICkpO1xufVxuXG5mdW5jdGlvbiBjYW5Nb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogS2V5LCBkZXN0OiBLZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9yaWcgIT09IGRlc3QgJiYgaXNNb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5mcmVlIHx8ICghIXN0YXRlLm1vdmFibGUuZGVzdHMgJiYgY29udGFpbnNYKHN0YXRlLm1vdmFibGUuZGVzdHNbb3JpZ10sIGRlc3QpKVxuICApO1xufVxuXG5mdW5jdGlvbiBjYW5Ecm9wKHN0YXRlOiBTdGF0ZSwgb3JpZzogS2V5LCBkZXN0OiBLZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiBwaWVjZSAmJiBkZXN0ICYmIChvcmlnID09PSBkZXN0IHx8ICFzdGF0ZS5waWVjZXNbZGVzdF0pICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvclxuICAgICkpO1xufVxuXG5cbmZ1bmN0aW9uIGlzUHJlbW92YWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IEtleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuIHBpZWNlICYmIHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCAmJlxuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3I7XG59XG5cbmZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBLZXksIGRlc3Q6IEtleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb3JpZyAhPT0gZGVzdCAmJlxuICBpc1ByZW1vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gIGNvbnRhaW5zWChwcmVtb3ZlKHN0YXRlLnBpZWNlcywgb3JpZywgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpLCBkZXN0KTtcbn1cblxuZnVuY3Rpb24gY2FuUHJlZHJvcChzdGF0ZTogU3RhdGUsIG9yaWc6IEtleSwgZGVzdDogS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gcGllY2UgJiYgZGVzdCAmJlxuICAoIXN0YXRlLnBpZWNlc1tkZXN0XSB8fCBzdGF0ZS5waWVjZXNbZGVzdF0uY29sb3IgIT09IHN0YXRlLm1vdmFibGUuY29sb3IpICYmXG4gIHN0YXRlLnByZWRyb3BwYWJsZS5lbmFibGVkICYmXG4gIChwaWVjZS5yb2xlICE9PSAncGF3bicgfHwgKGRlc3RbMV0gIT09ICcxJyAmJiBkZXN0WzFdICE9PSAnOCcpKSAmJlxuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RyYWdnYWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IEtleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuIHBpZWNlICYmIHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiYgKFxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZFxuICAgICAgKVxuICAgIClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVtb3ZlKHN0YXRlOiBTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBtb3ZlID0gc3RhdGUucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAoIW1vdmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZyA9IG1vdmVbMF0sIGRlc3QgPSBtb3ZlWzFdO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBpZiAoYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgICAgY29uc3QgbWV0YWRhdGE6IE1vdmVNZXRhZGF0YSA9IHsgcHJlbW92ZTogdHJ1ZSB9O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgbWV0YWRhdGEpO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZWRyb3Aoc3RhdGU6IFN0YXRlLCB2YWxpZGF0ZTogKGRyb3A6IERyb3ApID0+IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgbGV0IGRyb3AgPSBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCxcbiAgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoIWRyb3ApIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkYXRlKGRyb3ApKSB7XG4gICAgY29uc3QgcGllY2UgPSB7XG4gICAgICByb2xlOiBkcm9wLnJvbGUsXG4gICAgICBjb2xvcjogc3RhdGUubW92YWJsZS5jb2xvciBhcyBDb2xvclxuICAgIH07XG4gICAgaWYgKGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRyb3Aua2V5KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlck5ld1BpZWNlLCBkcm9wLnJvbGUsIGRyb3Aua2V5LCB7XG4gICAgICAgIHByZWRyb3A6IHRydWVcbiAgICAgIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZShzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9IHVuZGVmaW5lZDtcbiAgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgY2FuY2VsTW92ZShzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhzdGF0ZTogU3RhdGUsIHBvczogTnVtYmVyUGFpcik6IEtleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5jZWlsKDggKiAoKHBvc1swXSAtIHN0YXRlLmRvbS5ib3VuZHMubGVmdCkgLyBzdGF0ZS5kb20uYm91bmRzLndpZHRoKSk7XG4gIGZpbGUgPSBzdGF0ZS5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJyA/IGZpbGUgOiA5IC0gZmlsZTtcbiAgbGV0IHJhbmsgPSBNYXRoLmNlaWwoOCAtICg4ICogKChwb3NbMV0gLSBzdGF0ZS5kb20uYm91bmRzLnRvcCkgLyBzdGF0ZS5kb20uYm91bmRzLmhlaWdodCkpKTtcbiAgcmFuayA9IHN0YXRlLm9yaWVudGF0aW9uID09PSAnd2hpdGUnID8gcmFuayA6IDkgLSByYW5rO1xuICByZXR1cm4gKGZpbGUgPiAwICYmIGZpbGUgPCA5ICYmIHJhbmsgPiAwICYmIHJhbmsgPCA5KSA/IHBvczJrZXkoW2ZpbGUsIHJhbmtdKSA6IHVuZGVmaW5lZDtcbn1cblxuLy8ge3doaXRlOiB7cGF3bjogMyBxdWVlbjogMX0sIGJsYWNrOiB7YmlzaG9wOiAyfX1cbmV4cG9ydCBmdW5jdGlvbiBnZXRNYXRlcmlhbERpZmYoc3RhdGU6IFN0YXRlKTogTWF0ZXJpYWxEaWZmIHtcbiAgbGV0IGNvdW50cyA9IHtcbiAgICBraW5nOiAwLFxuICAgIHF1ZWVuOiAwLFxuICAgIHJvb2s6IDAsXG4gICAgYmlzaG9wOiAwLFxuICAgIGtuaWdodDogMCxcbiAgICBwYXduOiAwXG4gIH0sIHA6IFBpZWNlLCByb2xlOiBSb2xlLCBjOiBudW1iZXI7XG4gIGZvciAobGV0IGsgaW4gc3RhdGUucGllY2VzKSB7XG4gICAgcCA9IHN0YXRlLnBpZWNlc1trXTtcbiAgICBjb3VudHNbcC5yb2xlXSArPSAoKHAuY29sb3IgPT09ICd3aGl0ZScpID8gMSA6IC0xKTtcbiAgfVxuICBsZXQgZGlmZjogTWF0ZXJpYWxEaWZmID0ge1xuICAgIHdoaXRlOiB7fSxcbiAgICBibGFjazoge31cbiAgfTtcbiAgZm9yIChyb2xlIGluIGNvdW50cykge1xuICAgIGMgPSBjb3VudHNbcm9sZV07XG4gICAgaWYgKGMgPiAwKSBkaWZmLndoaXRlW3JvbGVdID0gYztcbiAgICBlbHNlIGlmIChjIDwgMCkgZGlmZi5ibGFja1tyb2xlXSA9IC1jO1xuICB9XG4gIHJldHVybiBkaWZmO1xufVxuXG5jb25zdCBwaWVjZVNjb3JlcyA9IHtcbiAgcGF3bjogMSxcbiAga25pZ2h0OiAzLFxuICBiaXNob3A6IDMsXG4gIHJvb2s6IDUsXG4gIHF1ZWVuOiA5LFxuICBraW5nOiAwXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2NvcmUoc3RhdGU6IFN0YXRlKTogbnVtYmVyIHtcbiAgbGV0IHNjb3JlID0gMDtcbiAgZm9yIChsZXQgayBpbiBzdGF0ZS5waWVjZXMpIHtcbiAgICBzY29yZSArPSBwaWVjZVNjb3Jlc1tzdGF0ZS5waWVjZXNba10ucm9sZV0gKiAoc3RhdGUucGllY2VzW2tdLmNvbG9yID09PSAnd2hpdGUnID8gMSA6IC0xKTtcbiAgfVxuICByZXR1cm4gc2NvcmU7XG59XG4iLCJpbXBvcnQgeyBzZXRDaGVjaywgc2V0U2VsZWN0ZWQgfSBmcm9tICcuL2JvYXJkJ1xuaW1wb3J0IHsgcmVhZCBhcyBmZW5SZWFkIH0gZnJvbSAnLi9mZW4nXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHN0YXRlOiBTdGF0ZSwgY29uZmlnOiBDb25maWcpIHtcblxuICAvLyBkb24ndCBtZXJnZSBkZXN0aW5hdGlvbnMuIEp1c3Qgb3ZlcnJpZGUuXG4gIGlmIChjb25maWcubW92YWJsZSAmJiBjb25maWcubW92YWJsZS5kZXN0cykgc3RhdGUubW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcblxuICBsZXQgY29uZmlnQ2hlY2s6IENvbG9yIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCA9IGNvbmZpZy5jaGVjaztcblxuICBkZWxldGUgY29uZmlnLmNoZWNrO1xuXG4gIG1lcmdlKHN0YXRlLCBjb25maWcpO1xuXG4gIC8vIGlmIGEgZmVuIHdhcyBwcm92aWRlZCwgcmVwbGFjZSB0aGUgcGllY2VzXG4gIGlmIChjb25maWcuZmVuKSB7XG4gICAgc3RhdGUucGllY2VzID0gZmVuUmVhZChjb25maWcuZmVuKTtcbiAgICBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBbXTtcbiAgfVxuXG4gIGlmIChjb25maWdDaGVjayAhPT0gdW5kZWZpbmVkKSBzZXRDaGVjayhzdGF0ZSwgY29uZmlnQ2hlY2spO1xuXG4gIC8vIGZvcmdldCBhYm91dCB0aGUgbGFzdCBkcm9wcGVkIHBpZWNlXG4gIHN0YXRlLm1vdmFibGUuZHJvcHBlZCA9IHVuZGVmaW5lZDtcblxuICAvLyBmaXggbW92ZS9wcmVtb3ZlIGRlc3RzXG4gIGlmIChzdGF0ZS5zZWxlY3RlZCkgc2V0U2VsZWN0ZWQoc3RhdGUsIHN0YXRlLnNlbGVjdGVkKTtcblxuICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgaWYgKCFzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24gfHwgc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uIDwgNDApIHN0YXRlLmFuaW1hdGlvbi5lbmFibGVkID0gZmFsc2U7XG5cbiAgaWYgKCFzdGF0ZS5tb3ZhYmxlLnJvb2tDYXN0bGUgJiYgc3RhdGUubW92YWJsZS5kZXN0cykge1xuICAgIGNvbnN0IHJhbmsgPSBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnd2hpdGUnID8gMSA6IDg7XG4gICAgY29uc3Qga2luZ1N0YXJ0UG9zID0gJ2UnICsgcmFuaztcbiAgICBjb25zdCBkZXN0cyA9IHN0YXRlLm1vdmFibGUuZGVzdHNba2luZ1N0YXJ0UG9zXTtcbiAgICBpZiAoIWRlc3RzIHx8IHN0YXRlLnBpZWNlc1traW5nU3RhcnRQb3NdLnJvbGUgIT09ICdraW5nJykgcmV0dXJuO1xuICAgIHN0YXRlLm1vdmFibGUuZGVzdHNba2luZ1N0YXJ0UG9zXSA9IGRlc3RzLmZpbHRlcihkID0+IHtcbiAgICAgIGlmICgoZCA9PT0gJ2EnICsgcmFuaykgJiYgZGVzdHMuaW5kZXhPZignYycgKyByYW5rIGFzIEtleSkgIT09IC0xKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoKGQgPT09ICdoJyArIHJhbmspICYmIGRlc3RzLmluZGV4T2YoJ2cnICsgcmFuayBhcyBLZXkpICE9PSAtMSkgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1lcmdlKGJhc2U6IGFueSwgZXh0ZW5kOiBhbnkpIHtcbiAgZm9yICh2YXIga2V5IGluIGV4dGVuZCkge1xuICAgIGlmIChpc09iamVjdChiYXNlW2tleV0pICYmIGlzT2JqZWN0KGV4dGVuZFtrZXldKSkgbWVyZ2UoYmFzZVtrZXldLCBleHRlbmRba2V5XSk7XG4gICAgZWxzZSBiYXNlW2tleV0gPSBleHRlbmRba2V5XTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc09iamVjdChvOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHR5cGVvZiBvID09PSAnb2JqZWN0Jztcbn1cbiIsImltcG9ydCB7IHJhbmtzLCBmaWxlcyB9IGZyb20gJy4vdXRpbCdcblxuZnVuY3Rpb24gcmVuZGVyQ29vcmRzKGVsZW1zOiBhbnlbXSwga2xhc3M6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjb29yZHMnKTtcbiAgZWwuY2xhc3NOYW1lID0ga2xhc3M7XG4gIGxldCBmOiBIVE1MRWxlbWVudDtcbiAgZm9yIChsZXQgaSBpbiBlbGVtcykge1xuICAgIGYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjb29yZCcpO1xuICAgIGYudGV4dENvbnRlbnQgPSBlbGVtc1tpXTtcbiAgICBlbC5hcHBlbmRDaGlsZChmKTtcbiAgfVxuICByZXR1cm4gZWw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHN0YXRlOiBTdGF0ZSk6ICgpID0+IHZvaWQge1xuXG4gIGlmICghc3RhdGUuY29vcmRpbmF0ZXMpIHJldHVybiAoKSA9PiB7fTtcblxuICBsZXQgb3JpZW50YXRpb246IENvbG9yID0gc3RhdGUub3JpZW50YXRpb247XG5cbiAgdmFyIGNvb3JkcyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgdmFyIG9yaWVudENsYXNzID0gb3JpZW50YXRpb24gPT09ICdibGFjaycgPyAnIGJsYWNrJyA6ICcnO1xuICBjb29yZHMuYXBwZW5kQ2hpbGQocmVuZGVyQ29vcmRzKHJhbmtzLCAncmFua3MnICsgb3JpZW50Q2xhc3MpKTtcbiAgY29vcmRzLmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhmaWxlcywgJ2ZpbGVzJyArIG9yaWVudENsYXNzKSk7XG4gIHN0YXRlLmRvbS5lbGVtZW50LmFwcGVuZENoaWxkKGNvb3Jkcyk7XG5cbiAgcmV0dXJuICgpID0+IHtcbiAgICBpZiAoc3RhdGUub3JpZW50YXRpb24gPT09IG9yaWVudGF0aW9uKSByZXR1cm47XG4gICAgb3JpZW50YXRpb24gPSBzdGF0ZS5vcmllbnRhdGlvbjtcbiAgICBjb25zdCBjb29yZHMgPSBzdGF0ZS5kb20uZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdjb29yZHMnKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7ICsraSlcbiAgICAgIGNvb3Jkc1tpXS5jbGFzc0xpc3QudG9nZ2xlKCdibGFjaycsIG9yaWVudGF0aW9uID09PSAnYmxhY2snKTtcbiAgfTtcbn1cbiIsImltcG9ydCAqIGFzIGZlbiBmcm9tICcuL2ZlbidcblxuLy8gc2VlIGR0cy9zdGF0ZS5kLnRzIGZvciBkb2N1bWVudGF0aW9uIG9uIHRoZSBTdGF0ZSB0eXBlXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpOiBQYXJ0aWFsPFN0YXRlPiB7XG4gIHJldHVybiB7XG4gICAgcGllY2VzOiBmZW4ucmVhZChmZW4uaW5pdGlhbCksXG4gICAgb3JpZW50YXRpb246ICd3aGl0ZScsXG4gICAgdHVybkNvbG9yOiAnd2hpdGUnLFxuICAgIGNvb3JkaW5hdGVzOiB0cnVlLFxuICAgIGF1dG9DYXN0bGU6IGZhbHNlLFxuICAgIHZpZXdPbmx5OiBmYWxzZSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IGZhbHNlLFxuICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICBwaWVjZUtleTogZmFsc2UsXG4gICAgaGlnaGxpZ2h0OiB7XG4gICAgICBsYXN0TW92ZTogdHJ1ZSxcbiAgICAgIGNoZWNrOiB0cnVlLFxuICAgICAgZHJhZ092ZXI6IHRydWVcbiAgICB9LFxuICAgIGFuaW1hdGlvbjoge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIGR1cmF0aW9uOiAyMDBcbiAgICB9LFxuICAgIG1vdmFibGU6IHtcbiAgICAgIGZyZWU6IHRydWUsXG4gICAgICBjb2xvcjogJ2JvdGgnLFxuICAgICAgZHJvcE9mZjogJ3JldmVydCcsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBldmVudHM6IHt9LFxuICAgICAgcm9va0Nhc3RsZTogdHJ1ZVxuICAgIH0sXG4gICAgcHJlbW92YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIHNob3dEZXN0czogdHJ1ZSxcbiAgICAgIGNhc3RsZTogdHJ1ZSxcbiAgICAgIGV2ZW50czoge31cbiAgICB9LFxuICAgIHByZWRyb3BwYWJsZToge1xuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICBldmVudHM6IHt9XG4gICAgfSxcbiAgICBkcmFnZ2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBkaXN0YW5jZTogMyxcbiAgICAgIGF1dG9EaXN0YW5jZTogdHJ1ZSxcbiAgICAgIGNlbnRlclBpZWNlOiB0cnVlLFxuICAgICAgc2hvd0dob3N0OiB0cnVlXG4gICAgfSxcbiAgICBzZWxlY3RhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlXG4gICAgfSxcbiAgICBzdGF0czoge1xuICAgICAgZHJhZ2dlZDogISgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpXG4gICAgfSxcbiAgICBldmVudHM6IHt9LFxuICAgIGRyYXdhYmxlOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZXJhc2VPbkNsaWNrOiB0cnVlLFxuICAgICAgc2hhcGVzOiBbXSxcbiAgICAgIGF1dG9TaGFwZXM6IFtdLFxuICAgICAgYnJ1c2hlczoge1xuICAgICAgICBncmVlbjogeyBrZXk6ICdnJywgY29sb3I6ICcjMTU3ODFCJywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICByZWQ6IHsga2V5OiAncicsIGNvbG9yOiAnIzg4MjAyMCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgYmx1ZTogeyBrZXk6ICdiJywgY29sb3I6ICcjMDAzMDg4Jywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICB5ZWxsb3c6IHsga2V5OiAneScsIGNvbG9yOiAnI2U2OGYwMCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgcGFsZUJsdWU6IHsga2V5OiAncGInLCBjb2xvcjogJyMwMDMwODgnLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZUdyZWVuOiB7IGtleTogJ3BnJywgY29sb3I6ICcjMTU3ODFCJywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVSZWQ6IHsga2V5OiAncHInLCBjb2xvcjogJyM4ODIwMjAnLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZUdyZXk6IHsga2V5OiAncGdyJywgY29sb3I6ICcjNGE0YTRhJywgb3BhY2l0eTogMC4zNSwgbGluZVdpZHRoOiAxNSB9XG4gICAgICB9LFxuICAgICAgcGllY2VzOiB7XG4gICAgICAgIGJhc2VVcmw6ICdodHRwczovL2xpY2hlc3MxLm9yZy9hc3NldHMvcGllY2UvY2J1cm5ldHQvJ1xuICAgICAgfVxuICAgIH0sXG4gICAgZWRpdGFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IGZhbHNlLFxuICAgICAgc2VsZWN0ZWQ6ICdwb2ludGVyJ1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGRyYXcgZnJvbSAnLi9kcmF3J1xuXG5sZXQgb3JpZ2luVGFyZ2V0OiBFdmVudFRhcmdldCB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaGFzaFBpZWNlKHBpZWNlPzogUGllY2UpOiBzdHJpbmcge1xuICByZXR1cm4gcGllY2UgPyBwaWVjZS5jb2xvciArIHBpZWNlLnJvbGUgOiAnJztcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUJvdW5kcyhzdGF0ZTogU3RhdGUsIGtleTogS2V5KSB7XG4gIGNvbnN0IHBvcyA9IHV0aWwua2V5MnBvcyhrZXkpLCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzO1xuICBpZiAoc3RhdGUub3JpZW50YXRpb24gIT09ICd3aGl0ZScpIHtcbiAgICBwb3NbMF0gPSA5IC0gcG9zWzBdO1xuICAgIHBvc1sxXSA9IDkgLSBwb3NbMV07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBsZWZ0OiBib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCAqIChwb3NbMF0gLSAxKSAvIDgsXG4gICAgdG9wOiBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodCAqICg4IC0gcG9zWzFdKSAvIDgsXG4gICAgd2lkdGg6IGJvdW5kcy53aWR0aCAvIDgsXG4gICAgaGVpZ2h0OiBib3VuZHMuaGVpZ2h0IC8gOFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCBlOiBNb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmIChlLmJ1dHRvbiAhPT0gdW5kZWZpbmVkICYmIGUuYnV0dG9uICE9PSAwKSByZXR1cm47IC8vIG9ubHkgdG91Y2ggb3IgbGVmdCBjbGlja1xuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47IC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgb3JpZ2luVGFyZ2V0ID0gZS50YXJnZXQ7XG4gIGNvbnN0IHByZXZpb3VzbHlTZWxlY3RlZCA9IHN0YXRlLnNlbGVjdGVkO1xuICBjb25zdCBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKTtcbiAgY29uc3Qgb3JpZyA9IGJvYXJkLmdldEtleUF0RG9tUG9zKHN0YXRlLCBwb3NpdGlvbik7XG4gIGlmICghb3JpZykgcmV0dXJuO1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgaWYgKCFwcmV2aW91c2x5U2VsZWN0ZWQgJiYgKFxuICAgIHN0YXRlLmRyYXdhYmxlLmVyYXNlT25DbGljayB8fCAoIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSBzdGF0ZS50dXJuQ29sb3IpXG4gICkpIGRyYXcuY2xlYXIoc3RhdGUpO1xuICBpZiAoc3RhdGUudmlld09ubHkpIHJldHVybjtcbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhc3RhdGUucHJlbW92YWJsZS5jdXJyZW50O1xuICBjb25zdCBoYWRQcmVkcm9wID0gISFzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgc3RhdGUuc3RhdHMuY3RybEtleSA9IGUuY3RybEtleTtcbiAgYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBvcmlnKTtcbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHN0YXRlLnNlbGVjdGVkID09PSBvcmlnO1xuICBpZiAocGllY2UgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzdGF0ZSwgb3JpZykpIHtcbiAgICBjb25zdCBzcXVhcmVCb3VuZHMgPSBjb21wdXRlU3F1YXJlQm91bmRzKHN0YXRlLCBvcmlnKTtcbiAgICBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZDogcHJldmlvdXNseVNlbGVjdGVkLFxuICAgICAgb3JpZzogb3JpZyxcbiAgICAgIHBpZWNlSGFzaDogaGFzaFBpZWNlKHBpZWNlKSxcbiAgICAgIHJlbDogcG9zaXRpb24sXG4gICAgICBlcG9zOiBwb3NpdGlvbixcbiAgICAgIHBvczogWzAsIDBdLFxuICAgICAgZGVjOiBzdGF0ZS5kcmFnZ2FibGUuY2VudGVyUGllY2UgPyBbXG4gICAgICAgIHBvc2l0aW9uWzBdIC0gKHNxdWFyZUJvdW5kcy5sZWZ0ICsgc3F1YXJlQm91bmRzLndpZHRoIC8gMiksXG4gICAgICAgIHBvc2l0aW9uWzFdIC0gKHNxdWFyZUJvdW5kcy50b3AgKyBzcXVhcmVCb3VuZHMuaGVpZ2h0IC8gMilcbiAgICAgIF0gOiBbMCwgMF0sXG4gICAgICBzdGFydGVkOiBzdGF0ZS5kcmFnZ2FibGUuYXV0b0Rpc3RhbmNlICYmIHN0YXRlLnN0YXRzLmRyYWdnZWRcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUoc3RhdGUpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aoc3RhdGUpO1xuICB9XG4gIHByb2Nlc3NEcmFnKHN0YXRlKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0RyYWcoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHV0aWwucmFmKCgpID0+IHtcbiAgICBjb25zdCBjdXIgPSBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudDtcbiAgICBpZiAoY3VyKSB7XG4gICAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgICAgaWYgKHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ICYmIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50LnBsYW4uYW5pbXNbY3VyLm9yaWddKVxuICAgICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAvLyBpZiBtb3ZpbmcgcGllY2UgaXMgZ29uZSwgY2FuY2VsXG4gICAgICBpZiAoaGFzaFBpZWNlKHN0YXRlLnBpZWNlc1tjdXIub3JpZ10pICE9PSBjdXIucGllY2VIYXNoKSBjYW5jZWwoc3RhdGUpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGlmICghY3VyLnN0YXJ0ZWQgJiYgdXRpbC5kaXN0YW5jZShjdXIuZXBvcywgY3VyLnJlbCkgPj0gc3RhdGUuZHJhZ2dhYmxlLmRpc3RhbmNlKVxuICAgICAgICBjdXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIGlmIChjdXIuc3RhcnRlZCkge1xuICAgICAgICAgIGN1ci5wb3MgPSBbXG4gICAgICAgICAgICBjdXIuZXBvc1swXSAtIGN1ci5yZWxbMF0sXG4gICAgICAgICAgICBjdXIuZXBvc1sxXSAtIGN1ci5yZWxbMV1cbiAgICAgICAgICBdO1xuICAgICAgICAgIGN1ci5vdmVyID0gYm9hcmQuZ2V0S2V5QXREb21Qb3Moc3RhdGUsIGN1ci5lcG9zKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgaWYgKGN1cikgcHJvY2Vzc0RyYWcoc3RhdGUpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoc3RhdGU6IFN0YXRlLCBlOiBUb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybjsgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50KSBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudC5lcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHN0YXRlOiBTdGF0ZSwgZTogVG91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudDtcbiAgaWYgKCFjdXIgJiYgKCFzdGF0ZS5lZGl0YWJsZS5lbmFibGVkIHx8IHN0YXRlLmVkaXRhYmxlLnNlbGVjdGVkID09PSAncG9pbnRlcicpKSByZXR1cm47XG4gIC8vIGNvbXBhcmluZyB3aXRoIHRoZSBvcmlnaW4gdGFyZ2V0IGlzIGFuIGVhc3kgd2F5IHRvIHRlc3QgdGhhdCB0aGUgZW5kIGV2ZW50XG4gIC8vIGhhcyB0aGUgc2FtZSB0b3VjaCBvcmlnaW5cbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBvcmlnaW5UYXJnZXQgIT09IGUudGFyZ2V0ICYmIGN1ciAmJiAhY3VyLm5ld1BpZWNlKSB7XG4gICAgc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIGJvYXJkLnVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIGNvbnN0IGV2ZW50UG9zOiBOdW1iZXJQYWlyID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICBjb25zdCBkZXN0ID0gYm9hcmQuZ2V0S2V5QXREb21Qb3Moc3RhdGUsIGV2ZW50UG9zKTtcbiAgaWYgKGRlc3QpIHtcbiAgICBpZiAoc3RhdGUuZWRpdGFibGUuZW5hYmxlZCAmJiBzdGF0ZS5lZGl0YWJsZS5zZWxlY3RlZCAhPT0gJ3BvaW50ZXInKSB7XG4gICAgICBpZiAoc3RhdGUuZWRpdGFibGUuc2VsZWN0ZWQgPT09ICd0cmFzaCcpIHtcbiAgICAgICAgZGVsZXRlIHN0YXRlLnBpZWNlc1tkZXN0XTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gd2hlcmUgcGllY2VzIHRvIGJlIGRyb3BwZWQgbGl2ZS4gRml4IG1lLlxuICAgICAgICBjb25zdCBrZXkgPSAnYTAnO1xuICAgICAgICBzdGF0ZS5waWVjZXNba2V5XSA9IHN0YXRlLmVkaXRhYmxlLnNlbGVjdGVkIGFzIFBpZWNlO1xuICAgICAgICBib2FyZC5kcm9wTmV3UGllY2Uoc3RhdGUsIGtleSwgZGVzdCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjdXIgJiYgY3VyLnN0YXJ0ZWQpIHtcbiAgICAgIGlmIChjdXIubmV3UGllY2UpIGJvYXJkLmRyb3BOZXdQaWVjZShzdGF0ZSwgY3VyLm9yaWcsIGRlc3QpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChjdXIub3JpZyAhPT0gZGVzdCkgc3RhdGUubW92YWJsZS5kcm9wcGVkID0gW2N1ci5vcmlnLCBkZXN0XTtcbiAgICAgICAgc3RhdGUuc3RhdHMuY3RybEtleSA9IGUuY3RybEtleTtcbiAgICAgICAgaWYgKGJvYXJkLnVzZXJNb3ZlKHN0YXRlLCBjdXIub3JpZywgZGVzdCkpIHN0YXRlLnN0YXRzLmRyYWdnZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoY3VyICYmIGN1ci5vcmlnID09PSBjdXIucHJldmlvdXNseVNlbGVjdGVkICYmIChjdXIub3JpZyA9PT0gZGVzdCB8fCAhZGVzdCkpXG4gICAgYm9hcmQudW5zZWxlY3Qoc3RhdGUpO1xuICBlbHNlIGlmICghc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkKSBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhZ2dhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcblxuY29uc3QgYnJ1c2hlcyA9IFsnZ3JlZW4nLCAncmVkJywgJ2JsdWUnLCAneWVsbG93J107XG5cbmZ1bmN0aW9uIGV2ZW50QnJ1c2goZTogTW91Y2hFdmVudCk6IHN0cmluZyB7XG4gIGNvbnN0IGE6IG51bWJlciA9IGUuc2hpZnRLZXkgJiYgdXRpbC5pc1JpZ2h0QnV0dG9uKGUpID8gMSA6IDA7XG4gIGNvbnN0IGI6IG51bWJlciA9IGUuYWx0S2V5ID8gMiA6IDA7XG4gIHJldHVybiBicnVzaGVzW2EgKyBiXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgZTogTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47IC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgYm9hcmQuY2FuY2VsTW92ZShzdGF0ZSk7XG4gIGNvbnN0IHBvc2l0aW9uID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpO1xuICBjb25zdCBvcmlnID0gYm9hcmQuZ2V0S2V5QXREb21Qb3Moc3RhdGUsIHBvc2l0aW9uKTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZzogb3JpZyxcbiAgICBkZXN0OiB1bmRlZmluZWQsXG4gICAgcG9zOiBwb3NpdGlvbixcbiAgICBicnVzaDogZXZlbnRCcnVzaChlKVxuICB9O1xuICBwcm9jZXNzRHJhdyhzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzRHJhdyhzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgdXRpbC5yYWYoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gICAgaWYgKGN1cikge1xuICAgICAgY29uc3QgZGVzdCA9IGJvYXJkLmdldEtleUF0RG9tUG9zKHN0YXRlLCBjdXIucG9zKTtcbiAgICAgIGlmIChjdXIub3JpZyA9PT0gZGVzdCkgY3VyLmRlc3QgPSB1bmRlZmluZWQ7XG4gICAgICBlbHNlIGN1ci5kZXN0ID0gZGVzdDtcbiAgICB9XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgIGlmIChjdXIpIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlKHN0YXRlOiBTdGF0ZSwgZTogTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudCkgc3RhdGUuZHJhd2FibGUuY3VycmVudC5wb3MgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gIGlmICghY3VyKSByZXR1cm47XG4gIGlmIChjdXIuZGVzdCkgYWRkTGluZShzdGF0ZS5kcmF3YWJsZSwgY3VyLCBjdXIuZGVzdCk7XG4gIGVsc2UgYWRkQ2lyY2xlKHN0YXRlLmRyYXdhYmxlLCBjdXIpO1xuICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5zaGFwZXMubGVuZ3RoKSB7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgIG9uQ2hhbmdlKHN0YXRlLmRyYXdhYmxlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub3Q8QT4oZjogKGE6IEEpID0+IGJvb2xlYW4pOiAoYTogQSkgPT4gYm9vbGVhbiB7XG4gIHJldHVybiAoeDogQSkgPT4gIWYoeCk7XG59XG5cbmZ1bmN0aW9uIGFkZENpcmNsZShkcmF3YWJsZTogRHJhd2FibGUsIGN1cjogRHJhd2FibGVDdXJyZW50KTogdm9pZCB7XG4gIGNvbnN0IG9yaWcgPSBjdXIub3JpZztcbiAgY29uc3Qgc2FtZUNpcmNsZSA9IChzOiBTaGFwZSkgPT4gcy5vcmlnID09PSBvcmlnICYmICFzLmRlc3Q7XG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHNhbWVDaXJjbGUpWzBdO1xuICBpZiAoc2ltaWxhcikgZHJhd2FibGUuc2hhcGVzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcihub3Qoc2FtZUNpcmNsZSkpO1xuICBpZiAoIXNpbWlsYXIgfHwgc2ltaWxhci5icnVzaCAhPT0gY3VyLmJydXNoKSBkcmF3YWJsZS5zaGFwZXMucHVzaCh7XG4gICAgYnJ1c2g6IGN1ci5icnVzaCxcbiAgICBvcmlnOiBvcmlnXG4gIH0pO1xuICBvbkNoYW5nZShkcmF3YWJsZSk7XG59XG5cbmZ1bmN0aW9uIGFkZExpbmUoZHJhd2FibGU6IERyYXdhYmxlLCBjdXI6IERyYXdhYmxlQ3VycmVudCwgZGVzdDogS2V5KTogdm9pZCB7XG4gIGNvbnN0IG9yaWcgPSBjdXIub3JpZztcbiAgY29uc3Qgc2FtZUxpbmUgPSAoczogU2hhcGUpID0+IHtcbiAgICByZXR1cm4gISFzLmRlc3QgJiYgKChzLm9yaWcgPT09IG9yaWcgJiYgcy5kZXN0ID09PSBkZXN0KSB8fCAocy5kZXN0ID09PSBvcmlnICYmIHMub3JpZyA9PT0gZGVzdCkpO1xuICB9O1xuICBjb25zdCBleGlzdHMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHNhbWVMaW5lKS5sZW5ndGggPiAwO1xuICBpZiAoZXhpc3RzKSBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKG5vdChzYW1lTGluZSkpO1xuICBlbHNlIGRyYXdhYmxlLnNoYXBlcy5wdXNoKHtcbiAgICBicnVzaDogY3VyLmJydXNoLFxuICAgIG9yaWc6IG9yaWcsXG4gICAgZGVzdDogZGVzdFxuICB9KTtcbiAgb25DaGFuZ2UoZHJhd2FibGUpO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZShkcmF3YWJsZTogRHJhd2FibGUpOiB2b2lkIHtcbiAgaWYgKGRyYXdhYmxlLm9uQ2hhbmdlKSBkcmF3YWJsZS5vbkNoYW5nZShkcmF3YWJsZS5zaGFwZXMpO1xufVxuIiwiaW1wb3J0ICogYXMgZHJhZyBmcm9tICcuL2RyYWcnXG5pbXBvcnQgKiBhcyBkcmF3IGZyb20gJy4vZHJhdydcbmltcG9ydCB7IGlzTGVmdEJ1dHRvbiwgaXNSaWdodEJ1dHRvbiB9IGZyb20gJy4vdXRpbCdcblxuY29uc3Qgc3RhcnRFdmVudHMgPSBbJ3RvdWNoc3RhcnQnLCAnbW91c2Vkb3duJ107XG5jb25zdCBtb3ZlRXZlbnRzID0gWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ107XG5jb25zdCBlbmRFdmVudHMgPSBbJ3RvdWNoZW5kJywgJ21vdXNldXAnXTtcblxudHlwZSBNb3VjaEJpbmQgPSAoZTogTW91Y2hFdmVudCkgPT4gdm9pZDtcbnR5cGUgU3RhdGVNb3VjaEJpbmQgPSAoZDogU3RhdGUsIGU6IE1vdWNoRXZlbnQpID0+IHZvaWQ7XG5cbi8vIHJldHVybnMgdGhlIHVuYmluZCBmdW5jdGlvblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oZDogU3RhdGUpOiB2b2lkIHtcblxuICBjb25zdCBzdGFydDogTW91Y2hCaW5kID0gc3RhcnREcmFnT3JEcmF3KGQpO1xuICBjb25zdCBtb3ZlOiBNb3VjaEJpbmQgPSBkcmFnT3JEcmF3KGQsIGRyYWcubW92ZSwgZHJhdy5tb3ZlKTtcbiAgY29uc3QgZW5kOiBNb3VjaEJpbmQgPSBkcmFnT3JEcmF3KGQsIGRyYWcuZW5kLCBkcmF3LmVuZCk7XG5cbiAgbGV0IG9uc3RhcnQ6IE1vdWNoQmluZCwgb25tb3ZlOiBNb3VjaEJpbmQsIG9uZW5kOiBNb3VjaEJpbmQ7XG5cbiAgaWYgKGQuZWRpdGFibGUuZW5hYmxlZCkge1xuXG4gICAgb25zdGFydCA9IGUgPT4ge1xuICAgICAgaWYgKGQuZWRpdGFibGUuc2VsZWN0ZWQgPT09ICdwb2ludGVyJykge1xuICAgICAgICBpZiAoZS50eXBlICE9PSAnbW91c2Vtb3ZlJykgc3RhcnQoZSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChlLnR5cGUgIT09ICdtb3VzZW1vdmUnIHx8IGlzTGVmdEJ1dHRvbihlKSkgZW5kKGUpO1xuICAgIH07XG5cbiAgICBvbm1vdmUgPSBlID0+IHtcbiAgICAgIGlmIChkLmVkaXRhYmxlLnNlbGVjdGVkID09PSAncG9pbnRlcicpIG1vdmUoZSk7XG4gICAgfTtcblxuICAgIG9uZW5kID0gZSA9PiB7XG4gICAgICBpZiAoZC5lZGl0YWJsZS5zZWxlY3RlZCA9PT0gJ3BvaW50ZXInKSBlbmQoZSk7XG4gICAgfTtcblxuICAgIHN0YXJ0RXZlbnRzLnB1c2goJ21vdXNlbW92ZScpO1xuXG4gIH0gZWxzZSB7XG4gICAgb25zdGFydCA9IHN0YXJ0O1xuICAgIG9ubW92ZSA9IG1vdmU7XG4gICAgb25lbmQgPSBlbmQ7XG4gIH1cblxuICBzdGFydEV2ZW50cy5mb3JFYWNoKGV2ID0+IGQuZG9tLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldiwgb25zdGFydCkpO1xuXG4gIG1vdmVFdmVudHMuZm9yRWFjaChldiA9PiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2LCBvbm1vdmUpKTtcblxuICBlbmRFdmVudHMuZm9yRWFjaChldiA9PiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2LCBvbmVuZCkpO1xuXG4gIGJpbmRSZXNpemUoZCk7XG5cbiAgY29uc3Qgb25Db250ZXh0TWVudTogTW91Y2hCaW5kID0gZSA9PiB7XG4gICAgaWYgKGQuZGlzYWJsZUNvbnRleHRNZW51IHx8IGQuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgZC5kb20uZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIG9uQ29udGV4dE1lbnUpO1xufVxuXG5mdW5jdGlvbiBzdGFydERyYWdPckRyYXcoZDogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gZSA9PiB7XG4gICAgaWYgKGlzUmlnaHRCdXR0b24oZSkgJiYgZC5kcmFnZ2FibGUuY3VycmVudCkge1xuICAgICAgaWYgKGQuZHJhZ2dhYmxlLmN1cnJlbnQubmV3UGllY2UpIGRlbGV0ZSBkLnBpZWNlc1tkLmRyYWdnYWJsZS5jdXJyZW50Lm9yaWddO1xuICAgICAgZC5kcmFnZ2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgIGQuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmICgoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpKSAmJiBkLmRyYXdhYmxlLmVuYWJsZWQpIGRyYXcuc3RhcnQoZCwgZSk7XG4gICAgZWxzZSBkcmFnLnN0YXJ0KGQsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkcmFnT3JEcmF3KGQ6IFN0YXRlLCB3aXRoRHJhZzogU3RhdGVNb3VjaEJpbmQsIHdpdGhEcmF3OiBTdGF0ZU1vdWNoQmluZCk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAoKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSkgJiYgZC5kcmF3YWJsZS5lbmFibGVkKSB3aXRoRHJhdyhkLCBlKTtcbiAgICBlbHNlIGlmICghZC52aWV3T25seSkgd2l0aERyYWcoZCwgZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGJpbmRSZXNpemUoZDogU3RhdGUpOiB2b2lkIHtcblxuICBpZiAoIWQucmVzaXphYmxlKSByZXR1cm47XG5cbiAgZnVuY3Rpb24gcmVjb21wdXRlQm91bmRzKCkge1xuICAgIGQuZG9tLmJvdW5kcyA9IGQuZG9tLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZC5kb20ucmVkcmF3KCk7XG4gIH1cblxuICBbJ29uc2Nyb2xsJywgJ29ucmVzaXplJ10uZm9yRWFjaCgobjogV2luZG93RXZlbnQpID0+IHtcbiAgICBjb25zdCBwcmV2ID0gd2luZG93W25dO1xuICAgIHdpbmRvd1tuXSA9IGUgPT4ge1xuICAgICAgcHJldiAmJiBwcmV2LmFwcGx5KHdpbmRvdywgZSk7XG4gICAgICByZWNvbXB1dGVCb3VuZHMoKTtcbiAgICB9O1xuICB9KTtcblxuICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NoZXNzZ3JvdW5kLnJlc2l6ZScsIHJlY29tcHV0ZUJvdW5kcywgZmFsc2UpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc3RhdGU6IFN0YXRlLCBrZXlzOiBLZXlbXSk6IHZvaWQge1xuICBzdGF0ZS5leHBsb2RpbmcgPSB7XG4gICAgc3RhZ2U6IDEsXG4gICAga2V5czoga2V5c1xuICB9O1xuICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIHNldFN0YWdlKHN0YXRlLCAyKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHNldFN0YWdlKHN0YXRlLCB1bmRlZmluZWQpLCAxMjApO1xuICB9LCAxMjApO1xufVxuXG5mdW5jdGlvbiBzZXRTdGFnZShzdGF0ZTogU3RhdGUsIHN0YWdlOiBudW1iZXIgfCB1bmRlZmluZWQpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmV4cGxvZGluZykge1xuICAgIGlmIChzdGFnZSkgc3RhdGUuZXhwbG9kaW5nLnN0YWdlID0gc3RhZ2U7XG4gICAgZWxzZSBzdGF0ZS5leHBsb2RpbmcgPSB1bmRlZmluZWQ7XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBwb3Mya2V5LCByYW5rcywgaW52UmFua3MgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBjb25zdCBpbml0aWFsOiBGRU4gPSAncm5icWtibnIvcHBwcHBwcHAvOC84LzgvOC9QUFBQUFBQUC9STkJRS0JOUic7XG5cbmNvbnN0IHJvbGVzOiB7IFtsZXR0ZXI6IHN0cmluZ106IFJvbGUgfSA9IHsgcDogJ3Bhd24nLCByOiAncm9vaycsIG46ICdrbmlnaHQnLCBiOiAnYmlzaG9wJywgcTogJ3F1ZWVuJywgazogJ2tpbmcnIH07XG5cbmNvbnN0IGxldHRlcnMgPSB7IHBhd246ICdwJywgcm9vazogJ3InLCBrbmlnaHQ6ICduJywgYmlzaG9wOiAnYicsIHF1ZWVuOiAncScsIGtpbmc6ICdrJyB9O1xuXG5jb25zdCBmbGFnc1JlZ2V4ID0gLyAuKyQvO1xuY29uc3QgemhSZWdleCA9IC9+L2c7XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkKGZlbjogRkVOKTogUGllY2VzIHtcbiAgaWYgKGZlbiA9PT0gJ3N0YXJ0JykgZmVuID0gaW5pdGlhbDtcbiAgbGV0IHBpZWNlczogUGllY2VzID0ge30sIHg6IG51bWJlciwgbmI6IG51bWJlciwgcm9sZTogUm9sZTtcbiAgZmVuLnJlcGxhY2UoZmxhZ3NSZWdleCwgJycpLnJlcGxhY2UoemhSZWdleCwgJycpLnNwbGl0KCcvJykuZm9yRWFjaCgocm93LCB5KSA9PiB7XG4gICAgeCA9IDA7XG4gICAgcm93LnNwbGl0KCcnKS5mb3JFYWNoKHYgPT4ge1xuICAgICAgbmIgPSBwYXJzZUludCh2KTtcbiAgICAgIGlmIChuYikgeCArPSBuYjtcbiAgICAgIGVsc2Uge1xuICAgICAgICArK3g7XG4gICAgICAgIHJvbGUgPSB2LnRvTG93ZXJDYXNlKCkgYXMgUm9sZTtcbiAgICAgICAgcGllY2VzW3BvczJrZXkoW3gsIDggLSB5XSldID0ge1xuICAgICAgICAgIHJvbGU6IHJvbGVzW3JvbGVdLFxuICAgICAgICAgIGNvbG9yOiAodiA9PT0gcm9sZSA/ICdibGFjaycgOiAnd2hpdGUnKSBhcyBDb2xvclxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gcGllY2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGUocGllY2VzOiBQaWVjZXMpOiBGRU4ge1xuICBsZXQgcGllY2U6IFBpZWNlLCBsZXR0ZXI6IHN0cmluZztcbiAgcmV0dXJuIFs4LCA3LCA2LCA1LCA0LCAzLCAyXS5yZWR1Y2UoXG4gICAgKHN0cjogc3RyaW5nLCBuYjogYW55KSA9PiBzdHIucmVwbGFjZShuZXcgUmVnRXhwKEFycmF5KG5iICsgMSkuam9pbignMScpLCAnZycpLCBuYiksXG4gICAgaW52UmFua3MubWFwKHkgPT4ge1xuICAgICAgcmV0dXJuIHJhbmtzLm1hcCh4ID0+IHtcbiAgICAgICAgcGllY2UgPSBwaWVjZXNbcG9zMmtleShbeCwgeV0pXTtcbiAgICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgICAgbGV0dGVyID0gbGV0dGVyc1twaWVjZS5yb2xlXTtcbiAgICAgICAgICByZXR1cm4gcGllY2UuY29sb3IgPT09ICd3aGl0ZScgPyBsZXR0ZXIudG9VcHBlckNhc2UoKSA6IGxldHRlcjtcbiAgICAgICAgfSBlbHNlIHJldHVybiAnMSc7XG4gICAgICB9KS5qb2luKCcnKTtcbiAgICB9KS5qb2luKCcvJykpO1xufVxuIiwibGV0IHN0YXJ0QXQ6IERhdGUgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydCgpIHtcbiAgc3RhcnRBdCA9IG5ldyBEYXRlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gIHN0YXJ0QXQgPSB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc3RvcCgpOiBudW1iZXIge1xuICBpZiAoIXN0YXJ0QXQpIHJldHVybiAwO1xuICBjb25zdCB0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydEF0LmdldFRpbWUoKTtcbiAgc3RhcnRBdCA9IHVuZGVmaW5lZDtcbiAgcmV0dXJuIHRpbWU7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL21haW4nKS5kZWZhdWx0O1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vZHRzL2luZGV4LmQudHNcIiAvPlxuXG5pbXBvcnQgeyBpbml0IH0gZnJvbSAnc25hYmJkb20nO1xuaW1wb3J0IHsgVk5vZGUgfSBmcm9tICdzbmFiYmRvbS92bm9kZSdcblxuaW1wb3J0IG1ha2VBcGkgZnJvbSAnLi9hcGknO1xuaW1wb3J0IHZpZXcgZnJvbSAnLi92aWV3JztcbmltcG9ydCBjb25maWd1cmUgZnJvbSAnLi9jb25maWd1cmUnXG5pbXBvcnQgZGVmYXVsdHMgZnJvbSAnLi9kZWZhdWx0cydcbmltcG9ydCBiaW5kRXZlbnRzIGZyb20gJy4vZXZlbnRzJ1xuaW1wb3J0IG1ha2VDb29yZHMgZnJvbSAnLi9jb29yZHMnXG5cbmltcG9ydCBrbGFzcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJztcbmltcG9ydCBhdHRycyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnO1xuaW1wb3J0IHN0eWxlIGZyb20gJ3NuYWJiZG9tL21vZHVsZXMvc3R5bGUnO1xuXG5jb25zdCBwYXRjaCA9IGluaXQoW2tsYXNzLCBhdHRycywgc3R5bGVdKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ2hlc3Nncm91bmQoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgY29uZmlnPzogQ29uZmlnKTogQXBpIHtcblxuICBjb25zdCBwbGFjZWhvbGRlcjogSFRNTEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKHBsYWNlaG9sZGVyKTtcblxuICBjb25zdCBzdGF0ZSA9IGRlZmF1bHRzKCkgYXMgU3RhdGU7XG5cbiAgY29uZmlndXJlKHN0YXRlLCBjb25maWcgfHwge30pO1xuXG4gIHN0YXRlLmRvbSA9IHtcbiAgICBlbGVtZW50OiBwbGFjZWhvbGRlcixcbiAgICBib3VuZHM6IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICByZWRyYXcoKSB7fVxuICB9O1xuXG4gIGNvbnN0IHVwZGF0ZUNvb3JkcyA9IG1ha2VDb29yZHMoc3RhdGUpO1xuXG4gIGxldCB2bm9kZTogVk5vZGU7XG5cbiAgZnVuY3Rpb24gcmVkcmF3KCkge1xuICAgIHZub2RlID0gcGF0Y2godm5vZGUsIHZpZXcoYXBpLnN0YXRlKSk7XG4gICAgdXBkYXRlQ29vcmRzKCk7XG4gIH1cblxuICBjb25zdCBhcGkgPSBtYWtlQXBpKHN0YXRlKTtcblxuICB2bm9kZSA9IHBhdGNoKHBsYWNlaG9sZGVyLCB2aWV3KGFwaS5zdGF0ZSkpO1xuXG4gIHN0YXRlLmRvbS5lbGVtZW50ID0gdm5vZGUuZWxtIGFzIEhUTUxFbGVtZW50O1xuICBzdGF0ZS5kb20ucmVkcmF3ID0gcmVkcmF3O1xuXG4gIGJpbmRFdmVudHMoc3RhdGUpO1xuXG4gIHJldHVybiBhcGk7XG59O1xuIiwiaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5cbnR5cGUgTW9iaWxpdHkgPSAoeDE6bnVtYmVyLCB5MTpudW1iZXIsIHgyOm51bWJlciwgeTI6bnVtYmVyKSA9PiBib29sZWFuO1xuXG5mdW5jdGlvbiBkaWZmKGE6IG51bWJlciwgYjpudW1iZXIpOm51bWJlciB7XG4gIHJldHVybiBNYXRoLmFicyhhIC0gYik7XG59XG5cbmZ1bmN0aW9uIHBhd24oY29sb3I6IENvbG9yKTogTW9iaWxpdHkge1xuICByZXR1cm4gKHgxLCB4MiwgeTEsIHkyKSA9PiBkaWZmKHgxLCB4MikgPCAyICYmIChcbiAgICBjb2xvciA9PT0gJ3doaXRlJyA/IChcbiAgICAgIC8vIGFsbG93IDIgc3F1YXJlcyBmcm9tIDEgYW5kIDgsIGZvciBob3JkZVxuICAgICAgeTIgPT09IHkxICsgMSB8fCAoeTEgPD0gMiAmJiB5MiA9PT0gKHkxICsgMikgJiYgeDEgPT09IHgyKVxuICAgICkgOiAoXG4gICAgICB5MiA9PT0geTEgLSAxIHx8ICh5MSA+PSA3ICYmIHkyID09PSAoeTEgLSAyKSAmJiB4MSA9PT0geDIpXG4gICAgKVxuICApO1xufVxuXG5jb25zdCBrbmlnaHQ6IE1vYmlsaXR5ID0gKHgxLCB4MiwgeTEsIHkyKSA9PiB7XG4gIGNvbnN0IHhkID0gZGlmZih4MSwgeDIpO1xuICBjb25zdCB5ZCA9IGRpZmYoeTEsIHkyKTtcbiAgcmV0dXJuICh4ZCA9PT0gMSAmJiB5ZCA9PT0gMikgfHwgKHhkID09PSAyICYmIHlkID09PSAxKTtcbn1cblxuY29uc3QgYmlzaG9wOiBNb2JpbGl0eSA9ICh4MSwgeDIsIHkxLCB5MikgPT4ge1xuICByZXR1cm4gZGlmZih4MSwgeDIpID09PSBkaWZmKHkxLCB5Mik7XG59XG5cbmNvbnN0IHJvb2s6IE1vYmlsaXR5ID0gKHgxLCB4MiwgeTEsIHkyKSA9PiB7XG4gIHJldHVybiB4MSA9PT0geDIgfHwgeTEgPT09IHkyO1xufVxuXG5jb25zdCBxdWVlbjogTW9iaWxpdHkgPSAoeDEsIHgyLCB5MSwgeTIpID0+IHtcbiAgcmV0dXJuIGJpc2hvcCh4MSwgeTEsIHgyLCB5MikgfHwgcm9vayh4MSwgeTEsIHgyLCB5Mik7XG59XG5cbmZ1bmN0aW9uIGtpbmcoY29sb3I6IENvbG9yLCByb29rRmlsZXM6IG51bWJlcltdLCBjYW5DYXN0bGU6IGJvb2xlYW4pOiBNb2JpbGl0eSB7XG4gIHJldHVybiAoeDEsIHgyLCB5MSwgeTIpICA9PiAoXG4gICAgZGlmZih4MSwgeDIpIDwgMiAmJiBkaWZmKHkxLCB5MikgPCAyXG4gICkgfHwgKFxuICAgIGNhbkNhc3RsZSAmJiB5MSA9PT0geTIgJiYgeTEgPT09IChjb2xvciA9PT0gJ3doaXRlJyA/IDEgOiA4KSAmJiAoXG4gICAgICAoeDEgPT09IDUgJiYgKHgyID09PSAzIHx8IHgyID09PSA3KSkgfHwgdXRpbC5jb250YWluc1gocm9va0ZpbGVzLCB4MilcbiAgICApXG4gICk7XG59XG5cbmZ1bmN0aW9uIHJvb2tGaWxlc09mKHBpZWNlczogUGllY2VzLCBjb2xvcjogQ29sb3IpIHtcbiAgbGV0IHBpZWNlOiBQaWVjZTtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHBpZWNlcykuZmlsdGVyKGtleSA9PiB7XG4gICAgcGllY2UgPSBwaWVjZXNba2V5XTtcbiAgICByZXR1cm4gcGllY2UgJiYgcGllY2UuY29sb3IgPT09IGNvbG9yICYmIHBpZWNlLnJvbGUgPT09ICdyb29rJztcbiAgfSkubWFwKChrZXk6IEtleSkgPT4gdXRpbC5rZXkycG9zKGtleSlbMF0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihwaWVjZXM6IFBpZWNlcywga2V5OiBLZXksIGNhbkNhc3RsZTogYm9vbGVhbik6IEtleVtdIHtcbiAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XTtcbiAgY29uc3QgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gIGxldCBtb2JpbGl0eTogTW9iaWxpdHk7XG4gIHN3aXRjaCAocGllY2Uucm9sZSkge1xuICAgIGNhc2UgJ3Bhd24nOlxuICAgICAgbW9iaWxpdHkgPSBwYXduKHBpZWNlLmNvbG9yKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2tuaWdodCc6XG4gICAgICBtb2JpbGl0eSA9IGtuaWdodDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Jpc2hvcCc6XG4gICAgICBtb2JpbGl0eSA9IGJpc2hvcDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Jvb2snOlxuICAgICAgbW9iaWxpdHkgPSByb29rO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncXVlZW4nOlxuICAgICAgbW9iaWxpdHkgPSBxdWVlbjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2tpbmcnOlxuICAgICAgbW9iaWxpdHkgPSBraW5nKHBpZWNlLmNvbG9yLCByb29rRmlsZXNPZihwaWVjZXMsIHBpZWNlLmNvbG9yKSwgY2FuQ2FzdGxlKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiB1dGlsLmFsbFBvcy5maWx0ZXIocG9zMiA9PiB7XG4gICAgcmV0dXJuIChwb3NbMF0gIT09IHBvczJbMF0gfHwgcG9zWzFdICE9PSBwb3MyWzFdKSAmJiBtb2JpbGl0eShwb3NbMF0sIHBvc1sxXSwgcG9zMlswXSwgcG9zMlsxXSk7XG4gIH0pLm1hcCh1dGlsLnBvczJrZXkpO1xufTtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgeyBrZXkycG9zLCBpc1RyaWRlbnQgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHN0YXRlOiBTdGF0ZSk6IFZOb2RlIHwgdW5kZWZpbmVkIHtcbiAgY29uc3QgZCA9IHN0YXRlLmRyYXdhYmxlO1xuICBjb25zdCBhbGxTaGFwZXMgPSBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKTtcbiAgaWYgKCFhbGxTaGFwZXMubGVuZ3RoICYmICFkLmN1cnJlbnQpIHJldHVybjtcbiAgaWYgKHN0YXRlLmRvbS5ib3VuZHMud2lkdGggIT09IHN0YXRlLmRvbS5ib3VuZHMuaGVpZ2h0KSByZXR1cm47XG4gIGNvbnN0IHVzZWRCcnVzaGVzID0gY29tcHV0ZVVzZWRCcnVzaGVzKGQsIGFsbFNoYXBlcywgZC5jdXJyZW50IGFzIFNoYXBlIHwgdW5kZWZpbmVkKTtcbiAgY29uc3QgcmVuZGVyZWRTaGFwZXMgPSBhbGxTaGFwZXMubWFwKChzLCBpKSA9PiByZW5kZXJTaGFwZShzdGF0ZSwgZmFsc2UsIHMsIGkpKTtcbiAgaWYgKGQuY3VycmVudCkgcmVuZGVyZWRTaGFwZXMucHVzaChyZW5kZXJTaGFwZShzdGF0ZSwgdHJ1ZSwgZC5jdXJyZW50IGFzIFNoYXBlLCA5OTk5KSk7XG4gIHJldHVybiBoKCdzdmcnLCB7IGtleTogJ3N2ZycgfSwgWyBkZWZzKHVzZWRCcnVzaGVzKSwgLi4ucmVuZGVyZWRTaGFwZXMgXSk7XG59XG5cbmZ1bmN0aW9uIGNpcmNsZShicnVzaDogQnJ1c2gsIHBvczogUG9zLCBjdXJyZW50OiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBWTm9kZSB7XG4gIGNvbnN0IG8gPSBwb3MycHgocG9zLCBib3VuZHMpO1xuICBjb25zdCB3aWR0aCA9IGNpcmNsZVdpZHRoKGN1cnJlbnQsIGJvdW5kcyk7XG4gIGNvbnN0IHJhZGl1cyA9IGJvdW5kcy53aWR0aCAvIDE2O1xuICByZXR1cm4gaCgnY2lyY2xlJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBzdHJva2U6IGJydXNoLmNvbG9yLFxuICAgICAgJ3N0cm9rZS13aWR0aCc6IHdpZHRoLFxuICAgICAgZmlsbDogJ25vbmUnLFxuICAgICAgb3BhY2l0eTogb3BhY2l0eShicnVzaCwgY3VycmVudCksXG4gICAgICBjeDogb1swXSxcbiAgICAgIGN5OiBvWzFdLFxuICAgICAgcjogcmFkaXVzIC0gd2lkdGggLyAyXG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYXJyb3coYnJ1c2g6IEJydXNoLCBvcmlnOiBQb3MsIGRlc3Q6IFBvcywgY3VycmVudDogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogVk5vZGUge1xuICBjb25zdCBtID0gYXJyb3dNYXJnaW4oY3VycmVudCwgYm91bmRzKSxcbiAgYSA9IHBvczJweChvcmlnLCBib3VuZHMpLFxuICBiID0gcG9zMnB4KGRlc3QsIGJvdW5kcyksXG4gIGR4ID0gYlswXSAtIGFbMF0sXG4gIGR5ID0gYlsxXSAtIGFbMV0sXG4gIGFuZ2xlID0gTWF0aC5hdGFuMihkeSwgZHgpLFxuICB4byA9IE1hdGguY29zKGFuZ2xlKSAqIG0sXG4gIHlvID0gTWF0aC5zaW4oYW5nbGUpICogbTtcbiAgcmV0dXJuIGgoJ2xpbmUnLCB7XG4gICAgYXR0cnM6IHtcbiAgICAgIHN0cm9rZTogYnJ1c2guY29sb3IsXG4gICAgICAnc3Ryb2tlLXdpZHRoJzogbGluZVdpZHRoKGJydXNoLCBjdXJyZW50LCBib3VuZHMpLFxuICAgICAgJ3N0cm9rZS1saW5lY2FwJzogJ3JvdW5kJyxcbiAgICAgICdtYXJrZXItZW5kJzogaXNUcmlkZW50KCkgPyBudWxsIDogJ3VybCgjYXJyb3doZWFkLScgKyBicnVzaC5rZXkgKyAnKScsXG4gICAgICBvcGFjaXR5OiBvcGFjaXR5KGJydXNoLCBjdXJyZW50KSxcbiAgICAgIHgxOiBhWzBdLFxuICAgICAgeTE6IGFbMV0sXG4gICAgICB4MjogYlswXSAtIHhvLFxuICAgICAgeTI6IGJbMV0gLSB5b1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBpZWNlKGJhc2VVcmw6IHN0cmluZywgcG9zOiBQb3MsIHBpZWNlOiBTaGFwZVBpZWNlLCBib3VuZHM6IENsaWVudFJlY3QpOiBWTm9kZSB7XG4gIGNvbnN0IG8gPSBwb3MycHgocG9zLCBib3VuZHMpO1xuICBjb25zdCBzaXplID0gYm91bmRzLndpZHRoIC8gOCAqIChwaWVjZS5zY2FsZSB8fCAxKTtcbiAgY29uc3QgbmFtZSA9IHBpZWNlLmNvbG9yWzBdICsgKHBpZWNlLnJvbGUgPT09ICdrbmlnaHQnID8gJ24nIDogcGllY2Uucm9sZVswXSkudG9VcHBlckNhc2UoKTtcbiAgcmV0dXJuIGgoJ2ltYWdlJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBjbGFzczogYCR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gLCAvLyBjYW4ndCB1c2UgY2xhc3NlcyBiZWNhdXNlIElFXG4gICAgICB4OiBvWzBdIC0gc2l6ZSAvIDIsXG4gICAgICB5OiBvWzFdIC0gc2l6ZSAvIDIsXG4gICAgICB3aWR0aDogc2l6ZSxcbiAgICAgIGhlaWdodDogc2l6ZSxcbiAgICAgIGhyZWY6IGJhc2VVcmwgKyBuYW1lICsgJy5zdmcnXG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gZGVmcyhicnVzaGVzOiBCcnVzaFtdKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGVmcycsIGJydXNoZXMubWFwKG1hcmtlcikpO1xufVxuXG5mdW5jdGlvbiBtYXJrZXIoYnJ1c2g6IEJydXNoKTogVk5vZGUge1xuICByZXR1cm4gaCgnbWFya2VyJywge1xuICAgIGF0dHJzOiB7XG4gICAgICBpZDogJ2Fycm93aGVhZC0nICsgYnJ1c2gua2V5LFxuICAgICAgb3JpZW50OiAnYXV0bycsXG4gICAgICBtYXJrZXJXaWR0aDogNCxcbiAgICAgIG1hcmtlckhlaWdodDogOCxcbiAgICAgIHJlZlg6IDIuMDUsXG4gICAgICByZWZZOiAyLjAxXG4gICAgfVxuICB9LCBbXG4gICAgaCgncGF0aCcsIHtcbiAgICAgIGF0dHJzOiB7XG4gICAgICAgIGQ6ICdNMCwwIFY0IEwzLDIgWicsXG4gICAgICAgIGZpbGw6IGJydXNoLmNvbG9yXG4gICAgICB9XG4gICAgfSlcbiAgXSk7XG59XG5cbmZ1bmN0aW9uIG9yaWVudChwb3M6IFBvcywgY29sb3I6IENvbG9yKTogUG9zIHtcbiAgcmV0dXJuIGNvbG9yID09PSAnd2hpdGUnID8gcG9zIDogWzkgLSBwb3NbMF0sIDkgLSBwb3NbMV1dO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTaGFwZShzdGF0ZTogU3RhdGUsIGN1cnJlbnQ6IGJvb2xlYW4sIHNoYXBlOiBTaGFwZSwgaTogbnVtYmVyKTogVk5vZGUge1xuICBpZiAoc2hhcGUucGllY2UpIHJldHVybiBwaWVjZShcbiAgICBzdGF0ZS5kcmF3YWJsZS5waWVjZXMuYmFzZVVybCxcbiAgICBvcmllbnQoa2V5MnBvcyhzaGFwZS5vcmlnKSwgc3RhdGUub3JpZW50YXRpb24pLFxuICAgIHNoYXBlLnBpZWNlLFxuICAgIHN0YXRlLmRvbS5ib3VuZHMpO1xuICBlbHNlIHtcbiAgICBsZXQgYnJ1c2ggPSBzdGF0ZS5kcmF3YWJsZS5icnVzaGVzW3NoYXBlLmJydXNoXTtcbiAgICBpZiAoc2hhcGUuYnJ1c2hNb2RpZmllcnMpIGJydXNoID0gbWFrZUN1c3RvbUJydXNoKGJydXNoLCBzaGFwZS5icnVzaE1vZGlmaWVycywgaSk7XG4gICAgY29uc3Qgb3JpZyA9IG9yaWVudChrZXkycG9zKHNoYXBlLm9yaWcpLCBzdGF0ZS5vcmllbnRhdGlvbik7XG4gICAgaWYgKHNoYXBlLm9yaWcgJiYgc2hhcGUuZGVzdCkgcmV0dXJuIGFycm93KFxuICAgICAgYnJ1c2gsXG4gICAgICBvcmlnLFxuICAgICAgb3JpZW50KGtleTJwb3Moc2hhcGUuZGVzdCksIHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICAgIGN1cnJlbnQsIHN0YXRlLmRvbS5ib3VuZHMpO1xuICAgIGVsc2UgcmV0dXJuIGNpcmNsZShicnVzaCwgb3JpZywgY3VycmVudCwgc3RhdGUuZG9tLmJvdW5kcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZUN1c3RvbUJydXNoKGJhc2U6IEJydXNoLCBtb2RpZmllcnM6IEJydXNoTW9kaWZpZXJzLCBpOiBudW1iZXIpOiBCcnVzaCB7XG4gIHJldHVybiB7XG4gICAga2V5OiAnY2JfJyArIGksXG4gICAgY29sb3I6IG1vZGlmaWVycy5jb2xvciB8fCBiYXNlLmNvbG9yLFxuICAgIG9wYWNpdHk6IG1vZGlmaWVycy5vcGFjaXR5IHx8IGJhc2Uub3BhY2l0eSxcbiAgICBsaW5lV2lkdGg6IG1vZGlmaWVycy5saW5lV2lkdGggfHwgYmFzZS5saW5lV2lkdGhcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVVzZWRCcnVzaGVzKGQ6IERyYXdhYmxlLCBkcmF3bjogU2hhcGVbXSwgY3VycmVudD86IFNoYXBlKTogQnJ1c2hbXSB7XG4gIGNvbnN0IGJydXNoZXMgPSBbXSxcbiAga2V5cyA9IFtdLFxuICBzaGFwZXMgPSAoY3VycmVudCAmJiBjdXJyZW50LmRlc3QpID8gZHJhd24uY29uY2F0KGN1cnJlbnQpIDogZHJhd247XG4gIGxldCBpOiBhbnksIHNoYXBlOiBTaGFwZSwgYnJ1c2hLZXk6IHN0cmluZztcbiAgZm9yIChpIGluIHNoYXBlcykge1xuICAgIHNoYXBlID0gc2hhcGVzW2ldO1xuICAgIGlmICghc2hhcGUuZGVzdCkgY29udGludWU7XG4gICAgYnJ1c2hLZXkgPSBzaGFwZS5icnVzaDtcbiAgICBpZiAoc2hhcGUuYnJ1c2hNb2RpZmllcnMpXG4gICAgYnJ1c2hlcy5wdXNoKG1ha2VDdXN0b21CcnVzaChkLmJydXNoZXNbYnJ1c2hLZXldLCBzaGFwZS5icnVzaE1vZGlmaWVycywgaSkpO1xuICAgIGVsc2UgaWYgKGtleXMuaW5kZXhPZihicnVzaEtleSkgPT09IC0xKSB7XG4gICAgICBicnVzaGVzLnB1c2goZC5icnVzaGVzW2JydXNoS2V5XSk7XG4gICAgICBrZXlzLnB1c2goYnJ1c2hLZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYnJ1c2hlcztcbn1cblxuZnVuY3Rpb24gY2lyY2xlV2lkdGgoY3VycmVudDogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogbnVtYmVyIHtcbiAgcmV0dXJuIChjdXJyZW50ID8gMyA6IDQpIC8gNTEyICogYm91bmRzLndpZHRoO1xufVxuXG5mdW5jdGlvbiBsaW5lV2lkdGgoYnJ1c2g6IEJydXNoLCBjdXJyZW50OiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBudW1iZXIge1xuICByZXR1cm4gKGJydXNoLmxpbmVXaWR0aCB8fCAxMCkgKiAoY3VycmVudCA/IDAuODUgOiAxKSAvIDUxMiAqIGJvdW5kcy53aWR0aDtcbn1cblxuZnVuY3Rpb24gb3BhY2l0eShicnVzaDogQnJ1c2gsIGN1cnJlbnQ6IGJvb2xlYW4pOiBudW1iZXIge1xuICByZXR1cm4gKGJydXNoLm9wYWNpdHkgfHwgMSkgKiAoY3VycmVudCA/IDAuOSA6IDEpO1xufVxuXG5mdW5jdGlvbiBhcnJvd01hcmdpbihjdXJyZW50OiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBudW1iZXIge1xuICByZXR1cm4gaXNUcmlkZW50KCkgPyAwIDogKChjdXJyZW50ID8gMTAgOiAyMCkgLyA1MTIgKiBib3VuZHMud2lkdGgpO1xufVxuXG5mdW5jdGlvbiBwb3MycHgocG9zOiBQb3MsIGJvdW5kczogQ2xpZW50UmVjdCk6IE51bWJlclBhaXIge1xuICBjb25zdCBzcXVhcmVTaXplID0gYm91bmRzLndpZHRoIC8gODtcbiAgcmV0dXJuIFsocG9zWzBdIC0gMC41KSAqIHNxdWFyZVNpemUsICg4LjUgLSBwb3NbMV0pICogc3F1YXJlU2l6ZV07XG59XG4iLCJleHBvcnQgY29uc3QgZmlsZXM6IEZpbFtdID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnXTtcbmV4cG9ydCBjb25zdCByYW5rczogUmFua1tdID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDhdO1xuZXhwb3J0IGNvbnN0IGludlJhbmtzOiBSYW5rW10gPSBbOCwgNywgNiwgNSwgNCwgMywgMiwgMV07XG5leHBvcnQgY29uc3QgZmlsZU51bWJlcnM6IHsgW2ZpbGU6IHN0cmluZ106IG51bWJlciB9ID0ge1xuICBhOiAxLFxuICBiOiAyLFxuICBjOiAzLFxuICBkOiA0LFxuICBlOiA1LFxuICBmOiA2LFxuICBnOiA3LFxuICBoOiA4XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcG9zMmtleShwb3M6IFBvcyk6IEtleSB7XG4gIHJldHVybiBmaWxlc1twb3NbMF0gLSAxXSArIHBvc1sxXSBhcyBLZXk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBrZXkycG9zKGtleTogS2V5KTogUG9zIHtcbiAgcmV0dXJuIFtmaWxlTnVtYmVyc1trZXlbMF1dIGFzIG51bWJlciwgcGFyc2VJbnQoa2V5WzFdKSBhcyBudW1iZXJdIGFzIFBvcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludmVydEtleShrZXk6IEtleSkge1xuICByZXR1cm4gZmlsZXNbOCAtIGZpbGVOdW1iZXJzW2tleVswXV1dICsgKDkgLSBwYXJzZUludChrZXlbMV0pKSBhcyBLZXlcbn1cblxuZXhwb3J0IGNvbnN0IGFsbFBvczogUG9zW10gPSBbXTtcbmV4cG9ydCBjb25zdCBhbGxLZXlzOiBLZXlbXSA9IFtdO1xuZm9yIChsZXQgeSA9IDg7IHkgPiAwOyAtLXkpIHtcbiAgZm9yIChsZXQgeCA9IDE7IHggPCA5OyArK3gpIHtcbiAgICBjb25zdCBwb3M6IFBvcyA9IFt4LCB5XTtcbiAgICBhbGxQb3MucHVzaChwb3MpO1xuICAgIGFsbEtleXMucHVzaChwb3Mya2V5KHBvcykpO1xuICB9XG59XG5leHBvcnQgY29uc3QgaW52S2V5czogS2V5W10gPSBhbGxLZXlzLnNsaWNlKDApLnJldmVyc2UoKTtcblxuZXhwb3J0IGZ1bmN0aW9uIG9wcG9zaXRlKGNvbG9yOiBDb2xvcik6IENvbG9yIHtcbiAgcmV0dXJuIGNvbG9yID09PSAnd2hpdGUnID8gJ2JsYWNrJyA6ICd3aGl0ZSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250YWluc1g8WD4oeHM6IFhbXSwgeDogWCk6IGJvb2xlYW4ge1xuICByZXR1cm4geHMgJiYgeHMuaW5kZXhPZih4KSAhPT0gLTE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShwb3MxOiBQb3MsIHBvczI6IFBvcyk6IG51bWJlciB7XG4gIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocG9zMVswXSAtIHBvczJbMF0sIDIpICsgTWF0aC5wb3cocG9zMVsxXSAtIHBvczJbMV0sIDIpKTtcbn1cblxuLy8gdGhpcyBtdXN0IGJlIGNhY2hlZCBiZWNhdXNlIG9mIHRoZSBhY2Nlc3MgdG8gZG9jdW1lbnQuYm9keS5zdHlsZVxubGV0IGNhY2hlZFRyYW5zZm9ybVByb3A6IHN0cmluZztcblxuZnVuY3Rpb24gY29tcHV0ZVRyYW5zZm9ybVByb3AoKSB7XG4gIHJldHVybiAndHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID9cbiAgJ3RyYW5zZm9ybScgOiAnd2Via2l0VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID9cbiAgJ3dlYmtpdFRyYW5zZm9ybScgOiAnbW96VHJhbnNmb3JtJyBpbiBkb2N1bWVudC5ib2R5LnN0eWxlID9cbiAgJ21velRyYW5zZm9ybScgOiAnb1RyYW5zZm9ybScgaW4gZG9jdW1lbnQuYm9keS5zdHlsZSA/XG4gICdvVHJhbnNmb3JtJyA6ICdtc1RyYW5zZm9ybSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1Qcm9wKCk6IHN0cmluZyB7XG4gIGlmICghY2FjaGVkVHJhbnNmb3JtUHJvcCkgY2FjaGVkVHJhbnNmb3JtUHJvcCA9IGNvbXB1dGVUcmFuc2Zvcm1Qcm9wKCk7XG4gIHJldHVybiBjYWNoZWRUcmFuc2Zvcm1Qcm9wO1xufVxuXG5sZXQgY2FjaGVkSXNUcmlkZW50OiBib29sZWFuO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNUcmlkZW50KCk6IGJvb2xlYW4ge1xuICBpZiAoY2FjaGVkSXNUcmlkZW50ID09PSB1bmRlZmluZWQpXG4gICAgY2FjaGVkSXNUcmlkZW50ID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignVHJpZGVudC8nKSA+IC0xO1xuICByZXR1cm4gY2FjaGVkSXNUcmlkZW50O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKHBvczogUG9zKTogc3RyaW5nIHtcbiAgcmV0dXJuICd0cmFuc2xhdGUoJyArIHBvc1swXSArICdweCwnICsgcG9zWzFdICsgJ3B4KSc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudFBvc2l0aW9uKGU6IGFueSk6IE51bWJlclBhaXIge1xuICBpZiAoZS5jbGllbnRYIHx8IGUuY2xpZW50WCA9PT0gMCkgcmV0dXJuIFtlLmNsaWVudFgsIGUuY2xpZW50WV07XG4gIGlmIChlLnRvdWNoZXMgJiYgZS50YXJnZXRUb3VjaGVzWzBdKSByZXR1cm4gW2UudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRYLCBlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WV07XG4gIHRocm93ICdDYW5ub3QgZmluZCBwb3NpdGlvbiBvZiBldmVudCAnICsgZTtcbn1cblxuLy8gZnVuY3Rpb24gcGFydGlhbEFwcGx5KGZuLCBhcmdzKSB7XG4vLyAgIHJldHVybiBmbi5iaW5kLmFwcGx5KGZuLCBbbnVsbF0uY29uY2F0KGFyZ3MpKTtcbi8vIH1cblxuLy8gZnVuY3Rpb24gcGFydGlhbCgpIHtcbi8vICAgcmV0dXJuIHBhcnRpYWxBcHBseShhcmd1bWVudHNbMF0sIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuLy8gfVxuXG5leHBvcnQgZnVuY3Rpb24gaXNMZWZ0QnV0dG9uKGU6IE1vdXNlRXZlbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIGUuYnV0dG9ucyA9PT0gMSB8fCBlLmJ1dHRvbiA9PT0gMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmlnaHRCdXR0b24oZTogTW91c2VFdmVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xufVxuXG5leHBvcnQgY29uc3QgcmFmID0gKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LnNldFRpbWVvdXQpLmJpbmQod2luZG93KTtcbiIsImltcG9ydCB7IGggfSBmcm9tICdzbmFiYmRvbSdcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCBzdmcgZnJvbSAnLi9zdmcnXG5cbmludGVyZmFjZSBDdHgge1xuICByZWFkb25seSBhc1doaXRlOiBib29sZWFuO1xuICByZWFkb25seSBib3VuZHM6IENsaWVudFJlY3Q7XG4gIHJlYWRvbmx5IHRyYW5zZm9ybVByb3A6IHN0cmluZztcbn1cblxudHlwZSBDbGFzc2VzID0gUmVjb3JkPHN0cmluZywgYm9vbGVhbj47XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGQ6IFN0YXRlKTogVk5vZGUge1xuICByZXR1cm4gaCgnZGl2Jywge1xuICAgIGNsYXNzOiB7XG4gICAgICAnY2ctYm9hcmQtd3JhcCc6IHRydWUsXG4gICAgICBbJ29yaWVudGF0aW9uLScgKyBkLm9yaWVudGF0aW9uXTogdHJ1ZSxcbiAgICAgICd2aWV3LW9ubHknOiBkLnZpZXdPbmx5LFxuICAgICAgJ21hbmlwdWxhYmxlJzogIWQudmlld09ubHlcbiAgICB9XG4gIH0sIFtcbiAgICBoKCdkaXYnLCB7XG4gICAgICBjbGFzczoge1xuICAgICAgICAnY2ctYm9hcmQnOiB0cnVlXG4gICAgICB9XG4gICAgfSwgcmVuZGVyQ29udGVudChkKSlcbiAgXSk7XG59O1xuXG5mdW5jdGlvbiByZW5kZXJQaWVjZShkOiBTdGF0ZSwga2V5OiBLZXksIGN0eDogQ3R4KTogVk5vZGUge1xuXG4gIGNvbnN0IGNsYXNzZXMgPSBwaWVjZUNsYXNzZXMoZC5waWVjZXNba2V5XSksXG4gIHRyYW5zbGF0ZSA9IHBvc1RvVHJhbnNsYXRlKHV0aWwua2V5MnBvcyhrZXkpLCBjdHgpLFxuICBkcmFnZ2FibGUgPSBkLmRyYWdnYWJsZS5jdXJyZW50LFxuICBhbmltID0gZC5hbmltYXRpb24uY3VycmVudDtcbiAgaWYgKGRyYWdnYWJsZSAmJiBkcmFnZ2FibGUub3JpZyA9PT0ga2V5ICYmIGRyYWdnYWJsZS5zdGFydGVkKSB7XG4gICAgdHJhbnNsYXRlWzBdICs9IGRyYWdnYWJsZS5wb3NbMF0gKyBkcmFnZ2FibGUuZGVjWzBdO1xuICAgIHRyYW5zbGF0ZVsxXSArPSBkcmFnZ2FibGUucG9zWzFdICsgZHJhZ2dhYmxlLmRlY1sxXTtcbiAgICBjbGFzc2VzWydkcmFnZ2luZyddID0gdHJ1ZTtcbiAgfSBlbHNlIGlmIChhbmltKSB7XG4gICAgY29uc3QgbXlBbmltID0gYW5pbS5wbGFuLmFuaW1zW2tleV07XG4gICAgaWYgKG15QW5pbSkge1xuICAgICAgdHJhbnNsYXRlWzBdICs9IG15QW5pbVsxXVswXTtcbiAgICAgIHRyYW5zbGF0ZVsxXSArPSBteUFuaW1bMV1bMV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGgocGllY2VUYWcsIHtcbiAgICBrZXk6ICdwJyArIGtleSxcbiAgICBjbGFzczogcGllY2VDbGFzc2VzKGQucGllY2VzW2tleV0pLFxuICAgIHN0eWxlOiB7IFtjdHgudHJhbnNmb3JtUHJvcF06IHV0aWwudHJhbnNsYXRlKHRyYW5zbGF0ZSkgfSxcbiAgICAvLyBhdHRyczogZC5waWVjZUtleSA/IHsnZGF0YS1rZXknOiBrZXkgfSA6IHVuZGVmaW5lZFxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTcXVhcmUoa2V5OiBLZXksIGNsYXNzZXM6IENsYXNzZXMsIGN0eDogQ3R4KTogVk5vZGUge1xuICByZXR1cm4gaChzcXVhcmVUYWcsIHtcbiAgICBrZXk6ICdzJyArIGtleSxcbiAgICBjbGFzczogY2xhc3NlcyxcbiAgICBzdHlsZTogeyBbY3R4LnRyYW5zZm9ybVByb3BdOiB1dGlsLnRyYW5zbGF0ZShwb3NUb1RyYW5zbGF0ZSh1dGlsLmtleTJwb3Moa2V5KSwgY3R4KSkgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcG9zVG9UcmFuc2xhdGUocG9zOiBQb3MsIGN0eDogQ3R4KTogTnVtYmVyUGFpciB7XG4gIHJldHVybiBbXG4gICAgKGN0eC5hc1doaXRlID8gcG9zWzBdIC0gMSA6IDggLSBwb3NbMF0pICogY3R4LmJvdW5kcy53aWR0aCAvIDgsXG4gICAgKGN0eC5hc1doaXRlID8gOCAtIHBvc1sxXSA6IHBvc1sxXSAtIDEpICogY3R4LmJvdW5kcy5oZWlnaHQgLyA4XG4gIF07XG59XG5cbmZ1bmN0aW9uIHJlbmRlckdob3N0KGtleTogS2V5LCBwaWVjZTogUGllY2UsIGN0eDogQ3R4KTogVk5vZGUge1xuICBjb25zdCBjbGFzc2VzID0gcGllY2VDbGFzc2VzKHBpZWNlKTtcbiAgY2xhc3Nlc1snZ2hvc3QnXSA9IHRydWU7XG4gIHJldHVybiBoKHBpZWNlVGFnLCB7XG4gICAga2V5OiAnZycgKyBrZXksXG4gICAgY2xhc3M6IGNsYXNzZXMsXG4gICAgc3R5bGU6IHsgW2N0eC50cmFuc2Zvcm1Qcm9wXTogdXRpbC50cmFuc2xhdGUocG9zVG9UcmFuc2xhdGUodXRpbC5rZXkycG9zKGtleSksIGN0eCkpIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckZhZGluZyhmYWRpbmc6IEFuaW1GYWRpbmcsIGN0eDogQ3R4KTogVk5vZGUge1xuICBjb25zdCBjbGFzc2VzID0gcGllY2VDbGFzc2VzKGZhZGluZy5waWVjZSk7XG4gIGNsYXNzZXNbJ2ZhZGluZyddID0gdHJ1ZTtcbiAgcmV0dXJuIGgocGllY2VUYWcsIHtcbiAgICBrZXk6ICdmJyArIHV0aWwucG9zMmtleShmYWRpbmcucG9zKSxcbiAgICBjbGFzczogY2xhc3NlcyxcbiAgICBzdHlsZToge1xuICAgICAgW2N0eC50cmFuc2Zvcm1Qcm9wXTogdXRpbC50cmFuc2xhdGUocG9zVG9UcmFuc2xhdGUoZmFkaW5nLnBvcywgY3R4KSksXG4gICAgICBvcGFjaXR5OiBmYWRpbmcub3BhY2l0eVxuICAgIH1cbiAgfSk7XG59XG5cbmludGVyZmFjZSBTcXVhcmVDbGFzc2VzIHtcbiAgW2tleTogc3RyaW5nXTogQ2xhc3Nlc1xufVxuXG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlczogU3F1YXJlQ2xhc3Nlcywga2V5OiBLZXksIGtsYXNzOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKHNxdWFyZXNba2V5XSkgc3F1YXJlc1trZXldW2tsYXNzXSA9IHRydWU7XG4gIGVsc2Ugc3F1YXJlc1trZXldID0geyBba2xhc3NdOiB0cnVlIH07XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNxdWFyZXMoZDogU3RhdGUsIGN0eDogQ3R4KTogVk5vZGVbXSB7XG4gIGNvbnN0IHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSB7fTtcbiAgbGV0IGk6IGFueSwgazogS2V5O1xuICBpZiAoZC5sYXN0TW92ZSAmJiBkLmhpZ2hsaWdodC5sYXN0TW92ZSkgZm9yIChpIGluIGQubGFzdE1vdmUpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgZC5sYXN0TW92ZVtpXSwgJ2xhc3QtbW92ZScpO1xuICB9XG4gIGlmIChkLmNoZWNrICYmIGQuaGlnaGxpZ2h0LmNoZWNrKSBhZGRTcXVhcmUoc3F1YXJlcywgZC5jaGVjaywgJ2NoZWNrJyk7XG4gIGlmIChkLnNlbGVjdGVkKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIGQuc2VsZWN0ZWQsICdzZWxlY3RlZCcpO1xuICAgIGNvbnN0IG92ZXIgPSBkLmRyYWdnYWJsZS5jdXJyZW50ICYmIGQuZHJhZ2dhYmxlLmN1cnJlbnQub3ZlcixcbiAgICBkZXN0cyA9IGQubW92YWJsZS5kZXN0cyAmJiBkLm1vdmFibGUuZGVzdHNbZC5zZWxlY3RlZF07XG4gICAgaWYgKGRlc3RzKSBmb3IgKGkgaW4gZGVzdHMpIHtcbiAgICAgIGsgPSBkZXN0c1tpXTtcbiAgICAgIGlmIChkLm1vdmFibGUuc2hvd0Rlc3RzKSBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ21vdmUtZGVzdCcpO1xuICAgICAgaWYgKGsgPT09IG92ZXIpIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnZHJhZy1vdmVyJyk7XG4gICAgICBlbHNlIGlmIChkLm1vdmFibGUuc2hvd0Rlc3RzICYmIGQucGllY2VzW2tdKSBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ29jJyk7XG4gICAgfVxuICAgIGNvbnN0IHBEZXN0cyA9IGQucHJlbW92YWJsZS5kZXN0cztcbiAgICBpZiAocERlc3RzKSBmb3IgKGkgaW4gcERlc3RzKSB7XG4gICAgICBrID0gcERlc3RzW2ldO1xuICAgICAgaWYgKGQubW92YWJsZS5zaG93RGVzdHMpIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAncHJlbW92ZS1kZXN0Jyk7XG4gICAgICBpZiAoayA9PT0gb3ZlcikgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdkcmFnLW92ZXInKTtcbiAgICAgIGVsc2UgaWYgKGQubW92YWJsZS5zaG93RGVzdHMgJiYgZC5waWVjZXNba10pIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAnb2MnKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgcHJlbW92ZSA9IGQucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAocHJlbW92ZSkgZm9yIChpIGluIHByZW1vdmUpIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlW2ldLCAnY3VycmVudC1wcmVtb3ZlJyk7XG4gIGVsc2UgaWYgKGQucHJlZHJvcHBhYmxlLmN1cnJlbnQpIGFkZFNxdWFyZShzcXVhcmVzLCBkLnByZWRyb3BwYWJsZS5jdXJyZW50LmtleSwgJ2N1cnJlbnQtcHJlbW92ZScpO1xuXG4gIGxldCBvID0gZC5leHBsb2Rpbmc7XG4gIGlmIChvKSBmb3IgKGkgaW4gby5rZXlzKSBhZGRTcXVhcmUoc3F1YXJlcywgby5rZXlzW2ldLCAnZXhwbG9kaW5nJyArIG8uc3RhZ2UpO1xuXG4gIGNvbnN0IG5vZGVzOiBWTm9kZVtdID0gW107XG5cbiAgLy8gaWYgKGQuaXRlbXMpIHtcbiAgLy8gICBsZXQga2V5OiBLZXksIHNxdWFyZTogU3F1YXJlQ2xhc3NlcyB8IHVuZGVmaW5lZCwgaXRlbTogSXRlbTtcbiAgLy8gICBmb3IgKGkgPSAwOyBpIDwgNjQ7IGkrKykge1xuICAvLyAgICAga2V5ID0gdXRpbC5hbGxLZXlzW2ldO1xuICAvLyAgICAgc3F1YXJlID0gc3F1YXJlc1trZXldO1xuICAvLyAgICAgaXRlbSA9IGQuaXRlbXModXRpbC5rZXkycG9zKGtleSksIGtleSk7XG4gIC8vICAgICBpZiAoc3F1YXJlIHx8IGl0ZW0pIHtcbiAgLy8gICAgICAgdmFyIHNxID0gcmVuZGVyU3F1YXJlKGtleSwgc3F1YXJlID8gc3F1YXJlLmpvaW4oJyAnKSArIChpdGVtID8gJyBoYXMtaXRlbScgOiAnJykgOiAnaGFzLWl0ZW0nLCBjdHgpO1xuICAvLyAgICAgICBpZiAoaXRlbSkgc3EuY2hpbGRyZW4gPSBbaXRlbV07XG4gIC8vICAgICAgIGRvbS5wdXNoKHNxKTtcbiAgLy8gICAgIH1cbiAgLy8gICB9XG4gIC8vIH1cblxuICBmb3IgKGkgaW4gc3F1YXJlcykgbm9kZXMucHVzaChyZW5kZXJTcXVhcmUoaSwgc3F1YXJlc1tpXSwgY3R4KSk7XG4gIHJldHVybiBub2Rlcztcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29udGVudChkOiBTdGF0ZSk6IFZOb2RlW10ge1xuICBjb25zdCBjdHg6IEN0eCA9IHtcbiAgICBhc1doaXRlOiBkLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLFxuICAgIGJvdW5kczogZC5kb20uYm91bmRzLFxuICAgIHRyYW5zZm9ybVByb3A6IHV0aWwudHJhbnNmb3JtUHJvcCgpXG4gIH0sXG4gIGFuaW1hdGlvbiA9IGQuYW5pbWF0aW9uLmN1cnJlbnQsXG4gIG5vZGVzOiBWTm9kZVtdID0gcmVuZGVyU3F1YXJlcyhkLCBjdHgpLFxuICBmYWRpbmdzID0gYW5pbWF0aW9uICYmIGFuaW1hdGlvbi5wbGFuLmZhZGluZ3MsXG4gIGRyYWdnYWJsZSA9IGQuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGxldCBpOiBhbnk7XG5cbiAgaWYgKGZhZGluZ3MpIGZvciAoaSBpbiBmYWRpbmdzKSBub2Rlcy5wdXNoKHJlbmRlckZhZGluZyhmYWRpbmdzW2ldLCBjdHgpKTtcblxuICAvLyBtdXN0IGluc2VydCBwaWVjZXMgaW4gdGhlIHJpZ2h0IG9yZGVyXG4gIC8vIGZvciAzRCB0byBkaXNwbGF5IGNvcnJlY3RseVxuICBjb25zdCBrZXlzID0gY3R4LmFzV2hpdGUgPyB1dGlsLmFsbEtleXMgOiB1dGlsLmludktleXM7XG4gIGlmIChkLml0ZW1zKSB7XG4gICAgLy8gZm9yIChpID0gMDsgaSA8IDY0OyBpKyspIHtcbiAgICAvLyAgIGlmIChkLnBpZWNlc1trZXlzW2ldXSAmJiAhZC5pdGVtcyh1dGlsLmtleTJwb3Moa2V5c1tpXSksIGtleXNbaV0pKVxuICAgIC8vICAgY2hpbGRyZW4ucHVzaChyZW5kZXJQaWVjZShkLCBrZXlzW2ldLCBjdHgpKTtcbiAgICAvLyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCA2NDsgaSsrKSB7XG4gICAgICAgIGlmIChkLnBpZWNlc1trZXlzW2ldXSkgbm9kZXMucHVzaChyZW5kZXJQaWVjZShkLCBrZXlzW2ldLCBjdHgpKTtcbiAgICAgIH1cbiAgICAgIC8vIHRoZSBoYWNrIHRvIGRyYWcgbmV3IHBpZWNlcyBvbiB0aGUgYm9hcmQgKGVkaXRvciBhbmQgY3Jhenlob3VzZSlcbiAgICAgIC8vIGlzIHRvIHB1dCBpdCBvbiBhMCB0aGVuIHNldCBpdCBhcyBiZWluZyBkcmFnZ2VkXG4gICAgICBpZiAoZHJhZ2dhYmxlICYmIGRyYWdnYWJsZS5uZXdQaWVjZSkgbm9kZXMucHVzaChyZW5kZXJQaWVjZShkLCAnYTAnLCBjdHgpKTtcbiAgICB9XG5cbiAgICBpZiAoZHJhZ2dhYmxlICYmIGQuZHJhZ2dhYmxlLnNob3dHaG9zdCAmJiAhZHJhZ2dhYmxlLm5ld1BpZWNlKSB7XG4gICAgICBub2Rlcy5wdXNoKHJlbmRlckdob3N0KGRyYWdnYWJsZS5vcmlnLCBkLnBpZWNlc1tkcmFnZ2FibGUub3JpZ10sIGN0eCkpO1xuICAgIH1cblxuICAgIGlmIChkLmRyYXdhYmxlLmVuYWJsZWQpIHtcbiAgICAgIGxldCBub2RlID0gc3ZnKGQpO1xuICAgICAgaWYgKG5vZGUpIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICAgIHJldHVybiBub2Rlcztcbn1cblxuY29uc3QgcGllY2VUYWcgPSAncGllY2UnO1xuY29uc3Qgc3F1YXJlVGFnID0gJ3NxdWFyZSc7XG5cbmZ1bmN0aW9uIHBpZWNlQ2xhc3NlcyhwOiBQaWVjZSk6IENsYXNzZXMge1xuICByZXR1cm4ge1xuICAgIFtwLnJvbGVdOiB0cnVlLFxuICAgIFtwLmNvbG9yXTogdHJ1ZVxuICB9O1xufVxuIl19
