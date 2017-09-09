(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Chessground = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
function anim(mutation, state) {
    return state.animation.enabled ? animate(mutation, state) : render(mutation, state);
}
exports.anim = anim;
function render(mutation, state) {
    var result = mutation(state);
    state.dom.redraw();
    return result;
}
exports.render = render;
function makePiece(key, piece) {
    return {
        key: key,
        pos: util.key2pos(key),
        piece: piece
    };
}
function closer(piece, pieces) {
    return pieces.sort(function (p1, p2) {
        return util.distanceSq(piece.pos, p1.pos) - util.distanceSq(piece.pos, p2.pos);
    })[0];
}
function computePlan(prevPieces, current) {
    var anims = {}, animedOrigs = [], fadings = {}, missings = [], news = [], prePieces = {};
    var curP, preP, i, vector;
    for (i in prevPieces) {
        prePieces[i] = makePiece(i, prevPieces[i]);
    }
    for (var _i = 0, _a = util.allKeys; _i < _a.length; _i++) {
        var key = _a[_i];
        curP = current.pieces[key];
        preP = prePieces[key];
        if (curP) {
            if (preP) {
                if (!util.samePiece(curP, preP.piece)) {
                    missings.push(preP);
                    news.push(makePiece(key, curP));
                }
            }
            else
                news.push(makePiece(key, curP));
        }
        else if (preP)
            missings.push(preP);
    }
    news.forEach(function (newP) {
        preP = closer(newP, missings.filter(function (p) { return util.samePiece(newP.piece, p.piece); }));
        if (preP) {
            vector = [preP.pos[0] - newP.pos[0], preP.pos[1] - newP.pos[1]];
            anims[newP.key] = [vector, vector];
            animedOrigs.push(preP.key);
        }
    });
    missings.forEach(function (p) {
        if (!util.containsX(animedOrigs, p.key) &&
            !(current.items ? current.items(p.pos, p.key) : false))
            fadings[p.key] = p.piece;
    });
    return {
        anims: anims,
        fadings: fadings
    };
}
function step(state) {
    var cur = state.animation.current;
    if (!cur) {
        if (!state.dom.destroyed)
            state.dom.redrawNow();
        return;
    }
    var rest = 1 - (Date.now() - cur.start) / cur.duration;
    if (rest <= 0) {
        state.animation.current = undefined;
        state.dom.redrawNow();
    }
    else {
        var ease = easing(rest);
        for (var i in cur.plan.anims) {
            var cfg = cur.plan.anims[i];
            cfg[1] = [cfg[0][0] * ease, cfg[0][1] * ease];
        }
        state.dom.redrawNow(true);
        util.raf(function () { return step(state); });
    }
}
function animate(mutation, state) {
    var prevPieces = __assign({}, state.pieces);
    var result = mutation(state);
    var plan = computePlan(prevPieces, state);
    if (!isObjectEmpty(plan.anims) || !isObjectEmpty(plan.fadings)) {
        var alreadyRunning = state.animation.current && state.animation.current.start;
        state.animation.current = {
            start: Date.now(),
            duration: state.animation.duration,
            plan: plan
        };
        if (!alreadyRunning)
            step(state);
    }
    else {
        state.dom.redraw();
    }
    return result;
}
function isObjectEmpty(o) {
    for (var _ in o)
        return false;
    return true;
}
function easing(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

},{"./util":17}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board = require("./board");
var fen_1 = require("./fen");
var config_1 = require("./config");
var anim_1 = require("./anim");
var drag_1 = require("./drag");
var explosion_1 = require("./explosion");
function start(state, redrawAll) {
    function toggleOrientation() {
        board.toggleOrientation(state);
        redrawAll();
    }
    ;
    return {
        set: function (config) {
            if (config.orientation && config.orientation !== state.orientation)
                toggleOrientation();
            (config.fen ? anim_1.anim : anim_1.render)(function (state) { return config_1.configure(state, config); }, state);
        },
        state: state,
        getFen: function () { return fen_1.write(state.pieces); },
        toggleOrientation: toggleOrientation,
        setPieces: function (pieces) {
            anim_1.anim(function (state) { return board.setPieces(state, pieces); }, state);
        },
        selectSquare: function (key, force) {
            if (key)
                anim_1.anim(function (state) { return board.selectSquare(state, key, force); }, state);
            else if (state.selected) {
                board.unselect(state);
                state.dom.redraw();
            }
        },
        move: function (orig, dest) {
            anim_1.anim(function (state) { return board.baseMove(state, orig, dest); }, state);
        },
        newPiece: function (piece, key) {
            anim_1.anim(function (state) { return board.baseNewPiece(state, piece, key); }, state);
        },
        playPremove: function () {
            if (state.premovable.current) {
                if (anim_1.anim(board.playPremove, state))
                    return true;
                state.dom.redraw();
            }
            return false;
        },
        playPredrop: function (validate) {
            if (state.predroppable.current) {
                var result = board.playPredrop(state, validate);
                state.dom.redraw();
                return result;
            }
            return false;
        },
        cancelPremove: function () {
            anim_1.render(board.unsetPremove, state);
        },
        cancelPredrop: function () {
            anim_1.render(board.unsetPredrop, state);
        },
        cancelMove: function () {
            anim_1.render(function (state) { board.cancelMove(state); drag_1.cancel(state); }, state);
        },
        stop: function () {
            anim_1.render(function (state) { board.stop(state); drag_1.cancel(state); }, state);
        },
        explode: function (keys) {
            explosion_1.default(state, keys);
        },
        setAutoShapes: function (shapes) {
            anim_1.render(function (state) { return state.drawable.autoShapes = shapes; }, state);
        },
        setShapes: function (shapes) {
            anim_1.render(function (state) { return state.drawable.shapes = shapes; }, state);
        },
        getKeyAtDomPos: function (pos) {
            return board.getKeyAtDomPos(pos, state.orientation === 'white', state.dom.bounds());
        },
        redrawAll: redrawAll,
        dragNewPiece: function (piece, event, force) {
            drag_1.dragNewPiece(state, piece, event, force);
        },
        destroy: function () {
            board.stop(state);
            state.dom.unbind && state.dom.unbind();
            state.dom.destroyed = true;
        }
    };
}
exports.start = start;

},{"./anim":1,"./board":3,"./config":5,"./drag":6,"./explosion":9,"./fen":10}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var premove_1 = require("./premove");
function callUserFunction(f) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (f)
        setTimeout(function () { return f.apply(void 0, args); }, 1);
}
exports.callUserFunction = callUserFunction;
function toggleOrientation(state) {
    state.orientation = util_1.opposite(state.orientation);
    state.animation.current =
        state.draggable.current =
            state.selected = undefined;
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
        var piece = pieces[key];
        if (piece)
            state.pieces[key] = piece;
        else
            delete state.pieces[key];
    }
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
        return false;
    var king = state.pieces[orig];
    if (king.role !== 'king')
        return false;
    var origPos = util_1.key2pos(orig);
    if (origPos[0] !== 5)
        return false;
    if (origPos[1] !== 1 && origPos[1] !== 8)
        return false;
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
        return false;
    var rook = state.pieces[oldRookPos];
    if (rook.role !== 'rook')
        return false;
    delete state.pieces[orig];
    delete state.pieces[oldRookPos];
    state.pieces[newKingPos] = king;
    state.pieces[newRookPos] = rook;
    return true;
}
function baseMove(state, orig, dest) {
    if (orig === dest || !state.pieces[orig])
        return false;
    var captured = (state.pieces[dest] &&
        state.pieces[dest].color !== state.pieces[orig].color) ? state.pieces[dest] : undefined;
    if (dest == state.selected)
        unselect(state);
    callUserFunction(state.events.move, orig, dest, captured);
    if (!tryAutoCastle(state, orig, dest)) {
        state.pieces[dest] = state.pieces[orig];
        delete state.pieces[orig];
    }
    state.lastMove = [orig, dest];
    state.check = undefined;
    callUserFunction(state.events.change);
    return captured || true;
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
    state.lastMove = [key];
    state.check = undefined;
    callUserFunction(state.events.change);
    state.movable.dests = undefined;
    state.turnColor = util_1.opposite(state.turnColor);
    return true;
}
exports.baseNewPiece = baseNewPiece;
function baseUserMove(state, orig, dest) {
    var result = baseMove(state, orig, dest);
    if (result) {
        state.movable.dests = undefined;
        state.turnColor = util_1.opposite(state.turnColor);
        state.animation.current = undefined;
    }
    return result;
}
function userMove(state, orig, dest) {
    if (canMove(state, orig, dest)) {
        var result = baseUserMove(state, orig, dest);
        if (result) {
            var holdTime = state.hold.stop();
            unselect(state);
            var metadata = {
                premove: false,
                ctrlKey: state.stats.ctrlKey,
                holdTime: holdTime
            };
            if (result !== true)
                metadata.captured = result;
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
        state.hold.start();
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
            state.hold.cancel();
        }
        else if ((state.selectable.enabled || force) && state.selected !== key) {
            if (userMove(state, state.selected, key))
                state.stats.dragged = false;
        }
        else
            state.hold.start();
    }
    else if (isMovable(state, key) || isPremovable(state, key)) {
        setSelected(state, key);
        state.hold.start();
    }
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
    state.hold.cancel();
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
exports.canMove = canMove;
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
        var result = baseUserMove(state, orig, dest);
        if (result) {
            var metadata = { premove: true };
            if (result !== true)
                metadata.captured = result;
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
    state.movable.color =
        state.movable.dests =
            state.animation.current = undefined;
    cancelMove(state);
}
exports.stop = stop;
function getKeyAtDomPos(pos, asWhite, bounds) {
    var file = Math.ceil(8 * ((pos[0] - bounds.left) / bounds.width));
    if (!asWhite)
        file = 9 - file;
    var rank = Math.ceil(8 - (8 * ((pos[1] - bounds.top) / bounds.height)));
    if (!asWhite)
        rank = 9 - rank;
    return (file > 0 && file < 9 && rank > 0 && rank < 9) ? util_1.pos2key([file, rank]) : undefined;
}
exports.getKeyAtDomPos = getKeyAtDomPos;

},{"./premove":12,"./util":17}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var api_1 = require("./api");
var config_1 = require("./config");
var state_1 = require("./state");
var wrap_1 = require("./wrap");
var events = require("./events");
var render_1 = require("./render");
var svg = require("./svg");
var util = require("./util");
function Chessground(element, config) {
    var state = state_1.defaults();
    config_1.configure(state, config || {});
    function redrawAll() {
        var prevUnbind = state.dom && state.dom.unbind;
        element.classList.add('cg-board-wrap');
        var bounds = util.memo(function () { return element.getBoundingClientRect(); });
        var elements = wrap_1.default(element, state, state.viewOnly && !state.drawable.visible ? undefined : bounds());
        var redrawNow = function (skipSvg) {
            render_1.default(state);
            if (!skipSvg && elements.svg)
                svg.renderSvg(state, elements.svg);
        };
        state.dom = {
            elements: elements,
            bounds: bounds,
            redraw: debounceRedraw(redrawNow),
            redrawNow: redrawNow,
            unbind: prevUnbind
        };
        svg.clearCache();
        redrawNow(false);
        events.bindBoard(state);
        if (!prevUnbind)
            state.dom.unbind = events.bindDocument(state, redrawAll);
    }
    redrawAll();
    var api = api_1.start(state, redrawAll);
    return api;
}
exports.Chessground = Chessground;
;
function debounceRedraw(redrawNow) {
    var redrawing = false;
    return function () {
        if (redrawing)
            return;
        redrawing = true;
        util.raf(function () {
            redrawNow();
            redrawing = false;
        });
    };
}

},{"./api":2,"./config":5,"./events":8,"./render":13,"./state":14,"./svg":15,"./util":17,"./wrap":18}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board_1 = require("./board");
var fen_1 = require("./fen");
function configure(state, config) {
    if (config.movable && config.movable.dests)
        state.movable.dests = undefined;
    merge(state, config);
    if (config.fen) {
        state.pieces = fen_1.read(config.fen);
        state.drawable.shapes = [];
    }
    if (config.hasOwnProperty('check'))
        board_1.setCheck(state, config.check || false);
    if (config.hasOwnProperty('lastMove') && !config.lastMove)
        state.lastMove = undefined;
    else if (config.lastMove)
        state.lastMove = config.lastMove;
    if (state.selected)
        board_1.setSelected(state, state.selected);
    if (!state.animation.duration || state.animation.duration < 100)
        state.animation.enabled = false;
    if (!state.movable.rookCastle && state.movable.dests) {
        var rank_1 = state.movable.color === 'white' ? 1 : 8;
        var kingStartPos = 'e' + rank_1;
        var dests_1 = state.movable.dests[kingStartPos];
        if (!dests_1 || state.pieces[kingStartPos].role !== 'king')
            return;
        state.movable.dests[kingStartPos] = dests_1.filter(function (d) {
            return !((d === 'a' + rank_1) && dests_1.indexOf('c' + rank_1) !== -1) &&
                !((d === 'h' + rank_1) && dests_1.indexOf('g' + rank_1) !== -1);
        });
    }
}
exports.configure = configure;
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

},{"./board":3,"./fen":10}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board = require("./board");
var util = require("./util");
var draw_1 = require("./draw");
var anim_1 = require("./anim");
function start(s, e) {
    if (e.button !== undefined && e.button !== 0)
        return;
    if (e.touches && e.touches.length > 1)
        return;
    e.preventDefault();
    var asWhite = s.orientation === 'white', bounds = s.dom.bounds(), position = util.eventPosition(e), orig = board.getKeyAtDomPos(position, asWhite, bounds);
    if (!orig)
        return;
    var piece = s.pieces[orig];
    var previouslySelected = s.selected;
    if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || (!piece || piece.color !== s.turnColor)))
        draw_1.clear(s);
    var hadPremove = !!s.premovable.current;
    var hadPredrop = !!s.predroppable.current;
    s.stats.ctrlKey = e.ctrlKey;
    if (s.selected && board.canMove(s, s.selected, orig)) {
        anim_1.anim(function (state) { return board.selectSquare(state, orig); }, s);
    }
    else {
        board.selectSquare(s, orig);
    }
    var stillSelected = s.selected === orig;
    var element = pieceElementByKey(s, orig);
    if (piece && element && stillSelected && board.isDraggable(s, orig)) {
        var squareBounds = computeSquareBounds(orig, asWhite, bounds);
        s.draggable.current = {
            orig: orig,
            origPos: util.key2pos(orig),
            piece: piece,
            rel: position,
            epos: position,
            pos: [0, 0],
            dec: s.draggable.centerPiece ? [
                position[0] - (squareBounds.left + squareBounds.width / 2),
                position[1] - (squareBounds.top + squareBounds.height / 2)
            ] : [0, 0],
            started: s.draggable.autoDistance && s.stats.dragged,
            element: element,
            previouslySelected: previouslySelected,
            originTarget: e.target
        };
        element.cgDragging = true;
        element.classList.add('dragging');
        var ghost = s.dom.elements.ghost;
        if (ghost) {
            ghost.className = "ghost " + piece.color + " " + piece.role;
            util.translateAbs(ghost, util.posToTranslateAbs(bounds)(util.key2pos(orig), asWhite));
        }
        processDrag(s);
    }
    else {
        if (hadPremove)
            board.unsetPremove(s);
        if (hadPredrop)
            board.unsetPredrop(s);
    }
    s.dom.redraw();
}
exports.start = start;
function dragNewPiece(s, piece, e, force) {
    var key = 'a0';
    s.pieces[key] = piece;
    s.dom.redraw();
    var position = util.eventPosition(e), asWhite = s.orientation === 'white', bounds = s.dom.bounds(), squareBounds = computeSquareBounds(key, asWhite, bounds);
    var rel = [
        (asWhite ? 0 : 7) * squareBounds.width + bounds.left,
        (asWhite ? 8 : -1) * squareBounds.height + bounds.top
    ];
    s.draggable.current = {
        orig: key,
        origPos: util.key2pos(key),
        piece: piece,
        rel: rel,
        epos: position,
        pos: [position[0] - rel[0], position[1] - rel[1]],
        dec: [-squareBounds.width / 2, -squareBounds.height / 2],
        started: true,
        element: function () { return pieceElementByKey(s, key); },
        originTarget: e.target,
        newPiece: true,
        force: force || false
    };
    processDrag(s);
}
exports.dragNewPiece = dragNewPiece;
function processDrag(s) {
    util.raf(function () {
        var cur = s.draggable.current;
        if (!cur)
            return;
        if (s.animation.current && s.animation.current.plan.anims[cur.orig])
            s.animation.current = undefined;
        var origPiece = s.pieces[cur.orig];
        if (!origPiece || !util.samePiece(origPiece, cur.piece))
            cancel(s);
        else {
            if (!cur.started && util.distanceSq(cur.epos, cur.rel) >= Math.pow(s.draggable.distance, 2))
                cur.started = true;
            if (cur.started) {
                if (typeof cur.element === 'function') {
                    var found = cur.element();
                    if (!found)
                        return;
                    cur.element = found;
                    cur.element.cgDragging = true;
                    cur.element.classList.add('dragging');
                }
                var asWhite = s.orientation === 'white', bounds = s.dom.bounds();
                cur.pos = [
                    cur.epos[0] - cur.rel[0],
                    cur.epos[1] - cur.rel[1]
                ];
                cur.over = board.getKeyAtDomPos(cur.epos, asWhite, bounds);
                var translation = util.posToTranslateAbs(bounds)(cur.origPos, asWhite);
                translation[0] += cur.pos[0] + cur.dec[0];
                translation[1] += cur.pos[1] + cur.dec[1];
                util.translateAbs(cur.element, translation);
                var overEl = s.dom.elements.over;
                if (overEl && cur.over && cur.over !== cur.overPrev) {
                    var dests = s.movable.dests;
                    if (s.movable.free ||
                        util.containsX(dests && dests[cur.orig], cur.over) ||
                        util.containsX(s.premovable.dests, cur.over)) {
                        var pos = util.key2pos(cur.over), vector = [
                            (asWhite ? pos[0] - 1 : 8 - pos[0]) * bounds.width / 8,
                            (asWhite ? 8 - pos[1] : pos[1] - 1) * bounds.height / 8
                        ];
                        util.translateAbs(overEl, vector);
                    }
                    else {
                        util.translateAway(overEl);
                    }
                    cur.overPrev = cur.over;
                }
            }
        }
        processDrag(s);
    });
}
function move(s, e) {
    if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
        s.draggable.current.epos = util.eventPosition(e);
    }
}
exports.move = move;
function end(s, e) {
    var cur = s.draggable.current;
    if (!cur)
        return;
    if (e.type === 'touchend' && cur && cur.originTarget !== e.target && !cur.newPiece) {
        s.draggable.current = undefined;
        return;
    }
    board.unsetPremove(s);
    board.unsetPredrop(s);
    var eventPos = util.eventPosition(e) || cur.epos;
    var dest = board.getKeyAtDomPos(eventPos, s.orientation === 'white', s.dom.bounds());
    if (dest && cur.started) {
        if (cur.newPiece)
            board.dropNewPiece(s, cur.orig, dest, cur.force);
        else {
            s.stats.ctrlKey = e.ctrlKey;
            if (board.userMove(s, cur.orig, dest))
                s.stats.dragged = true;
        }
    }
    else if (cur.newPiece) {
        delete s.pieces[cur.orig];
    }
    else if (s.draggable.deleteOnDropOff) {
        delete s.pieces[cur.orig];
        board.callUserFunction(s.events.change);
    }
    if (cur && cur.orig === cur.previouslySelected && (cur.orig === dest || !dest))
        board.unselect(s);
    else if (!s.selectable.enabled)
        board.unselect(s);
    removeDragElements(s);
    s.draggable.current = undefined;
    s.dom.redraw();
}
exports.end = end;
function cancel(s) {
    var cur = s.draggable.current;
    if (cur) {
        if (cur.newPiece)
            delete s.pieces[cur.orig];
        s.draggable.current = undefined;
        board.unselect(s);
        removeDragElements(s);
        s.dom.redraw();
    }
}
exports.cancel = cancel;
function removeDragElements(s) {
    var e = s.dom.elements;
    if (e.over)
        util.translateAway(e.over);
    if (e.ghost)
        util.translateAway(e.ghost);
}
function computeSquareBounds(key, asWhite, bounds) {
    var pos = util.key2pos(key);
    if (!asWhite) {
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
function pieceElementByKey(s, key) {
    var el = s.dom.elements.board.firstChild;
    while (el) {
        if (el.cgKey === key && el.tagName === 'PIECE')
            return el;
        el = el.nextSibling;
    }
    return undefined;
}

},{"./anim":1,"./board":3,"./draw":7,"./util":17}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board_1 = require("./board");
var util_1 = require("./util");
var brushes = ['green', 'red', 'blue', 'yellow'];
function start(state, e) {
    if (e.touches && e.touches.length > 1)
        return;
    e.stopPropagation();
    e.preventDefault();
    board_1.cancelMove(state);
    var position = util_1.eventPosition(e);
    var orig = board_1.getKeyAtDomPos(position, state.orientation === 'white', state.dom.bounds());
    if (!orig)
        return;
    state.drawable.current = {
        orig: orig,
        dest: orig,
        pos: position,
        brush: eventBrush(e)
    };
    processDraw(state);
}
exports.start = start;
function processDraw(state) {
    util_1.raf(function () {
        var cur = state.drawable.current;
        if (cur) {
            var dest = board_1.getKeyAtDomPos(cur.pos, state.orientation === 'white', state.dom.bounds());
            var newDest = (cur.orig === dest) ? undefined : dest;
            if (newDest !== cur.dest) {
                cur.dest = newDest;
                state.dom.redrawNow();
            }
            processDraw(state);
        }
    });
}
exports.processDraw = processDraw;
function move(state, e) {
    if (state.drawable.current)
        state.drawable.current.pos = util_1.eventPosition(e);
}
exports.move = move;
function end(state) {
    var cur = state.drawable.current;
    if (!cur)
        return;
    if (cur.dest && cur.dest !== cur.orig)
        addLine(state.drawable, cur, cur.dest);
    else
        addCircle(state.drawable, cur);
    cancel(state);
}
exports.end = end;
function cancel(state) {
    if (state.drawable.current) {
        state.drawable.current = undefined;
        state.dom.redraw();
    }
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
function eventBrush(e) {
    var a = e.shiftKey && util_1.isRightButton(e) ? 1 : 0;
    var b = e.altKey ? 2 : 0;
    return brushes[a + b];
}
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
        return !!s.dest && s.orig === orig && s.dest === dest;
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

},{"./board":3,"./util":17}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var drag = require("./drag");
var draw = require("./draw");
var util_1 = require("./util");
function bindBoard(s) {
    if (s.viewOnly)
        return;
    var boardEl = s.dom.elements.board, onStart = startDragOrDraw(s);
    boardEl.addEventListener('touchstart', onStart);
    boardEl.addEventListener('mousedown', onStart);
    if (s.disableContextMenu || s.drawable.enabled) {
        boardEl.addEventListener('contextmenu', function (e) { return e.preventDefault(); });
    }
}
exports.bindBoard = bindBoard;
function bindDocument(s, redrawAll) {
    if (s.viewOnly)
        return function () { };
    var onmove = dragOrDraw(s, drag.move, draw.move);
    var onend = dragOrDraw(s, drag.end, draw.end);
    var unbinds = [];
    ['touchmove', 'mousemove'].forEach(function (ev) { return unbinds.push(unbindable(document, ev, onmove)); });
    ['touchend', 'mouseup'].forEach(function (ev) { return unbinds.push(unbindable(document, ev, onend)); });
    var onResize = function () {
        s.dom.bounds.clear();
        util_1.raf(redrawAll);
    };
    if (s.resizable)
        unbinds.push(unbindable(document.body, 'chessground.resize', onResize));
    var onScroll = function () { return s.dom.bounds.clear(); };
    unbinds.push(unbindable(window, 'scroll', onScroll, { passive: true }));
    unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
    return function () { return unbinds.forEach(function (f) { return f(); }); };
}
exports.bindDocument = bindDocument;
function unbindable(el, eventName, callback, options) {
    el.addEventListener(eventName, callback, options);
    return function () { return el.removeEventListener(eventName, callback); };
}
function startDragOrDraw(s) {
    return function (e) {
        if (s.draggable.current)
            drag.cancel(s);
        else if (s.drawable.current)
            draw.cancel(s);
        else if (e.shiftKey || util_1.isRightButton(e)) {
            if (s.drawable.enabled)
                draw.start(s, e);
        }
        else if (!s.viewOnly)
            drag.start(s, e);
    };
}
function dragOrDraw(s, withDrag, withDraw) {
    return function (e) {
        if (e.shiftKey || util_1.isRightButton(e)) {
            if (s.drawable.enabled)
                withDraw(s, e);
        }
        else if (!s.viewOnly)
            withDrag(s, e);
    };
}

},{"./drag":6,"./draw":7,"./util":17}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function explosion(state, keys) {
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
exports.default = explosion;
function setStage(state, stage) {
    if (state.exploding) {
        if (stage)
            state.exploding.stage = stage;
        else
            state.exploding = undefined;
        state.dom.redraw();
    }
}

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var cg = require("./types");
exports.initial = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
var roles = { p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king' };
var letters = { pawn: 'p', rook: 'r', knight: 'n', bishop: 'b', queen: 'q', king: 'k' };
function read(fen) {
    if (fen === 'start')
        fen = exports.initial;
    var pieces = {};
    var row = 8;
    var col = 0;
    for (var _i = 0, fen_1 = fen; _i < fen_1.length; _i++) {
        var c = fen_1[_i];
        switch (c) {
            case ' ': return pieces;
            case '/':
                --row;
                if (row === 0)
                    return pieces;
                col = 0;
                break;
            case '~':
                pieces[util_1.pos2key([col, row])].promoted = true;
                break;
            default:
                var nb = c.charCodeAt(0);
                if (nb < 57)
                    col += nb - 48;
                else {
                    ++col;
                    var role = c.toLowerCase();
                    pieces[util_1.pos2key([col, row])] = {
                        role: roles[role],
                        color: (c === role ? 'black' : 'white')
                    };
                }
        }
    }
    return pieces;
}
exports.read = read;
function write(pieces) {
    var piece, letter;
    return util_1.invRanks.map(function (y) { return cg.ranks.map(function (x) {
        piece = pieces[util_1.pos2key([x, y])];
        if (piece) {
            letter = letters[piece.role];
            return piece.color === 'white' ? letter.toUpperCase() : letter;
        }
        else
            return '1';
    }).join(''); }).join('/').replace(/1{2,}/g, function (s) { return s.length.toString(); });
}
exports.write = write;

},{"./types":16,"./util":17}],11:[function(require,module,exports){
module.exports = require("./chessground").Chessground;

},{"./chessground":4}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
function diff(a, b) {
    return Math.abs(a - b);
}
function pawn(color) {
    return function (x1, y1, x2, y2) { return diff(x1, x2) < 2 && (color === 'white' ? (y2 === y1 + 1 || (y1 <= 2 && y2 === (y1 + 2) && x1 === x2)) : (y2 === y1 - 1 || (y1 >= 7 && y2 === (y1 - 2) && x1 === x2))); };
}
var knight = function (x1, y1, x2, y2) {
    var xd = diff(x1, x2);
    var yd = diff(y1, y2);
    return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
};
var bishop = function (x1, y1, x2, y2) {
    return diff(x1, x2) === diff(y1, y2);
};
var rook = function (x1, y1, x2, y2) {
    return x1 === x2 || y1 === y2;
};
var queen = function (x1, y1, x2, y2) {
    return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
};
function king(color, rookFiles, canCastle) {
    return function (x1, y1, x2, y2) { return (diff(x1, x2) < 2 && diff(y1, y2) < 2) || (canCastle && y1 === y2 && y1 === (color === 'white' ? 1 : 8) && ((x1 === 5 && (x2 === 3 || x2 === 7)) || util.containsX(rookFiles, x2))); };
}
function rookFilesOf(pieces, color) {
    var piece;
    return Object.keys(pieces).filter(function (key) {
        piece = pieces[key];
        return piece && piece.color === color && piece.role === 'rook';
    }).map(function (key) { return util.key2pos(key)[0]; });
}
function premove(pieces, key, canCastle) {
    var piece = pieces[key], pos = util.key2pos(key);
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
    return util.allKeys.map(util.key2pos).filter(function (pos2) {
        return (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]);
    }).map(util.pos2key);
}
exports.default = premove;
;

},{"./util":17}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var util = require("./util");
function render(s) {
    var asWhite = s.orientation === 'white', posToTranslate = s.viewOnly ? util.posToTranslateRel : util.posToTranslateAbs(s.dom.bounds()), translate = s.viewOnly ? util.translateRel : util.translateAbs, boardEl = s.dom.elements.board, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : {}, fadings = curAnim ? curAnim.plan.fadings : {}, curDrag = s.draggable.current, squares = computeSquareClasses(s), samePieces = {}, sameSquares = {}, movedPieces = {}, movedSquares = {}, piecesKeys = Object.keys(pieces);
    var k, p, el, pieceAtKey, elPieceName, anim, fading, pMvdset, pMvd, sMvdset, sMvd;
    el = boardEl.firstChild;
    while (el) {
        k = el.cgKey;
        if (isPieceNode(el)) {
            pieceAtKey = pieces[k];
            anim = anims[k];
            fading = fadings[k];
            elPieceName = el.cgPiece;
            if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
                el.classList.remove('dragging');
                translate(el, posToTranslate(util_1.key2pos(k), asWhite));
                el.cgDragging = false;
            }
            if (!fading && el.cgFading) {
                el.cgFading = false;
                el.classList.remove('fading');
            }
            if (pieceAtKey) {
                if (anim && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey)) {
                    var pos = util_1.key2pos(k);
                    pos[0] += anim[1][0];
                    pos[1] += anim[1][1];
                    el.classList.add('anim');
                    translate(el, posToTranslate(pos, asWhite));
                }
                else if (el.cgAnimating) {
                    el.cgAnimating = false;
                    el.classList.remove('anim');
                    translate(el, posToTranslate(util_1.key2pos(k), asWhite));
                    if (s.addPieceZIndex)
                        el.style.zIndex = posZIndex(util_1.key2pos(k), asWhite);
                }
                if (elPieceName === pieceNameOf(pieceAtKey) && (!fading || !el.cgFading)) {
                    samePieces[k] = true;
                }
                else {
                    if (fading && elPieceName === pieceNameOf(fading)) {
                        el.classList.add('fading');
                        el.cgFading = true;
                    }
                    else {
                        if (movedPieces[elPieceName])
                            movedPieces[elPieceName].push(el);
                        else
                            movedPieces[elPieceName] = [el];
                    }
                }
            }
            else {
                if (movedPieces[elPieceName])
                    movedPieces[elPieceName].push(el);
                else
                    movedPieces[elPieceName] = [el];
            }
        }
        else if (isSquareNode(el)) {
            var cn = el.className;
            if (squares[k] === cn)
                sameSquares[k] = true;
            else if (movedSquares[cn])
                movedSquares[cn].push(el);
            else
                movedSquares[cn] = [el];
        }
        el = el.nextSibling;
    }
    for (var sk in squares) {
        if (!sameSquares[sk]) {
            sMvdset = movedSquares[squares[sk]];
            sMvd = sMvdset && sMvdset.pop();
            var translation = posToTranslate(util_1.key2pos(sk), asWhite);
            if (sMvd) {
                sMvd.cgKey = sk;
                translate(sMvd, translation);
            }
            else {
                var squareNode = util_1.createEl('square', squares[sk]);
                squareNode.cgKey = sk;
                translate(squareNode, translation);
                boardEl.insertBefore(squareNode, boardEl.firstChild);
            }
        }
    }
    for (var j in piecesKeys) {
        k = piecesKeys[j];
        p = pieces[k];
        anim = anims[k];
        if (!samePieces[k]) {
            pMvdset = movedPieces[pieceNameOf(p)];
            pMvd = pMvdset && pMvdset.pop();
            if (pMvd) {
                pMvd.cgKey = k;
                if (pMvd.cgFading) {
                    pMvd.classList.remove('fading');
                    pMvd.cgFading = false;
                }
                var pos = util_1.key2pos(k);
                if (s.addPieceZIndex)
                    pMvd.style.zIndex = posZIndex(pos, asWhite);
                if (anim) {
                    pMvd.cgAnimating = true;
                    pMvd.classList.add('anim');
                    pos[0] += anim[1][0];
                    pos[1] += anim[1][1];
                }
                translate(pMvd, posToTranslate(pos, asWhite));
            }
            else {
                var pieceName = pieceNameOf(p), pieceNode = util_1.createEl('piece', pieceName), pos = util_1.key2pos(k);
                pieceNode.cgPiece = pieceName;
                pieceNode.cgKey = k;
                if (anim) {
                    pieceNode.cgAnimating = true;
                    pos[0] += anim[1][0];
                    pos[1] += anim[1][1];
                }
                translate(pieceNode, posToTranslate(pos, asWhite));
                if (s.addPieceZIndex)
                    pieceNode.style.zIndex = posZIndex(pos, asWhite);
                boardEl.appendChild(pieceNode);
            }
        }
    }
    for (var i in movedPieces)
        removeNodes(s, movedPieces[i]);
    for (var i in movedSquares)
        removeNodes(s, movedSquares[i]);
}
exports.default = render;
function isPieceNode(el) {
    return el.tagName === 'PIECE';
}
function isSquareNode(el) {
    return el.tagName === 'SQUARE';
}
function removeNodes(s, nodes) {
    for (var i in nodes)
        s.dom.elements.board.removeChild(nodes[i]);
}
function posZIndex(pos, asWhite) {
    var z = 2 + (pos[1] - 1) * 8 + (8 - pos[0]);
    if (asWhite)
        z = 67 - z;
    return z + '';
}
function pieceNameOf(piece) {
    return piece.color + " " + piece.role;
}
function computeSquareClasses(s) {
    var squares = {};
    var i, k;
    if (s.lastMove && s.highlight.lastMove)
        for (i in s.lastMove) {
            addSquare(squares, s.lastMove[i], 'last-move');
        }
    if (s.check && s.highlight.check)
        addSquare(squares, s.check, 'check');
    if (s.selected) {
        addSquare(squares, s.selected, 'selected');
        if (s.movable.showDests) {
            var dests = s.movable.dests && s.movable.dests[s.selected];
            if (dests)
                for (i in dests) {
                    k = dests[i];
                    addSquare(squares, k, 'move-dest' + (s.pieces[k] ? ' oc' : ''));
                }
            var pDests = s.premovable.dests;
            if (pDests)
                for (i in pDests) {
                    k = pDests[i];
                    addSquare(squares, k, 'premove-dest' + (s.pieces[k] ? ' oc' : ''));
                }
        }
    }
    var premove = s.premovable.current;
    if (premove)
        for (i in premove)
            addSquare(squares, premove[i], 'current-premove');
    else if (s.predroppable.current)
        addSquare(squares, s.predroppable.current.key, 'current-premove');
    var o = s.exploding;
    if (o)
        for (i in o.keys)
            addSquare(squares, o.keys[i], 'exploding' + o.stage);
    return squares;
}
function addSquare(squares, key, klass) {
    if (squares[key])
        squares[key] += ' ' + klass;
    else
        squares[key] = klass;
}

},{"./util":17}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fen = require("./fen");
var util_1 = require("./util");
function defaults() {
    return {
        pieces: fen.read(fen.initial),
        orientation: 'white',
        turnColor: 'white',
        coordinates: true,
        autoCastle: true,
        viewOnly: false,
        disableContextMenu: false,
        resizable: true,
        addPieceZIndex: false,
        pieceKey: false,
        highlight: {
            lastMove: true,
            check: true
        },
        animation: {
            enabled: true,
            duration: 200
        },
        movable: {
            free: true,
            color: 'both',
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
            showGhost: true,
            deleteOnDropOff: false
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
            visible: true,
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
        hold: util_1.timer()
    };
}
exports.defaults = defaults;

},{"./fen":10,"./util":17}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
function createElement(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}
exports.createElement = createElement;
var isTrident;
var fullHashPrev = '';
function clearCache() {
    fullHashPrev = '';
}
exports.clearCache = clearCache;
function renderSvg(state, root) {
    var d = state.drawable, cur = d.current, arrowDests = {};
    d.shapes.concat(d.autoShapes).concat(cur ? [cur] : []).forEach(function (s) {
        if (s.dest)
            arrowDests[s.dest] = (arrowDests[s.dest] || 0) + 1;
    });
    var shapes = d.shapes.concat(d.autoShapes).map(function (s) {
        return {
            shape: s,
            current: false,
            hash: shapeHash(s, arrowDests, false)
        };
    });
    if (cur)
        shapes.push({
            shape: cur,
            current: true,
            hash: shapeHash(cur, arrowDests, true)
        });
    var fullHash = shapes.map(function (sc) { return sc.hash; }).join('');
    if (fullHash === fullHashPrev)
        return;
    fullHashPrev = fullHash;
    var defsEl = root.firstChild;
    syncDefs(d, shapes, defsEl);
    syncShapes(state, shapes, d.brushes, arrowDests, root, defsEl);
}
exports.renderSvg = renderSvg;
function syncDefs(d, shapes, defsEl) {
    var brushes = {};
    var brush;
    shapes.forEach(function (s) {
        if (s.shape.dest) {
            brush = d.brushes[s.shape.brush];
            if (s.shape.modifiers)
                brush = makeCustomBrush(brush, s.shape.modifiers);
            brushes[brush.key] = brush;
        }
    });
    var keysInDom = {};
    var el = defsEl.firstChild;
    while (el) {
        keysInDom[el.getAttribute('cgKey')] = true;
        el = el.nextSibling;
    }
    for (var key in brushes) {
        if (!keysInDom[key])
            defsEl.appendChild(renderMarker(brushes[key]));
    }
}
function syncShapes(state, shapes, brushes, arrowDests, root, defsEl) {
    if (isTrident === undefined)
        isTrident = util_1.computeIsTrident();
    var bounds = state.dom.bounds(), hashesInDom = {}, toRemove = [];
    shapes.forEach(function (sc) { hashesInDom[sc.hash] = false; });
    var el = defsEl.nextSibling, elHash;
    while (el) {
        elHash = el.getAttribute('cgHash');
        if (hashesInDom.hasOwnProperty(elHash))
            hashesInDom[elHash] = true;
        else
            toRemove.push(el);
        el = el.nextSibling;
    }
    toRemove.forEach(function (el) { return root.removeChild(el); });
    shapes.forEach(function (sc) {
        if (!hashesInDom[sc.hash])
            root.appendChild(renderShape(state, sc, brushes, arrowDests, bounds));
    });
}
function shapeHash(_a, arrowDests, current) {
    var orig = _a.orig, dest = _a.dest, brush = _a.brush, piece = _a.piece, modifiers = _a.modifiers;
    return [current, orig, dest, brush, dest && arrowDests[dest],
        piece && pieceHash(piece),
        modifiers && modifiersHash(modifiers)
    ].filter(function (x) { return x; }).join('');
}
function pieceHash(piece) {
    return [piece.color, piece.role, piece.scale].filter(function (x) { return x; }).join('');
}
function modifiersHash(m) {
    return '' + (m.lineWidth || '');
}
function renderShape(state, _a, brushes, arrowDests, bounds) {
    var shape = _a.shape, current = _a.current, hash = _a.hash;
    var el;
    if (shape.piece)
        el = renderPiece(state.drawable.pieces.baseUrl, orient(util_1.key2pos(shape.orig), state.orientation), shape.piece, bounds);
    else {
        var orig = orient(util_1.key2pos(shape.orig), state.orientation);
        if (shape.orig && shape.dest) {
            var brush = brushes[shape.brush];
            if (shape.modifiers)
                brush = makeCustomBrush(brush, shape.modifiers);
            el = renderArrow(brush, orig, orient(util_1.key2pos(shape.dest), state.orientation), current, arrowDests[shape.dest] > 1, bounds);
        }
        else
            el = renderCircle(brushes[shape.brush], orig, current, bounds);
    }
    el.setAttribute('cgHash', hash);
    return el;
}
function renderCircle(brush, pos, current, bounds) {
    var o = pos2px(pos, bounds), width = circleWidth(current, bounds), radius = (bounds.width + bounds.height) / 32;
    return setAttributes(createElement('circle'), {
        stroke: brush.color,
        'stroke-width': width,
        fill: 'none',
        opacity: opacity(brush, current),
        cx: o[0],
        cy: o[1],
        r: radius - width / 2
    });
}
function renderArrow(brush, orig, dest, current, shorten, bounds) {
    var m = arrowMargin(bounds, shorten && !current), a = pos2px(orig, bounds), b = pos2px(dest, bounds), dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
    return setAttributes(createElement('line'), {
        stroke: brush.color,
        'stroke-width': lineWidth(brush, current, bounds),
        'stroke-linecap': 'round',
        'marker-end': isTrident ? undefined : 'url(#arrowhead-' + brush.key + ')',
        opacity: opacity(brush, current),
        x1: a[0],
        y1: a[1],
        x2: b[0] - xo,
        y2: b[1] - yo
    });
}
function renderPiece(baseUrl, pos, piece, bounds) {
    var o = pos2px(pos, bounds), size = bounds.width / 8 * (piece.scale || 1), name = piece.color[0] + (piece.role === 'knight' ? 'n' : piece.role[0]).toUpperCase();
    return setAttributes(createElement('image'), {
        className: piece.role + " " + piece.color,
        x: o[0] - size / 2,
        y: o[1] - size / 2,
        width: size,
        height: size,
        href: baseUrl + name + '.svg'
    });
}
function renderMarker(brush) {
    var marker = setAttributes(createElement('marker'), {
        id: 'arrowhead-' + brush.key,
        orient: 'auto',
        markerWidth: 4,
        markerHeight: 8,
        refX: 2.05,
        refY: 2.01
    });
    marker.appendChild(setAttributes(createElement('path'), {
        d: 'M0,0 V4 L3,2 Z',
        fill: brush.color
    }));
    marker.setAttribute('cgKey', brush.key);
    return marker;
}
function setAttributes(el, attrs) {
    for (var key in attrs)
        el.setAttribute(key, attrs[key]);
    return el;
}
function orient(pos, color) {
    return color === 'white' ? pos : [9 - pos[0], 9 - pos[1]];
}
function makeCustomBrush(base, modifiers) {
    var brush = {
        color: base.color,
        opacity: Math.round(base.opacity * 10) / 10,
        lineWidth: Math.round(modifiers.lineWidth || base.lineWidth)
    };
    brush.key = [base.key, modifiers.lineWidth].filter(function (x) { return x; }).join('');
    return brush;
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
function arrowMargin(bounds, shorten) {
    return isTrident ? 0 : ((shorten ? 20 : 10) / 512 * bounds.width);
}
function pos2px(pos, bounds) {
    return [(pos[0] - 0.5) * bounds.width / 8, (8.5 - pos[1]) * bounds.height / 8];
}

},{"./util":17}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
exports.ranks = [1, 2, 3, 4, 5, 6, 7, 8];

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cg = require("./types");
exports.colors = ['white', 'black'];
exports.invRanks = [8, 7, 6, 5, 4, 3, 2, 1];
exports.allKeys = (_a = Array.prototype).concat.apply(_a, cg.files.map(function (c) { return cg.ranks.map(function (r) { return c + r; }); }));
exports.pos2key = function (pos) { return exports.allKeys[8 * pos[0] + pos[1] - 9]; };
exports.key2pos = function (k) { return [k.charCodeAt(0) - 96, k.charCodeAt(1) - 48]; };
function memo(f) {
    var v;
    var ret = function () {
        if (v === undefined)
            v = f();
        return v;
    };
    ret.clear = function () { v = undefined; };
    return ret;
}
exports.memo = memo;
exports.timer = function () {
    var startAt;
    return {
        start: function () { startAt = Date.now(); },
        cancel: function () { startAt = undefined; },
        stop: function () {
            if (!startAt)
                return 0;
            var time = Date.now() - startAt;
            startAt = undefined;
            return time;
        }
    };
};
exports.opposite = function (c) { return c === 'white' ? 'black' : 'white'; };
function containsX(xs, x) {
    return xs ? xs.indexOf(x) !== -1 : false;
}
exports.containsX = containsX;
exports.distanceSq = function (pos1, pos2) {
    return Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2);
};
exports.samePiece = function (p1, p2) {
    return p1.role === p2.role && p1.color === p2.color;
};
exports.computeIsTrident = function () { return window.navigator.userAgent.indexOf('Trident/') > -1; };
var posToTranslateBase = function (pos, asWhite, xFactor, yFactor) { return [
    (asWhite ? pos[0] - 1 : 8 - pos[0]) * xFactor,
    (asWhite ? 8 - pos[1] : pos[1] - 1) * yFactor
]; };
exports.posToTranslateAbs = function (bounds) {
    var xFactor = bounds.width / 8, yFactor = bounds.height / 8;
    return function (pos, asWhite) { return posToTranslateBase(pos, asWhite, xFactor, yFactor); };
};
exports.posToTranslateRel = function (pos, asWhite) { return posToTranslateBase(pos, asWhite, 12.5, 12.5); };
exports.translateAbs = function (el, pos) {
    el.style.transform = "translate(" + pos[0] + "px," + pos[1] + "px)";
};
exports.translateRel = function (el, percents) {
    el.style.left = percents[0] + '%';
    el.style.top = percents[1] + '%';
};
exports.translateAway = function (el) { return exports.translateAbs(el, [-99999, -99999]); };
exports.eventPosition = function (e) {
    if (e.clientX || e.clientX === 0)
        return [e.clientX, e.clientY];
    if (e.touches && e.targetTouches[0])
        return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
    return undefined;
};
exports.isRightButton = function (e) { return e.buttons === 2 || e.button === 2; };
exports.createEl = function (tagName, className) {
    var el = document.createElement(tagName);
    if (className)
        el.className = className;
    return el;
};
exports.raf = (window.requestAnimationFrame || window.setTimeout).bind(window);
var _a;

},{"./types":16}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var types_1 = require("./types");
var svg_1 = require("./svg");
function wrap(element, s, bounds) {
    element.innerHTML = '';
    element.classList.add('cg-board-wrap');
    util_1.colors.forEach(function (c) {
        element.classList.toggle('orientation-' + c, s.orientation === c);
    });
    element.classList.toggle('manipulable', !s.viewOnly);
    var board = util_1.createEl('div', 'cg-board');
    element.appendChild(board);
    var svg;
    if (s.drawable.visible && bounds) {
        svg = svg_1.createElement('svg');
        svg.appendChild(svg_1.createElement('defs'));
        element.appendChild(svg);
    }
    if (s.coordinates) {
        var orientClass = s.orientation === 'black' ? ' black' : '';
        element.appendChild(renderCoords(types_1.ranks, 'ranks' + orientClass));
        element.appendChild(renderCoords(types_1.files, 'files' + orientClass));
    }
    var over;
    if (bounds && (s.movable.showDests || s.premovable.showDests)) {
        over = util_1.createEl('div', 'over');
        util_1.translateAway(over);
        over.style.width = (bounds.width / 8) + 'px';
        over.style.height = (bounds.height / 8) + 'px';
        element.appendChild(over);
    }
    var ghost;
    if (bounds && s.draggable.showGhost) {
        ghost = util_1.createEl('piece', 'ghost');
        util_1.translateAway(ghost);
        element.appendChild(ghost);
    }
    return {
        board: board,
        over: over,
        ghost: ghost,
        svg: svg
    };
}
exports.default = wrap;
function renderCoords(elems, className) {
    var el = util_1.createEl('coords', className);
    var f;
    for (var i in elems) {
        f = util_1.createEl('coord');
        f.textContent = elems[i];
        el.appendChild(f);
    }
    return el;
}

},{"./svg":15,"./types":16,"./util":17}]},{},[11])(11)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYW5pbS50cyIsInNyYy9hcGkudHMiLCJzcmMvYm9hcmQudHMiLCJzcmMvY2hlc3Nncm91bmQudHMiLCJzcmMvY29uZmlnLnRzIiwic3JjL2RyYWcudHMiLCJzcmMvZHJhdy50cyIsInNyYy9ldmVudHMudHMiLCJzcmMvZXhwbG9zaW9uLnRzIiwic3JjL2Zlbi50cyIsInNyYy9pbmRleC5qcyIsInNyYy9wcmVtb3ZlLnRzIiwic3JjL3JlbmRlci50cyIsInNyYy9zdGF0ZS50cyIsInNyYy9zdmcudHMiLCJzcmMvdHlwZXMudHMiLCJzcmMvdXRpbC50cyIsInNyYy93cmFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0NBLDZCQUE4QjtBQTZCOUIsY0FBd0IsUUFBcUIsRUFBRSxLQUFZO0lBQ3pELE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdEYsQ0FBQztBQUZELG9CQUVDO0FBRUQsZ0JBQTBCLFFBQXFCLEVBQUUsS0FBWTtJQUMzRCxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNuQixNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFKRCx3QkFJQztBQVdELG1CQUFtQixHQUFXLEVBQUUsS0FBZTtJQUM3QyxNQUFNLENBQUM7UUFDTCxHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUN0QixLQUFLLEVBQUUsS0FBSztLQUNiLENBQUM7QUFDSixDQUFDO0FBRUQsZ0JBQWdCLEtBQWdCLEVBQUUsTUFBbUI7SUFD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Q0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7SUFJdEYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFBQyxLQUFLLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFHM0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztRQUFDLG1CQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUd2RCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztJQUVqRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNyRCxJQUFNLE1BQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRCxJQUFNLFlBQVksR0FBRyxHQUFHLEdBQUcsTUFBSSxDQUFDO1FBQ2hDLElBQU0sT0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUNqRSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxPQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQztZQUNoRCxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFH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QyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDN0QsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2YsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzNDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDO2dCQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUMzQixDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNiLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLENBQUM7WUFDRCxJQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUNsQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7Z0JBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFD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SUFFRCxJQUFJLEtBQThCLENBQUM7SUFDbkMsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNwQyxLQUFLLEdBQUcsZUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuQyxvQkFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELE1BQU0sQ0FBQztRQUNMLEtBQUssRUFBRSxLQUFLO1FBQ1osSUFBSSxFQUFFLElBQUk7UUFDVixLQUFLLEVBQUUsS0FBSztRQUNaLEdBQUcsRUFBRSxHQUFHO0tBQ1QsQ0FBQztBQUNKLENBQUM7QUFqREQsdUJBaURDO0FBRUQsc0JBQXNCLEtBQVksRUFBRSxTQUFpQjtJQUNuRCxJQUFNLEVBQUUsR0FBRyxlQUFRLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ3pDLElBQUksQ0FBYyxDQUFDO0lBQ25CLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxHQUFHLGVBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN0QixDQUFDLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6QixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFDRCxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQ1osQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCB0eXBlIE11dGF0aW9uPEE+ID0gKHN0YXRlOiBTdGF0ZSkgPT4gQTtcblxuZXhwb3J0IGludGVyZmFjZSBBbmltVmVjdG9yIHtcbiAgMDogY2cuTnVtYmVyUGFpcjsgLy8gYW5pbWF0aW9uIGdvYWxcbiAgMTogY2cuTnVtYmVyUGFpcjsgLy8gYW5pbWF0aW9uIGN1cnJlbnQgc3RhdHVzXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbVZlY3RvcnMge1xuICBba2V5OiBzdHJpbmddOiBBbmltVmVjdG9yXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbUZhZGluZ3Mge1xuICBba2V5OiBzdHJpbmddOiBjZy5QaWVjZVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1QbGFuIHtcbiAgYW5pbXM6IEFuaW1WZWN0b3JzO1xuICBmYWRpbmdzOiBBbmltRmFkaW5ncztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltQ3VycmVudCB7XG4gIHN0YXJ0OiBjZy5UaW1lc3RhbXA7XG4gIGR1cmF0aW9uOiBjZy5NaWxsaXNlY29uZHM7XG4gIHBsYW46IEFuaW1QbGFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5pbTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICByZXR1cm4gc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPyBhbmltYXRlKG11dGF0aW9uLCBzdGF0ZSkgOiByZW5kZXIobXV0YXRpb24sIHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcjxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEFuaW1QaWVjZSB7XG4gIGtleTogY2cuS2V5O1xuICBwb3M6IGNnLlBvcztcbiAgcGllY2U6IGNnLlBpZWNlO1xufVxuaW50ZXJmYWNlIEFuaW1QaWVjZXMge1xuICBba2V5OiBzdHJpbmddOiBBbmltUGllY2Vcbn1cblxuZnVuY3Rpb24gbWFrZVBpZWNlKGtleTogY2cuS2V5LCBwaWVjZTogY2cuUGllY2UpOiBBbmltUGllY2Uge1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsb3NlcihwaWVjZTogQW5pbVBpZWNlLCBwaWVjZXM6IEFuaW1QaWVjZVtdKTogQW5pbVBpZWNlIHtcbiAgcmV0dXJuIHBpZWNlcy5zb3J0KChwMSwgcDIpID0+IHtcbiAgICByZXR1cm4gdXRpbC5kaXN0YW5jZVNxKHBpZWNlLnBvcywgcDEucG9zKSAtIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAyLnBvcyk7XG4gIH0pWzBdO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlUGxhbihwcmV2UGllY2VzOiBjZy5QaWVjZXMsIGN1cnJlbnQ6IFN0YXRlKTogQW5pbVBsYW4ge1xuICBjb25zdCBhbmltczogQW5pbVZlY3RvcnMgPSB7fSxcbiAgYW5pbWVkT3JpZ3M6IGNnLktleVtdID0gW10sXG4gIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0ge30sXG4gIG1pc3NpbmdzOiBBbmltUGllY2VbXSA9IFtdLFxuICBuZXdzOiBBbmltUGllY2VbXSA9IFtdLFxuICBwcmVQaWVjZXM6IEFuaW1QaWVjZXMgPSB7fTtcbiAgbGV0IGN1clA6IGNnLlBpZWNlLCBwcmVQOiBBbmltUGllY2UsIGk6IGFueSwgdmVjdG9yOiBjZy5OdW1iZXJQYWlyO1xuICBmb3IgKGkgaW4gcHJldlBpZWNlcykge1xuICAgIHByZVBpZWNlc1tpXSA9IG1ha2VQaWVjZShpIGFzIGNnLktleSwgcHJldlBpZWNlc1tpXSk7XG4gIH1cbiAgZm9yIChjb25zdCBrZXkgb2YgdXRpbC5hbGxLZXlzKSB7XG4gICAgY3VyUCA9IGN1cnJlbnQucGllY2VzW2tleV07XG4gICAgcHJlUCA9IHByZVBpZWNlc1trZXldO1xuICAgIGlmIChjdXJQKSB7XG4gICAgICBpZiAocHJlUCkge1xuICAgICAgICBpZiAoIXV0aWwuc2FtZVBpZWNlKGN1clAsIHByZVAucGllY2UpKSB7XG4gICAgICAgICAgbWlzc2luZ3MucHVzaChwcmVQKTtcbiAgICAgICAgICBuZXdzLnB1c2gobWFrZVBpZWNlKGtleSwgY3VyUCkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICB9IGVsc2UgaWYgKHByZVApIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gIH1cbiAgbmV3cy5mb3JFYWNoKG5ld1AgPT4ge1xuICAgIHByZVAgPSBjbG9zZXIobmV3UCwgbWlzc2luZ3MuZmlsdGVyKHAgPT4gdXRpbC5zYW1lUGllY2UobmV3UC5waWVjZSwgcC5waWVjZSkpKTtcbiAgICBpZiAocHJlUCkge1xuICAgICAgdmVjdG9yID0gW3ByZVAucG9zWzBdIC0gbmV3UC5wb3NbMF0sIHByZVAucG9zWzFdIC0gbmV3UC5wb3NbMV1dO1xuICAgICAgYW5pbXNbbmV3UC5rZXldID0gW3ZlY3RvciwgdmVjdG9yXTtcbiAgICAgIGFuaW1lZE9yaWdzLnB1c2gocHJlUC5rZXkpO1xuICAgIH1cbiAgfSk7XG4gIG1pc3NpbmdzLmZvckVhY2gocCA9PiB7XG4gICAgaWYgKFxuICAgICAgIXV0aWwuY29udGFpbnNYKGFuaW1lZE9yaWdzLCBwLmtleSkgJiZcbiAgICAgICEoY3VycmVudC5pdGVtcyA/IGN1cnJlbnQuaXRlbXMocC5wb3MsIHAua2V5KSA6IGZhbHNlKVxuICAgIClcbiAgICBmYWRpbmdzW3Aua2V5XSA9IHAucGllY2U7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgYW5pbXM6IGFuaW1zLFxuICAgIGZhZGluZ3M6IGZhZGluZ3NcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3RlcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQ7XG4gIGlmICghY3VyKSB7IC8vIGFuaW1hdGlvbiB3YXMgY2FuY2VsZWQgOihcbiAgICBpZiAoIXN0YXRlLmRvbS5kZXN0cm95ZWQpIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgcmVzdCA9IDEgLSAoRGF0ZS5ub3coKSAtIGN1ci5zdGFydCkgLyBjdXIuZHVyYXRpb247XG4gIGlmIChyZXN0IDw9IDApIHtcbiAgICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3Tm93KCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZWFzZSA9IGVhc2luZyhyZXN0KTtcbiAgICBmb3IgKGxldCBpIGluIGN1ci5wbGFuLmFuaW1zKSB7XG4gICAgICBjb25zdCBjZmcgPSBjdXIucGxhbi5hbmltc1tpXTtcbiAgICAgIGNmZ1sxXSA9IFtjZmdbMF1bMF0gKiBlYXNlLCBjZmdbMF1bMV0gKiBlYXNlXTtcbiAgICB9XG4gICAgc3RhdGUuZG9tLnJlZHJhd05vdyh0cnVlKTsgLy8gb3B0aW1pc2F0aW9uOiBkb24ndCByZW5kZXIgU1ZHIGNoYW5nZXMgZHVyaW5nIGFuaW1hdGlvbnNcbiAgICB1dGlsLnJhZigoKSA9PiBzdGVwKHN0YXRlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldlBpZWNlczogY2cuUGllY2VzID0gey4uLnN0YXRlLnBpZWNlc307XG5cbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBjb25zdCBwbGFuID0gY29tcHV0ZVBsYW4ocHJldlBpZWNlcywgc3RhdGUpO1xuICBpZiAoIWlzT2JqZWN0RW1wdHkocGxhbi5hbmltcykgfHwgIWlzT2JqZWN0RW1wdHkocGxhbi5mYWRpbmdzKSkge1xuICAgIGNvbnN0IGFscmVhZHlSdW5uaW5nID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgJiYgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQuc3RhcnQ7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB7XG4gICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgIGR1cmF0aW9uOiBzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24sXG4gICAgICBwbGFuOiBwbGFuXG4gICAgfTtcbiAgICBpZiAoIWFscmVhZHlSdW5uaW5nKSBzdGVwKHN0YXRlKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBkb24ndCBhbmltYXRlLCBqdXN0IHJlbmRlciByaWdodCBhd2F5XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0RW1wdHkobzogYW55KTogYm9vbGVhbiB7XG4gIGZvciAobGV0IF8gaW4gbykgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gdHJ1ZTtcbn1cbi8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2dyZS8xNjUwMjk0XG5mdW5jdGlvbiBlYXNpbmcodDogbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIHQgPCAwLjUgPyA0ICogdCAqIHQgKiB0IDogKHQgLSAxKSAqICgyICogdCAtIDIpICogKDIgKiB0IC0gMikgKyAxO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZCdcbmltcG9ydCB7IHdyaXRlIGFzIGZlbldyaXRlIH0gZnJvbSAnLi9mZW4nXG5pbXBvcnQgeyBDb25maWcsIGNvbmZpZ3VyZSB9IGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHsgYW5pbSwgcmVuZGVyIH0gZnJvbSAnLi9hbmltJ1xuaW1wb3J0IHsgY2FuY2VsIGFzIGRyYWdDYW5jZWwsIGRyYWdOZXdQaWVjZSB9IGZyb20gJy4vZHJhZydcbmltcG9ydCB7IERyYXdTaGFwZSB9IGZyb20gJy4vZHJhdydcbmltcG9ydCBleHBsb3Npb24gZnJvbSAnLi9leHBsb3Npb24nXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwaSB7XG5cbiAgLy8gcmVjb25maWd1cmUgdGhlIGluc3RhbmNlLiBBY2NlcHRzIGFsbCBjb25maWcgb3B0aW9ucywgZXhjZXB0IGZvciB2aWV3T25seSAmIG1pbmltYWxEb20uXG4gIC8vIGJvYXJkIHdpbGwgYmUgYW5pbWF0ZWQgYWNjb3JkaW5nbHksIGlmIGFuaW1hdGlvbnMgYXJlIGVuYWJsZWQuXG4gIHNldChjb25maWc6IENvbmZpZyk6IHZvaWQ7XG5cbiAgLy8gcmVhZCBjaGVzc2dyb3VuZCBzdGF0ZTsgd3JpdGUgYXQgeW91ciBvd24gcmlza3MuXG4gIHN0YXRlOiBTdGF0ZTtcblxuICAvLyBnZXQgdGhlIHBvc2l0aW9uIGFzIGEgRkVOIHN0cmluZyAob25seSBjb250YWlucyBwaWVjZXMsIG5vIGZsYWdzKVxuICAvLyBlLmcuIHJuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlJcbiAgZ2V0RmVuKCk6IGNnLkZFTjtcblxuICAvLyBjaGFuZ2UgdGhlIHZpZXcgYW5nbGVcbiAgdG9nZ2xlT3JpZW50YXRpb24oKTogdm9pZDtcblxuICAvLyBwZXJmb3JtIGEgbW92ZSBwcm9ncmFtbWF0aWNhbGx5XG4gIG1vdmUob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiB2b2lkO1xuXG4gIC8vIGFkZCBhbmQvb3IgcmVtb3ZlIGFyYml0cmFyeSBwaWVjZXMgb24gdGhlIGJvYXJkXG4gIHNldFBpZWNlcyhwaWVjZXM6IGNnLlBpZWNlc0RpZmYpOiB2b2lkO1xuXG4gIC8vIGNsaWNrIGEgc3F1YXJlIHByb2dyYW1tYXRpY2FsbHlcbiAgc2VsZWN0U3F1YXJlKGtleTogY2cuS2V5IHwgbnVsbCwgZm9yY2U/OiBib29sZWFuKTogdm9pZDtcblxuICAvLyBwdXQgYSBuZXcgcGllY2Ugb24gdGhlIGJvYXJkXG4gIG5ld1BpZWNlKHBpZWNlOiBjZy5QaWVjZSwga2V5OiBjZy5LZXkpOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlbW92ZSwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVtb3ZlKCk6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueVxuICBjYW5jZWxQcmVtb3ZlKCk6IHZvaWQ7XG5cbiAgLy8gcGxheSB0aGUgY3VycmVudCBwcmVkcm9wLCBpZiBhbnk7IHJldHVybnMgdHJ1ZSBpZiBwcmVtb3ZlIHdhcyBwbGF5ZWRcbiAgcGxheVByZWRyb3AodmFsaWRhdGU6IChkcm9wOiBjZy5Ecm9wKSA9PiBib29sZWFuKTogYm9vbGVhbjtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55XG4gIGNhbmNlbFByZWRyb3AoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgdGhlIGN1cnJlbnQgbW92ZSBiZWluZyBtYWRlXG4gIGNhbmNlbE1vdmUoKTogdm9pZDtcblxuICAvLyBjYW5jZWwgY3VycmVudCBtb3ZlIGFuZCBwcmV2ZW50IGZ1cnRoZXIgb25lc1xuICBzdG9wKCk6IHZvaWQ7XG5cbiAgLy8gbWFrZSBzcXVhcmVzIGV4cGxvZGUgKGF0b21pYyBjaGVzcylcbiAgZXhwbG9kZShrZXlzOiBjZy5LZXlbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IHVzZXIgc2hhcGVzXG4gIHNldFNoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBwcm9ncmFtbWF0aWNhbGx5IGRyYXcgYXV0byBzaGFwZXNcbiAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKTogdm9pZDtcblxuICAvLyBzcXVhcmUgbmFtZSBhdCB0aGlzIERPTSBwb3NpdGlvbiAobGlrZSBcImU0XCIpXG4gIGdldEtleUF0RG9tUG9zKHBvczogY2cuTnVtYmVyUGFpcik6IGNnLktleSB8IHVuZGVmaW5lZDtcblxuICAvLyBvbmx5IHVzZWZ1bCB3aGVuIENTUyBjaGFuZ2VzIHRoZSBib2FyZCB3aWR0aC9oZWlnaHQgcmF0aW8gKGZvciAzRClcbiAgcmVkcmF3QWxsOiBjZy5SZWRyYXc7XG5cbiAgLy8gZm9yIGNyYXp5aG91c2UgYW5kIGJvYXJkIGVkaXRvcnNcbiAgZHJhZ05ld1BpZWNlKHBpZWNlOiBjZy5QaWVjZSwgZXZlbnQ6IGNnLk1vdWNoRXZlbnQsIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gdW5iaW5kcyBhbGwgZXZlbnRzXG4gIC8vIChpbXBvcnRhbnQgZm9yIGRvY3VtZW50LXdpZGUgZXZlbnRzIGxpa2Ugc2Nyb2xsIGFuZCBtb3VzZW1vdmUpXG4gIGRlc3Ryb3k6IGNnLlVuYmluZFxufVxuXG4vLyBzZWUgQVBJIHR5cGVzIGFuZCBkb2N1bWVudGF0aW9ucyBpbiBkdHMvYXBpLmQudHNcbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzdGF0ZTogU3RhdGUsIHJlZHJhd0FsbDogY2cuUmVkcmF3KTogQXBpIHtcblxuICBmdW5jdGlvbiB0b2dnbGVPcmllbnRhdGlvbigpIHtcbiAgICBib2FyZC50b2dnbGVPcmllbnRhdGlvbihzdGF0ZSk7XG4gICAgcmVkcmF3QWxsKCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcblxuICAgIHNldChjb25maWcpIHtcbiAgICAgIGlmIChjb25maWcub3JpZW50YXRpb24gJiYgY29uZmlnLm9yaWVudGF0aW9uICE9PSBzdGF0ZS5vcmllbnRhdGlvbikgdG9nZ2xlT3JpZW50YXRpb24oKTtcbiAgICAgIChjb25maWcuZmVuID8gYW5pbSA6IHJlbmRlcikoc3RhdGUgPT4gY29uZmlndXJlKHN0YXRlLCBjb25maWcpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHN0YXRlLFxuXG4gICAgZ2V0RmVuOiAoKSA9PiBmZW5Xcml0ZShzdGF0ZS5waWVjZXMpLFxuXG4gICAgdG9nZ2xlT3JpZW50YXRpb24sXG5cbiAgICBzZXRQaWVjZXMocGllY2VzKSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLnNldFBpZWNlcyhzdGF0ZSwgcGllY2VzKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZWxlY3RTcXVhcmUoa2V5LCBmb3JjZSkge1xuICAgICAgaWYgKGtleSkgYW5pbShzdGF0ZSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIGtleSwgZm9yY2UpLCBzdGF0ZSk7XG4gICAgICBlbHNlIGlmIChzdGF0ZS5zZWxlY3RlZCkge1xuICAgICAgICBib2FyZC51bnNlbGVjdChzdGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbW92ZShvcmlnLCBkZXN0KSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLmJhc2VNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBuZXdQaWVjZShwaWVjZSwga2V5KSB7XG4gICAgICBhbmltKHN0YXRlID0+IGJvYXJkLmJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGtleSksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgcGxheVByZW1vdmUoKSB7XG4gICAgICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGlmIChhbmltKGJvYXJkLnBsYXlQcmVtb3ZlLCBzdGF0ZSkpIHJldHVybiB0cnVlO1xuICAgICAgICAvLyBpZiB0aGUgcHJlbW92ZSBjb3VsZG4ndCBiZSBwbGF5ZWQsIHJlZHJhdyB0byBjbGVhciBpdCB1cFxuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIHBsYXlQcmVkcm9wKHZhbGlkYXRlKSB7XG4gICAgICBpZiAoc3RhdGUucHJlZHJvcHBhYmxlLmN1cnJlbnQpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYm9hcmQucGxheVByZWRyb3Aoc3RhdGUsIHZhbGlkYXRlKTtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVtb3ZlKCkge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlbW92ZSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxQcmVkcm9wKCkge1xuICAgICAgcmVuZGVyKGJvYXJkLnVuc2V0UHJlZHJvcCwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBjYW5jZWxNb3ZlKCkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHsgYm9hcmQuY2FuY2VsTW92ZShzdGF0ZSk7IGRyYWdDYW5jZWwoc3RhdGUpOyB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHN0b3AoKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4geyBib2FyZC5zdG9wKHN0YXRlKTsgZHJhZ0NhbmNlbChzdGF0ZSk7IH0sIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZXhwbG9kZShrZXlzOiBjZy5LZXlbXSkge1xuICAgICAgZXhwbG9zaW9uKHN0YXRlLCBrZXlzKTtcbiAgICB9LFxuXG4gICAgc2V0QXV0b1NoYXBlcyhzaGFwZXM6IERyYXdTaGFwZVtdKSB7XG4gICAgICByZW5kZXIoc3RhdGUgPT4gc3RhdGUuZHJhd2FibGUuYXV0b1NoYXBlcyA9IHNoYXBlcywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IHNoYXBlcywgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBnZXRLZXlBdERvbVBvcyhwb3MpIHtcbiAgICAgIHJldHVybiBib2FyZC5nZXRLZXlBdERvbVBvcyhwb3MsIHN0YXRlLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgIH0sXG5cbiAgICByZWRyYXdBbGwsXG5cbiAgICBkcmFnTmV3UGllY2UocGllY2UsIGV2ZW50LCBmb3JjZSkge1xuICAgICAgZHJhZ05ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZXZlbnQsIGZvcmNlKVxuICAgIH0sXG5cbiAgICBkZXN0cm95KCkge1xuICAgICAgYm9hcmQuc3RvcChzdGF0ZSk7XG4gICAgICBzdGF0ZS5kb20udW5iaW5kICYmIHN0YXRlLmRvbS51bmJpbmQoKTtcbiAgICAgIHN0YXRlLmRvbS5kZXN0cm95ZWQgPSB0cnVlO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHBvczJrZXksIGtleTJwb3MsIG9wcG9zaXRlLCBjb250YWluc1ggfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgcHJlbW92ZSBmcm9tICcuL3ByZW1vdmUnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgdHlwZSBDYWxsYmFjayA9ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGxVc2VyRnVuY3Rpb24oZjogQ2FsbGJhY2sgfCB1bmRlZmluZWQsIC4uLmFyZ3M6IGFueVtdKTogdm9pZCB7XG4gIGlmIChmKSBzZXRUaW1lb3V0KCgpID0+IGYoLi4uYXJncyksIDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLm9yaWVudGF0aW9uID0gb3Bwb3NpdGUoc3RhdGUub3JpZW50YXRpb24pO1xuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9XG4gIHN0YXRlLmRyYWdnYWJsZS5jdXJyZW50ID1cbiAgc3RhdGUuc2VsZWN0ZWQgPSB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubGFzdE1vdmUgPSB1bmRlZmluZWQ7XG4gIHVuc2VsZWN0KHN0YXRlKTtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBpZWNlcyhzdGF0ZTogU3RhdGUsIHBpZWNlczogY2cuUGllY2VzRGlmZik6IHZvaWQge1xuICBmb3IgKGxldCBrZXkgaW4gcGllY2VzKSB7XG4gICAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XTtcbiAgICBpZiAocGllY2UpIHN0YXRlLnBpZWNlc1trZXldID0gcGllY2U7XG4gICAgZWxzZSBkZWxldGUgc3RhdGUucGllY2VzW2tleV07XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldENoZWNrKHN0YXRlOiBTdGF0ZSwgY29sb3I6IGNnLkNvbG9yIHwgYm9vbGVhbik6IHZvaWQge1xuICBpZiAoY29sb3IgPT09IHRydWUpIGNvbG9yID0gc3RhdGUudHVybkNvbG9yO1xuICBpZiAoIWNvbG9yKSBzdGF0ZS5jaGVjayA9IHVuZGVmaW5lZDtcbiAgZWxzZSBmb3IgKGxldCBrIGluIHN0YXRlLnBpZWNlcykge1xuICAgIGlmIChzdGF0ZS5waWVjZXNba10ucm9sZSA9PT0gJ2tpbmcnICYmIHN0YXRlLnBpZWNlc1trXS5jb2xvciA9PT0gY29sb3IpIHtcbiAgICAgIHN0YXRlLmNoZWNrID0gayBhcyBjZy5LZXk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YTogY2cuU2V0UHJlbW92ZU1ldGFkYXRhKTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IFtvcmlnLCBkZXN0XTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy5zZXQsIG9yaWcsIGRlc3QsIG1ldGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVtb3ZlKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlbW92YWJsZS5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZWRyb3Aoc3RhdGU6IFN0YXRlLCByb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHtcbiAgICByb2xlOiByb2xlLFxuICAgIGtleToga2V5XG4gIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHJvbGUsIGtleSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZWRyb3Aoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IHBkID0gc3RhdGUucHJlZHJvcHBhYmxlO1xuICBpZiAocGQuY3VycmVudCkge1xuICAgIHBkLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihwZC5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyeUF1dG9DYXN0bGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoIXN0YXRlLmF1dG9DYXN0bGUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qga2luZyA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgaWYgKGtpbmcucm9sZSAhPT0gJ2tpbmcnKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yaWdQb3MgPSBrZXkycG9zKG9yaWcpO1xuICBpZiAob3JpZ1Bvc1swXSAhPT0gNSkgcmV0dXJuIGZhbHNlO1xuICBpZiAob3JpZ1Bvc1sxXSAhPT0gMSAmJiBvcmlnUG9zWzFdICE9PSA4KSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGRlc3RQb3MgPSBrZXkycG9zKGRlc3QpO1xuICBsZXQgb2xkUm9va1BvcywgbmV3Um9va1BvcywgbmV3S2luZ1BvcztcbiAgaWYgKGRlc3RQb3NbMF0gPT09IDcgfHwgZGVzdFBvc1swXSA9PT0gOCkge1xuICAgIG9sZFJvb2tQb3MgPSBwb3Mya2V5KFs4LCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3Um9va1BvcyA9IHBvczJrZXkoWzYsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gcG9zMmtleShbNywgb3JpZ1Bvc1sxXV0pO1xuICB9IGVsc2UgaWYgKGRlc3RQb3NbMF0gPT09IDMgfHwgZGVzdFBvc1swXSA9PT0gMSkge1xuICAgIG9sZFJvb2tQb3MgPSBwb3Mya2V5KFsxLCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3Um9va1BvcyA9IHBvczJrZXkoWzQsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gcG9zMmtleShbMywgb3JpZ1Bvc1sxXV0pO1xuICB9IGVsc2UgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IHJvb2sgPSBzdGF0ZS5waWVjZXNbb2xkUm9va1Bvc107XG4gIGlmIChyb29rLnJvbGUgIT09ICdyb29rJykgcmV0dXJuIGZhbHNlO1xuXG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb2xkUm9va1Bvc107XG5cbiAgc3RhdGUucGllY2VzW25ld0tpbmdQb3NdID0ga2luZ1xuICBzdGF0ZS5waWVjZXNbbmV3Um9va1Bvc10gPSByb29rO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBjZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBpZiAob3JpZyA9PT0gZGVzdCB8fCAhc3RhdGUucGllY2VzW29yaWddKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGNhcHR1cmVkOiBjZy5QaWVjZSB8IHVuZGVmaW5lZCA9IChcbiAgICBzdGF0ZS5waWVjZXNbZGVzdF0gJiZcbiAgICBzdGF0ZS5waWVjZXNbZGVzdF0uY29sb3IgIT09IHN0YXRlLnBpZWNlc1tvcmlnXS5jb2xvclxuICApID8gc3RhdGUucGllY2VzW2Rlc3RdIDogdW5kZWZpbmVkO1xuICBpZiAoZGVzdCA9PSBzdGF0ZS5zZWxlY3RlZCkgdW5zZWxlY3Qoc3RhdGUpO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5tb3ZlLCBvcmlnLCBkZXN0LCBjYXB0dXJlZCk7XG4gIGlmICghdHJ5QXV0b0Nhc3RsZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzdGF0ZS5waWVjZXNbZGVzdF0gPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gICAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgfVxuICBzdGF0ZS5sYXN0TW92ZSA9IFtvcmlnLCBkZXN0XTtcbiAgc3RhdGUuY2hlY2sgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZU5ld1BpZWNlKHN0YXRlOiBTdGF0ZSwgcGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGlmIChzdGF0ZS5waWVjZXNba2V5XSkge1xuICAgIGlmIChmb3JjZSkgZGVsZXRlIHN0YXRlLnBpZWNlc1trZXldO1xuICAgIGVsc2UgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmRyb3BOZXdQaWVjZSwgcGllY2UsIGtleSk7XG4gIHN0YXRlLnBpZWNlc1trZXldID0gcGllY2U7XG4gIHN0YXRlLmxhc3RNb3ZlID0gW2tleV07XG4gIHN0YXRlLmNoZWNrID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBzdGF0ZS50dXJuQ29sb3IgPSBvcHBvc2l0ZShzdGF0ZS50dXJuQ29sb3IpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBjZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBjb25zdCByZXN1bHQgPSBiYXNlTW92ZShzdGF0ZSwgb3JpZywgZGVzdCk7XG4gIGlmIChyZXN1bHQpIHtcbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCBob2xkVGltZSA9IHN0YXRlLmhvbGQuc3RvcCgpO1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY29uc3QgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSA9IHtcbiAgICAgICAgcHJlbW92ZTogZmFsc2UsXG4gICAgICAgIGN0cmxLZXk6IHN0YXRlLnN0YXRzLmN0cmxLZXksXG4gICAgICAgIGhvbGRUaW1lOiBob2xkVGltZVxuICAgICAgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgbWV0YWRhdGEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgc2V0UHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCwge1xuICAgICAgY3RybEtleTogc3RhdGUuc3RhdHMuY3RybEtleVxuICAgIH0pO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgfSBlbHNlIGlmIChpc01vdmFibGUoc3RhdGUsIGRlc3QpIHx8IGlzUHJlbW92YWJsZShzdGF0ZSwgZGVzdCkpIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwgZGVzdCk7XG4gICAgc3RhdGUuaG9sZC5zdGFydCgpO1xuICB9IGVsc2UgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBmb3JjZSkge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICAgIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gICAgYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZGVzdCwgZm9yY2UpO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUubW92YWJsZS5ldmVudHMuYWZ0ZXJOZXdQaWVjZSwgcGllY2Uucm9sZSwgZGVzdCwge1xuICAgICAgcHJlZHJvcDogZmFsc2VcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChjYW5QcmVkcm9wKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIHNldFByZWRyb3Aoc3RhdGUsIHN0YXRlLnBpZWNlc1tvcmlnXS5yb2xlLCBkZXN0KTtcbiAgfSBlbHNlIHtcbiAgICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICAgIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIH1cbiAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0U3F1YXJlKHN0YXRlOiBTdGF0ZSwga2V5OiBjZy5LZXksIGZvcmNlPzogYm9vbGVhbik6IHZvaWQge1xuICBpZiAoc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICBpZiAoc3RhdGUuc2VsZWN0ZWQgPT09IGtleSAmJiAhc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQpIHtcbiAgICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgICAgIHN0YXRlLmhvbGQuY2FuY2VsKCk7XG4gICAgfSBlbHNlIGlmICgoc3RhdGUuc2VsZWN0YWJsZS5lbmFibGVkIHx8IGZvcmNlKSAmJiBzdGF0ZS5zZWxlY3RlZCAhPT0ga2V5KSB7XG4gICAgICBpZiAodXNlck1vdmUoc3RhdGUsIHN0YXRlLnNlbGVjdGVkLCBrZXkpKSBzdGF0ZS5zdGF0cy5kcmFnZ2VkID0gZmFsc2U7XG4gICAgfSBlbHNlIHN0YXRlLmhvbGQuc3RhcnQoKTtcbiAgfSBlbHNlIGlmIChpc01vdmFibGUoc3RhdGUsIGtleSkgfHwgaXNQcmVtb3ZhYmxlKHN0YXRlLCBrZXkpKSB7XG4gICAgc2V0U2VsZWN0ZWQoc3RhdGUsIGtleSk7XG4gICAgc3RhdGUuaG9sZC5zdGFydCgpO1xuICB9XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLnNlbGVjdCwga2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFNlbGVjdGVkKHN0YXRlOiBTdGF0ZSwga2V5OiBjZy5LZXkpOiB2b2lkIHtcbiAgc3RhdGUuc2VsZWN0ZWQgPSBrZXk7XG4gIGlmIChpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpIHtcbiAgICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gcHJlbW92ZShzdGF0ZS5waWVjZXMsIGtleSwgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpO1xuICB9XG4gIGVsc2Ugc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuc2VsZWN0KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5zZWxlY3RlZCA9IHVuZGVmaW5lZDtcbiAgc3RhdGUucHJlbW92YWJsZS5kZXN0cyA9IHVuZGVmaW5lZDtcbiAgc3RhdGUuaG9sZC5jYW5jZWwoKTtcbn1cblxuZnVuY3Rpb24gaXNNb3ZhYmxlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gcGllY2UgJiYgKFxuICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICdib3RoJyB8fCAoXG4gICAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yXG4gICAgKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5Nb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9yaWcgIT09IGRlc3QgJiYgaXNNb3ZhYmxlKHN0YXRlLCBvcmlnKSAmJiAoXG4gICAgc3RhdGUubW92YWJsZS5mcmVlIHx8ICghIXN0YXRlLm1vdmFibGUuZGVzdHMgJiYgY29udGFpbnNYKHN0YXRlLm1vdmFibGUuZGVzdHNbb3JpZ10sIGRlc3QpKVxuICApO1xufVxuXG5mdW5jdGlvbiBjYW5Ecm9wKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiBwaWVjZSAmJiBkZXN0ICYmIChvcmlnID09PSBkZXN0IHx8ICFzdGF0ZS5waWVjZXNbZGVzdF0pICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvclxuICAgICkpO1xufVxuXG5cbmZ1bmN0aW9uIGlzUHJlbW92YWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuIHBpZWNlICYmIHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZCAmJlxuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3I7XG59XG5cbmZ1bmN0aW9uIGNhblByZW1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb3JpZyAhPT0gZGVzdCAmJlxuICBpc1ByZW1vdmFibGUoc3RhdGUsIG9yaWcpICYmXG4gIGNvbnRhaW5zWChwcmVtb3ZlKHN0YXRlLnBpZWNlcywgb3JpZywgc3RhdGUucHJlbW92YWJsZS5jYXN0bGUpLCBkZXN0KTtcbn1cblxuZnVuY3Rpb24gY2FuUHJlZHJvcChzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gcGllY2UgJiYgZGVzdCAmJlxuICAoIXN0YXRlLnBpZWNlc1tkZXN0XSB8fCBzdGF0ZS5waWVjZXNbZGVzdF0uY29sb3IgIT09IHN0YXRlLm1vdmFibGUuY29sb3IpICYmXG4gIHN0YXRlLnByZWRyb3BwYWJsZS5lbmFibGVkICYmXG4gIChwaWVjZS5yb2xlICE9PSAncGF3bicgfHwgKGRlc3RbMV0gIT09ICcxJyAmJiBkZXN0WzFdICE9PSAnOCcpKSAmJlxuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RyYWdnYWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuIHBpZWNlICYmIHN0YXRlLmRyYWdnYWJsZS5lbmFibGVkICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiYgKFxuICAgICAgICBzdGF0ZS50dXJuQ29sb3IgPT09IHBpZWNlLmNvbG9yIHx8IHN0YXRlLnByZW1vdmFibGUuZW5hYmxlZFxuICAgICAgKVxuICAgIClcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBsYXlQcmVtb3ZlKHN0YXRlOiBTdGF0ZSk6IGJvb2xlYW4ge1xuICBjb25zdCBtb3ZlID0gc3RhdGUucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAoIW1vdmUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qgb3JpZyA9IG1vdmVbMF0sIGRlc3QgPSBtb3ZlWzFdO1xuICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoY2FuTW92ZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBjb25zdCByZXN1bHQgPSBiYXNlVXNlck1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpO1xuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIGNvbnN0IG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEgPSB7IHByZW1vdmU6IHRydWUgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgbWV0YWRhdGEpO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZWRyb3Aoc3RhdGU6IFN0YXRlLCB2YWxpZGF0ZTogKGRyb3A6IGNnLkRyb3ApID0+IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgbGV0IGRyb3AgPSBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCxcbiAgc3VjY2VzcyA9IGZhbHNlO1xuICBpZiAoIWRyb3ApIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbGlkYXRlKGRyb3ApKSB7XG4gICAgY29uc3QgcGllY2UgPSB7XG4gICAgICByb2xlOiBkcm9wLnJvbGUsXG4gICAgICBjb2xvcjogc3RhdGUubW92YWJsZS5jb2xvclxuICAgIH0gYXMgY2cuUGllY2U7XG4gICAgaWYgKGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRyb3Aua2V5KSkge1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlck5ld1BpZWNlLCBkcm9wLnJvbGUsIGRyb3Aua2V5LCB7XG4gICAgICAgIHByZWRyb3A6IHRydWVcbiAgICAgIH0pO1xuICAgICAgc3VjY2VzcyA9IHRydWU7XG4gICAgfVxuICB9XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHJldHVybiBzdWNjZXNzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsTW92ZShzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgdW5zZWxlY3Qoc3RhdGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgc3RhdGUubW92YWJsZS5jb2xvciA9XG4gIHN0YXRlLm1vdmFibGUuZGVzdHMgPVxuICBzdGF0ZS5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgY2FuY2VsTW92ZShzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRLZXlBdERvbVBvcyhwb3M6IGNnLk51bWJlclBhaXIsIGFzV2hpdGU6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IGNnLktleSB8IHVuZGVmaW5lZCB7XG4gIGxldCBmaWxlID0gTWF0aC5jZWlsKDggKiAoKHBvc1swXSAtIGJvdW5kcy5sZWZ0KSAvIGJvdW5kcy53aWR0aCkpO1xuICBpZiAoIWFzV2hpdGUpIGZpbGUgPSA5IC0gZmlsZTtcbiAgbGV0IHJhbmsgPSBNYXRoLmNlaWwoOCAtICg4ICogKChwb3NbMV0gLSBib3VuZHMudG9wKSAvIGJvdW5kcy5oZWlnaHQpKSk7XG4gIGlmICghYXNXaGl0ZSkgcmFuayA9IDkgLSByYW5rO1xuICByZXR1cm4gKGZpbGUgPiAwICYmIGZpbGUgPCA5ICYmIHJhbmsgPiAwICYmIHJhbmsgPCA5KSA/IHBvczJrZXkoW2ZpbGUsIHJhbmtdKSA6IHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7IEFwaSwgc3RhcnQgfSBmcm9tICcuL2FwaSdcbmltcG9ydCB7IENvbmZpZywgY29uZmlndXJlIH0gZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgeyBTdGF0ZSwgZGVmYXVsdHMgfSBmcm9tICcuL3N0YXRlJ1xuXG5pbXBvcnQgcmVuZGVyV3JhcCBmcm9tICcuL3dyYXAnO1xuaW1wb3J0ICogYXMgZXZlbnRzIGZyb20gJy4vZXZlbnRzJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcic7XG5pbXBvcnQgKiBhcyBzdmcgZnJvbSAnLi9zdmcnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgZnVuY3Rpb24gQ2hlc3Nncm91bmQoZWxlbWVudDogSFRNTEVsZW1lbnQsIGNvbmZpZz86IENvbmZpZyk6IEFwaSB7XG5cbiAgY29uc3Qgc3RhdGUgPSBkZWZhdWx0cygpIGFzIFN0YXRlO1xuXG4gIGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnIHx8IHt9KTtcblxuICBmdW5jdGlvbiByZWRyYXdBbGwoKSB7XG4gICAgbGV0IHByZXZVbmJpbmQgPSBzdGF0ZS5kb20gJiYgc3RhdGUuZG9tLnVuYmluZDtcbiAgICAvLyBmaXJzdCBlbnN1cmUgdGhlIGNnLWJvYXJkLXdyYXAgY2xhc3MgaXMgc2V0XG4gICAgLy8gc28gYm91bmRzIGNhbGN1bGF0aW9uIGNhbiB1c2UgdGhlIENTUyB3aWR0aC9oZWlnaHQgdmFsdWVzXG4gICAgLy8gYWRkIHRoYXQgY2xhc3MgeW91cnNlbGYgdG8gdGhlIGVsZW1lbnQgYmVmb3JlIGNhbGxpbmcgY2hlc3Nncm91bmRcbiAgICAvLyBmb3IgYSBzbGlnaHQgcGVyZm9ybWFuY2UgaW1wcm92ZW1lbnQhIChhdm9pZHMgcmVjb21wdXRpbmcgc3R5bGUpXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjZy1ib2FyZC13cmFwJyk7XG4gICAgLy8gY29tcHV0ZSBib3VuZHMgZnJvbSBleGlzdGluZyBib2FyZCBlbGVtZW50IGlmIHBvc3NpYmxlXG4gICAgLy8gdGhpcyBhbGxvd3Mgbm9uLXNxdWFyZSBib2FyZHMgZnJvbSBDU1MgdG8gYmUgaGFuZGxlZCAoZm9yIDNEKVxuICAgIGNvbnN0IGJvdW5kcyA9IHV0aWwubWVtbygoKSA9PiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKTtcbiAgICBjb25zdCBlbGVtZW50cyA9IHJlbmRlcldyYXAoZWxlbWVudCwgc3RhdGUsIHN0YXRlLnZpZXdPbmx5ICYmICFzdGF0ZS5kcmF3YWJsZS52aXNpYmxlID8gdW5kZWZpbmVkIDogYm91bmRzKCkpO1xuICAgIGNvbnN0IHJlZHJhd05vdyA9IChza2lwU3ZnOiBib29sZWFuKSA9PiB7XG4gICAgICByZW5kZXIoc3RhdGUpO1xuICAgICAgaWYgKCFza2lwU3ZnICYmIGVsZW1lbnRzLnN2Zykgc3ZnLnJlbmRlclN2ZyhzdGF0ZSwgZWxlbWVudHMuc3ZnKTtcbiAgICB9O1xuICAgIHN0YXRlLmRvbSA9IHtcbiAgICAgIGVsZW1lbnRzOiBlbGVtZW50cyxcbiAgICAgIGJvdW5kczogYm91bmRzLFxuICAgICAgcmVkcmF3OiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdOb3cpLFxuICAgICAgcmVkcmF3Tm93OiByZWRyYXdOb3csXG4gICAgICB1bmJpbmQ6IHByZXZVbmJpbmRcbiAgICB9O1xuICAgIHN2Zy5jbGVhckNhY2hlKCk7XG4gICAgcmVkcmF3Tm93KGZhbHNlKTtcbiAgICBldmVudHMuYmluZEJvYXJkKHN0YXRlKTtcbiAgICBpZiAoIXByZXZVbmJpbmQpIHN0YXRlLmRvbS51bmJpbmQgPSBldmVudHMuYmluZERvY3VtZW50KHN0YXRlLCByZWRyYXdBbGwpO1xuICB9XG4gIHJlZHJhd0FsbCgpO1xuXG4gIGNvbnN0IGFwaSA9IHN0YXJ0KHN0YXRlLCByZWRyYXdBbGwpO1xuXG4gIHJldHVybiBhcGk7XG59O1xuXG5mdW5jdGlvbiBkZWJvdW5jZVJlZHJhdyhyZWRyYXdOb3c6IChza2lwU3ZnPzogYm9vbGVhbikgPT4gdm9pZCk6ICgpID0+IHZvaWQge1xuICBsZXQgcmVkcmF3aW5nID0gZmFsc2U7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgaWYgKHJlZHJhd2luZykgcmV0dXJuO1xuICAgIHJlZHJhd2luZyA9IHRydWU7XG4gICAgdXRpbC5yYWYoKCkgPT4ge1xuICAgICAgcmVkcmF3Tm93KCk7XG4gICAgICByZWRyYXdpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHNldENoZWNrLCBzZXRTZWxlY3RlZCB9IGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyByZWFkIGFzIGZlblJlYWQgfSBmcm9tICcuL2ZlbidcbmltcG9ydCB7IERyYXdTaGFwZSwgRHJhd0JydXNoIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICBmZW4/OiBjZy5GRU47IC8vIGNoZXNzIHBvc2l0aW9uIGluIEZvcnN5dGggbm90YXRpb25cbiAgb3JpZW50YXRpb24/OiBjZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHdoaXRlIHwgYmxhY2tcbiAgdHVybkNvbG9yPzogY2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gd2hpdGUgfCBibGFja1xuICBjaGVjaz86IGNnLkNvbG9yIHwgYm9vbGVhbjsgLy8gdHJ1ZSBmb3IgY3VycmVudCBjb2xvciwgZmFsc2UgdG8gdW5zZXRcbiAgbGFzdE1vdmU/OiBjZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgW1wiYzNcIiwgXCJjNFwiXVxuICBzZWxlY3RlZD86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcImExXCJcbiAgY29vcmRpbmF0ZXM/OiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gIGF1dG9DYXN0bGU/OiBib29sZWFuOyAvLyBpbW1lZGlhdGVseSBjb21wbGV0ZSB0aGUgY2FzdGxlIGJ5IG1vdmluZyB0aGUgcm9vayBhZnRlciBraW5nIG1vdmVcbiAgdmlld09ubHk/OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGV2ZW50czogdGhlIHVzZXIgd2lsbCBuZXZlciBiZSBhYmxlIHRvIG1vdmUgcGllY2VzIGFyb3VuZFxuICBkaXNhYmxlQ29udGV4dE1lbnU/OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGNoZXNzYm9hcmRcbiAgcmVzaXphYmxlPzogYm9vbGVhbjsgLy8gbGlzdGVucyB0byBjaGVzc2dyb3VuZC5yZXNpemUgb24gZG9jdW1lbnQuYm9keSB0byBjbGVhciBib3VuZHMgY2FjaGVcbiAgYWRkUGllY2VaSW5kZXg/OiBib29sZWFuOyAvLyBhZGRzIHotaW5kZXggdmFsdWVzIHRvIHBpZWNlcyAoZm9yIDNEKVxuICAvLyBwaWVjZUtleTogYm9vbGVhbjsgLy8gYWRkIGEgZGF0YS1rZXkgYXR0cmlidXRlIHRvIHBpZWNlIGVsZW1lbnRzXG4gIGhpZ2hsaWdodD86IHtcbiAgICBsYXN0TW92ZT86IGJvb2xlYW47IC8vIGFkZCBsYXN0LW1vdmUgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrPzogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuO1xuICAgIGR1cmF0aW9uPzogbnVtYmVyO1xuICB9O1xuICBtb3ZhYmxlPzoge1xuICAgIGZyZWU/OiBib29sZWFuOyAvLyBhbGwgbW92ZXMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgY29sb3I/OiBjZy5Db2xvciB8ICdib3RoJzsgLy8gY29sb3IgdGhhdCBjYW4gbW92ZS4gd2hpdGUgfCBibGFjayB8IGJvdGggfCB1bmRlZmluZWRcbiAgICBkZXN0cz86IHtcbiAgICAgIFtrZXk6IHN0cmluZ106IGNnLktleVtdXG4gICAgfTsgLy8gdmFsaWQgbW92ZXMuIHtcImEyXCIgW1wiYTNcIiBcImE0XCJdIFwiYjFcIiBbXCJhM1wiIFwiYzNcIl19XG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIG1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzPzoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICAgIGFmdGVyTmV3UGllY2U/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciBhIG5ldyBwaWVjZSBpcyBkcm9wcGVkIG9uIHRoZSBib2FyZFxuICAgIH07XG4gICAgcm9va0Nhc3RsZT86IGJvb2xlYW4gLy8gY2FzdGxlIGJ5IG1vdmluZyB0aGUga2luZyB0byB0aGUgcm9va1xuICB9O1xuICBwcmVtb3ZhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBjYXN0bGU/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFsbG93IGtpbmcgY2FzdGxlIHByZW1vdmVzXG4gICAgZGVzdHM/OiBjZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGV2ZW50cz86IHtcbiAgICAgIHNldD86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE/OiBjZy5TZXRQcmVtb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgIC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH1cbiAgfTtcbiAgcHJlZHJvcHBhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBkcmFnZ2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U/OiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U/OiBib29sZWFuOyAvLyBsZXRzIGNoZXNzZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBjZW50ZXJQaWVjZT86IGJvb2xlYW47IC8vIGNlbnRlciB0aGUgcGllY2Ugb24gY3Vyc29yIGF0IGRyYWcgc3RhcnRcbiAgICBzaG93R2hvc3Q/OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBkZWxldGVPbkRyb3BPZmY/OiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZFxuICB9O1xuICBzZWxlY3RhYmxlPzoge1xuICAgIC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBlbmFibGVkPzogYm9vbGVhblxuICB9O1xuICBldmVudHM/OiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICAvLyBjYWxsZWQgYWZ0ZXIgYSBwaWVjZSBoYXMgYmVlbiBtb3ZlZC5cbiAgICAvLyBjYXB0dXJlZFBpZWNlIGlzIHVuZGVmaW5lZCBvciBsaWtlIHtjb2xvcjogJ3doaXRlJzsgJ3JvbGUnOiAncXVlZW4nfVxuICAgIG1vdmU/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIGNhcHR1cmVkUGllY2U/OiBjZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wTmV3UGllY2U/OiAocGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSkgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBjZy5LZXkpID0+IHZvaWQgLy8gY2FsbGVkIHdoZW4gYSBzcXVhcmUgaXMgc2VsZWN0ZWRcbiAgfTtcbiAgaXRlbXM/OiAocG9zOiBjZy5Qb3MsIGtleTogY2cuS2V5KSA9PiBhbnkgfCB1bmRlZmluZWQ7IC8vIGl0ZW1zIG9uIHRoZSBib2FyZCB7IHJlbmRlcjoga2V5IC0+IHZkb20gfVxuICBkcmF3YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgICB2aXNpYmxlPzogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgICBlcmFzZU9uQ2xpY2s/OiBib29sZWFuO1xuICAgIHNoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIGF1dG9TaGFwZXM/OiBEcmF3U2hhcGVbXTtcbiAgICBicnVzaGVzPzogRHJhd0JydXNoW107XG4gICAgcGllY2VzPzoge1xuICAgICAgYmFzZVVybD86IHN0cmluZztcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZShzdGF0ZTogU3RhdGUsIGNvbmZpZzogQ29uZmlnKSB7XG5cbiAgLy8gZG9uJ3QgbWVyZ2UgZGVzdGluYXRpb25zLiBKdXN0IG92ZXJyaWRlLlxuICBpZiAoY29uZmlnLm1vdmFibGUgJiYgY29uZmlnLm1vdmFibGUuZGVzdHMpIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG5cbiAgbWVyZ2Uoc3RhdGUsIGNvbmZpZyk7XG5cbiAgLy8gaWYgYSBmZW4gd2FzIHByb3ZpZGVkLCByZXBsYWNlIHRoZSBwaWVjZXNcbiAgaWYgKGNvbmZpZy5mZW4pIHtcbiAgICBzdGF0ZS5waWVjZXMgPSBmZW5SZWFkKGNvbmZpZy5mZW4pO1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICB9XG5cbiAgLy8gYXBwbHkgY29uZmlnIHZhbHVlcyB0aGF0IGNvdWxkIGJlIHVuZGVmaW5lZCB5ZXQgbWVhbmluZ2Z1bFxuICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KCdjaGVjaycpKSBzZXRDaGVjayhzdGF0ZSwgY29uZmlnLmNoZWNrIHx8IGZhbHNlKTtcbiAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgnbGFzdE1vdmUnKSAmJiAhY29uZmlnLmxhc3RNb3ZlKSBzdGF0ZS5sYXN0TW92ZSA9IHVuZGVmaW5lZDtcbiAgLy8gaW4gY2FzZSBvZiBaSCBkcm9wIGxhc3QgbW92ZSwgdGhlcmUncyBhIHNpbmdsZSBzcXVhcmUuXG4gIC8vIGlmIHRoZSBwcmV2aW91cyBsYXN0IG1vdmUgaGFkIHR3byBzcXVhcmVzLFxuICAvLyB0aGUgbWVyZ2UgYWxnb3JpdGhtIHdpbGwgaW5jb3JyZWN0bHkga2VlcCB0aGUgc2Vjb25kIHNxdWFyZS5cbiAgZWxzZSBpZiAoY29uZmlnLmxhc3RNb3ZlKSBzdGF0ZS5sYXN0TW92ZSA9IGNvbmZpZy5sYXN0TW92ZTtcblxuICAvLyBmaXggbW92ZS9wcmVtb3ZlIGRlc3RzXG4gIGlmIChzdGF0ZS5zZWxlY3RlZCkgc2V0U2VsZWN0ZWQoc3RhdGUsIHN0YXRlLnNlbGVjdGVkKTtcblxuICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgaWYgKCFzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24gfHwgc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uIDwgMTAwKSBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuXG4gIGlmICghc3RhdGUubW92YWJsZS5yb29rQ2FzdGxlICYmIHN0YXRlLm1vdmFibGUuZGVzdHMpIHtcbiAgICBjb25zdCByYW5rID0gc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ3doaXRlJyA/IDEgOiA4O1xuICAgIGNvbnN0IGtpbmdTdGFydFBvcyA9ICdlJyArIHJhbms7XG4gICAgY29uc3QgZGVzdHMgPSBzdGF0ZS5tb3ZhYmxlLmRlc3RzW2tpbmdTdGFydFBvc107XG4gICAgaWYgKCFkZXN0cyB8fCBzdGF0ZS5waWVjZXNba2luZ1N0YXJ0UG9zXS5yb2xlICE9PSAna2luZycpIHJldHVybjtcbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzW2tpbmdTdGFydFBvc10gPSBkZXN0cy5maWx0ZXIoZCA9PlxuICAgICAgISgoZCA9PT0gJ2EnICsgcmFuaykgJiYgZGVzdHMuaW5kZXhPZignYycgKyByYW5rIGFzIGNnLktleSkgIT09IC0xKSAmJlxuICAgICAgICAhKChkID09PSAnaCcgKyByYW5rKSAmJiBkZXN0cy5pbmRleE9mKCdnJyArIHJhbmsgYXMgY2cuS2V5KSAhPT0gLTEpXG4gICAgKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gbWVyZ2UoYmFzZTogYW55LCBleHRlbmQ6IGFueSkge1xuICBmb3IgKHZhciBrZXkgaW4gZXh0ZW5kKSB7XG4gICAgaWYgKGlzT2JqZWN0KGJhc2Vba2V5XSkgJiYgaXNPYmplY3QoZXh0ZW5kW2tleV0pKSBtZXJnZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcbiAgICBlbHNlIGJhc2Vba2V5XSA9IGV4dGVuZFtrZXldO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG86IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgY2xlYXIgYXMgZHJhd0NsZWFyIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0nXG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ0N1cnJlbnQge1xuICBvcmlnOiBjZy5LZXk7IC8vIG9yaWcga2V5IG9mIGRyYWdnaW5nIHBpZWNlXG4gIG9yaWdQb3M6IGNnLlBvcztcbiAgcGllY2U6IGNnLlBpZWNlO1xuICByZWw6IGNnLk51bWJlclBhaXI7IC8vIHg7IHkgb2YgdGhlIHBpZWNlIGF0IG9yaWdpbmFsIHBvc2l0aW9uXG4gIGVwb3M6IGNnLk51bWJlclBhaXI7IC8vIGluaXRpYWwgZXZlbnQgcG9zaXRpb25cbiAgcG9zOiBjZy5OdW1iZXJQYWlyOyAvLyByZWxhdGl2ZSBjdXJyZW50IHBvc2l0aW9uXG4gIGRlYzogY2cuTnVtYmVyUGFpcjsgLy8gcGllY2UgY2VudGVyIGRlY2F5XG4gIG92ZXI/OiBjZy5LZXk7IC8vIHNxdWFyZSBiZWluZyBtb3VzZWQgb3ZlclxuICBvdmVyUHJldj86IGNnLktleTsgLy8gc3F1YXJlIHByZXZpb3VzbHkgbW91c2VkIG92ZXJcbiAgc3RhcnRlZDogYm9vbGVhbjsgLy8gd2hldGhlciB0aGUgZHJhZyBoYXMgc3RhcnRlZDsgYXMgcGVyIHRoZSBkaXN0YW5jZSBzZXR0aW5nXG4gIGVsZW1lbnQ6IGNnLlBpZWNlTm9kZSB8ICgoKSA9PiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQpO1xuICBuZXdQaWVjZT86IGJvb2xlYW47IC8vIGl0IGl0IGEgbmV3IHBpZWNlIGZyb20gb3V0c2lkZSB0aGUgYm9hcmRcbiAgZm9yY2U/OiBib29sZWFuOyAvLyBjYW4gdGhlIG5ldyBwaWVjZSByZXBsYWNlIGFuIGV4aXN0aW5nIG9uZSAoZWRpdG9yKVxuICBwcmV2aW91c2x5U2VsZWN0ZWQ/OiBjZy5LZXk7XG4gIG9yaWdpblRhcmdldDogRXZlbnRUYXJnZXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydChzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoZS5idXR0b24gIT09IHVuZGVmaW5lZCAmJiBlLmJ1dHRvbiAhPT0gMCkgcmV0dXJuOyAvLyBvbmx5IHRvdWNoIG9yIGxlZnQgY2xpY2tcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuOyAvLyBzdXBwb3J0IG9uZSBmaW5nZXIgdG91Y2ggb25seVxuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIGNvbnN0IGFzV2hpdGUgPSBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLFxuICBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSxcbiAgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcixcbiAgb3JpZyA9IGJvYXJkLmdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCBhc1doaXRlLCBib3VuZHMpO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgY29uc3QgcGllY2UgPSBzLnBpZWNlc1tvcmlnXTtcbiAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkID0gcy5zZWxlY3RlZDtcbiAgaWYgKCFwcmV2aW91c2x5U2VsZWN0ZWQgJiYgcy5kcmF3YWJsZS5lbmFibGVkICYmIChcbiAgICBzLmRyYXdhYmxlLmVyYXNlT25DbGljayB8fCAoIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSBzLnR1cm5Db2xvcilcbiAgKSkgZHJhd0NsZWFyKHMpO1xuICBjb25zdCBoYWRQcmVtb3ZlID0gISFzLnByZW1vdmFibGUuY3VycmVudDtcbiAgY29uc3QgaGFkUHJlZHJvcCA9ICEhcy5wcmVkcm9wcGFibGUuY3VycmVudDtcbiAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICBpZiAocy5zZWxlY3RlZCAmJiBib2FyZC5jYW5Nb3ZlKHMsIHMuc2VsZWN0ZWQsIG9yaWcpKSB7XG4gICAgYW5pbShzdGF0ZSA9PiBib2FyZC5zZWxlY3RTcXVhcmUoc3RhdGUsIG9yaWcpLCBzKTtcbiAgfSBlbHNlIHtcbiAgICBib2FyZC5zZWxlY3RTcXVhcmUocywgb3JpZyk7XG4gIH1cbiAgY29uc3Qgc3RpbGxTZWxlY3RlZCA9IHMuc2VsZWN0ZWQgPT09IG9yaWc7XG4gIGNvbnN0IGVsZW1lbnQgPSBwaWVjZUVsZW1lbnRCeUtleShzLCBvcmlnKTtcbiAgaWYgKHBpZWNlICYmIGVsZW1lbnQgJiYgc3RpbGxTZWxlY3RlZCAmJiBib2FyZC5pc0RyYWdnYWJsZShzLCBvcmlnKSkge1xuICAgIGNvbnN0IHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMob3JpZywgYXNXaGl0ZSwgYm91bmRzKTtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0ge1xuICAgICAgb3JpZzogb3JpZyxcbiAgICAgIG9yaWdQb3M6IHV0aWwua2V5MnBvcyhvcmlnKSxcbiAgICAgIHBpZWNlOiBwaWVjZSxcbiAgICAgIHJlbDogcG9zaXRpb24sXG4gICAgICBlcG9zOiBwb3NpdGlvbixcbiAgICAgIHBvczogWzAsIDBdLFxuICAgICAgZGVjOiBzLmRyYWdnYWJsZS5jZW50ZXJQaWVjZSA/IFtcbiAgICAgICAgcG9zaXRpb25bMF0gLSAoc3F1YXJlQm91bmRzLmxlZnQgKyBzcXVhcmVCb3VuZHMud2lkdGggLyAyKSxcbiAgICAgICAgcG9zaXRpb25bMV0gLSAoc3F1YXJlQm91bmRzLnRvcCArIHNxdWFyZUJvdW5kcy5oZWlnaHQgLyAyKVxuICAgICAgXSA6IFswLCAwXSxcbiAgICAgIHN0YXJ0ZWQ6IHMuZHJhZ2dhYmxlLmF1dG9EaXN0YW5jZSAmJiBzLnN0YXRzLmRyYWdnZWQsXG4gICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgcHJldmlvdXNseVNlbGVjdGVkOiBwcmV2aW91c2x5U2VsZWN0ZWQsXG4gICAgICBvcmlnaW5UYXJnZXQ6IGUudGFyZ2V0XG4gICAgfTtcbiAgICBlbGVtZW50LmNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZHJhZ2dpbmcnKTtcbiAgICAvLyBwbGFjZSBnaG9zdFxuICAgIGNvbnN0IGdob3N0ID0gcy5kb20uZWxlbWVudHMuZ2hvc3Q7XG4gICAgaWYgKGdob3N0KSB7XG4gICAgICBnaG9zdC5jbGFzc05hbWUgPSBgZ2hvc3QgJHtwaWVjZS5jb2xvcn0gJHtwaWVjZS5yb2xlfWA7XG4gICAgICB1dGlsLnRyYW5zbGF0ZUFicyhnaG9zdCwgdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhib3VuZHMpKHV0aWwua2V5MnBvcyhvcmlnKSwgYXNXaGl0ZSkpO1xuICAgIH1cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoaGFkUHJlbW92ZSkgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICAgIGlmIChoYWRQcmVkcm9wKSBib2FyZC51bnNldFByZWRyb3Aocyk7XG4gIH1cbiAgcy5kb20ucmVkcmF3KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmFnTmV3UGllY2UoczogU3RhdGUsIHBpZWNlOiBjZy5QaWVjZSwgZTogY2cuTW91Y2hFdmVudCwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG5cbiAgY29uc3Qga2V5OiBjZy5LZXkgPSAnYTAnO1xuXG4gIHMucGllY2VzW2tleV0gPSBwaWVjZTtcblxuICBzLmRvbS5yZWRyYXcoKTtcblxuICBjb25zdCBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyLFxuICBhc1doaXRlID0gcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJyxcbiAgYm91bmRzID0gcy5kb20uYm91bmRzKCksXG4gIHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMoa2V5LCBhc1doaXRlLCBib3VuZHMpO1xuXG4gIGNvbnN0IHJlbDogY2cuTnVtYmVyUGFpciA9IFtcbiAgICAoYXNXaGl0ZSA/IDAgOiA3KSAqIHNxdWFyZUJvdW5kcy53aWR0aCArIGJvdW5kcy5sZWZ0LFxuICAgIChhc1doaXRlID8gOCA6IC0xKSAqIHNxdWFyZUJvdW5kcy5oZWlnaHQgKyBib3VuZHMudG9wXG4gIF07XG5cbiAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnOiBrZXksXG4gICAgb3JpZ1BvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlLFxuICAgIHJlbDogcmVsLFxuICAgIGVwb3M6IHBvc2l0aW9uLFxuICAgIHBvczogW3Bvc2l0aW9uWzBdIC0gcmVsWzBdLCBwb3NpdGlvblsxXSAtIHJlbFsxXV0sXG4gICAgZGVjOiBbLXNxdWFyZUJvdW5kcy53aWR0aCAvIDIsIC1zcXVhcmVCb3VuZHMuaGVpZ2h0IC8gMl0sXG4gICAgc3RhcnRlZDogdHJ1ZSxcbiAgICBlbGVtZW50OiAoKSA9PiBwaWVjZUVsZW1lbnRCeUtleShzLCBrZXkpLFxuICAgIG9yaWdpblRhcmdldDogZS50YXJnZXQsXG4gICAgbmV3UGllY2U6IHRydWUsXG4gICAgZm9yY2U6IGZvcmNlIHx8IGZhbHNlXG4gIH07XG4gIHByb2Nlc3NEcmFnKHMpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhZyhzOiBTdGF0ZSk6IHZvaWQge1xuICB1dGlsLnJhZigoKSA9PiB7XG4gICAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgICBpZiAoIWN1cikgcmV0dXJuO1xuICAgIC8vIGNhbmNlbCBhbmltYXRpb25zIHdoaWxlIGRyYWdnaW5nXG4gICAgaWYgKHMuYW5pbWF0aW9uLmN1cnJlbnQgJiYgcy5hbmltYXRpb24uY3VycmVudC5wbGFuLmFuaW1zW2N1ci5vcmlnXSkgcy5hbmltYXRpb24uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAvLyBpZiBtb3ZpbmcgcGllY2UgaXMgZ29uZSwgY2FuY2VsXG4gICAgY29uc3Qgb3JpZ1BpZWNlID0gcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIGlmICghb3JpZ1BpZWNlIHx8ICF1dGlsLnNhbWVQaWVjZShvcmlnUGllY2UsIGN1ci5waWVjZSkpIGNhbmNlbChzKTtcbiAgICBlbHNlIHtcbiAgICAgIGlmICghY3VyLnN0YXJ0ZWQgJiYgdXRpbC5kaXN0YW5jZVNxKGN1ci5lcG9zLCBjdXIucmVsKSA+PSBNYXRoLnBvdyhzLmRyYWdnYWJsZS5kaXN0YW5jZSwgMikpIGN1ci5zdGFydGVkID0gdHJ1ZTtcbiAgICAgIGlmIChjdXIuc3RhcnRlZCkge1xuXG4gICAgICAgIC8vIHN1cHBvcnQgbGF6eSBlbGVtZW50c1xuICAgICAgICBpZiAodHlwZW9mIGN1ci5lbGVtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc3QgZm91bmQgPSBjdXIuZWxlbWVudCgpO1xuICAgICAgICAgIGlmICghZm91bmQpIHJldHVybjtcbiAgICAgICAgICBjdXIuZWxlbWVudCA9IGZvdW5kO1xuICAgICAgICAgIGN1ci5lbGVtZW50LmNnRHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgIGN1ci5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhc1doaXRlID0gcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJyxcbiAgICAgICAgYm91bmRzID0gcy5kb20uYm91bmRzKCk7XG4gICAgICAgIGN1ci5wb3MgPSBbXG4gICAgICAgICAgY3VyLmVwb3NbMF0gLSBjdXIucmVsWzBdLFxuICAgICAgICAgIGN1ci5lcG9zWzFdIC0gY3VyLnJlbFsxXVxuICAgICAgICBdO1xuICAgICAgICBjdXIub3ZlciA9IGJvYXJkLmdldEtleUF0RG9tUG9zKGN1ci5lcG9zLCBhc1doaXRlLCBib3VuZHMpO1xuXG4gICAgICAgIC8vIG1vdmUgcGllY2VcbiAgICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSB1dGlsLnBvc1RvVHJhbnNsYXRlQWJzKGJvdW5kcykoY3VyLm9yaWdQb3MsIGFzV2hpdGUpO1xuICAgICAgICB0cmFuc2xhdGlvblswXSArPSBjdXIucG9zWzBdICsgY3VyLmRlY1swXTtcbiAgICAgICAgdHJhbnNsYXRpb25bMV0gKz0gY3VyLnBvc1sxXSArIGN1ci5kZWNbMV07XG4gICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKGN1ci5lbGVtZW50LCB0cmFuc2xhdGlvbik7XG5cbiAgICAgICAgLy8gbW92ZSBvdmVyIGVsZW1lbnRcbiAgICAgICAgY29uc3Qgb3ZlckVsID0gcy5kb20uZWxlbWVudHMub3ZlcjtcbiAgICAgICAgaWYgKG92ZXJFbCAmJiBjdXIub3ZlciAmJiBjdXIub3ZlciAhPT0gY3VyLm92ZXJQcmV2KSB7XG4gICAgICAgICAgY29uc3QgZGVzdHMgPSBzLm1vdmFibGUuZGVzdHM7XG4gICAgICAgICAgaWYgKHMubW92YWJsZS5mcmVlIHx8XG4gICAgICAgICAgICB1dGlsLmNvbnRhaW5zWChkZXN0cyAmJiBkZXN0c1tjdXIub3JpZ10sIGN1ci5vdmVyKSB8fFxuICAgICAgICAgICAgdXRpbC5jb250YWluc1gocy5wcmVtb3ZhYmxlLmRlc3RzLCBjdXIub3ZlcikpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IHV0aWwua2V5MnBvcyhjdXIub3ZlciksXG4gICAgICAgICAgICB2ZWN0b3I6IGNnLk51bWJlclBhaXIgPSBbXG4gICAgICAgICAgICAgIChhc1doaXRlID8gcG9zWzBdIC0gMSA6IDggLSBwb3NbMF0pICogYm91bmRzLndpZHRoIC8gOCxcbiAgICAgICAgICAgICAgKGFzV2hpdGUgPyA4IC0gcG9zWzFdIDogcG9zWzFdIC0gMSkgKiBib3VuZHMuaGVpZ2h0IC8gOFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHV0aWwudHJhbnNsYXRlQWJzKG92ZXJFbCwgdmVjdG9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXRpbC50cmFuc2xhdGVBd2F5KG92ZXJFbCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGN1ci5vdmVyUHJldiA9IGN1ci5vdmVyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgLy8gc3VwcG9ydCBvbmUgZmluZ2VyIHRvdWNoIG9ubHlcbiAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQgJiYgKCFlLnRvdWNoZXMgfHwgZS50b3VjaGVzLmxlbmd0aCA8IDIpKSB7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudC5lcG9zID0gdXRpbC5ldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXI7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuZChzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICBpZiAoIWN1cikgcmV0dXJuO1xuICAvLyBjb21wYXJpbmcgd2l0aCB0aGUgb3JpZ2luIHRhcmdldCBpcyBhbiBlYXN5IHdheSB0byB0ZXN0IHRoYXQgdGhlIGVuZCBldmVudFxuICAvLyBoYXMgdGhlIHNhbWUgdG91Y2ggb3JpZ2luXG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaGVuZCcgJiYgY3VyICYmIGN1ci5vcmlnaW5UYXJnZXQgIT09IGUudGFyZ2V0ICYmICFjdXIubmV3UGllY2UpIHtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybjtcbiAgfVxuICBib2FyZC51bnNldFByZW1vdmUocyk7XG4gIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uOyBzbyB1c2UgdGhlIGxhc3QgdG91Y2htb3ZlIHBvc2l0aW9uIGluc3RlYWRcbiAgY29uc3QgZXZlbnRQb3M6IGNnLk51bWJlclBhaXIgPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgfHwgY3VyLmVwb3M7XG4gIGNvbnN0IGRlc3QgPSBib2FyZC5nZXRLZXlBdERvbVBvcyhldmVudFBvcywgcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJywgcy5kb20uYm91bmRzKCkpO1xuICBpZiAoZGVzdCAmJiBjdXIuc3RhcnRlZCkge1xuICAgIGlmIChjdXIubmV3UGllY2UpIGJvYXJkLmRyb3BOZXdQaWVjZShzLCBjdXIub3JpZywgZGVzdCwgY3VyLmZvcmNlKTtcbiAgICBlbHNlIHtcbiAgICAgIHMuc3RhdHMuY3RybEtleSA9IGUuY3RybEtleTtcbiAgICAgIGlmIChib2FyZC51c2VyTW92ZShzLCBjdXIub3JpZywgZGVzdCkpIHMuc3RhdHMuZHJhZ2dlZCA9IHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGN1ci5uZXdQaWVjZSkge1xuICAgIGRlbGV0ZSBzLnBpZWNlc1tjdXIub3JpZ107XG4gIH0gZWxzZSBpZiAocy5kcmFnZ2FibGUuZGVsZXRlT25Ecm9wT2ZmKSB7XG4gICAgZGVsZXRlIHMucGllY2VzW2N1ci5vcmlnXTtcbiAgICBib2FyZC5jYWxsVXNlckZ1bmN0aW9uKHMuZXZlbnRzLmNoYW5nZSk7XG4gIH1cbiAgaWYgKGN1ciAmJiBjdXIub3JpZyA9PT0gY3VyLnByZXZpb3VzbHlTZWxlY3RlZCAmJiAoY3VyLm9yaWcgPT09IGRlc3QgfHwgIWRlc3QpKVxuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICBlbHNlIGlmICghcy5zZWxlY3RhYmxlLmVuYWJsZWQpIGJvYXJkLnVuc2VsZWN0KHMpO1xuXG4gIHJlbW92ZURyYWdFbGVtZW50cyhzKTtcblxuICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChzOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzLmRyYWdnYWJsZS5jdXJyZW50O1xuICBpZiAoY3VyKSB7XG4gICAgaWYgKGN1ci5uZXdQaWVjZSkgZGVsZXRlIHMucGllY2VzW2N1ci5vcmlnXTtcbiAgICBzLmRyYWdnYWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGJvYXJkLnVuc2VsZWN0KHMpO1xuICAgIHJlbW92ZURyYWdFbGVtZW50cyhzKTtcbiAgICBzLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVEcmFnRWxlbWVudHMoczogU3RhdGUpIHtcbiAgY29uc3QgZSA9IHMuZG9tLmVsZW1lbnRzO1xuICBpZiAoZS5vdmVyKSB1dGlsLnRyYW5zbGF0ZUF3YXkoZS5vdmVyKTtcbiAgaWYgKGUuZ2hvc3QpIHV0aWwudHJhbnNsYXRlQXdheShlLmdob3N0KTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUJvdW5kcyhrZXk6IGNnLktleSwgYXNXaGl0ZTogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KSB7XG4gIGNvbnN0IHBvcyA9IHV0aWwua2V5MnBvcyhrZXkpO1xuICBpZiAoIWFzV2hpdGUpIHtcbiAgICBwb3NbMF0gPSA5IC0gcG9zWzBdO1xuICAgIHBvc1sxXSA9IDkgLSBwb3NbMV07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBsZWZ0OiBib3VuZHMubGVmdCArIGJvdW5kcy53aWR0aCAqIChwb3NbMF0gLSAxKSAvIDgsXG4gICAgdG9wOiBib3VuZHMudG9wICsgYm91bmRzLmhlaWdodCAqICg4IC0gcG9zWzFdKSAvIDgsXG4gICAgd2lkdGg6IGJvdW5kcy53aWR0aCAvIDgsXG4gICAgaGVpZ2h0OiBib3VuZHMuaGVpZ2h0IC8gOFxuICB9O1xufVxuXG5mdW5jdGlvbiBwaWVjZUVsZW1lbnRCeUtleShzOiBTdGF0ZSwga2V5OiBjZy5LZXkpOiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQge1xuICBsZXQgZWwgPSBzLmRvbS5lbGVtZW50cy5ib2FyZC5maXJzdENoaWxkIGFzIGNnLlBpZWNlTm9kZTtcbiAgd2hpbGUgKGVsKSB7XG4gICAgaWYgKGVsLmNnS2V5ID09PSBrZXkgJiYgZWwudGFnTmFtZSA9PT0gJ1BJRUNFJykgcmV0dXJuIGVsO1xuICAgIGVsID0gZWwubmV4dFNpYmxpbmcgYXMgY2cuUGllY2VOb2RlO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBjYW5jZWxNb3ZlLCBnZXRLZXlBdERvbVBvcyB9IGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyBldmVudFBvc2l0aW9uLCByYWYsIGlzUmlnaHRCdXR0b24gfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdTaGFwZSB7XG4gIG9yaWc6IGNnLktleTtcbiAgZGVzdD86IGNnLktleTtcbiAgYnJ1c2g6IHN0cmluZztcbiAgbW9kaWZpZXJzPzogRHJhd01vZGlmaWVycztcbiAgcGllY2U/OiBEcmF3U2hhcGVQaWVjZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGVQaWVjZSB7XG4gIHJvbGU6IGNnLlJvbGU7XG4gIGNvbG9yOiBjZy5Db2xvcjtcbiAgc2NhbGU/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0JydXNoIHtcbiAga2V5OiBzdHJpbmc7XG4gIGNvbG9yOiBzdHJpbmc7XG4gIG9wYWNpdHk6IG51bWJlcjtcbiAgbGluZVdpZHRoOiBudW1iZXJcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3QnJ1c2hlcyB7XG4gIFtuYW1lOiBzdHJpbmddOiBEcmF3QnJ1c2g7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd01vZGlmaWVycyB7XG4gIGxpbmVXaWR0aD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3YWJsZSB7XG4gIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGNhbiBkcmF3XG4gIHZpc2libGU6IGJvb2xlYW47IC8vIGNhbiB2aWV3XG4gIGVyYXNlT25DbGljazogYm9vbGVhbjtcbiAgb25DaGFuZ2U/OiAoc2hhcGVzOiBEcmF3U2hhcGVbXSkgPT4gdm9pZDtcbiAgc2hhcGVzOiBEcmF3U2hhcGVbXTsgLy8gdXNlciBzaGFwZXNcbiAgYXV0b1NoYXBlczogRHJhd1NoYXBlW107IC8vIGNvbXB1dGVyIHNoYXBlc1xuICBjdXJyZW50PzogRHJhd0N1cnJlbnQ7XG4gIGJydXNoZXM6IERyYXdCcnVzaGVzO1xuICAvLyBkcmF3YWJsZSBTVkcgcGllY2VzOyB1c2VkIGZvciBjcmF6eWhvdXNlIGRyb3BcbiAgcGllY2VzOiB7XG4gICAgYmFzZVVybDogc3RyaW5nXG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBEcmF3Q3VycmVudCB7XG4gIG9yaWc6IGNnLktleTsgLy8gb3JpZyBrZXkgb2YgZHJhd2luZ1xuICBkZXN0PzogY2cuS2V5OyAvLyBzcXVhcmUgYmVpbmcgbW91c2VkIG92ZXIsIGlmICE9IG9yaWdcbiAgZGVzdFByZXY/OiBjZy5LZXk7IC8vIHNxdWFyZSBwcmV2aW91c2x5IG1vdXNlZCBvdmVyXG4gIHBvczogY2cuTnVtYmVyUGFpcjsgLy8gcmVsYXRpdmUgY3VycmVudCBwb3NpdGlvblxuICBicnVzaDogc3RyaW5nOyAvLyBicnVzaCBuYW1lIGZvciBzaGFwZVxufVxuXG5jb25zdCBicnVzaGVzID0gWydncmVlbicsICdyZWQnLCAnYmx1ZScsICd5ZWxsb3cnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47IC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgY2FuY2VsTW92ZShzdGF0ZSk7XG4gIGNvbnN0IHBvc2l0aW9uID0gZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyO1xuICBjb25zdCBvcmlnID0gZ2V0S2V5QXREb21Qb3MocG9zaXRpb24sIHN0YXRlLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnOiBvcmlnLFxuICAgIGRlc3Q6IG9yaWcsIC8vIHdpbGwgaW1tZWRpYXRlbHkgYmUgc2V0IHRvIHVuZGVmaW5lZCBieSBwcm9jZXNzRHJhdywgdHJpZ2dlcmluZyByZWRyYXdcbiAgICBwb3M6IHBvc2l0aW9uLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUpXG4gIH07XG4gIHByb2Nlc3NEcmF3KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NEcmF3KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICByYWYoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gICAgaWYgKGN1cikge1xuICAgICAgY29uc3QgZGVzdCA9IGdldEtleUF0RG9tUG9zKGN1ci5wb3MsIHN0YXRlLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgICAgY29uc3QgbmV3RGVzdCA9IChjdXIub3JpZyA9PT0gZGVzdCkgPyB1bmRlZmluZWQgOiBkZXN0O1xuICAgICAgaWYgKG5ld0Rlc3QgIT09IGN1ci5kZXN0KSB7XG4gICAgICAgIGN1ci5kZXN0ID0gbmV3RGVzdDtcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICAgICAgfVxuICAgICAgcHJvY2Vzc0RyYXcoc3RhdGUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlKHN0YXRlOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuY3VycmVudCkgc3RhdGUuZHJhd2FibGUuY3VycmVudC5wb3MgPSBldmVudFBvc2l0aW9uKGUpIGFzIGNnLk51bWJlclBhaXI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gIGlmICghY3VyKSByZXR1cm47XG4gIGlmIChjdXIuZGVzdCAmJiBjdXIuZGVzdCAhPT0gY3VyLm9yaWcpIGFkZExpbmUoc3RhdGUuZHJhd2FibGUsIGN1ciwgY3VyLmRlc3QpO1xuICBlbHNlIGFkZENpcmNsZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgY2FuY2VsKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbChzdGF0ZTogU3RhdGUpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHtcbiAgICBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXIoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5zaGFwZXMubGVuZ3RoKSB7XG4gICAgc3RhdGUuZHJhd2FibGUuc2hhcGVzID0gW107XG4gICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgIG9uQ2hhbmdlKHN0YXRlLmRyYXdhYmxlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudEJydXNoKGU6IGNnLk1vdWNoRXZlbnQpOiBzdHJpbmcge1xuICBjb25zdCBhOiBudW1iZXIgPSBlLnNoaWZ0S2V5ICYmIGlzUmlnaHRCdXR0b24oZSkgPyAxIDogMDtcbiAgY29uc3QgYjogbnVtYmVyID0gZS5hbHRLZXkgPyAyIDogMDtcbiAgcmV0dXJuIGJydXNoZXNbYSArIGJdO1xufVxuXG5mdW5jdGlvbiBub3Q8QT4oZjogKGE6IEEpID0+IGJvb2xlYW4pOiAoYTogQSkgPT4gYm9vbGVhbiB7XG4gIHJldHVybiAoeDogQSkgPT4gIWYoeCk7XG59XG5cbmZ1bmN0aW9uIGFkZENpcmNsZShkcmF3YWJsZTogRHJhd2FibGUsIGN1cjogRHJhd0N1cnJlbnQpOiB2b2lkIHtcbiAgY29uc3Qgb3JpZyA9IGN1ci5vcmlnO1xuICBjb25zdCBzYW1lQ2lyY2xlID0gKHM6IERyYXdTaGFwZSkgPT4gcy5vcmlnID09PSBvcmlnICYmICFzLmRlc3Q7XG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHNhbWVDaXJjbGUpWzBdO1xuICBpZiAoc2ltaWxhcikgZHJhd2FibGUuc2hhcGVzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcihub3Qoc2FtZUNpcmNsZSkpO1xuICBpZiAoIXNpbWlsYXIgfHwgc2ltaWxhci5icnVzaCAhPT0gY3VyLmJydXNoKSBkcmF3YWJsZS5zaGFwZXMucHVzaCh7XG4gICAgYnJ1c2g6IGN1ci5icnVzaCxcbiAgICBvcmlnOiBvcmlnXG4gIH0pO1xuICBvbkNoYW5nZShkcmF3YWJsZSk7XG59XG5cbmZ1bmN0aW9uIGFkZExpbmUoZHJhd2FibGU6IERyYXdhYmxlLCBjdXI6IERyYXdDdXJyZW50LCBkZXN0OiBjZy5LZXkpOiB2b2lkIHtcbiAgY29uc3Qgb3JpZyA9IGN1ci5vcmlnO1xuICBjb25zdCBzYW1lTGluZSA9IChzOiBEcmF3U2hhcGUpID0+IHtcbiAgICByZXR1cm4gISFzLmRlc3QgJiYgcy5vcmlnID09PSBvcmlnICYmIHMuZGVzdCA9PT0gZGVzdDtcbiAgfTtcbiAgY29uc3QgZXhpc3RzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcihzYW1lTGluZSkubGVuZ3RoID4gMDtcbiAgaWYgKGV4aXN0cykgZHJhd2FibGUuc2hhcGVzID0gZHJhd2FibGUuc2hhcGVzLmZpbHRlcihub3Qoc2FtZUxpbmUpKTtcbiAgZWxzZSBkcmF3YWJsZS5zaGFwZXMucHVzaCh7XG4gICAgYnJ1c2g6IGN1ci5icnVzaCxcbiAgICBvcmlnOiBvcmlnLFxuICAgIGRlc3Q6IGRlc3RcbiAgfSk7XG4gIG9uQ2hhbmdlKGRyYXdhYmxlKTtcbn1cblxuZnVuY3Rpb24gb25DaGFuZ2UoZHJhd2FibGU6IERyYXdhYmxlKTogdm9pZCB7XG4gIGlmIChkcmF3YWJsZS5vbkNoYW5nZSkgZHJhd2FibGUub25DaGFuZ2UoZHJhd2FibGUuc2hhcGVzKTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGRyYWcgZnJvbSAnLi9kcmFnJ1xuaW1wb3J0ICogYXMgZHJhdyBmcm9tICcuL2RyYXcnXG5pbXBvcnQgeyBpc1JpZ2h0QnV0dG9uLCByYWYgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG50eXBlIE1vdWNoQmluZCA9IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xudHlwZSBTdGF0ZU1vdWNoQmluZCA9IChkOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCkgPT4gdm9pZDtcblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmRCb2FyZChzOiBTdGF0ZSk6IHZvaWQge1xuXG4gIGlmIChzLnZpZXdPbmx5KSByZXR1cm47XG5cbiAgY29uc3QgYm9hcmRFbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLFxuICBvblN0YXJ0ID0gc3RhcnREcmFnT3JEcmF3KHMpO1xuXG4gIC8vIG11c3QgTk9UIGJlIGEgcGFzc2l2ZSBldmVudCFcbiAgYm9hcmRFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCk7XG4gIGJvYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25TdGFydCk7XG5cbiAgaWYgKHMuZGlzYWJsZUNvbnRleHRNZW51IHx8IHMuZHJhd2FibGUuZW5hYmxlZCkge1xuICAgIGJvYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBlID0+IGUucHJldmVudERlZmF1bHQoKSk7XG4gIH1cbn1cblxuLy8gcmV0dXJucyB0aGUgdW5iaW5kIGZ1bmN0aW9uXG5leHBvcnQgZnVuY3Rpb24gYmluZERvY3VtZW50KHM6IFN0YXRlLCByZWRyYXdBbGw6IGNnLlJlZHJhdyk6IGNnLlVuYmluZCB7XG5cbiAgaWYgKHMudmlld09ubHkpIHJldHVybiAoKSA9PiB7fTtcblxuICBjb25zdCBvbm1vdmU6IE1vdWNoQmluZCA9IGRyYWdPckRyYXcocywgZHJhZy5tb3ZlLCBkcmF3Lm1vdmUpO1xuICBjb25zdCBvbmVuZDogTW91Y2hCaW5kID0gZHJhZ09yRHJhdyhzLCBkcmFnLmVuZCwgZHJhdy5lbmQpO1xuXG4gIGNvbnN0IHVuYmluZHM6IGNnLlVuYmluZFtdID0gW107XG5cbiAgWyd0b3VjaG1vdmUnLCAnbW91c2Vtb3ZlJ10uZm9yRWFjaChldiA9PiB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9ubW92ZSkpKTtcbiAgWyd0b3VjaGVuZCcsICdtb3VzZXVwJ10uZm9yRWFjaChldiA9PiB1bmJpbmRzLnB1c2godW5iaW5kYWJsZShkb2N1bWVudCwgZXYsIG9uZW5kKSkpO1xuXG4gIGNvbnN0IG9uUmVzaXplID0gKCkgPT4ge1xuICAgIHMuZG9tLmJvdW5kcy5jbGVhcigpO1xuICAgIHJhZihyZWRyYXdBbGwpO1xuICB9O1xuICBpZiAocy5yZXNpemFibGUpIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LmJvZHksICdjaGVzc2dyb3VuZC5yZXNpemUnLCBvblJlc2l6ZSkpO1xuXG4gIGNvbnN0IG9uU2Nyb2xsID0gKCkgPT4gcy5kb20uYm91bmRzLmNsZWFyKCk7XG4gIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKHdpbmRvdywgJ3Njcm9sbCcsIG9uU2Nyb2xsLCB7IHBhc3NpdmU6IHRydWUgfSkpO1xuICB1bmJpbmRzLnB1c2godW5iaW5kYWJsZSh3aW5kb3csICdyZXNpemUnLCBvblNjcm9sbCwgeyBwYXNzaXZlOiB0cnVlIH0pKTtcblxuICByZXR1cm4gKCkgPT4gdW5iaW5kcy5mb3JFYWNoKGYgPT4gZigpKTtcbn1cblxuZnVuY3Rpb24gdW5iaW5kYWJsZShlbDogRXZlbnRUYXJnZXQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogTW91Y2hCaW5kLCBvcHRpb25zPzogYW55KTogY2cuVW5iaW5kIHtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrLCBvcHRpb25zKTtcbiAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0RHJhZ09yRHJhdyhzOiBTdGF0ZSk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAocy5kcmFnZ2FibGUuY3VycmVudCkgZHJhZy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAocy5kcmF3YWJsZS5jdXJyZW50KSBkcmF3LmNhbmNlbChzKTtcbiAgICBlbHNlIGlmIChlLnNoaWZ0S2V5IHx8IGlzUmlnaHRCdXR0b24oZSkpIHsgaWYgKHMuZHJhd2FibGUuZW5hYmxlZCkgZHJhdy5zdGFydChzLCBlKTsgfVxuICAgIGVsc2UgaWYgKCFzLnZpZXdPbmx5KSBkcmFnLnN0YXJ0KHMsIGUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkcmFnT3JEcmF3KHM6IFN0YXRlLCB3aXRoRHJhZzogU3RhdGVNb3VjaEJpbmQsIHdpdGhEcmF3OiBTdGF0ZU1vdWNoQmluZCk6IE1vdWNoQmluZCB7XG4gIHJldHVybiBlID0+IHtcbiAgICBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpKSB7IGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIHdpdGhEcmF3KHMsIGUpOyB9XG4gICAgZWxzZSBpZiAoIXMudmlld09ubHkpIHdpdGhEcmFnKHMsIGUpO1xuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsgS2V5IH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXhwbG9zaW9uKHN0YXRlOiBTdGF0ZSwga2V5czogS2V5W10pOiB2b2lkIHtcbiAgc3RhdGUuZXhwbG9kaW5nID0ge1xuICAgIHN0YWdlOiAxLFxuICAgIGtleXM6IGtleXNcbiAgfTtcbiAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBzZXRTdGFnZShzdGF0ZSwgMik7XG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRTdGFnZShzdGF0ZSwgdW5kZWZpbmVkKSwgMTIwKTtcbiAgfSwgMTIwKTtcbn1cblxuZnVuY3Rpb24gc2V0U3RhZ2Uoc3RhdGU6IFN0YXRlLCBzdGFnZTogbnVtYmVyIHwgdW5kZWZpbmVkKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5leHBsb2RpbmcpIHtcbiAgICBpZiAoc3RhZ2UpIHN0YXRlLmV4cGxvZGluZy5zdGFnZSA9IHN0YWdlO1xuICAgIGVsc2Ugc3RhdGUuZXhwbG9kaW5nID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgcG9zMmtleSwgaW52UmFua3MgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbDogY2cuRkVOID0gJ3JuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlInO1xuXG5jb25zdCByb2xlczogeyBbbGV0dGVyOiBzdHJpbmddOiBjZy5Sb2xlIH0gPSB7IHA6ICdwYXduJywgcjogJ3Jvb2snLCBuOiAna25pZ2h0JywgYjogJ2Jpc2hvcCcsIHE6ICdxdWVlbicsIGs6ICdraW5nJyB9O1xuXG5jb25zdCBsZXR0ZXJzID0geyBwYXduOiAncCcsIHJvb2s6ICdyJywga25pZ2h0OiAnbicsIGJpc2hvcDogJ2InLCBxdWVlbjogJ3EnLCBraW5nOiAnaycgfTtcblxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZChmZW46IGNnLkZFTik6IGNnLlBpZWNlcyB7XG4gIGlmIChmZW4gPT09ICdzdGFydCcpIGZlbiA9IGluaXRpYWw7XG4gIGNvbnN0IHBpZWNlczogY2cuUGllY2VzID0ge307XG4gIGxldCByb3c6IG51bWJlciA9IDg7XG4gIGxldCBjb2w6IG51bWJlciA9IDA7XG4gIGZvciAoY29uc3QgYyBvZiBmZW4pIHtcbiAgICBzd2l0Y2ggKGMpIHtcbiAgICAgIGNhc2UgJyAnOiByZXR1cm4gcGllY2VzO1xuICAgICAgY2FzZSAnLyc6XG4gICAgICAgIC0tcm93O1xuICAgICAgICBpZiAocm93ID09PSAwKSByZXR1cm4gcGllY2VzO1xuICAgICAgICBjb2wgPSAwO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ34nOlxuICAgICAgICBwaWVjZXNbcG9zMmtleShbY29sLCByb3ddKV0ucHJvbW90ZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnN0IG5iID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAobmIgPCA1NykgY29sICs9IG5iIC0gNDg7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICsrY29sO1xuICAgICAgICAgIGNvbnN0IHJvbGUgPSBjLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgcGllY2VzW3BvczJrZXkoW2NvbCwgcm93XSldID0ge1xuICAgICAgICAgICAgcm9sZTogcm9sZXNbcm9sZV0sXG4gICAgICAgICAgICBjb2xvcjogKGMgPT09IHJvbGUgPyAnYmxhY2snIDogJ3doaXRlJykgYXMgY2cuQ29sb3JcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBwaWVjZXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZShwaWVjZXM6IGNnLlBpZWNlcyk6IGNnLkZFTiB7XG4gIGxldCBwaWVjZTogY2cuUGllY2UsIGxldHRlcjogc3RyaW5nO1xuICByZXR1cm4gaW52UmFua3MubWFwKHkgPT4gY2cucmFua3MubWFwKHggPT4ge1xuICAgICAgcGllY2UgPSBwaWVjZXNbcG9zMmtleShbeCwgeV0pXTtcbiAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICBsZXR0ZXIgPSBsZXR0ZXJzW3BpZWNlLnJvbGVdO1xuICAgICAgICByZXR1cm4gcGllY2UuY29sb3IgPT09ICd3aGl0ZScgPyBsZXR0ZXIudG9VcHBlckNhc2UoKSA6IGxldHRlcjtcbiAgICAgIH0gZWxzZSByZXR1cm4gJzEnO1xuICAgIH0pLmpvaW4oJycpXG4gICkuam9pbignLycpLnJlcGxhY2UoLzF7Mix9L2csIHMgPT4gcy5sZW5ndGgudG9TdHJpbmcoKSk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2NoZXNzZ3JvdW5kXCIpLkNoZXNzZ3JvdW5kO1xuIiwiaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG50eXBlIE1vYmlsaXR5ID0gKHgxOm51bWJlciwgeTE6bnVtYmVyLCB4MjpudW1iZXIsIHkyOm51bWJlcikgPT4gYm9vbGVhbjtcblxuZnVuY3Rpb24gZGlmZihhOiBudW1iZXIsIGI6bnVtYmVyKTpudW1iZXIge1xuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpO1xufVxuXG5mdW5jdGlvbiBwYXduKGNvbG9yOiBjZy5Db2xvcik6IE1vYmlsaXR5IHtcbiAgcmV0dXJuICh4MSwgeTEsIHgyLCB5MikgPT4gZGlmZih4MSwgeDIpIDwgMiAmJiAoXG4gICAgY29sb3IgPT09ICd3aGl0ZScgPyAoXG4gICAgICAvLyBhbGxvdyAyIHNxdWFyZXMgZnJvbSAxIGFuZCA4LCBmb3IgaG9yZGVcbiAgICAgIHkyID09PSB5MSArIDEgfHwgKHkxIDw9IDIgJiYgeTIgPT09ICh5MSArIDIpICYmIHgxID09PSB4MilcbiAgICApIDogKFxuICAgICAgeTIgPT09IHkxIC0gMSB8fCAoeTEgPj0gNyAmJiB5MiA9PT0gKHkxIC0gMikgJiYgeDEgPT09IHgyKVxuICAgIClcbiAgKTtcbn1cblxuY29uc3Qga25pZ2h0OiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICBjb25zdCB4ZCA9IGRpZmYoeDEsIHgyKTtcbiAgY29uc3QgeWQgPSBkaWZmKHkxLCB5Mik7XG4gIHJldHVybiAoeGQgPT09IDEgJiYgeWQgPT09IDIpIHx8ICh4ZCA9PT0gMiAmJiB5ZCA9PT0gMSk7XG59XG5cbmNvbnN0IGJpc2hvcDogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgcmV0dXJuIGRpZmYoeDEsIHgyKSA9PT0gZGlmZih5MSwgeTIpO1xufVxuXG5jb25zdCByb29rOiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICByZXR1cm4geDEgPT09IHgyIHx8IHkxID09PSB5Mjtcbn1cblxuY29uc3QgcXVlZW46IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIHJldHVybiBiaXNob3AoeDEsIHkxLCB4MiwgeTIpIHx8IHJvb2soeDEsIHkxLCB4MiwgeTIpO1xufVxuXG5mdW5jdGlvbiBraW5nKGNvbG9yOiBjZy5Db2xvciwgcm9va0ZpbGVzOiBudW1iZXJbXSwgY2FuQ2FzdGxlOiBib29sZWFuKTogTW9iaWxpdHkge1xuICByZXR1cm4gKHgxLCB5MSwgeDIsIHkyKSAgPT4gKFxuICAgIGRpZmYoeDEsIHgyKSA8IDIgJiYgZGlmZih5MSwgeTIpIDwgMlxuICApIHx8IChcbiAgICBjYW5DYXN0bGUgJiYgeTEgPT09IHkyICYmIHkxID09PSAoY29sb3IgPT09ICd3aGl0ZScgPyAxIDogOCkgJiYgKFxuICAgICAgKHgxID09PSA1ICYmICh4MiA9PT0gMyB8fCB4MiA9PT0gNykpIHx8IHV0aWwuY29udGFpbnNYKHJvb2tGaWxlcywgeDIpXG4gICAgKVxuICApO1xufVxuXG5mdW5jdGlvbiByb29rRmlsZXNPZihwaWVjZXM6IGNnLlBpZWNlcywgY29sb3I6IGNnLkNvbG9yKSB7XG4gIGxldCBwaWVjZTogY2cuUGllY2U7XG4gIHJldHVybiBPYmplY3Qua2V5cyhwaWVjZXMpLmZpbHRlcihrZXkgPT4ge1xuICAgIHBpZWNlID0gcGllY2VzW2tleV07XG4gICAgcmV0dXJuIHBpZWNlICYmIHBpZWNlLmNvbG9yID09PSBjb2xvciAmJiBwaWVjZS5yb2xlID09PSAncm9vayc7XG4gIH0pLm1hcCgoa2V5OiBjZy5LZXkpID0+IHV0aWwua2V5MnBvcyhrZXkpWzBdKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJlbW92ZShwaWVjZXM6IGNnLlBpZWNlcywga2V5OiBjZy5LZXksIGNhbkNhc3RsZTogYm9vbGVhbik6IGNnLktleVtdIHtcbiAgY29uc3QgcGllY2UgPSBwaWVjZXNba2V5XSxcbiAgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gIGxldCBtb2JpbGl0eTogTW9iaWxpdHk7XG4gIHN3aXRjaCAocGllY2Uucm9sZSkge1xuICAgIGNhc2UgJ3Bhd24nOlxuICAgICAgbW9iaWxpdHkgPSBwYXduKHBpZWNlLmNvbG9yKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2tuaWdodCc6XG4gICAgICBtb2JpbGl0eSA9IGtuaWdodDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Jpc2hvcCc6XG4gICAgICBtb2JpbGl0eSA9IGJpc2hvcDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Jvb2snOlxuICAgICAgbW9iaWxpdHkgPSByb29rO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncXVlZW4nOlxuICAgICAgbW9iaWxpdHkgPSBxdWVlbjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2tpbmcnOlxuICAgICAgbW9iaWxpdHkgPSBraW5nKHBpZWNlLmNvbG9yLCByb29rRmlsZXNPZihwaWVjZXMsIHBpZWNlLmNvbG9yKSwgY2FuQ2FzdGxlKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiB1dGlsLmFsbEtleXMubWFwKHV0aWwua2V5MnBvcykuZmlsdGVyKHBvczIgPT4ge1xuICAgIHJldHVybiAocG9zWzBdICE9PSBwb3MyWzBdIHx8IHBvc1sxXSAhPT0gcG9zMlsxXSkgJiYgbW9iaWxpdHkocG9zWzBdLCBwb3NbMV0sIHBvczJbMF0sIHBvczJbMV0pO1xuICB9KS5tYXAodXRpbC5wb3Mya2V5KTtcbn07XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBrZXkycG9zLCBjcmVhdGVFbCB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgQW5pbUN1cnJlbnQsIEFuaW1WZWN0b3JzLCBBbmltVmVjdG9yLCBBbmltRmFkaW5ncyB9IGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuLy8gYCRjb2xvciAkcm9sZWBcbnR5cGUgUGllY2VOYW1lID0gc3RyaW5nO1xuXG5pbnRlcmZhY2UgU2FtZVBpZWNlcyB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfVxuaW50ZXJmYWNlIFNhbWVTcXVhcmVzIHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9XG5pbnRlcmZhY2UgTW92ZWRQaWVjZXMgeyBbcGllY2VOYW1lOiBzdHJpbmddOiBjZy5QaWVjZU5vZGVbXSB9XG5pbnRlcmZhY2UgTW92ZWRTcXVhcmVzIHsgW2NsYXNzTmFtZTogc3RyaW5nXTogY2cuU3F1YXJlTm9kZVtdIH1cbmludGVyZmFjZSBTcXVhcmVDbGFzc2VzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH1cblxuLy8gcG9ydGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3ZlbG9jZS9saWNob2JpbGUvYmxvYi9tYXN0ZXIvc3JjL2pzL2NoZXNzZ3JvdW5kL3ZpZXcuanNcbi8vIGluIGNhc2Ugb2YgYnVncywgYmxhbWUgQHZlbG9jZVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGFzV2hpdGU6IGJvb2xlYW4gPSBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLFxuICBwb3NUb1RyYW5zbGF0ZSA9IHMudmlld09ubHkgPyB1dGlsLnBvc1RvVHJhbnNsYXRlUmVsIDogdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhzLmRvbS5ib3VuZHMoKSksXG4gIHRyYW5zbGF0ZSA9IHMudmlld09ubHkgPyB1dGlsLnRyYW5zbGF0ZVJlbCA6IHV0aWwudHJhbnNsYXRlQWJzLFxuICBib2FyZEVsOiBIVE1MRWxlbWVudCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLFxuICBwaWVjZXM6IGNnLlBpZWNlcyA9IHMucGllY2VzLFxuICBjdXJBbmltOiBBbmltQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuYW5pbWF0aW9uLmN1cnJlbnQsXG4gIGFuaW1zOiBBbmltVmVjdG9ycyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uYW5pbXMgOiB7fSxcbiAgZmFkaW5nczogQW5pbUZhZGluZ3MgPSBjdXJBbmltID8gY3VyQW5pbS5wbGFuLmZhZGluZ3MgOiB7fSxcbiAgY3VyRHJhZzogRHJhZ0N1cnJlbnQgfCB1bmRlZmluZWQgPSBzLmRyYWdnYWJsZS5jdXJyZW50LFxuICBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0gY29tcHV0ZVNxdWFyZUNsYXNzZXMocyksXG4gIHNhbWVQaWVjZXM6IFNhbWVQaWVjZXMgPSB7fSxcbiAgc2FtZVNxdWFyZXM6IFNhbWVTcXVhcmVzID0ge30sXG4gIG1vdmVkUGllY2VzOiBNb3ZlZFBpZWNlcyA9IHt9LFxuICBtb3ZlZFNxdWFyZXM6IE1vdmVkU3F1YXJlcyA9IHt9LFxuICBwaWVjZXNLZXlzOiBjZy5LZXlbXSA9IE9iamVjdC5rZXlzKHBpZWNlcykgYXMgY2cuS2V5W107XG4gIGxldCBrOiBjZy5LZXksXG4gIHA6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLFxuICBlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSxcbiAgcGllY2VBdEtleTogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIGVsUGllY2VOYW1lOiBQaWVjZU5hbWUsXG4gIGFuaW06IEFuaW1WZWN0b3IgfCB1bmRlZmluZWQsXG4gIGZhZGluZzogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIHBNdmRzZXQ6IGNnLlBpZWNlTm9kZVtdLFxuICBwTXZkOiBjZy5QaWVjZU5vZGUgfCB1bmRlZmluZWQsXG4gIHNNdmRzZXQ6IGNnLlNxdWFyZU5vZGVbXSxcbiAgc012ZDogY2cuU3F1YXJlTm9kZSB8IHVuZGVmaW5lZDtcblxuICAvLyB3YWxrIG92ZXIgYWxsIGJvYXJkIGRvbSBlbGVtZW50cywgYXBwbHkgYW5pbWF0aW9ucyBhbmQgZmxhZyBtb3ZlZCBwaWVjZXNcbiAgZWwgPSBib2FyZEVsLmZpcnN0Q2hpbGQgYXMgY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZTtcbiAgd2hpbGUgKGVsKSB7XG4gICAgayA9IGVsLmNnS2V5O1xuICAgIGlmIChpc1BpZWNlTm9kZShlbCkpIHtcbiAgICAgIHBpZWNlQXRLZXkgPSBwaWVjZXNba107XG4gICAgICBhbmltID0gYW5pbXNba107XG4gICAgICBmYWRpbmcgPSBmYWRpbmdzW2tdO1xuICAgICAgZWxQaWVjZU5hbWUgPSBlbC5jZ1BpZWNlO1xuICAgICAgLy8gaWYgcGllY2Ugbm90IGJlaW5nIGRyYWdnZWQgYW55bW9yZSwgcmVtb3ZlIGRyYWdnaW5nIHN0eWxlXG4gICAgICBpZiAoZWwuY2dEcmFnZ2luZyAmJiAoIWN1ckRyYWcgfHwgY3VyRHJhZy5vcmlnICE9PSBrKSkge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdkcmFnZ2luZycpO1xuICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzV2hpdGUpKTtcbiAgICAgICAgZWwuY2dEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgLy8gcmVtb3ZlIGZhZGluZyBjbGFzcyBpZiBpdCBzdGlsbCByZW1haW5zXG4gICAgICBpZiAoIWZhZGluZyAmJiBlbC5jZ0ZhZGluZykge1xuICAgICAgICBlbC5jZ0ZhZGluZyA9IGZhbHNlO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdmYWRpbmcnKTtcbiAgICAgIH1cbiAgICAgIC8vIHRoZXJlIGlzIG5vdyBhIHBpZWNlIGF0IHRoaXMgZG9tIGtleVxuICAgICAgaWYgKHBpZWNlQXRLZXkpIHtcbiAgICAgICAgLy8gY29udGludWUgYW5pbWF0aW9uIGlmIGFscmVhZHkgYW5pbWF0aW5nIGFuZCBzYW1lIHBpZWNlXG4gICAgICAgIC8vIChvdGhlcndpc2UgaXQgY291bGQgYW5pbWF0ZSBhIGNhcHR1cmVkIHBpZWNlKVxuICAgICAgICBpZiAoYW5pbSAmJiBlbC5jZ0FuaW1hdGluZyAmJiBlbFBpZWNlTmFtZSA9PT0gcGllY2VOYW1lT2YocGllY2VBdEtleSkpIHtcbiAgICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzFdWzBdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzFdWzFdO1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2FuaW0nKTtcbiAgICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLmNnQW5pbWF0aW5nKSB7XG4gICAgICAgICAgZWwuY2dBbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdhbmltJyk7XG4gICAgICAgICAgdHJhbnNsYXRlKGVsLCBwb3NUb1RyYW5zbGF0ZShrZXkycG9zKGspLCBhc1doaXRlKSk7XG4gICAgICAgICAgaWYgKHMuYWRkUGllY2VaSW5kZXgpIGVsLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChrZXkycG9zKGspLCBhc1doaXRlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzYW1lIHBpZWNlOiBmbGFnIGFzIHNhbWVcbiAgICAgICAgaWYgKGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSAmJiAoIWZhZGluZyB8fCAhZWwuY2dGYWRpbmcpKSB7XG4gICAgICAgICAgc2FtZVBpZWNlc1trXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGlmZmVyZW50IHBpZWNlOiBmbGFnIGFzIG1vdmVkIHVubGVzcyBpdCBpcyBhIGZhZGluZyBwaWVjZVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoZmFkaW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihmYWRpbmcpKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdmYWRpbmcnKTtcbiAgICAgICAgICAgIGVsLmNnRmFkaW5nID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSkgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdLnB1c2goZWwpO1xuICAgICAgICAgICAgZWxzZSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0gPSBbZWxdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gbm8gcGllY2U6IGZsYWcgYXMgbW92ZWRcbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAobW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdKSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0ucHVzaChlbCk7XG4gICAgICAgIGVsc2UgbW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdID0gW2VsXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoaXNTcXVhcmVOb2RlKGVsKSkge1xuICAgICAgY29uc3QgY24gPSBlbC5jbGFzc05hbWU7XG4gICAgICBpZiAoc3F1YXJlc1trXSA9PT0gY24pIHNhbWVTcXVhcmVzW2tdID0gdHJ1ZTtcbiAgICAgIGVsc2UgaWYgKG1vdmVkU3F1YXJlc1tjbl0pIG1vdmVkU3F1YXJlc1tjbl0ucHVzaChlbCk7XG4gICAgICBlbHNlIG1vdmVkU3F1YXJlc1tjbl0gPSBbZWxdO1xuICAgIH1cbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGU7XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHNxdWFyZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHNxdWFyZXNcbiAgLy8gb3IgYXBwZW5kIG5ldyBzcXVhcmVzXG4gIGZvciAoY29uc3Qgc2sgaW4gc3F1YXJlcykge1xuICAgIGlmICghc2FtZVNxdWFyZXNbc2tdKSB7XG4gICAgICBzTXZkc2V0ID0gbW92ZWRTcXVhcmVzW3NxdWFyZXNbc2tdXTtcbiAgICAgIHNNdmQgPSBzTXZkc2V0ICYmIHNNdmRzZXQucG9wKCk7XG4gICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHBvc1RvVHJhbnNsYXRlKGtleTJwb3Moc2sgYXMgY2cuS2V5KSwgYXNXaGl0ZSk7XG4gICAgICBpZiAoc012ZCkge1xuICAgICAgICBzTXZkLmNnS2V5ID0gc2sgYXMgY2cuS2V5O1xuICAgICAgICB0cmFuc2xhdGUoc012ZCwgdHJhbnNsYXRpb24pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbnN0IHNxdWFyZU5vZGUgPSBjcmVhdGVFbCgnc3F1YXJlJywgc3F1YXJlc1tza10pIGFzIGNnLlNxdWFyZU5vZGU7XG4gICAgICAgIHNxdWFyZU5vZGUuY2dLZXkgPSBzayBhcyBjZy5LZXk7XG4gICAgICAgIHRyYW5zbGF0ZShzcXVhcmVOb2RlLCB0cmFuc2xhdGlvbik7XG4gICAgICAgIGJvYXJkRWwuaW5zZXJ0QmVmb3JlKHNxdWFyZU5vZGUsIGJvYXJkRWwuZmlyc3RDaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gd2FsayBvdmVyIGFsbCBwaWVjZXMgaW4gY3VycmVudCBzZXQsIGFwcGx5IGRvbSBjaGFuZ2VzIHRvIG1vdmVkIHBpZWNlc1xuICAvLyBvciBhcHBlbmQgbmV3IHBpZWNlc1xuICBmb3IgKGNvbnN0IGogaW4gcGllY2VzS2V5cykge1xuICAgIGsgPSBwaWVjZXNLZXlzW2pdO1xuICAgIHAgPSBwaWVjZXNba107XG4gICAgYW5pbSA9IGFuaW1zW2tdO1xuICAgIGlmICghc2FtZVBpZWNlc1trXSkge1xuICAgICAgcE12ZHNldCA9IG1vdmVkUGllY2VzW3BpZWNlTmFtZU9mKHApXTtcbiAgICAgIHBNdmQgPSBwTXZkc2V0ICYmIHBNdmRzZXQucG9wKCk7XG4gICAgICAvLyBhIHNhbWUgcGllY2Ugd2FzIG1vdmVkXG4gICAgICBpZiAocE12ZCkge1xuICAgICAgICAvLyBhcHBseSBkb20gY2hhbmdlc1xuICAgICAgICBwTXZkLmNnS2V5ID0gaztcbiAgICAgICAgaWYgKHBNdmQuY2dGYWRpbmcpIHtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgICAgIHBNdmQuY2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleCkgcE12ZC5zdHlsZS56SW5kZXggPSBwb3NaSW5kZXgocG9zLCBhc1doaXRlKTtcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwTXZkLmNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5hZGQoJ2FuaW0nKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsxXVswXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVsxXVsxXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGUocE12ZCwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1doaXRlKSk7XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZSBpbiBtb3ZlZCBvYmo6IGluc2VydCB0aGUgbmV3IHBpZWNlXG4gICAgICAvLyBuZXc6IGFzc3VtZSB0aGUgbmV3IHBpZWNlIGlzIG5vdCBiZWluZyBkcmFnZ2VkXG4gICAgICAvLyBtaWdodCBiZSBhIGJhZCBpZGVhXG4gICAgICBlbHNlIHtcblxuICAgICAgICBjb25zdCBwaWVjZU5hbWUgPSBwaWVjZU5hbWVPZihwKSxcbiAgICAgICAgcGllY2VOb2RlID0gY3JlYXRlRWwoJ3BpZWNlJywgcGllY2VOYW1lKSBhcyBjZy5QaWVjZU5vZGUsXG4gICAgICAgIHBvcyA9IGtleTJwb3Moayk7XG5cbiAgICAgICAgcGllY2VOb2RlLmNnUGllY2UgPSBwaWVjZU5hbWU7XG4gICAgICAgIHBpZWNlTm9kZS5jZ0tleSA9IGs7XG4gICAgICAgIGlmIChhbmltKSB7XG4gICAgICAgICAgcGllY2VOb2RlLmNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsxXVswXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVsxXVsxXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGUocGllY2VOb2RlLCBwb3NUb1RyYW5zbGF0ZShwb3MsIGFzV2hpdGUpKTtcblxuICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleCkgcGllY2VOb2RlLnN0eWxlLnpJbmRleCA9IHBvc1pJbmRleChwb3MsIGFzV2hpdGUpO1xuXG4gICAgICAgIGJvYXJkRWwuYXBwZW5kQ2hpbGQocGllY2VOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyByZW1vdmUgYW55IGVsZW1lbnQgdGhhdCByZW1haW5zIGluIHRoZSBtb3ZlZCBzZXRzXG4gIGZvciAoY29uc3QgaSBpbiBtb3ZlZFBpZWNlcykgcmVtb3ZlTm9kZXMocywgbW92ZWRQaWVjZXNbaV0pO1xuICBmb3IgKGNvbnN0IGkgaW4gbW92ZWRTcXVhcmVzKSByZW1vdmVOb2RlcyhzLCBtb3ZlZFNxdWFyZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBpc1BpZWNlTm9kZShlbDogY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZSk6IGVsIGlzIGNnLlBpZWNlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnUElFQ0UnO1xufVxuZnVuY3Rpb24gaXNTcXVhcmVOb2RlKGVsOiBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlKTogZWwgaXMgY2cuU3F1YXJlTm9kZSB7XG4gIHJldHVybiBlbC50YWdOYW1lID09PSAnU1FVQVJFJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZXMoczogU3RhdGUsIG5vZGVzOiBIVE1MRWxlbWVudFtdKTogdm9pZCB7XG4gIGZvciAoY29uc3QgaSBpbiBub2Rlcykgcy5kb20uZWxlbWVudHMuYm9hcmQucmVtb3ZlQ2hpbGQobm9kZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBwb3NaSW5kZXgocG9zOiBjZy5Qb3MsIGFzV2hpdGU6IGJvb2xlYW4pOiBzdHJpbmcge1xuICBsZXQgeiA9IDIgKyAocG9zWzFdIC0gMSkgKiA4ICsgKDggLSBwb3NbMF0pO1xuICBpZiAoYXNXaGl0ZSkgeiA9IDY3IC0gejtcbiAgcmV0dXJuIHogKyAnJztcbn1cblxuZnVuY3Rpb24gcGllY2VOYW1lT2YocGllY2U6IGNnLlBpZWNlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGAke3BpZWNlLmNvbG9yfSAke3BpZWNlLnJvbGV9YDtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVNxdWFyZUNsYXNzZXMoczogU3RhdGUpOiBTcXVhcmVDbGFzc2VzIHtcbiAgY29uc3Qgc3F1YXJlczogU3F1YXJlQ2xhc3NlcyA9IHt9O1xuICBsZXQgaTogYW55LCBrOiBjZy5LZXk7XG4gIGlmIChzLmxhc3RNb3ZlICYmIHMuaGlnaGxpZ2h0Lmxhc3RNb3ZlKSBmb3IgKGkgaW4gcy5sYXN0TW92ZSkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLmxhc3RNb3ZlW2ldLCAnbGFzdC1tb3ZlJyk7XG4gIH1cbiAgaWYgKHMuY2hlY2sgJiYgcy5oaWdobGlnaHQuY2hlY2spIGFkZFNxdWFyZShzcXVhcmVzLCBzLmNoZWNrLCAnY2hlY2snKTtcbiAgaWYgKHMuc2VsZWN0ZWQpIHtcbiAgICBhZGRTcXVhcmUoc3F1YXJlcywgcy5zZWxlY3RlZCwgJ3NlbGVjdGVkJyk7XG4gICAgaWYgKHMubW92YWJsZS5zaG93RGVzdHMpIHtcbiAgICAgIGNvbnN0IGRlc3RzID0gcy5tb3ZhYmxlLmRlc3RzICYmIHMubW92YWJsZS5kZXN0c1tzLnNlbGVjdGVkXTtcbiAgICAgIGlmIChkZXN0cykgZm9yIChpIGluIGRlc3RzKSB7XG4gICAgICAgIGsgPSBkZXN0c1tpXTtcbiAgICAgICAgYWRkU3F1YXJlKHNxdWFyZXMsIGssICdtb3ZlLWRlc3QnICsgKHMucGllY2VzW2tdID8gJyBvYycgOiAnJykpO1xuICAgICAgfVxuICAgICAgY29uc3QgcERlc3RzID0gcy5wcmVtb3ZhYmxlLmRlc3RzO1xuICAgICAgaWYgKHBEZXN0cykgZm9yIChpIGluIHBEZXN0cykge1xuICAgICAgICBrID0gcERlc3RzW2ldO1xuICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ3ByZW1vdmUtZGVzdCcgKyAocy5waWVjZXNba10gPyAnIG9jJyA6ICcnKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHByZW1vdmUgPSBzLnByZW1vdmFibGUuY3VycmVudDtcbiAgaWYgKHByZW1vdmUpIGZvciAoaSBpbiBwcmVtb3ZlKSBhZGRTcXVhcmUoc3F1YXJlcywgcHJlbW92ZVtpXSwgJ2N1cnJlbnQtcHJlbW92ZScpO1xuICBlbHNlIGlmIChzLnByZWRyb3BwYWJsZS5jdXJyZW50KSBhZGRTcXVhcmUoc3F1YXJlcywgcy5wcmVkcm9wcGFibGUuY3VycmVudC5rZXksICdjdXJyZW50LXByZW1vdmUnKTtcblxuICBjb25zdCBvID0gcy5leHBsb2Rpbmc7XG4gIGlmIChvKSBmb3IgKGkgaW4gby5rZXlzKSBhZGRTcXVhcmUoc3F1YXJlcywgby5rZXlzW2ldLCAnZXhwbG9kaW5nJyArIG8uc3RhZ2UpO1xuXG4gIHJldHVybiBzcXVhcmVzO1xufVxuXG5mdW5jdGlvbiBhZGRTcXVhcmUoc3F1YXJlczogU3F1YXJlQ2xhc3Nlcywga2V5OiBjZy5LZXksIGtsYXNzOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKHNxdWFyZXNba2V5XSkgc3F1YXJlc1trZXldICs9ICcgJyArIGtsYXNzO1xuICBlbHNlIHNxdWFyZXNba2V5XSA9IGtsYXNzO1xufVxuIiwiaW1wb3J0ICogYXMgZmVuIGZyb20gJy4vZmVuJ1xuaW1wb3J0IHsgQW5pbUN1cnJlbnQgfSBmcm9tICcuL2FuaW0nXG5pbXBvcnQgeyBEcmFnQ3VycmVudCB9IGZyb20gJy4vZHJhZydcbmltcG9ydCB7IERyYXdhYmxlIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0IHsgdGltZXIgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGludGVyZmFjZSBTdGF0ZSB7XG4gIHBpZWNlczogY2cuUGllY2VzO1xuICBvcmllbnRhdGlvbjogY2cuQ29sb3I7IC8vIGJvYXJkIG9yaWVudGF0aW9uLiB3aGl0ZSB8IGJsYWNrXG4gIHR1cm5Db2xvcjogY2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gd2hpdGUgfCBibGFja1xuICBjaGVjaz86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBpbiBjaGVjayBcImEyXCJcbiAgbGFzdE1vdmU/OiBjZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgW1wiYzNcIjsgXCJjNFwiXVxuICBzZWxlY3RlZD86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcImExXCJcbiAgY29vcmRpbmF0ZXM6IGJvb2xlYW47IC8vIGluY2x1ZGUgY29vcmRzIGF0dHJpYnV0ZXNcbiAgYXV0b0Nhc3RsZTogYm9vbGVhbjsgLy8gaW1tZWRpYXRlbHkgY29tcGxldGUgdGhlIGNhc3RsZSBieSBtb3ZpbmcgdGhlIHJvb2sgYWZ0ZXIga2luZyBtb3ZlXG4gIHZpZXdPbmx5OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGV2ZW50czogdGhlIHVzZXIgd2lsbCBuZXZlciBiZSBhYmxlIHRvIG1vdmUgcGllY2VzIGFyb3VuZFxuICBkaXNhYmxlQ29udGV4dE1lbnU6IGJvb2xlYW47IC8vIGJlY2F1c2Ugd2hvIG5lZWRzIGEgY29udGV4dCBtZW51IG9uIGEgY2hlc3Nib2FyZFxuICByZXNpemFibGU6IGJvb2xlYW47IC8vIGxpc3RlbnMgdG8gY2hlc3Nncm91bmQucmVzaXplIG9uIGRvY3VtZW50LmJvZHkgdG8gY2xlYXIgYm91bmRzIGNhY2hlXG4gIGFkZFBpZWNlWkluZGV4OiBib29sZWFuOyAvLyBhZGRzIHotaW5kZXggdmFsdWVzIHRvIHBpZWNlcyAoZm9yIDNEKVxuICBwaWVjZUtleTogYm9vbGVhbjsgLy8gYWRkIGEgZGF0YS1rZXkgYXR0cmlidXRlIHRvIHBpZWNlIGVsZW1lbnRzXG4gIGhpZ2hsaWdodDoge1xuICAgIGxhc3RNb3ZlOiBib29sZWFuOyAvLyBhZGQgbGFzdC1tb3ZlIGNsYXNzIHRvIHNxdWFyZXNcbiAgICBjaGVjazogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjtcbiAgICBkdXJhdGlvbjogbnVtYmVyO1xuICAgIGN1cnJlbnQ/OiBBbmltQ3VycmVudDtcbiAgfTtcbiAgbW92YWJsZToge1xuICAgIGZyZWU6IGJvb2xlYW47IC8vIGFsbCBtb3ZlcyBhcmUgdmFsaWQgLSBib2FyZCBlZGl0b3JcbiAgICBjb2xvcj86IGNnLkNvbG9yIHwgJ2JvdGgnOyAvLyBjb2xvciB0aGF0IGNhbiBtb3ZlLiB3aGl0ZSB8IGJsYWNrIHwgYm90aFxuICAgIGRlc3RzPzogY2cuRGVzdHM7IC8vIHZhbGlkIG1vdmVzLiB7XCJhMlwiIFtcImEzXCIgXCJhNFwiXSBcImIxXCIgW1wiYTNcIiBcImMzXCJdfVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIG1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzOiB7XG4gICAgICBhZnRlcj86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBtb3ZlIGhhcyBiZWVuIHBsYXllZFxuICAgICAgYWZ0ZXJOZXdQaWVjZT86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSwgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIGEgbmV3IHBpZWNlIGlzIGRyb3BwZWQgb24gdGhlIGJvYXJkXG4gICAgfTtcbiAgICByb29rQ2FzdGxlOiBib29sZWFuIC8vIGNhc3RsZSBieSBtb3ZpbmcgdGhlIGtpbmcgdG8gdGhlIHJvb2tcbiAgfTtcbiAgcHJlbW92YWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZW1vdmVzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIHNob3dEZXN0czogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIHByZW1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgY2FzdGxlOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFsbG93IGtpbmcgY2FzdGxlIHByZW1vdmVzXG4gICAgZGVzdHM/OiBjZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGN1cnJlbnQ/OiBjZy5LZXlQYWlyOyAvLyBrZXlzIG9mIHRoZSBjdXJyZW50IHNhdmVkIHByZW1vdmUgW1wiZTJcIiBcImU0XCJdXG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhPzogY2cuU2V0UHJlbW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gc2V0XG4gICAgICB1bnNldD86ICgpID0+IHZvaWQ7ICAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZW1vdmUgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIHByZWRyb3BwYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IHByZWRyb3BzIGZvciBjb2xvciB0aGF0IGNhbiBub3QgbW92ZVxuICAgIGN1cnJlbnQ/OiB7IC8vIGN1cnJlbnQgc2F2ZWQgcHJlZHJvcCB7cm9sZTogJ2tuaWdodCc7IGtleTogJ2U0J31cbiAgICAgIHJvbGU6IGNnLlJvbGU7XG4gICAgICBrZXk6IGNnLktleVxuICAgIH07XG4gICAgZXZlbnRzOiB7XG4gICAgICBzZXQ/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBkcmFnZ2FibGU6IHtcbiAgICBlbmFibGVkOiBib29sZWFuOyAvLyBhbGxvdyBtb3ZlcyAmIHByZW1vdmVzIHRvIHVzZSBkcmFnJ24gZHJvcFxuICAgIGRpc3RhbmNlOiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U6IGJvb2xlYW47IC8vIGxldHMgY2hlc3Nncm91bmQgc2V0IGRpc3RhbmNlIHRvIHplcm8gd2hlbiB1c2VyIGRyYWdzIHBpZWNlc1xuICAgIGNlbnRlclBpZWNlOiBib29sZWFuOyAvLyBjZW50ZXIgdGhlIHBpZWNlIG9uIGN1cnNvciBhdCBkcmFnIHN0YXJ0XG4gICAgc2hvd0dob3N0OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBkZWxldGVPbkRyb3BPZmY6IGJvb2xlYW47IC8vIGRlbGV0ZSBhIHBpZWNlIHdoZW4gaXQgaXMgZHJvcHBlZCBvZmYgdGhlIGJvYXJkXG4gICAgY3VycmVudD86IERyYWdDdXJyZW50O1xuICB9O1xuICBzZWxlY3RhYmxlOiB7XG4gICAgLy8gZGlzYWJsZSB0byBlbmZvcmNlIGRyYWdnaW5nIG92ZXIgY2xpY2stY2xpY2sgbW92ZVxuICAgIGVuYWJsZWQ6IGJvb2xlYW5cbiAgfTtcbiAgc3RhdHM6IHtcbiAgICAvLyB3YXMgbGFzdCBwaWVjZSBkcmFnZ2VkIG9yIGNsaWNrZWQ/XG4gICAgLy8gbmVlZHMgZGVmYXVsdCB0byBmYWxzZSBmb3IgdG91Y2hcbiAgICBkcmFnZ2VkOiBib29sZWFuLFxuICAgIGN0cmxLZXk/OiBib29sZWFuXG4gIH07XG4gIGV2ZW50czoge1xuICAgIGNoYW5nZT86ICgpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgb24gdGhlIGJvYXJkXG4gICAgLy8gY2FsbGVkIGFmdGVyIGEgcGllY2UgaGFzIGJlZW4gbW92ZWQuXG4gICAgLy8gY2FwdHVyZWRQaWVjZSBpcyB1bmRlZmluZWQgb3IgbGlrZSB7Y29sb3I6ICd3aGl0ZSc7ICdyb2xlJzogJ3F1ZWVuJ31cbiAgICBtb3ZlPzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBjYXB0dXJlZFBpZWNlPzogY2cuUGllY2UpID0+IHZvaWQ7XG4gICAgZHJvcE5ld1BpZWNlPzogKHBpZWNlOiBjZy5QaWVjZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7XG4gICAgc2VsZWN0PzogKGtleTogY2cuS2V5KSA9PiB2b2lkIC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gIH07XG4gIGl0ZW1zPzogKHBvczogY2cuUG9zLCBrZXk6IGNnLktleSkgPT4gYW55IHwgdW5kZWZpbmVkOyAvLyBpdGVtcyBvbiB0aGUgYm9hcmQgeyByZW5kZXI6IGtleSAtPiB2ZG9tIH1cbiAgZHJhd2FibGU6IERyYXdhYmxlLFxuICBleHBsb2Rpbmc/OiBjZy5FeHBsb2Rpbmc7XG4gIGRvbTogY2cuRG9tLFxuICBob2xkOiBjZy5UaW1lclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMoKTogUGFydGlhbDxTdGF0ZT4ge1xuICByZXR1cm4ge1xuICAgIHBpZWNlczogZmVuLnJlYWQoZmVuLmluaXRpYWwpLFxuICAgIG9yaWVudGF0aW9uOiAnd2hpdGUnLFxuICAgIHR1cm5Db2xvcjogJ3doaXRlJyxcbiAgICBjb29yZGluYXRlczogdHJ1ZSxcbiAgICBhdXRvQ2FzdGxlOiB0cnVlLFxuICAgIHZpZXdPbmx5OiBmYWxzZSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IGZhbHNlLFxuICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICBhZGRQaWVjZVpJbmRleDogZmFsc2UsXG4gICAgcGllY2VLZXk6IGZhbHNlLFxuICAgIGhpZ2hsaWdodDoge1xuICAgICAgbGFzdE1vdmU6IHRydWUsXG4gICAgICBjaGVjazogdHJ1ZVxuICAgIH0sXG4gICAgYW5pbWF0aW9uOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZHVyYXRpb246IDIwMFxuICAgIH0sXG4gICAgbW92YWJsZToge1xuICAgICAgZnJlZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiAnYm90aCcsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBldmVudHM6IHt9LFxuICAgICAgcm9va0Nhc3RsZTogdHJ1ZVxuICAgIH0sXG4gICAgcHJlbW92YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIHNob3dEZXN0czogdHJ1ZSxcbiAgICAgIGNhc3RsZTogdHJ1ZSxcbiAgICAgIGV2ZW50czoge31cbiAgICB9LFxuICAgIHByZWRyb3BwYWJsZToge1xuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICBldmVudHM6IHt9XG4gICAgfSxcbiAgICBkcmFnZ2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBkaXN0YW5jZTogMyxcbiAgICAgIGF1dG9EaXN0YW5jZTogdHJ1ZSxcbiAgICAgIGNlbnRlclBpZWNlOiB0cnVlLFxuICAgICAgc2hvd0dob3N0OiB0cnVlLFxuICAgICAgZGVsZXRlT25Ecm9wT2ZmOiBmYWxzZVxuICAgIH0sXG4gICAgc2VsZWN0YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZVxuICAgIH0sXG4gICAgc3RhdHM6IHtcbiAgICAgIC8vIG9uIHRvdWNoc2NyZWVuLCBkZWZhdWx0IHRvIFwidGFwLXRhcFwiIG1vdmVzXG4gICAgICAvLyBpbnN0ZWFkIG9mIGRyYWdcbiAgICAgIGRyYWdnZWQ6ICEoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KVxuICAgIH0sXG4gICAgZXZlbnRzOiB7fSxcbiAgICBkcmF3YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSwgLy8gY2FuIGRyYXdcbiAgICAgIHZpc2libGU6IHRydWUsIC8vIGNhbiB2aWV3XG4gICAgICBlcmFzZU9uQ2xpY2s6IHRydWUsXG4gICAgICBzaGFwZXM6IFtdLFxuICAgICAgYXV0b1NoYXBlczogW10sXG4gICAgICBicnVzaGVzOiB7XG4gICAgICAgIGdyZWVuOiB7IGtleTogJ2cnLCBjb2xvcjogJyMxNTc4MUInLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIHJlZDogeyBrZXk6ICdyJywgY29sb3I6ICcjODgyMDIwJywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICBibHVlOiB7IGtleTogJ2InLCBjb2xvcjogJyMwMDMwODgnLCBvcGFjaXR5OiAxLCBsaW5lV2lkdGg6IDEwIH0sXG4gICAgICAgIHllbGxvdzogeyBrZXk6ICd5JywgY29sb3I6ICcjZTY4ZjAwJywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICBwYWxlQmx1ZTogeyBrZXk6ICdwYicsIGNvbG9yOiAnIzAwMzA4OCcsIG9wYWNpdHk6IDAuNCwgbGluZVdpZHRoOiAxNSB9LFxuICAgICAgICBwYWxlR3JlZW46IHsga2V5OiAncGcnLCBjb2xvcjogJyMxNTc4MUInLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZVJlZDogeyBrZXk6ICdwcicsIGNvbG9yOiAnIzg4MjAyMCcsIG9wYWNpdHk6IDAuNCwgbGluZVdpZHRoOiAxNSB9LFxuICAgICAgICBwYWxlR3JleTogeyBrZXk6ICdwZ3InLCBjb2xvcjogJyM0YTRhNGEnLCBvcGFjaXR5OiAwLjM1LCBsaW5lV2lkdGg6IDE1IH1cbiAgICAgIH0sXG4gICAgICBwaWVjZXM6IHtcbiAgICAgICAgYmFzZVVybDogJ2h0dHBzOi8vbGljaGVzczEub3JnL2Fzc2V0cy9waWVjZS9jYnVybmV0dC8nXG4gICAgICB9XG4gICAgfSxcbiAgICBob2xkOiB0aW1lcigpXG4gIH07XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBrZXkycG9zLCBjb21wdXRlSXNUcmlkZW50IH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgRHJhd2FibGUsIERyYXdTaGFwZSwgRHJhd1NoYXBlUGllY2UsIERyYXdCcnVzaCwgRHJhd0JydXNoZXMsIERyYXdNb2RpZmllcnMgfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBTVkdFbGVtZW50IHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCB0YWdOYW1lKTtcbn1cblxuaW50ZXJmYWNlIFNoYXBlIHtcbiAgc2hhcGU6IERyYXdTaGFwZTtcbiAgY3VycmVudDogYm9vbGVhbjtcbiAgaGFzaDogSGFzaDtcbn1cblxuaW50ZXJmYWNlIEN1c3RvbUJydXNoZXMge1xuICBbaGFzaDogc3RyaW5nXTogRHJhd0JydXNoXG59XG5cbmludGVyZmFjZSBBcnJvd0Rlc3RzIHtcbiAgW2tleTogc3RyaW5nXTogbnVtYmVyOyAvLyBob3cgbWFueSBhcnJvd3MgbGFuZCBvbiBhIHNxdWFyZVxufVxuXG50eXBlIEhhc2ggPSBzdHJpbmc7XG5cbmxldCBpc1RyaWRlbnQ6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5sZXQgZnVsbEhhc2hQcmV2OiBIYXNoID0gJyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGVhckNhY2hlKCkge1xuICBmdWxsSGFzaFByZXYgPSAnJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlclN2ZyhzdGF0ZTogU3RhdGUsIHJvb3Q6IFNWR0VsZW1lbnQpOiB2b2lkIHtcblxuICBjb25zdCBkID0gc3RhdGUuZHJhd2FibGUsXG4gIGN1ciA9IGQuY3VycmVudCxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyA9IHt9O1xuXG4gIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKS5mb3JFYWNoKHMgPT4ge1xuICAgIGlmIChzLmRlc3QpIGFycm93RGVzdHNbcy5kZXN0XSA9IChhcnJvd0Rlc3RzW3MuZGVzdF0gfHwgMCkgKyAxO1xuICB9KTtcblxuICBjb25zdCBzaGFwZXM6IFNoYXBlW10gPSBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5tYXAoKHM6IERyYXdTaGFwZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGN1cnJlbnQ6IGZhbHNlLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlKVxuICAgIH07XG4gIH0pO1xuICBpZiAoY3VyKSBzaGFwZXMucHVzaCh7XG4gICAgc2hhcGU6IGN1ciBhcyBEcmF3U2hhcGUsXG4gICAgY3VycmVudDogdHJ1ZSxcbiAgICBoYXNoOiBzaGFwZUhhc2goY3VyLCBhcnJvd0Rlc3RzLCB0cnVlKVxuICB9KTtcblxuICBjb25zdCBmdWxsSGFzaCA9IHNoYXBlcy5tYXAoc2MgPT4gc2MuaGFzaCkuam9pbignJyk7XG4gIGlmIChmdWxsSGFzaCA9PT0gZnVsbEhhc2hQcmV2KSByZXR1cm47XG4gIGZ1bGxIYXNoUHJldiA9IGZ1bGxIYXNoO1xuXG4gIGNvbnN0IGRlZnNFbCA9IHJvb3QuZmlyc3RDaGlsZCBhcyBTVkdFbGVtZW50O1xuXG4gIHN5bmNEZWZzKGQsIHNoYXBlcywgZGVmc0VsKTtcbiAgc3luY1NoYXBlcyhzdGF0ZSwgc2hhcGVzLCBkLmJydXNoZXMsIGFycm93RGVzdHMsIHJvb3QsIGRlZnNFbCk7XG59XG5cbi8vIGFwcGVuZCBvbmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlL3JlbW92ZS5cbmZ1bmN0aW9uIHN5bmNEZWZzKGQ6IERyYXdhYmxlLCBzaGFwZXM6IFNoYXBlW10sIGRlZnNFbDogU1ZHRWxlbWVudCkge1xuICBjb25zdCBicnVzaGVzOiBDdXN0b21CcnVzaGVzID0ge307XG4gIGxldCBicnVzaDogRHJhd0JydXNoO1xuICBzaGFwZXMuZm9yRWFjaChzID0+IHtcbiAgICBpZiAocy5zaGFwZS5kZXN0KSB7XG4gICAgICBicnVzaCA9IGQuYnJ1c2hlc1tzLnNoYXBlLmJydXNoXTtcbiAgICAgIGlmIChzLnNoYXBlLm1vZGlmaWVycykgYnJ1c2ggPSBtYWtlQ3VzdG9tQnJ1c2goYnJ1c2gsIHMuc2hhcGUubW9kaWZpZXJzKTtcbiAgICAgIGJydXNoZXNbYnJ1c2gua2V5XSA9IGJydXNoO1xuICAgIH1cbiAgfSk7XG4gIGNvbnN0IGtleXNJbkRvbToge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG4gIGxldCBlbDogU1ZHRWxlbWVudCA9IGRlZnNFbC5maXJzdENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIHdoaWxlKGVsKSB7XG4gICAga2V5c0luRG9tW2VsLmdldEF0dHJpYnV0ZSgnY2dLZXknKSBhcyBzdHJpbmddID0gdHJ1ZTtcbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQ7XG4gIH1cbiAgZm9yIChsZXQga2V5IGluIGJydXNoZXMpIHtcbiAgICBpZiAoIWtleXNJbkRvbVtrZXldKSBkZWZzRWwuYXBwZW5kQ2hpbGQocmVuZGVyTWFya2VyKGJydXNoZXNba2V5XSkpO1xuICB9XG59XG5cbi8vIGFwcGVuZCBhbmQgcmVtb3ZlIG9ubHkuIE5vIHVwZGF0ZXMuXG5mdW5jdGlvbiBzeW5jU2hhcGVzKHN0YXRlOiBTdGF0ZSwgc2hhcGVzOiBTaGFwZVtdLCBicnVzaGVzOiBEcmF3QnJ1c2hlcywgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgcm9vdDogU1ZHRWxlbWVudCwgZGVmc0VsOiBTVkdFbGVtZW50KTogdm9pZCB7XG4gIGlmIChpc1RyaWRlbnQgPT09IHVuZGVmaW5lZCkgaXNUcmlkZW50ID0gY29tcHV0ZUlzVHJpZGVudCgpO1xuICBjb25zdCBib3VuZHMgPSBzdGF0ZS5kb20uYm91bmRzKCksXG4gIGhhc2hlc0luRG9tOiB7W2hhc2g6IHN0cmluZ106IGJvb2xlYW59ID0ge30sXG4gIHRvUmVtb3ZlOiBTVkdFbGVtZW50W10gPSBbXTtcbiAgc2hhcGVzLmZvckVhY2goc2MgPT4geyBoYXNoZXNJbkRvbVtzYy5oYXNoXSA9IGZhbHNlOyB9KTtcbiAgbGV0IGVsOiBTVkdFbGVtZW50ID0gZGVmc0VsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQsIGVsSGFzaDogSGFzaDtcbiAgd2hpbGUoZWwpIHtcbiAgICBlbEhhc2ggPSBlbC5nZXRBdHRyaWJ1dGUoJ2NnSGFzaCcpIGFzIEhhc2g7XG4gICAgLy8gZm91bmQgYSBzaGFwZSBlbGVtZW50IHRoYXQncyBoZXJlIHRvIHN0YXlcbiAgICBpZiAoaGFzaGVzSW5Eb20uaGFzT3duUHJvcGVydHkoZWxIYXNoKSkgaGFzaGVzSW5Eb21bZWxIYXNoXSA9IHRydWU7XG4gICAgLy8gb3IgcmVtb3ZlIGl0XG4gICAgZWxzZSB0b1JlbW92ZS5wdXNoKGVsKTtcbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQ7XG4gIH1cbiAgLy8gcmVtb3ZlIG9sZCBzaGFwZXNcbiAgdG9SZW1vdmUuZm9yRWFjaChlbCA9PiByb290LnJlbW92ZUNoaWxkKGVsKSk7XG4gIC8vIGluc2VydCBzaGFwZXMgdGhhdCBhcmUgbm90IHlldCBpbiBkb21cbiAgc2hhcGVzLmZvckVhY2goc2MgPT4ge1xuICAgIGlmICghaGFzaGVzSW5Eb21bc2MuaGFzaF0pIHJvb3QuYXBwZW5kQ2hpbGQocmVuZGVyU2hhcGUoc3RhdGUsIHNjLCBicnVzaGVzLCBhcnJvd0Rlc3RzLCBib3VuZHMpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHNoYXBlSGFzaCh7b3JpZywgZGVzdCwgYnJ1c2gsIHBpZWNlLCBtb2RpZmllcnN9OiBEcmF3U2hhcGUsIGFycm93RGVzdHM6IEFycm93RGVzdHMsIGN1cnJlbnQ6IGJvb2xlYW4pOiBIYXNoIHtcbiAgcmV0dXJuIFtjdXJyZW50LCBvcmlnLCBkZXN0LCBicnVzaCwgZGVzdCAmJiBhcnJvd0Rlc3RzW2Rlc3RdLFxuICAgIHBpZWNlICYmIHBpZWNlSGFzaChwaWVjZSksXG4gICAgbW9kaWZpZXJzICYmIG1vZGlmaWVyc0hhc2gobW9kaWZpZXJzKVxuICBdLmZpbHRlcih4ID0+IHgpLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gbW9kaWZpZXJzSGFzaChtOiBEcmF3TW9kaWZpZXJzKTogSGFzaCB7XG4gIHJldHVybiAnJyArIChtLmxpbmVXaWR0aCB8fCAnJyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNoYXBlKHN0YXRlOiBTdGF0ZSwge3NoYXBlLCBjdXJyZW50LCBoYXNofTogU2hhcGUsIGJydXNoZXM6IERyYXdCcnVzaGVzLCBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgbGV0IGVsOiBTVkdFbGVtZW50O1xuICBpZiAoc2hhcGUucGllY2UpIGVsID0gcmVuZGVyUGllY2UoXG4gICAgc3RhdGUuZHJhd2FibGUucGllY2VzLmJhc2VVcmwsXG4gICAgb3JpZW50KGtleTJwb3Moc2hhcGUub3JpZyksIHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICBzaGFwZS5waWVjZSxcbiAgICBib3VuZHMpO1xuICBlbHNlIHtcbiAgICBjb25zdCBvcmlnID0gb3JpZW50KGtleTJwb3Moc2hhcGUub3JpZyksIHN0YXRlLm9yaWVudGF0aW9uKTtcbiAgICBpZiAoc2hhcGUub3JpZyAmJiBzaGFwZS5kZXN0KSB7XG4gICAgICBsZXQgYnJ1c2g6IERyYXdCcnVzaCA9IGJydXNoZXNbc2hhcGUuYnJ1c2hdO1xuICAgICAgaWYgKHNoYXBlLm1vZGlmaWVycykgYnJ1c2ggPSBtYWtlQ3VzdG9tQnJ1c2goYnJ1c2gsIHNoYXBlLm1vZGlmaWVycyk7XG4gICAgICBlbCA9IHJlbmRlckFycm93KFxuICAgICAgICBicnVzaCxcbiAgICAgICAgb3JpZyxcbiAgICAgICAgb3JpZW50KGtleTJwb3Moc2hhcGUuZGVzdCksIHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICAgICAgY3VycmVudCxcbiAgICAgICAgYXJyb3dEZXN0c1tzaGFwZS5kZXN0XSA+IDEsXG4gICAgICAgIGJvdW5kcyk7XG4gICAgfVxuICAgIGVsc2UgZWwgPSByZW5kZXJDaXJjbGUoYnJ1c2hlc1tzaGFwZS5icnVzaF0sIG9yaWcsIGN1cnJlbnQsIGJvdW5kcyk7XG4gIH1cbiAgZWwuc2V0QXR0cmlidXRlKCdjZ0hhc2gnLCBoYXNoKTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDaXJjbGUoYnJ1c2g6IERyYXdCcnVzaCwgcG9zOiBjZy5Qb3MsIGN1cnJlbnQ6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBvID0gcG9zMnB4KHBvcywgYm91bmRzKSxcbiAgd2lkdGggPSBjaXJjbGVXaWR0aChjdXJyZW50LCBib3VuZHMpLFxuICByYWRpdXMgPSAoYm91bmRzLndpZHRoICsgYm91bmRzLmhlaWdodCkgLyAzMjtcbiAgcmV0dXJuIHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgnY2lyY2xlJyksIHtcbiAgICBzdHJva2U6IGJydXNoLmNvbG9yLFxuICAgICdzdHJva2Utd2lkdGgnOiB3aWR0aCxcbiAgICBmaWxsOiAnbm9uZScsXG4gICAgb3BhY2l0eTogb3BhY2l0eShicnVzaCwgY3VycmVudCksXG4gICAgY3g6IG9bMF0sXG4gICAgY3k6IG9bMV0sXG4gICAgcjogcmFkaXVzIC0gd2lkdGggLyAyXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJBcnJvdyhicnVzaDogRHJhd0JydXNoLCBvcmlnOiBjZy5Qb3MsIGRlc3Q6IGNnLlBvcywgY3VycmVudDogYm9vbGVhbiwgc2hvcnRlbjogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG0gPSBhcnJvd01hcmdpbihib3VuZHMsIHNob3J0ZW4gJiYgIWN1cnJlbnQpLFxuICBhID0gcG9zMnB4KG9yaWcsIGJvdW5kcyksXG4gIGIgPSBwb3MycHgoZGVzdCwgYm91bmRzKSxcbiAgZHggPSBiWzBdIC0gYVswXSxcbiAgZHkgPSBiWzFdIC0gYVsxXSxcbiAgYW5nbGUgPSBNYXRoLmF0YW4yKGR5LCBkeCksXG4gIHhvID0gTWF0aC5jb3MoYW5nbGUpICogbSxcbiAgeW8gPSBNYXRoLnNpbihhbmdsZSkgKiBtO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdsaW5lJyksIHtcbiAgICBzdHJva2U6IGJydXNoLmNvbG9yLFxuICAgICdzdHJva2Utd2lkdGgnOiBsaW5lV2lkdGgoYnJ1c2gsIGN1cnJlbnQsIGJvdW5kcyksXG4gICAgJ3N0cm9rZS1saW5lY2FwJzogJ3JvdW5kJyxcbiAgICAnbWFya2VyLWVuZCc6IGlzVHJpZGVudCA/IHVuZGVmaW5lZCA6ICd1cmwoI2Fycm93aGVhZC0nICsgYnJ1c2gua2V5ICsgJyknLFxuICAgIG9wYWNpdHk6IG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpLFxuICAgIHgxOiBhWzBdLFxuICAgIHkxOiBhWzFdLFxuICAgIHgyOiBiWzBdIC0geG8sXG4gICAgeTI6IGJbMV0gLSB5b1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUGllY2UoYmFzZVVybDogc3RyaW5nLCBwb3M6IGNnLlBvcywgcGllY2U6IERyYXdTaGFwZVBpZWNlLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbyA9IHBvczJweChwb3MsIGJvdW5kcyksXG4gIHNpemUgPSBib3VuZHMud2lkdGggLyA4ICogKHBpZWNlLnNjYWxlIHx8IDEpLFxuICBuYW1lID0gcGllY2UuY29sb3JbMF0gKyAocGllY2Uucm9sZSA9PT0gJ2tuaWdodCcgPyAnbicgOiBwaWVjZS5yb2xlWzBdKS50b1VwcGVyQ2FzZSgpO1xuICByZXR1cm4gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdpbWFnZScpLCB7XG4gICAgY2xhc3NOYW1lOiBgJHtwaWVjZS5yb2xlfSAke3BpZWNlLmNvbG9yfWAsXG4gICAgeDogb1swXSAtIHNpemUgLyAyLFxuICAgIHk6IG9bMV0gLSBzaXplIC8gMixcbiAgICB3aWR0aDogc2l6ZSxcbiAgICBoZWlnaHQ6IHNpemUsXG4gICAgaHJlZjogYmFzZVVybCArIG5hbWUgKyAnLnN2ZydcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1hcmtlcihicnVzaDogRHJhd0JydXNoKTogU1ZHRWxlbWVudCB7XG4gIGNvbnN0IG1hcmtlciA9IHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgnbWFya2VyJyksIHtcbiAgICBpZDogJ2Fycm93aGVhZC0nICsgYnJ1c2gua2V5LFxuICAgIG9yaWVudDogJ2F1dG8nLFxuICAgIG1hcmtlcldpZHRoOiA0LFxuICAgIG1hcmtlckhlaWdodDogOCxcbiAgICByZWZYOiAyLjA1LFxuICAgIHJlZlk6IDIuMDFcbiAgfSk7XG4gIG1hcmtlci5hcHBlbmRDaGlsZChzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ3BhdGgnKSwge1xuICAgIGQ6ICdNMCwwIFY0IEwzLDIgWicsXG4gICAgZmlsbDogYnJ1c2guY29sb3JcbiAgfSkpO1xuICBtYXJrZXIuc2V0QXR0cmlidXRlKCdjZ0tleScsIGJydXNoLmtleSk7XG4gIHJldHVybiBtYXJrZXI7XG59XG5cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZXMoZWw6IFNWR0VsZW1lbnQsIGF0dHJzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KTogU1ZHRWxlbWVudCB7XG4gIGZvciAobGV0IGtleSBpbiBhdHRycykgZWwuc2V0QXR0cmlidXRlKGtleSwgYXR0cnNba2V5XSk7XG4gIHJldHVybiBlbDtcbn1cblxuZnVuY3Rpb24gb3JpZW50KHBvczogY2cuUG9zLCBjb2xvcjogY2cuQ29sb3IpOiBjZy5Qb3Mge1xuICByZXR1cm4gY29sb3IgPT09ICd3aGl0ZScgPyBwb3MgOiBbOSAtIHBvc1swXSwgOSAtIHBvc1sxXV07XG59XG5cbmZ1bmN0aW9uIG1ha2VDdXN0b21CcnVzaChiYXNlOiBEcmF3QnJ1c2gsIG1vZGlmaWVyczogRHJhd01vZGlmaWVycyk6IERyYXdCcnVzaCB7XG4gIGNvbnN0IGJydXNoOiBQYXJ0aWFsPERyYXdCcnVzaD4gPSB7XG4gICAgY29sb3I6IGJhc2UuY29sb3IsXG4gICAgb3BhY2l0eTogTWF0aC5yb3VuZChiYXNlLm9wYWNpdHkgKiAxMCkgLyAxMCxcbiAgICBsaW5lV2lkdGg6IE1hdGgucm91bmQobW9kaWZpZXJzLmxpbmVXaWR0aCB8fCBiYXNlLmxpbmVXaWR0aClcbiAgfTtcbiAgYnJ1c2gua2V5ID0gW2Jhc2Uua2V5LCBtb2RpZmllcnMubGluZVdpZHRoXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbiAgcmV0dXJuIGJydXNoIGFzIERyYXdCcnVzaDtcbn1cblxuZnVuY3Rpb24gY2lyY2xlV2lkdGgoY3VycmVudDogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogbnVtYmVyIHtcbiAgcmV0dXJuIChjdXJyZW50ID8gMyA6IDQpIC8gNTEyICogYm91bmRzLndpZHRoO1xufVxuXG5mdW5jdGlvbiBsaW5lV2lkdGgoYnJ1c2g6IERyYXdCcnVzaCwgY3VycmVudDogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogbnVtYmVyIHtcbiAgcmV0dXJuIChicnVzaC5saW5lV2lkdGggfHwgMTApICogKGN1cnJlbnQgPyAwLjg1IDogMSkgLyA1MTIgKiBib3VuZHMud2lkdGg7XG59XG5cbmZ1bmN0aW9uIG9wYWNpdHkoYnJ1c2g6IERyYXdCcnVzaCwgY3VycmVudDogYm9vbGVhbik6IG51bWJlciB7XG4gIHJldHVybiAoYnJ1c2gub3BhY2l0eSB8fCAxKSAqIChjdXJyZW50ID8gMC45IDogMSk7XG59XG5cbmZ1bmN0aW9uIGFycm93TWFyZ2luKGJvdW5kczogQ2xpZW50UmVjdCwgc2hvcnRlbjogYm9vbGVhbik6IG51bWJlciB7XG4gIHJldHVybiBpc1RyaWRlbnQgPyAwIDogKChzaG9ydGVuID8gMjAgOiAxMCkgLyA1MTIgKiBib3VuZHMud2lkdGgpO1xufVxuXG5mdW5jdGlvbiBwb3MycHgocG9zOiBjZy5Qb3MsIGJvdW5kczogQ2xpZW50UmVjdCk6IGNnLk51bWJlclBhaXIge1xuICByZXR1cm4gWyhwb3NbMF0gLSAwLjUpICogYm91bmRzLndpZHRoIC8gOCwgKDguNSAtIHBvc1sxXSkgKiBib3VuZHMuaGVpZ2h0IC8gOF07XG59XG4iLCJleHBvcnQgdHlwZSBDb2xvciA9ICd3aGl0ZScgfCAnYmxhY2snO1xuZXhwb3J0IHR5cGUgUm9sZSA9ICdraW5nJyB8ICdxdWVlbicgfCAncm9vaycgfCAnYmlzaG9wJyB8ICdrbmlnaHQnIHwgJ3Bhd24nO1xuZXhwb3J0IHR5cGUgS2V5ID0gJ2EwJyB8ICdhMScgfCAnYjEnIHwgJ2MxJyB8ICdkMScgfCAnZTEnIHwgJ2YxJyB8ICdnMScgfCAnaDEnIHwgJ2EyJyB8ICdiMicgfCAnYzInIHwgJ2QyJyB8ICdlMicgfCAnZjInIHwgJ2cyJyB8ICdoMicgfCAnYTMnIHwgJ2IzJyB8ICdjMycgfCAnZDMnIHwgJ2UzJyB8ICdmMycgfCAnZzMnIHwgJ2gzJyB8ICdhNCcgfCAnYjQnIHwgJ2M0JyB8ICdkNCcgfCAnZTQnIHwgJ2Y0JyB8ICdnNCcgfCAnaDQnIHwgJ2E1JyB8ICdiNScgfCAnYzUnIHwgJ2Q1JyB8ICdlNScgfCAnZjUnIHwgJ2c1JyB8ICdoNScgfCAnYTYnIHwgJ2I2JyB8ICdjNicgfCAnZDYnIHwgJ2U2JyB8ICdmNicgfCAnZzYnIHwgJ2g2JyB8ICdhNycgfCAnYjcnIHwgJ2M3JyB8ICdkNycgfCAnZTcnIHwgJ2Y3JyB8ICdnNycgfCAnaDcnIHwgJ2E4JyB8ICdiOCcgfCAnYzgnIHwgJ2Q4JyB8ICdlOCcgfCAnZjgnIHwgJ2c4JyB8ICdoOCc7XG5leHBvcnQgdHlwZSBGaWxlID0gJ2EnIHwgJ2InIHwgJ2MnIHwgJ2QnIHwgJ2UnIHwgJ2YnIHwgJ2cnIHwgJ2gnO1xuZXhwb3J0IHR5cGUgUmFuayA9IDEgfCAyIHwgMyB8IDQgfCA1IHwgNiB8IDcgfCA4O1xuZXhwb3J0IHR5cGUgRkVOID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgUG9zID0gW251bWJlciwgbnVtYmVyXTtcbmV4cG9ydCBpbnRlcmZhY2UgUGllY2Uge1xuICByb2xlOiBSb2xlO1xuICBjb2xvcjogQ29sb3I7XG4gIHByb21vdGVkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRHJvcCB7XG4gIHJvbGU6IFJvbGU7XG4gIGtleTogS2V5O1xufVxuZXhwb3J0IGludGVyZmFjZSBQaWVjZXMge1xuICBba2V5OiBzdHJpbmddOiBQaWVjZTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VzRGlmZiB7XG4gIFtrZXk6IHN0cmluZ106IFBpZWNlIHwgbnVsbDtcbn1cblxuZXhwb3J0IHR5cGUgS2V5UGFpciA9IFtLZXksIEtleV07XG5cbmV4cG9ydCB0eXBlIE51bWJlclBhaXIgPSBbbnVtYmVyLCBudW1iZXJdO1xuXG5leHBvcnQgaW50ZXJmYWNlIERlc3RzIHtcbiAgW2tleTogc3RyaW5nXTogS2V5W11cbn1cbmV4cG9ydCBpbnRlcmZhY2UgTWF0ZXJpYWxEaWZmU2lkZSB7XG4gIFtyb2xlOiBzdHJpbmddOiBudW1iZXI7XG59XG5leHBvcnQgaW50ZXJmYWNlIE1hdGVyaWFsRGlmZiB7XG4gIHdoaXRlOiBNYXRlcmlhbERpZmZTaWRlO1xuICBibGFjazogTWF0ZXJpYWxEaWZmU2lkZTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudHMge1xuICBib2FyZDogSFRNTEVsZW1lbnQ7XG4gIG92ZXI/OiBIVE1MRWxlbWVudDtcbiAgZ2hvc3Q/OiBIVE1MRWxlbWVudDtcbiAgc3ZnPzogU1ZHRWxlbWVudDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRG9tIHtcbiAgZWxlbWVudHM6IEVsZW1lbnRzLFxuICBib3VuZHM6IE1lbW88Q2xpZW50UmVjdD47XG4gIHJlZHJhdzogKCkgPT4gdm9pZDtcbiAgcmVkcmF3Tm93OiAoc2tpcFN2Zz86IGJvb2xlYW4pID0+IHZvaWQ7XG4gIHVuYmluZD86IFVuYmluZDtcbiAgZGVzdHJveWVkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRXhwbG9kaW5nIHtcbiAgc3RhZ2U6IG51bWJlcjtcbiAga2V5czogS2V5W107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTW92ZU1ldGFkYXRhIHtcbiAgcHJlbW92ZTogYm9vbGVhbjtcbiAgY3RybEtleT86IGJvb2xlYW47XG4gIGhvbGRUaW1lPzogbnVtYmVyO1xuICBjYXB0dXJlZD86IFBpZWNlO1xuICBwcmVkcm9wPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgU2V0UHJlbW92ZU1ldGFkYXRhIHtcbiAgY3RybEtleT86IGJvb2xlYW47XG59XG5cbmV4cG9ydCB0eXBlIFdpbmRvd0V2ZW50ID0gJ29uc2Nyb2xsJyB8ICdvbnJlc2l6ZSc7XG5cbmV4cG9ydCB0eXBlIE1vdWNoRXZlbnQgPSBNb3VzZUV2ZW50ICYgVG91Y2hFdmVudDtcblxuZXhwb3J0IGludGVyZmFjZSBLZXllZE5vZGUgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gIGNnS2V5OiBLZXk7XG59XG5leHBvcnQgaW50ZXJmYWNlIFBpZWNlTm9kZSBleHRlbmRzIEtleWVkTm9kZSB7XG4gIGNnUGllY2U6IHN0cmluZztcbiAgY2dBbmltYXRpbmc/OiBib29sZWFuO1xuICBjZ0ZhZGluZz86IGJvb2xlYW47XG4gIGNnRHJhZ2dpbmc/OiBib29sZWFuO1xufVxuZXhwb3J0IGludGVyZmFjZSBTcXVhcmVOb2RlIGV4dGVuZHMgS2V5ZWROb2RlIHsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIE1lbW88QT4geyAoKTogQTsgY2xlYXI6ICgpID0+IHZvaWQ7IH1cblxuZXhwb3J0IGludGVyZmFjZSBUaW1lciB7XG4gIHN0YXJ0OiAoKSA9PiB2b2lkO1xuICBjYW5jZWw6ICgpID0+IHZvaWQ7XG4gIHN0b3A6ICgpID0+IG51bWJlcjtcbn1cblxuZXhwb3J0IHR5cGUgUmVkcmF3ID0gKCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIFVuYmluZCA9ICgpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBUaW1lc3RhbXAgPSBudW1iZXI7XG5leHBvcnQgdHlwZSBNaWxsaXNlY29uZHMgPSBudW1iZXI7XG5cbmV4cG9ydCBjb25zdCBmaWxlczogRmlsZVtdID0gWydhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZicsICdnJywgJ2gnXTtcbmV4cG9ydCBjb25zdCByYW5rczogUmFua1tdID0gWzEsIDIsIDMsIDQsIDUsIDYsIDcsIDhdO1xuIiwiaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcyc7XG5cbmV4cG9ydCBjb25zdCBjb2xvcnM6IGNnLkNvbG9yW10gPSBbJ3doaXRlJywgJ2JsYWNrJ107XG5cbmV4cG9ydCBjb25zdCBpbnZSYW5rczogY2cuUmFua1tdID0gWzgsIDcsIDYsIDUsIDQsIDMsIDIsIDFdO1xuXG5leHBvcnQgY29uc3QgYWxsS2V5czogY2cuS2V5W10gPSBBcnJheS5wcm90b3R5cGUuY29uY2F0KC4uLmNnLmZpbGVzLm1hcChjID0+IGNnLnJhbmtzLm1hcChyID0+IGMrcikpKTtcblxuZXhwb3J0IGNvbnN0IHBvczJrZXkgPSAocG9zOiBjZy5Qb3MpID0+IGFsbEtleXNbOCAqIHBvc1swXSArIHBvc1sxXSAtIDldO1xuXG5leHBvcnQgY29uc3Qga2V5MnBvcyA9IChrOiBjZy5LZXkpID0+IFtrLmNoYXJDb2RlQXQoMCkgLSA5Niwgay5jaGFyQ29kZUF0KDEpIC0gNDhdIGFzIGNnLlBvcztcblxuZXhwb3J0IGZ1bmN0aW9uIG1lbW88QT4oZjogKCkgPT4gQSk6IGNnLk1lbW88QT4ge1xuICBsZXQgdjogQSB8IHVuZGVmaW5lZDtcbiAgY29uc3QgcmV0OiBhbnkgPSAoKSA9PiB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkgdiA9IGYoKTtcbiAgICByZXR1cm4gdjtcbiAgfTtcbiAgcmV0LmNsZWFyID0gKCkgPT4geyB2ID0gdW5kZWZpbmVkOyB9O1xuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnQgY29uc3QgdGltZXI6ICgpID0+IGNnLlRpbWVyID0gKCkgPT4ge1xuICBsZXQgc3RhcnRBdDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuICByZXR1cm4ge1xuICAgIHN0YXJ0KCkgeyBzdGFydEF0ID0gRGF0ZS5ub3coKTsgfSxcbiAgICBjYW5jZWwoKSB7IHN0YXJ0QXQgPSB1bmRlZmluZWQ7IH0sXG4gICAgc3RvcCgpIHtcbiAgICAgIGlmICghc3RhcnRBdCkgcmV0dXJuIDA7XG4gICAgICBjb25zdCB0aW1lID0gRGF0ZS5ub3coKSAtIHN0YXJ0QXQ7XG4gICAgICBzdGFydEF0ID0gdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIHRpbWU7XG4gICAgfVxuICB9O1xufVxuXG5leHBvcnQgY29uc3Qgb3Bwb3NpdGUgPSAoYzogY2cuQ29sb3IpID0+IGMgPT09ICd3aGl0ZScgPyAnYmxhY2snIDogJ3doaXRlJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zWDxYPih4czogWFtdIHwgdW5kZWZpbmVkLCB4OiBYKTogYm9vbGVhbiB7XG4gIHJldHVybiB4cyA/IHhzLmluZGV4T2YoeCkgIT09IC0xIDogZmFsc2U7XG59XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxOiAocG9zMTogY2cuUG9zLCBwb3MyOiBjZy5Qb3MpID0+IG51bWJlciA9IChwb3MxLCBwb3MyKSA9PiB7XG4gIHJldHVybiBNYXRoLnBvdyhwb3MxWzBdIC0gcG9zMlswXSwgMikgKyBNYXRoLnBvdyhwb3MxWzFdIC0gcG9zMlsxXSwgMik7XG59XG5cbmV4cG9ydCBjb25zdCBzYW1lUGllY2U6IChwMTogY2cuUGllY2UsIHAyOiBjZy5QaWVjZSkgPT4gYm9vbGVhbiA9IChwMSwgcDIpID0+XG4gIHAxLnJvbGUgPT09IHAyLnJvbGUgJiYgcDEuY29sb3IgPT09IHAyLmNvbG9yO1xuXG5leHBvcnQgY29uc3QgY29tcHV0ZUlzVHJpZGVudCA9ICgpID0+IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ1RyaWRlbnQvJykgPiAtMTtcblxuY29uc3QgcG9zVG9UcmFuc2xhdGVCYXNlOiAocG9zOiBjZy5Qb3MsIGFzV2hpdGU6IGJvb2xlYW4sIHhGYWN0b3I6IG51bWJlciwgeUZhY3RvcjogbnVtYmVyKSA9PiBjZy5OdW1iZXJQYWlyID1cbihwb3MsIGFzV2hpdGUsIHhGYWN0b3IsIHlGYWN0b3IpID0+IFtcbiAgKGFzV2hpdGUgPyBwb3NbMF0gLSAxIDogOCAtIHBvc1swXSkgKiB4RmFjdG9yLFxuICAoYXNXaGl0ZSA/IDggLSBwb3NbMV0gOiBwb3NbMV0gLSAxKSAqIHlGYWN0b3Jcbl07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZUFicyA9IChib3VuZHM6IENsaWVudFJlY3QpID0+IHtcbiAgY29uc3QgeEZhY3RvciA9IGJvdW5kcy53aWR0aCAvIDgsXG4gIHlGYWN0b3IgPSBib3VuZHMuaGVpZ2h0IC8gODtcbiAgcmV0dXJuIChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbikgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgYXNXaGl0ZSwgeEZhY3RvciwgeUZhY3Rvcik7XG59O1xuXG5leHBvcnQgY29uc3QgcG9zVG9UcmFuc2xhdGVSZWw6IChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbikgPT4gY2cuTnVtYmVyUGFpciA9XG4gIChwb3MsIGFzV2hpdGUpID0+IHBvc1RvVHJhbnNsYXRlQmFzZShwb3MsIGFzV2hpdGUsIDEyLjUsIDEyLjUpO1xuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlQWJzID0gKGVsOiBIVE1MRWxlbWVudCwgcG9zOiBjZy5Qb3MpID0+IHtcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke3Bvc1swXX1weCwke3Bvc1sxXX1weClgO1xufVxuXG5leHBvcnQgY29uc3QgdHJhbnNsYXRlUmVsID0gKGVsOiBIVE1MRWxlbWVudCwgcGVyY2VudHM6IGNnLk51bWJlclBhaXIpID0+IHtcbiAgZWwuc3R5bGUubGVmdCA9IHBlcmNlbnRzWzBdICsgJyUnO1xuICBlbC5zdHlsZS50b3AgPSBwZXJjZW50c1sxXSArICclJztcbn1cblxuZXhwb3J0IGNvbnN0IHRyYW5zbGF0ZUF3YXkgPSAoZWw6IEhUTUxFbGVtZW50KSA9PiB0cmFuc2xhdGVBYnMoZWwsIFstOTk5OTksIC05OTk5OV0pO1xuXG4vLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb24hXG5leHBvcnQgY29uc3QgZXZlbnRQb3NpdGlvbjogKGU6IGNnLk1vdWNoRXZlbnQpID0+IGNnLk51bWJlclBhaXIgfCB1bmRlZmluZWQgPSBlID0+IHtcbiAgaWYgKGUuY2xpZW50WCB8fCBlLmNsaWVudFggPT09IDApIHJldHVybiBbZS5jbGllbnRYLCBlLmNsaWVudFldO1xuICBpZiAoZS50b3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlc1swXSkgcmV0dXJuIFtlLnRhcmdldFRvdWNoZXNbMF0uY2xpZW50WCwgZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFldO1xuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgY29uc3QgaXNSaWdodEJ1dHRvbiA9IChlOiBNb3VzZUV2ZW50KSA9PiBlLmJ1dHRvbnMgPT09IDIgfHwgZS5idXR0b24gPT09IDI7XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVFbCA9ICh0YWdOYW1lOiBzdHJpbmcsIGNsYXNzTmFtZT86IHN0cmluZykgPT4ge1xuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG4gIGlmIChjbGFzc05hbWUpIGVsLmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgcmV0dXJuIGVsO1xufVxuXG5leHBvcnQgY29uc3QgcmFmID0gKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LnNldFRpbWVvdXQpLmJpbmQod2luZG93KTtcbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGNvbG9ycywgdHJhbnNsYXRlQXdheSwgY3JlYXRlRWwgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBmaWxlcywgcmFua3MgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgY3JlYXRlRWxlbWVudCBhcyBjcmVhdGVTVkcgfSBmcm9tICcuL3N2ZydcbmltcG9ydCB7IEVsZW1lbnRzIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd3JhcChlbGVtZW50OiBIVE1MRWxlbWVudCwgczogU3RhdGUsIGJvdW5kcz86IENsaWVudFJlY3QpOiBFbGVtZW50cyB7XG5cbiAgZWxlbWVudC5pbm5lckhUTUwgPSAnJztcblxuICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NnLWJvYXJkLXdyYXAnKTtcbiAgY29sb3JzLmZvckVhY2goYyA9PiB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdvcmllbnRhdGlvbi0nICsgYywgcy5vcmllbnRhdGlvbiA9PT0gYyk7XG4gIH0pO1xuICBlbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoJ21hbmlwdWxhYmxlJywgIXMudmlld09ubHkpO1xuXG4gIGNvbnN0IGJvYXJkID0gY3JlYXRlRWwoJ2RpdicsICdjZy1ib2FyZCcpO1xuXG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuXG4gIGxldCBzdmc6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmRyYXdhYmxlLnZpc2libGUgJiYgYm91bmRzKSB7XG4gICAgc3ZnID0gY3JlYXRlU1ZHKCdzdmcnKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHKCdkZWZzJykpO1xuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoc3ZnKTtcbiAgfVxuXG4gIGlmIChzLmNvb3JkaW5hdGVzKSB7XG4gICAgY29uc3Qgb3JpZW50Q2xhc3MgPSBzLm9yaWVudGF0aW9uID09PSAnYmxhY2snID8gJyBibGFjaycgOiAnJztcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKHJlbmRlckNvb3JkcyhyYW5rcywgJ3JhbmtzJyArIG9yaWVudENsYXNzKSk7XG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsICdmaWxlcycgKyBvcmllbnRDbGFzcykpO1xuICB9XG5cbiAgbGV0IG92ZXI6IEhUTUxFbGVtZW50IHwgdW5kZWZpbmVkO1xuICBpZiAoYm91bmRzICYmIChzLm1vdmFibGUuc2hvd0Rlc3RzIHx8IHMucHJlbW92YWJsZS5zaG93RGVzdHMpKSB7XG4gICAgb3ZlciA9IGNyZWF0ZUVsKCdkaXYnLCAnb3ZlcicpO1xuICAgIHRyYW5zbGF0ZUF3YXkob3Zlcik7XG4gICAgb3Zlci5zdHlsZS53aWR0aCA9IChib3VuZHMud2lkdGggLyA4KSArICdweCc7XG4gICAgb3Zlci5zdHlsZS5oZWlnaHQgPSAoYm91bmRzLmhlaWdodCAvIDgpICsgJ3B4JztcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKG92ZXIpO1xuICB9XG5cbiAgbGV0IGdob3N0OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgaWYgKGJvdW5kcyAmJiBzLmRyYWdnYWJsZS5zaG93R2hvc3QpIHtcbiAgICBnaG9zdCA9IGNyZWF0ZUVsKCdwaWVjZScsICdnaG9zdCcpO1xuICAgIHRyYW5zbGF0ZUF3YXkoZ2hvc3QpO1xuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZ2hvc3QpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBib2FyZDogYm9hcmQsXG4gICAgb3Zlcjogb3ZlcixcbiAgICBnaG9zdDogZ2hvc3QsXG4gICAgc3ZnOiBzdmdcbiAgfTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29vcmRzKGVsZW1zOiBhbnlbXSwgY2xhc3NOYW1lOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gIGNvbnN0IGVsID0gY3JlYXRlRWwoJ2Nvb3JkcycsIGNsYXNzTmFtZSk7XG4gIGxldCBmOiBIVE1MRWxlbWVudDtcbiAgZm9yIChsZXQgaSBpbiBlbGVtcykge1xuICAgIGYgPSBjcmVhdGVFbCgnY29vcmQnKTtcbiAgICBmLnRleHRDb250ZW50ID0gZWxlbXNbaV07XG4gICAgZWwuYXBwZW5kQ2hpbGQoZik7XG4gIH1cbiAgcmV0dXJuIGVsO1xufVxuIl19
