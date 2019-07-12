(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Chessground = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
            anims[newP.key] = vector.concat(vector);
            animedOrigs.push(preP.key);
        }
    });
    missings.forEach(function (p) {
        if (!util.containsX(animedOrigs, p.key))
            fadings[p.key] = p.piece;
    });
    return {
        anims: anims,
        fadings: fadings
    };
}
function step(state, now) {
    var cur = state.animation.current;
    if (cur === undefined) {
        if (!state.dom.destroyed)
            state.dom.redrawNow();
        return;
    }
    var rest = 1 - (now - cur.start) * cur.frequency;
    if (rest <= 0) {
        state.animation.current = undefined;
        state.dom.redrawNow();
    }
    else {
        var ease = easing(rest);
        for (var i in cur.plan.anims) {
            var cfg = cur.plan.anims[i];
            cfg[2] = cfg[0] * ease;
            cfg[3] = cfg[1] * ease;
        }
        state.dom.redrawNow(true);
        requestAnimationFrame(function (now) {
            if (now === void 0) { now = performance.now(); }
            return step(state, now);
        });
    }
}
function animate(mutation, state) {
    var prevPieces = __assign({}, state.pieces);
    var result = mutation(state);
    var plan = computePlan(prevPieces, state);
    if (!isObjectEmpty(plan.anims) || !isObjectEmpty(plan.fadings)) {
        var alreadyRunning = state.animation.current && state.animation.current.start;
        state.animation.current = {
            start: performance.now(),
            frequency: 1 / state.animation.duration,
            plan: plan
        };
        if (!alreadyRunning)
            step(state, performance.now());
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

},{"./util":18}],2:[function(require,module,exports){
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

},{"./anim":1,"./board":3,"./config":5,"./drag":6,"./explosion":10,"./fen":11}],3:[function(require,module,exports){
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
    state.check = undefined;
    if (color === true)
        color = state.turnColor;
    if (color)
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
    if (!king || king.role !== 'king')
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
    if (!rook || rook.role !== 'rook')
        return false;
    delete state.pieces[orig];
    delete state.pieces[oldRookPos];
    state.pieces[newKingPos] = king;
    state.pieces[newRookPos] = rook;
    return true;
}
function baseMove(state, orig, dest) {
    var origPiece = state.pieces[orig], destPiece = state.pieces[dest];
    if (orig === dest || !origPiece)
        return false;
    var captured = (destPiece && destPiece.color !== origPiece.color) ? destPiece : undefined;
    if (dest == state.selected)
        unselect(state);
    callUserFunction(state.events.move, orig, dest, captured);
    if (!tryAutoCastle(state, orig, dest)) {
        state.pieces[dest] = origPiece;
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
    return !!piece && (state.movable.color === 'both' || (state.movable.color === piece.color &&
        state.turnColor === piece.color));
}
function canMove(state, orig, dest) {
    return orig !== dest && isMovable(state, orig) && (state.movable.free || (!!state.movable.dests && util_1.containsX(state.movable.dests[orig], dest)));
}
exports.canMove = canMove;
function canDrop(state, orig, dest) {
    var piece = state.pieces[orig];
    return !!piece && dest && (orig === dest || !state.pieces[dest]) && (state.movable.color === 'both' || (state.movable.color === piece.color &&
        state.turnColor === piece.color));
}
function isPremovable(state, orig) {
    var piece = state.pieces[orig];
    return !!piece && state.premovable.enabled &&
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
    var destPiece = state.pieces[dest];
    return !!piece && dest &&
        (!destPiece || destPiece.color !== state.movable.color) &&
        state.predroppable.enabled &&
        (piece.role !== 'pawn' || (dest[1] !== '1' && dest[1] !== '8')) &&
        state.movable.color === piece.color &&
        state.turnColor !== piece.color;
}
function isDraggable(state, orig) {
    var piece = state.pieces[orig];
    return !!piece && state.draggable.enabled && (state.movable.color === 'both' || (state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled)));
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

},{"./premove":13,"./util":18}],4:[function(require,module,exports){
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
        element.classList.add('cg-wrap');
        var relative = state.viewOnly && !state.drawable.visible;
        var elements = wrap_1.default(element, state, relative);
        var bounds = util.memo(function () { return elements.board.getBoundingClientRect(); });
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
            unbind: prevUnbind,
            relative: relative
        };
        state.drawable.prevSvgHash = '';
        redrawNow(false);
        events.bindBoard(state);
        if (!prevUnbind)
            state.dom.unbind = events.bindDocument(state, redrawAll);
        state.events.insert && state.events.insert(elements);
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
        requestAnimationFrame(function () {
            redrawNow();
            redrawing = false;
        });
    };
}

},{"./api":2,"./config":5,"./events":9,"./render":14,"./state":15,"./svg":16,"./util":18,"./wrap":19}],5:[function(require,module,exports){
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
        var king = state.pieces[kingStartPos];
        if (!dests_1 || !king || king.role !== 'king')
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

},{"./board":3,"./fen":11}],6:[function(require,module,exports){
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
    var asWhite = s.orientation === 'white', bounds = s.dom.bounds(), position = util.eventPosition(e), orig = board.getKeyAtDomPos(position, asWhite, bounds);
    if (!orig)
        return;
    var piece = s.pieces[orig];
    var previouslySelected = s.selected;
    if (!previouslySelected && s.drawable.enabled && (s.drawable.eraseOnClick || (!piece || piece.color !== s.turnColor)))
        draw_1.clear(s);
    if (e.type === 'touchstart' && e.cancelable !== false &&
        (!e.touches || !s.movable.color || piece || previouslySelected || pieceCloseTo(s, position)))
        e.preventDefault();
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
            util.setVisible(ghost, true);
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
function pieceCloseTo(s, pos) {
    var asWhite = s.orientation === 'white', bounds = s.dom.bounds(), radiusSq = Math.pow(bounds.width / 8, 2);
    for (var key in s.pieces) {
        var squareBounds = computeSquareBounds(key, asWhite, bounds), center = [
            squareBounds.left + squareBounds.width / 2,
            squareBounds.top + squareBounds.height / 2
        ];
        if (util.distanceSq(center, pos) <= radiusSq)
            return true;
    }
    return false;
}
exports.pieceCloseTo = pieceCloseTo;
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
    requestAnimationFrame(function () {
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
                var translation = util.posToTranslateAbs(bounds)(cur.origPos, asWhite);
                translation[0] += cur.pos[0] + cur.dec[0];
                translation[1] += cur.pos[1] + cur.dec[1];
                util.translateAbs(cur.element, translation);
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
    if (e.type === 'touchend' && e.cancelable !== false)
        e.preventDefault();
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
    if (e.ghost)
        util.setVisible(e.ghost, false);
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

},{"./anim":1,"./board":3,"./draw":7,"./util":18}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board_1 = require("./board");
var util_1 = require("./util");
var brushes = ['green', 'red', 'blue', 'yellow'];
function start(state, e) {
    if (e.touches && e.touches.length > 1)
        return;
    if (e.type === 'touchstart') {
        e.stopPropagation();
        e.preventDefault();
    }
    e.ctrlKey ? board_1.unselect(state) : board_1.cancelMove(state);
    var position = util_1.eventPosition(e);
    var orig = board_1.getKeyAtDomPos(position, state.orientation === 'white', state.dom.bounds());
    if (!orig)
        return;
    state.drawable.current = {
        orig: orig,
        pos: position,
        brush: eventBrush(e)
    };
    processDraw(state);
}
exports.start = start;
function processDraw(state) {
    requestAnimationFrame(function () {
        var cur = state.drawable.current;
        if (cur) {
            var mouseSq = board_1.getKeyAtDomPos(cur.pos, state.orientation === 'white', state.dom.bounds());
            if (mouseSq !== cur.mouseSq) {
                cur.mouseSq = mouseSq;
                cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
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
    if (cur) {
        if (cur.mouseSq)
            addShape(state.drawable, cur);
        cancel(state);
    }
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
function addShape(drawable, cur) {
    var sameShape = function (s) {
        return s.orig === cur.orig && s.dest === cur.dest;
    };
    var similar = drawable.shapes.filter(sameShape)[0];
    if (similar)
        drawable.shapes = drawable.shapes.filter(not(sameShape));
    if (!similar || similar.brush !== cur.brush)
        drawable.shapes.push(cur);
    onChange(drawable);
}
function onChange(drawable) {
    if (drawable.onChange)
        drawable.onChange(drawable.shapes);
}

},{"./board":3,"./util":18}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var board = require("./board");
var util = require("./util");
var drag_1 = require("./drag");
function setDropMode(s, piece) {
    s.dropmode = {
        active: true,
        piece: piece
    };
    drag_1.cancel(s);
}
exports.setDropMode = setDropMode;
function cancelDropMode(s) {
    s.dropmode = {
        active: false
    };
}
exports.cancelDropMode = cancelDropMode;
function drop(s, e) {
    if (!s.dropmode.active)
        return;
    board.unsetPremove(s);
    board.unsetPredrop(s);
    var piece = s.dropmode.piece;
    if (piece) {
        s.pieces.a0 = piece;
        var position = util.eventPosition(e);
        var dest = position && board.getKeyAtDomPos(position, s.orientation === 'white', s.dom.bounds());
        if (dest)
            board.dropNewPiece(s, 'a0', dest);
    }
    s.dom.redraw();
}
exports.drop = drop;

},{"./board":3,"./drag":6,"./util":18}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var drag = require("./drag");
var draw = require("./draw");
var drop_1 = require("./drop");
var util_1 = require("./util");
function bindBoard(s) {
    if (s.viewOnly)
        return;
    var boardEl = s.dom.elements.board, onStart = startDragOrDraw(s);
    boardEl.addEventListener('touchstart', onStart, { passive: false });
    boardEl.addEventListener('mousedown', onStart, { passive: true });
    if (s.disableContextMenu || s.drawable.enabled) {
        boardEl.addEventListener('contextmenu', function (e) { return e.preventDefault(); });
    }
}
exports.bindBoard = bindBoard;
function bindDocument(s, redrawAll) {
    var unbinds = [];
    if (!s.dom.relative && s.resizable) {
        var onResize = function () {
            s.dom.bounds.clear();
            requestAnimationFrame(redrawAll);
        };
        unbinds.push(unbindable(document.body, 'chessground.resize', onResize));
    }
    if (!s.viewOnly) {
        var onmove_1 = dragOrDraw(s, drag.move, draw.move);
        var onend_1 = dragOrDraw(s, drag.end, draw.end);
        ['touchmove', 'mousemove'].forEach(function (ev) { return unbinds.push(unbindable(document, ev, onmove_1)); });
        ['touchend', 'mouseup'].forEach(function (ev) { return unbinds.push(unbindable(document, ev, onend_1)); });
        var onScroll = function () { return s.dom.bounds.clear(); };
        unbinds.push(unbindable(window, 'scroll', onScroll, { passive: true }));
        unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
    }
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
        else if (!s.viewOnly) {
            if (s.dropmode.active)
                drop_1.drop(s, e);
            else
                drag.start(s, e);
        }
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

},{"./drag":6,"./draw":7,"./drop":8,"./util":18}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
                var piece = pieces[util_1.pos2key([col, row])];
                if (piece)
                    piece.promoted = true;
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
    return util_1.invRanks.map(function (y) { return cg.ranks.map(function (x) {
        var piece = pieces[util_1.pos2key([x, y])];
        if (piece) {
            var letter = letters[piece.role];
            return piece.color === 'white' ? letter.toUpperCase() : letter;
        }
        else
            return '1';
    }).join(''); }).join('/').replace(/1{2,}/g, function (s) { return s.length.toString(); });
}
exports.write = write;

},{"./types":17,"./util":18}],12:[function(require,module,exports){
module.exports = require("./chessground").Chessground;

},{"./chessground":4}],13:[function(require,module,exports){
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
    return Object.keys(pieces).filter(function (key) {
        var piece = pieces[key];
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

},{"./util":18}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var util = require("./util");
function render(s) {
    var asWhite = s.orientation === 'white', posToTranslate = s.dom.relative ? util.posToTranslateRel : util.posToTranslateAbs(s.dom.bounds()), translate = s.dom.relative ? util.translateRel : util.translateAbs, boardEl = s.dom.elements.board, pieces = s.pieces, curAnim = s.animation.current, anims = curAnim ? curAnim.plan.anims : {}, fadings = curAnim ? curAnim.plan.fadings : {}, curDrag = s.draggable.current, squares = computeSquareClasses(s), samePieces = {}, sameSquares = {}, movedPieces = {}, movedSquares = {}, piecesKeys = Object.keys(pieces);
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
                    pos[0] += anim[2];
                    pos[1] += anim[3];
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
                    pos[0] += anim[2];
                    pos[1] += anim[3];
                }
                translate(pMvd, posToTranslate(pos, asWhite));
            }
            else {
                var pieceName = pieceNameOf(p), pieceNode = util_1.createEl('piece', pieceName), pos = util_1.key2pos(k);
                pieceNode.cgPiece = pieceName;
                pieceNode.cgKey = k;
                if (anim) {
                    pieceNode.cgAnimating = true;
                    pos[0] += anim[2];
                    pos[1] += anim[3];
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

},{"./util":18}],15:[function(require,module,exports){
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
        dropmode: {
            active: false
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
            },
            prevSvgHash: ''
        },
        hold: util_1.timer()
    };
}
exports.defaults = defaults;

},{"./fen":11,"./util":18}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
function createElement(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}
exports.createElement = createElement;
function renderSvg(state, root) {
    var d = state.drawable, curD = d.current, cur = curD && curD.mouseSq ? curD : undefined, arrowDests = {};
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
    if (fullHash === state.drawable.prevSvgHash)
        return;
    state.drawable.prevSvgHash = fullHash;
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
    return [current, orig, dest, brush, dest && arrowDests[dest] > 1,
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
    var o = pos2px(pos, bounds), widths = circleWidth(bounds), radius = (bounds.width + bounds.height) / 32;
    return setAttributes(createElement('circle'), {
        stroke: brush.color,
        'stroke-width': widths[current ? 0 : 1],
        fill: 'none',
        opacity: opacity(brush, current),
        cx: o[0],
        cy: o[1],
        r: radius - widths[1] / 2
    });
}
function renderArrow(brush, orig, dest, current, shorten, bounds) {
    var m = arrowMargin(bounds, shorten && !current), a = pos2px(orig, bounds), b = pos2px(dest, bounds), dx = b[0] - a[0], dy = b[1] - a[1], angle = Math.atan2(dy, dx), xo = Math.cos(angle) * m, yo = Math.sin(angle) * m;
    return setAttributes(createElement('line'), {
        stroke: brush.color,
        'stroke-width': lineWidth(brush, current, bounds),
        'stroke-linecap': 'round',
        'marker-end': 'url(#arrowhead-' + brush.key + ')',
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
function circleWidth(bounds) {
    var base = bounds.width / 512;
    return [3 * base, 4 * base];
}
function lineWidth(brush, current, bounds) {
    return (brush.lineWidth || 10) * (current ? 0.85 : 1) / 512 * bounds.width;
}
function opacity(brush, current) {
    return (brush.opacity || 1) * (current ? 0.9 : 1);
}
function arrowMargin(bounds, shorten) {
    return (shorten ? 20 : 10) / 512 * bounds.width;
}
function pos2px(pos, bounds) {
    return [(pos[0] - 0.5) * bounds.width / 8, (8.5 - pos[1]) * bounds.height / 8];
}

},{"./util":18}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
exports.ranks = [1, 2, 3, 4, 5, 6, 7, 8];

},{}],18:[function(require,module,exports){
"use strict";
var _a;
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
    return xs !== undefined && xs.indexOf(x) !== -1;
}
exports.containsX = containsX;
exports.distanceSq = function (pos1, pos2) {
    return Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2);
};
exports.samePiece = function (p1, p2) {
    return p1.role === p2.role && p1.color === p2.color;
};
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
exports.setVisible = function (el, v) {
    el.style.visibility = v ? 'visible' : 'hidden';
};
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

},{"./types":17}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var types_1 = require("./types");
var svg_1 = require("./svg");
function wrap(element, s, relative) {
    element.innerHTML = '';
    element.classList.add('cg-wrap');
    util_1.colors.forEach(function (c) {
        element.classList.toggle('orientation-' + c, s.orientation === c);
    });
    element.classList.toggle('manipulable', !s.viewOnly);
    var helper = util_1.createEl('cg-helper');
    element.appendChild(helper);
    var container = util_1.createEl('cg-container');
    helper.appendChild(container);
    var board = util_1.createEl('cg-board');
    container.appendChild(board);
    var svg;
    if (s.drawable.visible && !relative) {
        svg = svg_1.createElement('svg');
        svg.appendChild(svg_1.createElement('defs'));
        container.appendChild(svg);
    }
    if (s.coordinates) {
        var orientClass = s.orientation === 'black' ? ' black' : '';
        container.appendChild(renderCoords(types_1.ranks, 'ranks' + orientClass));
        container.appendChild(renderCoords(types_1.files, 'files' + orientClass));
    }
    var ghost;
    if (s.draggable.showGhost && !relative) {
        ghost = util_1.createEl('piece', 'ghost');
        util_1.setVisible(ghost, false);
        container.appendChild(ghost);
    }
    return {
        board: board,
        container: container,
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

},{"./svg":16,"./types":17,"./util":18}]},{},[12])(12)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYW5pbS50cyIsInNyYy9hcGkudHMiLCJzcmMvYm9hcmQudHMiLCJzcmMvY2hlc3Nncm91bmQudHMiLCJzcmMvY29uZmlnLnRzIiwic3JjL2RyYWcudHMiLCJzcmMvZHJhdy50cyIsInNyYy9kcm9wLnRzIiwic3JjL2V2ZW50cy50cyIsInNyYy9leHBsb3Npb24udHMiLCJzcmMvZmVuLnRzIiwic3JjL2luZGV4LmpzIiwic3JjL3ByZW1vdmUudHMiLCJzcmMvcmVuZGVyLnRzIiwic3JjL3N0YXRlLnRzIiwic3JjL3N2Zy50cyIsInNyYy90eXBlcy50cyIsInNyYy91dGlsLnRzIiwic3JjL3dyYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7O0FDQ0EsNkJBQThCO0FBNEI5QixTQUFnQixJQUFJLENBQUksUUFBcUIsRUFBRSxLQUFZO0lBQ3pELE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDdEYsQ0FBQztBQUZELG9CQUVDO0FBRUQsU0FBZ0IsTUFBTSxDQUFJLFFBQXFCLEVBQUUsS0FBWTtJQUMzRCxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNuQixPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBSkQsd0JBSUM7QUFXRCxTQUFTLFNBQVMsQ0FBQyxHQUFXLEVBQUUsS0FBZTtJQUM3QyxPQUFPO1FBQ0wsR0FBRyxFQUFFLEdBQUc7UUFDUixHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDdEIsS0FBSyxFQUFFLEtBQUs7S0FD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LElBQUksQ0FBQyxLQUFlO0lBQzNCLE9BQU8sVUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUssT0FBQSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUM3QyxLQUFLLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUVsQixFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FDM0QsQ0FBQyxDQUFDLENBQUMsQ0FDRixFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FDM0QsQ0FDRixFQVAwQixDQU8xQixDQUFDO0FBQ0osQ0FBQztBQUVELElBQU0sTUFBTSxHQUFhLFVBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtJQUN0QyxJQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hCLElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEIsT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDMUQsQ0FBQyxDQUFBO0FBRUQsSUFBTSxNQUFNLEdBQWEsVUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0lBQ3RDLE9BQU8sSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FB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QUM7UUFDekIsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM5QjtJQUVELE9BQU87UUFDTCxLQUFLLE9BQUE7UUFDTCxTQUFTLFdBQUE7UUFDVCxLQUFLLE9BQUE7UUFDTCxHQUFHLEtBQUE7S0FDSixDQUFDO0FBQ0osQ0FBQztBQXJERCx1QkFxREM7QUFFRCxTQUFTLFlBQVksQ0FBQyxLQUFZLEVBQUUsU0FBaUI7SUFDbkQsSUFBTSxFQUFFLEdBQUcsZUFBUSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQWMsQ0FBQztJQUNuQixLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRTtRQUNuQixDQUFDLEdBQUcsZUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkI7SUFDRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCB0eXBlIE11dGF0aW9uPEE+ID0gKHN0YXRlOiBTdGF0ZSkgPT4gQTtcblxuLy8gMCwxIGFuaW1hdGlvbiBnb2FsXG4vLyAyLDMgYW5pbWF0aW9uIGN1cnJlbnQgc3RhdHVzXG5leHBvcnQgdHlwZSBBbmltVmVjdG9yID0gY2cuTnVtYmVyUXVhZFxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1WZWN0b3JzIHtcbiAgW2tleTogc3RyaW5nXTogQW5pbVZlY3RvclxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFuaW1GYWRpbmdzIHtcbiAgW2tleTogc3RyaW5nXTogY2cuUGllY2Vcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBbmltUGxhbiB7XG4gIGFuaW1zOiBBbmltVmVjdG9ycztcbiAgZmFkaW5nczogQW5pbUZhZGluZ3M7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQW5pbUN1cnJlbnQge1xuICBzdGFydDogRE9NSGlnaFJlc1RpbWVTdGFtcDtcbiAgZnJlcXVlbmN5OiBjZy5LSHo7XG4gIHBsYW46IEFuaW1QbGFuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5pbTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICByZXR1cm4gc3RhdGUuYW5pbWF0aW9uLmVuYWJsZWQgPyBhbmltYXRlKG11dGF0aW9uLCBzdGF0ZSkgOiByZW5kZXIobXV0YXRpb24sIHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlcjxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICBjb25zdCByZXN1bHQgPSBtdXRhdGlvbihzdGF0ZSk7XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuaW50ZXJmYWNlIEFuaW1QaWVjZSB7XG4gIGtleTogY2cuS2V5O1xuICBwb3M6IGNnLlBvcztcbiAgcGllY2U6IGNnLlBpZWNlO1xufVxuaW50ZXJmYWNlIEFuaW1QaWVjZXMge1xuICBba2V5OiBzdHJpbmddOiBBbmltUGllY2Vcbn1cblxuZnVuY3Rpb24gbWFrZVBpZWNlKGtleTogY2cuS2V5LCBwaWVjZTogY2cuUGllY2UpOiBBbmltUGllY2Uge1xuICByZXR1cm4ge1xuICAgIGtleToga2V5LFxuICAgIHBvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsb3NlcihwaWVjZTogQW5pbVBpZWNlLCBwaWVjZXM6IEFuaW1QaWVjZVtdKTogQW5pbVBpZWNlIHtcbiAgcmV0dXJuIHBpZWNlcy5zb3J0KChwMSwgcDIpID0+IHtcbiAgICByZXR1cm4gdXRpbC5kaXN0YW5jZVNxKHBpZWNlLnBvcywgcDEucG9zKSAtIHV0aWwuZGlzdGFuY2VTcShwaWVjZS5wb3MsIHAyLnBvcyk7XG4gIH0pWzBdO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlUGxhbihwcmV2UGllY2VzOiBjZy5QaWVjZXMsIGN1cnJlbnQ6IFN0YXRlKTogQW5pbVBsYW4ge1xuICBjb25zdCBhbmltczogQW5pbVZlY3RvcnMgPSB7fSxcbiAgYW5pbWVkT3JpZ3M6IGNnLktleVtdID0gW10sXG4gIGZhZGluZ3M6IEFuaW1GYWRpbmdzID0ge30sXG4gIG1pc3NpbmdzOiBBbmltUGllY2VbXSA9IFtdLFxuICBuZXdzOiBBbmltUGllY2VbXSA9IFtdLFxuICBwcmVQaWVjZXM6IEFuaW1QaWVjZXMgPSB7fTtcbiAgbGV0IGN1clA6IGNnLlBpZWNlIHwgdW5kZWZpbmVkLCBwcmVQOiBBbmltUGllY2UgfCB1bmRlZmluZWQsIGk6IGFueSwgdmVjdG9yOiBjZy5OdW1iZXJQYWlyO1xuICBmb3IgKGkgaW4gcHJldlBpZWNlcykge1xuICAgIHByZVBpZWNlc1tpXSA9IG1ha2VQaWVjZShpIGFzIGNnLktleSwgcHJldlBpZWNlc1tpXSEpO1xuICB9XG4gIGZvciAoY29uc3Qga2V5IG9mIHV0aWwuYWxsS2V5cykge1xuICAgIGN1clAgPSBjdXJyZW50LnBpZWNlc1trZXldO1xuICAgIHByZVAgPSBwcmVQaWVjZXNba2V5XTtcbiAgICBpZiAoY3VyUCkge1xuICAgICAgaWYgKHByZVApIHtcbiAgICAgICAgaWYgKCF1dGlsLnNhbWVQaWVjZShjdXJQLCBwcmVQLnBpZWNlKSkge1xuICAgICAgICAgIG1pc3NpbmdzLnB1c2gocHJlUCk7XG4gICAgICAgICAgbmV3cy5wdXNoKG1ha2VQaWVjZShrZXksIGN1clApKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIG5ld3MucHVzaChtYWtlUGllY2Uoa2V5LCBjdXJQKSk7XG4gICAgfSBlbHNlIGlmIChwcmVQKSBtaXNzaW5ncy5wdXNoKHByZVApO1xuICB9XG4gIG5ld3MuZm9yRWFjaChuZXdQID0+IHtcbiAgICBwcmVQID0gY2xvc2VyKG5ld1AsIG1pc3NpbmdzLmZpbHRlcihwID0+IHV0aWwuc2FtZVBpZWNlKG5ld1AucGllY2UsIHAucGllY2UpKSk7XG4gICAgaWYgKHByZVApIHtcbiAgICAgIHZlY3RvciA9IFtwcmVQLnBvc1swXSAtIG5ld1AucG9zWzBdLCBwcmVQLnBvc1sxXSAtIG5ld1AucG9zWzFdXTtcbiAgICAgIGFuaW1zW25ld1Aua2V5XSA9IHZlY3Rvci5jb25jYXQodmVjdG9yKSBhcyBBbmltVmVjdG9yO1xuICAgICAgYW5pbWVkT3JpZ3MucHVzaChwcmVQLmtleSk7XG4gICAgfVxuICB9KTtcbiAgbWlzc2luZ3MuZm9yRWFjaChwID0+IHtcbiAgICBpZiAoIXV0aWwuY29udGFpbnNYKGFuaW1lZE9yaWdzLCBwLmtleSkpIGZhZGluZ3NbcC5rZXldID0gcC5waWVjZTtcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBhbmltczogYW5pbXMsXG4gICAgZmFkaW5nczogZmFkaW5nc1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdGVwKHN0YXRlOiBTdGF0ZSwgbm93OiBET01IaWdoUmVzVGltZVN0YW1wKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50O1xuICBpZiAoY3VyID09PSB1bmRlZmluZWQpIHsgLy8gYW5pbWF0aW9uIHdhcyBjYW5jZWxlZCA6KFxuICAgIGlmICghc3RhdGUuZG9tLmRlc3Ryb3llZCkgc3RhdGUuZG9tLnJlZHJhd05vdygpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCByZXN0ID0gMSAtIChub3cgLSBjdXIuc3RhcnQpICogY3VyLmZyZXF1ZW5jeTtcbiAgaWYgKHJlc3QgPD0gMCkge1xuICAgIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBlYXNlID0gZWFzaW5nKHJlc3QpO1xuICAgIGZvciAobGV0IGkgaW4gY3VyLnBsYW4uYW5pbXMpIHtcbiAgICAgIGNvbnN0IGNmZyA9IGN1ci5wbGFuLmFuaW1zW2ldO1xuICAgICAgY2ZnWzJdID0gY2ZnWzBdICogZWFzZTtcbiAgICAgIGNmZ1szXSA9IGNmZ1sxXSAqIGVhc2U7XG4gICAgfVxuICAgIHN0YXRlLmRvbS5yZWRyYXdOb3codHJ1ZSk7IC8vIG9wdGltaXNhdGlvbjogZG9uJ3QgcmVuZGVyIFNWRyBjaGFuZ2VzIGR1cmluZyBhbmltYXRpb25zXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKChub3cgPSBwZXJmb3JtYW5jZS5ub3coKSkgPT4gc3RlcChzdGF0ZSwgbm93KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYW5pbWF0ZTxBPihtdXRhdGlvbjogTXV0YXRpb248QT4sIHN0YXRlOiBTdGF0ZSk6IEEge1xuICAvLyBjbG9uZSBzdGF0ZSBiZWZvcmUgbXV0YXRpbmcgaXRcbiAgY29uc3QgcHJldlBpZWNlczogY2cuUGllY2VzID0gey4uLnN0YXRlLnBpZWNlc307XG5cbiAgY29uc3QgcmVzdWx0ID0gbXV0YXRpb24oc3RhdGUpO1xuICBjb25zdCBwbGFuID0gY29tcHV0ZVBsYW4ocHJldlBpZWNlcywgc3RhdGUpO1xuICBpZiAoIWlzT2JqZWN0RW1wdHkocGxhbi5hbmltcykgfHwgIWlzT2JqZWN0RW1wdHkocGxhbi5mYWRpbmdzKSkge1xuICAgIGNvbnN0IGFscmVhZHlSdW5uaW5nID0gc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgJiYgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQuc3RhcnQ7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB7XG4gICAgICBzdGFydDogcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICBmcmVxdWVuY3k6IDEgLyBzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24sXG4gICAgICBwbGFuOiBwbGFuXG4gICAgfTtcbiAgICBpZiAoIWFscmVhZHlSdW5uaW5nKSBzdGVwKHN0YXRlLCBwZXJmb3JtYW5jZS5ub3coKSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gZG9uJ3QgYW5pbWF0ZSwganVzdCByZW5kZXIgcmlnaHQgYXdheVxuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBpc09iamVjdEVtcHR5KG86IGFueSk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBfIGluIG8pIHJldHVybiBmYWxzZTtcbiAgcmV0dXJuIHRydWU7XG59XG4vLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9ncmUvMTY1MDI5NFxuZnVuY3Rpb24gZWFzaW5nKHQ6IG51bWJlcik6IG51bWJlciB7XG4gIHJldHVybiB0IDwgMC41ID8gNCAqIHQgKiB0ICogdCA6ICh0IC0gMSkgKiAoMiAqIHQgLSAyKSAqICgyICogdCAtIDIpICsgMTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyB3cml0ZSBhcyBmZW5Xcml0ZSB9IGZyb20gJy4vZmVuJ1xuaW1wb3J0IHsgQ29uZmlnLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7IGFuaW0sIHJlbmRlciB9IGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IGNhbmNlbCBhcyBkcmFnQ2FuY2VsLCBkcmFnTmV3UGllY2UgfSBmcm9tICcuL2RyYWcnXG5pbXBvcnQgeyBEcmF3U2hhcGUgfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgZXhwbG9zaW9uIGZyb20gJy4vZXhwbG9zaW9uJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGludGVyZmFjZSBBcGkge1xuXG4gIC8vIHJlY29uZmlndXJlIHRoZSBpbnN0YW5jZS4gQWNjZXB0cyBhbGwgY29uZmlnIG9wdGlvbnMsIGV4Y2VwdCBmb3Igdmlld09ubHkgJiBkcmF3YWJsZS52aXNpYmxlLlxuICAvLyBib2FyZCB3aWxsIGJlIGFuaW1hdGVkIGFjY29yZGluZ2x5LCBpZiBhbmltYXRpb25zIGFyZSBlbmFibGVkLlxuICBzZXQoY29uZmlnOiBDb25maWcpOiB2b2lkO1xuXG4gIC8vIHJlYWQgY2hlc3Nncm91bmQgc3RhdGU7IHdyaXRlIGF0IHlvdXIgb3duIHJpc2tzLlxuICBzdGF0ZTogU3RhdGU7XG5cbiAgLy8gZ2V0IHRoZSBwb3NpdGlvbiBhcyBhIEZFTiBzdHJpbmcgKG9ubHkgY29udGFpbnMgcGllY2VzLCBubyBmbGFncylcbiAgLy8gZS5nLiBybmJxa2Juci9wcHBwcHBwcC84LzgvOC84L1BQUFBQUFBQL1JOQlFLQk5SXG4gIGdldEZlbigpOiBjZy5GRU47XG5cbiAgLy8gY2hhbmdlIHRoZSB2aWV3IGFuZ2xlXG4gIHRvZ2dsZU9yaWVudGF0aW9uKCk6IHZvaWQ7XG5cbiAgLy8gcGVyZm9ybSBhIG1vdmUgcHJvZ3JhbW1hdGljYWxseVxuICBtb3ZlKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogdm9pZDtcblxuICAvLyBhZGQgYW5kL29yIHJlbW92ZSBhcmJpdHJhcnkgcGllY2VzIG9uIHRoZSBib2FyZFxuICBzZXRQaWVjZXMocGllY2VzOiBjZy5QaWVjZXNEaWZmKTogdm9pZDtcblxuICAvLyBjbGljayBhIHNxdWFyZSBwcm9ncmFtbWF0aWNhbGx5XG4gIHNlbGVjdFNxdWFyZShrZXk6IGNnLktleSB8IG51bGwsIGZvcmNlPzogYm9vbGVhbik6IHZvaWQ7XG5cbiAgLy8gcHV0IGEgbmV3IHBpZWNlIG9uIHRoZSBib2FyZFxuICBuZXdQaWVjZShwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5KTogdm9pZDtcblxuICAvLyBwbGF5IHRoZSBjdXJyZW50IHByZW1vdmUsIGlmIGFueTsgcmV0dXJucyB0cnVlIGlmIHByZW1vdmUgd2FzIHBsYXllZFxuICBwbGF5UHJlbW92ZSgpOiBib29sZWFuO1xuXG4gIC8vIGNhbmNlbCB0aGUgY3VycmVudCBwcmVtb3ZlLCBpZiBhbnlcbiAgY2FuY2VsUHJlbW92ZSgpOiB2b2lkO1xuXG4gIC8vIHBsYXkgdGhlIGN1cnJlbnQgcHJlZHJvcCwgaWYgYW55OyByZXR1cm5zIHRydWUgaWYgcHJlbW92ZSB3YXMgcGxheWVkXG4gIHBsYXlQcmVkcm9wKHZhbGlkYXRlOiAoZHJvcDogY2cuRHJvcCkgPT4gYm9vbGVhbik6IGJvb2xlYW47XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IHByZWRyb3AsIGlmIGFueVxuICBjYW5jZWxQcmVkcm9wKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIHRoZSBjdXJyZW50IG1vdmUgYmVpbmcgbWFkZVxuICBjYW5jZWxNb3ZlKCk6IHZvaWQ7XG5cbiAgLy8gY2FuY2VsIGN1cnJlbnQgbW92ZSBhbmQgcHJldmVudCBmdXJ0aGVyIG9uZXNcbiAgc3RvcCgpOiB2b2lkO1xuXG4gIC8vIG1ha2Ugc3F1YXJlcyBleHBsb2RlIChhdG9taWMgY2hlc3MpXG4gIGV4cGxvZGUoa2V5czogY2cuS2V5W10pOiB2b2lkO1xuXG4gIC8vIHByb2dyYW1tYXRpY2FsbHkgZHJhdyB1c2VyIHNoYXBlc1xuICBzZXRTaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gcHJvZ3JhbW1hdGljYWxseSBkcmF3IGF1dG8gc2hhcGVzXG4gIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSk6IHZvaWQ7XG5cbiAgLy8gc3F1YXJlIG5hbWUgYXQgdGhpcyBET00gcG9zaXRpb24gKGxpa2UgXCJlNFwiKVxuICBnZXRLZXlBdERvbVBvcyhwb3M6IGNnLk51bWJlclBhaXIpOiBjZy5LZXkgfCB1bmRlZmluZWQ7XG5cbiAgLy8gb25seSB1c2VmdWwgd2hlbiBDU1MgY2hhbmdlcyB0aGUgYm9hcmQgd2lkdGgvaGVpZ2h0IHJhdGlvIChmb3IgM0QpXG4gIHJlZHJhd0FsbDogY2cuUmVkcmF3O1xuXG4gIC8vIGZvciBjcmF6eWhvdXNlIGFuZCBib2FyZCBlZGl0b3JzXG4gIGRyYWdOZXdQaWVjZShwaWVjZTogY2cuUGllY2UsIGV2ZW50OiBjZy5Nb3VjaEV2ZW50LCBmb3JjZT86IGJvb2xlYW4pOiB2b2lkO1xuXG4gIC8vIHVuYmluZHMgYWxsIGV2ZW50c1xuICAvLyAoaW1wb3J0YW50IGZvciBkb2N1bWVudC13aWRlIGV2ZW50cyBsaWtlIHNjcm9sbCBhbmQgbW91c2Vtb3ZlKVxuICBkZXN0cm95OiBjZy5VbmJpbmRcbn1cblxuLy8gc2VlIEFQSSB0eXBlcyBhbmQgZG9jdW1lbnRhdGlvbnMgaW4gZHRzL2FwaS5kLnRzXG5leHBvcnQgZnVuY3Rpb24gc3RhcnQoc3RhdGU6IFN0YXRlLCByZWRyYXdBbGw6IGNnLlJlZHJhdyk6IEFwaSB7XG5cbiAgZnVuY3Rpb24gdG9nZ2xlT3JpZW50YXRpb24oKSB7XG4gICAgYm9hcmQudG9nZ2xlT3JpZW50YXRpb24oc3RhdGUpO1xuICAgIHJlZHJhd0FsbCgpO1xuICB9O1xuXG4gIHJldHVybiB7XG5cbiAgICBzZXQoY29uZmlnKSB7XG4gICAgICBpZiAoY29uZmlnLm9yaWVudGF0aW9uICYmIGNvbmZpZy5vcmllbnRhdGlvbiAhPT0gc3RhdGUub3JpZW50YXRpb24pIHRvZ2dsZU9yaWVudGF0aW9uKCk7XG4gICAgICAoY29uZmlnLmZlbiA/IGFuaW0gOiByZW5kZXIpKHN0YXRlID0+IGNvbmZpZ3VyZShzdGF0ZSwgY29uZmlnKSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzdGF0ZSxcblxuICAgIGdldEZlbjogKCkgPT4gZmVuV3JpdGUoc3RhdGUucGllY2VzKSxcblxuICAgIHRvZ2dsZU9yaWVudGF0aW9uLFxuXG4gICAgc2V0UGllY2VzKHBpZWNlcykge1xuICAgICAgYW5pbShzdGF0ZSA9PiBib2FyZC5zZXRQaWVjZXMoc3RhdGUsIHBpZWNlcyksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2VsZWN0U3F1YXJlKGtleSwgZm9yY2UpIHtcbiAgICAgIGlmIChrZXkpIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBrZXksIGZvcmNlKSwgc3RhdGUpO1xuICAgICAgZWxzZSBpZiAoc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgYm9hcmQudW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIG1vdmUob3JpZywgZGVzdCkge1xuICAgICAgYW5pbShzdGF0ZSA9PiBib2FyZC5iYXNlTW92ZShzdGF0ZSwgb3JpZywgZGVzdCksIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgbmV3UGllY2UocGllY2UsIGtleSkge1xuICAgICAgYW5pbShzdGF0ZSA9PiBib2FyZC5iYXNlTmV3UGllY2Uoc3RhdGUsIHBpZWNlLCBrZXkpLCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIHBsYXlQcmVtb3ZlKCkge1xuICAgICAgaWYgKHN0YXRlLnByZW1vdmFibGUuY3VycmVudCkge1xuICAgICAgICBpZiAoYW5pbShib2FyZC5wbGF5UHJlbW92ZSwgc3RhdGUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gaWYgdGhlIHByZW1vdmUgY291bGRuJ3QgYmUgcGxheWVkLCByZWRyYXcgdG8gY2xlYXIgaXQgdXBcbiAgICAgICAgc3RhdGUuZG9tLnJlZHJhdygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICBwbGF5UHJlZHJvcCh2YWxpZGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50KSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGJvYXJkLnBsYXlQcmVkcm9wKHN0YXRlLCB2YWxpZGF0ZSk7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlbW92ZSgpIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZW1vdmUsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsUHJlZHJvcCgpIHtcbiAgICAgIHJlbmRlcihib2FyZC51bnNldFByZWRyb3AsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgY2FuY2VsTW92ZSgpIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiB7IGJvYXJkLmNhbmNlbE1vdmUoc3RhdGUpOyBkcmFnQ2FuY2VsKHN0YXRlKTsgfSwgc3RhdGUpO1xuICAgIH0sXG5cbiAgICBzdG9wKCkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHsgYm9hcmQuc3RvcChzdGF0ZSk7IGRyYWdDYW5jZWwoc3RhdGUpOyB9LCBzdGF0ZSk7XG4gICAgfSxcblxuICAgIGV4cGxvZGUoa2V5czogY2cuS2V5W10pIHtcbiAgICAgIGV4cGxvc2lvbihzdGF0ZSwga2V5cyk7XG4gICAgfSxcblxuICAgIHNldEF1dG9TaGFwZXMoc2hhcGVzOiBEcmF3U2hhcGVbXSkge1xuICAgICAgcmVuZGVyKHN0YXRlID0+IHN0YXRlLmRyYXdhYmxlLmF1dG9TaGFwZXMgPSBzaGFwZXMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgc2V0U2hhcGVzKHNoYXBlczogRHJhd1NoYXBlW10pIHtcbiAgICAgIHJlbmRlcihzdGF0ZSA9PiBzdGF0ZS5kcmF3YWJsZS5zaGFwZXMgPSBzaGFwZXMsIHN0YXRlKTtcbiAgICB9LFxuXG4gICAgZ2V0S2V5QXREb21Qb3MocG9zKSB7XG4gICAgICByZXR1cm4gYm9hcmQuZ2V0S2V5QXREb21Qb3MocG9zLCBzdGF0ZS5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJywgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgICB9LFxuXG4gICAgcmVkcmF3QWxsLFxuXG4gICAgZHJhZ05ld1BpZWNlKHBpZWNlLCBldmVudCwgZm9yY2UpIHtcbiAgICAgIGRyYWdOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGV2ZW50LCBmb3JjZSlcbiAgICB9LFxuXG4gICAgZGVzdHJveSgpIHtcbiAgICAgIGJvYXJkLnN0b3Aoc3RhdGUpO1xuICAgICAgc3RhdGUuZG9tLnVuYmluZCAmJiBzdGF0ZS5kb20udW5iaW5kKCk7XG4gICAgICBzdGF0ZS5kb20uZGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9XG4gIH07XG59XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBwb3Mya2V5LCBrZXkycG9zLCBvcHBvc2l0ZSwgY29udGFpbnNYIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHByZW1vdmUgZnJvbSAnLi9wcmVtb3ZlJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IHR5cGUgQ2FsbGJhY2sgPSAoLi4uYXJnczogYW55W10pID0+IHZvaWQ7XG5cbmV4cG9ydCBmdW5jdGlvbiBjYWxsVXNlckZ1bmN0aW9uKGY6IENhbGxiYWNrIHwgdW5kZWZpbmVkLCAuLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xuICBpZiAoZikgc2V0VGltZW91dCgoKSA9PiBmKC4uLmFyZ3MpLCAxKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU9yaWVudGF0aW9uKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5vcmllbnRhdGlvbiA9IG9wcG9zaXRlKHN0YXRlLm9yaWVudGF0aW9uKTtcbiAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPVxuICBzdGF0ZS5kcmFnZ2FibGUuY3VycmVudCA9XG4gIHN0YXRlLnNlbGVjdGVkID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXQoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLmxhc3RNb3ZlID0gdW5kZWZpbmVkO1xuICB1bnNlbGVjdChzdGF0ZSk7XG4gIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQaWVjZXMoc3RhdGU6IFN0YXRlLCBwaWVjZXM6IGNnLlBpZWNlc0RpZmYpOiB2b2lkIHtcbiAgZm9yIChsZXQga2V5IGluIHBpZWNlcykge1xuICAgIGNvbnN0IHBpZWNlID0gcGllY2VzW2tleV07XG4gICAgaWYgKHBpZWNlKSBzdGF0ZS5waWVjZXNba2V5XSA9IHBpZWNlO1xuICAgIGVsc2UgZGVsZXRlIHN0YXRlLnBpZWNlc1trZXldO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDaGVjayhzdGF0ZTogU3RhdGUsIGNvbG9yOiBjZy5Db2xvciB8IGJvb2xlYW4pOiB2b2lkIHtcbiAgc3RhdGUuY2hlY2sgPSB1bmRlZmluZWQ7XG4gIGlmIChjb2xvciA9PT0gdHJ1ZSkgY29sb3IgPSBzdGF0ZS50dXJuQ29sb3I7XG4gIGlmIChjb2xvcikgZm9yIChsZXQgayBpbiBzdGF0ZS5waWVjZXMpIHtcbiAgICBpZiAoc3RhdGUucGllY2VzW2tdIS5yb2xlID09PSAna2luZycgJiYgc3RhdGUucGllY2VzW2tdIS5jb2xvciA9PT0gY29sb3IpIHtcbiAgICAgIHN0YXRlLmNoZWNrID0gayBhcyBjZy5LZXk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZW1vdmUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YTogY2cuU2V0UHJlbW92ZU1ldGFkYXRhKTogdm9pZCB7XG4gIHVuc2V0UHJlZHJvcChzdGF0ZSk7XG4gIHN0YXRlLnByZW1vdmFibGUuY3VycmVudCA9IFtvcmlnLCBkZXN0XTtcbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5wcmVtb3ZhYmxlLmV2ZW50cy5zZXQsIG9yaWcsIGRlc3QsIG1ldGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZXRQcmVtb3ZlKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUucHJlbW92YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUucHJlbW92YWJsZS5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICAgIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlbW92YWJsZS5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldFByZWRyb3Aoc3RhdGU6IFN0YXRlLCByb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICBzdGF0ZS5wcmVkcm9wcGFibGUuY3VycmVudCA9IHtcbiAgICByb2xlOiByb2xlLFxuICAgIGtleToga2V5XG4gIH07XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUucHJlZHJvcHBhYmxlLmV2ZW50cy5zZXQsIHJvbGUsIGtleSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bnNldFByZWRyb3Aoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IHBkID0gc3RhdGUucHJlZHJvcHBhYmxlO1xuICBpZiAocGQuY3VycmVudCkge1xuICAgIHBkLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgY2FsbFVzZXJGdW5jdGlvbihwZC5ldmVudHMudW5zZXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyeUF1dG9DYXN0bGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSk6IGJvb2xlYW4ge1xuICBpZiAoIXN0YXRlLmF1dG9DYXN0bGUpIHJldHVybiBmYWxzZTtcbiAgY29uc3Qga2luZyA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgaWYgKCFraW5nIHx8IGtpbmcucm9sZSAhPT0gJ2tpbmcnKSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IG9yaWdQb3MgPSBrZXkycG9zKG9yaWcpO1xuICBpZiAob3JpZ1Bvc1swXSAhPT0gNSkgcmV0dXJuIGZhbHNlO1xuICBpZiAob3JpZ1Bvc1sxXSAhPT0gMSAmJiBvcmlnUG9zWzFdICE9PSA4KSByZXR1cm4gZmFsc2U7XG4gIGNvbnN0IGRlc3RQb3MgPSBrZXkycG9zKGRlc3QpO1xuICBsZXQgb2xkUm9va1BvcywgbmV3Um9va1BvcywgbmV3S2luZ1BvcztcbiAgaWYgKGRlc3RQb3NbMF0gPT09IDcgfHwgZGVzdFBvc1swXSA9PT0gOCkge1xuICAgIG9sZFJvb2tQb3MgPSBwb3Mya2V5KFs4LCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3Um9va1BvcyA9IHBvczJrZXkoWzYsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gcG9zMmtleShbNywgb3JpZ1Bvc1sxXV0pO1xuICB9IGVsc2UgaWYgKGRlc3RQb3NbMF0gPT09IDMgfHwgZGVzdFBvc1swXSA9PT0gMSkge1xuICAgIG9sZFJvb2tQb3MgPSBwb3Mya2V5KFsxLCBvcmlnUG9zWzFdXSk7XG4gICAgbmV3Um9va1BvcyA9IHBvczJrZXkoWzQsIG9yaWdQb3NbMV1dKTtcbiAgICBuZXdLaW5nUG9zID0gcG9zMmtleShbMywgb3JpZ1Bvc1sxXV0pO1xuICB9IGVsc2UgcmV0dXJuIGZhbHNlO1xuXG4gIGNvbnN0IHJvb2sgPSBzdGF0ZS5waWVjZXNbb2xkUm9va1Bvc107XG4gIGlmICghcm9vayB8fCByb29rLnJvbGUgIT09ICdyb29rJykgcmV0dXJuIGZhbHNlO1xuXG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIGRlbGV0ZSBzdGF0ZS5waWVjZXNbb2xkUm9va1Bvc107XG5cbiAgc3RhdGUucGllY2VzW25ld0tpbmdQb3NdID0ga2luZ1xuICBzdGF0ZS5waWVjZXNbbmV3Um9va1Bvc10gPSByb29rO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBjZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBjb25zdCBvcmlnUGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ10sIGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlc1tkZXN0XTtcbiAgaWYgKG9yaWcgPT09IGRlc3QgfHwgIW9yaWdQaWVjZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBjYXB0dXJlZCA9IChkZXN0UGllY2UgJiYgZGVzdFBpZWNlLmNvbG9yICE9PSBvcmlnUGllY2UuY29sb3IpID8gZGVzdFBpZWNlIDogdW5kZWZpbmVkO1xuICBpZiAoZGVzdCA9PSBzdGF0ZS5zZWxlY3RlZCkgdW5zZWxlY3Qoc3RhdGUpO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5tb3ZlLCBvcmlnLCBkZXN0LCBjYXB0dXJlZCk7XG4gIGlmICghdHJ5QXV0b0Nhc3RsZShzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzdGF0ZS5waWVjZXNbZGVzdF0gPSBvcmlnUGllY2U7XG4gICAgZGVsZXRlIHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgfVxuICBzdGF0ZS5sYXN0TW92ZSA9IFtvcmlnLCBkZXN0XTtcbiAgc3RhdGUuY2hlY2sgPSB1bmRlZmluZWQ7XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmNoYW5nZSk7XG4gIHJldHVybiBjYXB0dXJlZCB8fCB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZU5ld1BpZWNlKHN0YXRlOiBTdGF0ZSwgcGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogYm9vbGVhbiB7XG4gIGlmIChzdGF0ZS5waWVjZXNba2V5XSkge1xuICAgIGlmIChmb3JjZSkgZGVsZXRlIHN0YXRlLnBpZWNlc1trZXldO1xuICAgIGVsc2UgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNhbGxVc2VyRnVuY3Rpb24oc3RhdGUuZXZlbnRzLmRyb3BOZXdQaWVjZSwgcGllY2UsIGtleSk7XG4gIHN0YXRlLnBpZWNlc1trZXldID0gcGllY2U7XG4gIHN0YXRlLmxhc3RNb3ZlID0gW2tleV07XG4gIHN0YXRlLmNoZWNrID0gdW5kZWZpbmVkO1xuICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLmV2ZW50cy5jaGFuZ2UpO1xuICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBzdGF0ZS50dXJuQ29sb3IgPSBvcHBvc2l0ZShzdGF0ZS50dXJuQ29sb3IpO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gYmFzZVVzZXJNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBjZy5QaWVjZSB8IGJvb2xlYW4ge1xuICBjb25zdCByZXN1bHQgPSBiYXNlTW92ZShzdGF0ZSwgb3JpZywgZGVzdCk7XG4gIGlmIChyZXN1bHQpIHtcbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICAgIHN0YXRlLnR1cm5Db2xvciA9IG9wcG9zaXRlKHN0YXRlLnR1cm5Db2xvcik7XG4gICAgc3RhdGUuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZXJNb3ZlKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgaWYgKGNhbk1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYmFzZVVzZXJNb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBjb25zdCBob2xkVGltZSA9IHN0YXRlLmhvbGQuc3RvcCgpO1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgY29uc3QgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSA9IHtcbiAgICAgICAgcHJlbW92ZTogZmFsc2UsXG4gICAgICAgIGN0cmxLZXk6IHN0YXRlLnN0YXRzLmN0cmxLZXksXG4gICAgICAgIGhvbGRUaW1lOiBob2xkVGltZVxuICAgICAgfTtcbiAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIG1ldGFkYXRhLmNhcHR1cmVkID0gcmVzdWx0O1xuICAgICAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5tb3ZhYmxlLmV2ZW50cy5hZnRlciwgb3JpZywgZGVzdCwgbWV0YWRhdGEpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9IGVsc2UgaWYgKGNhblByZW1vdmUoc3RhdGUsIG9yaWcsIGRlc3QpKSB7XG4gICAgc2V0UHJlbW92ZShzdGF0ZSwgb3JpZywgZGVzdCwge1xuICAgICAgY3RybEtleTogc3RhdGUuc3RhdHMuY3RybEtleVxuICAgIH0pO1xuICAgIHVuc2VsZWN0KHN0YXRlKTtcbiAgfSBlbHNlIGlmIChpc01vdmFibGUoc3RhdGUsIGRlc3QpIHx8IGlzUHJlbW92YWJsZShzdGF0ZSwgZGVzdCkpIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwgZGVzdCk7XG4gICAgc3RhdGUuaG9sZC5zdGFydCgpO1xuICB9IGVsc2UgdW5zZWxlY3Qoc3RhdGUpO1xuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcm9wTmV3UGllY2Uoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChjYW5Ecm9wKHN0YXRlLCBvcmlnLCBkZXN0KSB8fCBmb3JjZSkge1xuICAgIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddITtcbiAgICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICAgIGJhc2VOZXdQaWVjZShzdGF0ZSwgcGllY2UsIGRlc3QsIGZvcmNlKTtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyTmV3UGllY2UsIHBpZWNlLnJvbGUsIGRlc3QsIHtcbiAgICAgIHByZWRyb3A6IGZhbHNlXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoY2FuUHJlZHJvcChzdGF0ZSwgb3JpZywgZGVzdCkpIHtcbiAgICBzZXRQcmVkcm9wKHN0YXRlLCBzdGF0ZS5waWVjZXNbb3JpZ10hLnJvbGUsIGRlc3QpO1xuICB9IGVsc2Uge1xuICAgIHVuc2V0UHJlbW92ZShzdGF0ZSk7XG4gICAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgfVxuICBkZWxldGUgc3RhdGUucGllY2VzW29yaWddO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RTcXVhcmUoc3RhdGU6IFN0YXRlLCBrZXk6IGNnLktleSwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5zZWxlY3RlZCkge1xuICAgIGlmIChzdGF0ZS5zZWxlY3RlZCA9PT0ga2V5ICYmICFzdGF0ZS5kcmFnZ2FibGUuZW5hYmxlZCkge1xuICAgICAgdW5zZWxlY3Qoc3RhdGUpO1xuICAgICAgc3RhdGUuaG9sZC5jYW5jZWwoKTtcbiAgICB9IGVsc2UgaWYgKChzdGF0ZS5zZWxlY3RhYmxlLmVuYWJsZWQgfHwgZm9yY2UpICYmIHN0YXRlLnNlbGVjdGVkICE9PSBrZXkpIHtcbiAgICAgIGlmICh1c2VyTW92ZShzdGF0ZSwgc3RhdGUuc2VsZWN0ZWQsIGtleSkpIHN0YXRlLnN0YXRzLmRyYWdnZWQgPSBmYWxzZTtcbiAgICB9IGVsc2Ugc3RhdGUuaG9sZC5zdGFydCgpO1xuICB9IGVsc2UgaWYgKGlzTW92YWJsZShzdGF0ZSwga2V5KSB8fCBpc1ByZW1vdmFibGUoc3RhdGUsIGtleSkpIHtcbiAgICBzZXRTZWxlY3RlZChzdGF0ZSwga2V5KTtcbiAgICBzdGF0ZS5ob2xkLnN0YXJ0KCk7XG4gIH1cbiAgY2FsbFVzZXJGdW5jdGlvbihzdGF0ZS5ldmVudHMuc2VsZWN0LCBrZXkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0U2VsZWN0ZWQoc3RhdGU6IFN0YXRlLCBrZXk6IGNnLktleSk6IHZvaWQge1xuICBzdGF0ZS5zZWxlY3RlZCA9IGtleTtcbiAgaWYgKGlzUHJlbW92YWJsZShzdGF0ZSwga2V5KSkge1xuICAgIHN0YXRlLnByZW1vdmFibGUuZGVzdHMgPSBwcmVtb3ZlKHN0YXRlLnBpZWNlcywga2V5LCBzdGF0ZS5wcmVtb3ZhYmxlLmNhc3RsZSk7XG4gIH1cbiAgZWxzZSBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zZWxlY3Qoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIHN0YXRlLnNlbGVjdGVkID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5wcmVtb3ZhYmxlLmRlc3RzID0gdW5kZWZpbmVkO1xuICBzdGF0ZS5ob2xkLmNhbmNlbCgpO1xufVxuXG5mdW5jdGlvbiBpc01vdmFibGUoc3RhdGU6IFN0YXRlLCBvcmlnOiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIHJldHVybiAhIXBpZWNlICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvclxuICAgICkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuTW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiBvcmlnICE9PSBkZXN0ICYmIGlzTW92YWJsZShzdGF0ZSwgb3JpZykgJiYgKFxuICAgIHN0YXRlLm1vdmFibGUuZnJlZSB8fCAoISFzdGF0ZS5tb3ZhYmxlLmRlc3RzICYmIGNvbnRhaW5zWChzdGF0ZS5tb3ZhYmxlLmRlc3RzW29yaWddLCBkZXN0KSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2FuRHJvcChzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIGNvbnN0IHBpZWNlID0gc3RhdGUucGllY2VzW29yaWddO1xuICByZXR1cm4gISFwaWVjZSAmJiBkZXN0ICYmIChvcmlnID09PSBkZXN0IHx8ICFzdGF0ZS5waWVjZXNbZGVzdF0pICYmIChcbiAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSAnYm90aCcgfHwgKFxuICAgICAgc3RhdGUubW92YWJsZS5jb2xvciA9PT0gcGllY2UuY29sb3IgJiZcbiAgICAgICAgc3RhdGUudHVybkNvbG9yID09PSBwaWVjZS5jb2xvclxuICAgICkpO1xufVxuXG5cbmZ1bmN0aW9uIGlzUHJlbW92YWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuICEhcGllY2UgJiYgc3RhdGUucHJlbW92YWJsZS5lbmFibGVkICYmXG4gIHN0YXRlLm1vdmFibGUuY29sb3IgPT09IHBpZWNlLmNvbG9yICYmXG4gICAgc3RhdGUudHVybkNvbG9yICE9PSBwaWVjZS5jb2xvcjtcbn1cblxuZnVuY3Rpb24gY2FuUHJlbW92ZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5KTogYm9vbGVhbiB7XG4gIHJldHVybiBvcmlnICE9PSBkZXN0ICYmXG4gIGlzUHJlbW92YWJsZShzdGF0ZSwgb3JpZykgJiZcbiAgY29udGFpbnNYKHByZW1vdmUoc3RhdGUucGllY2VzLCBvcmlnLCBzdGF0ZS5wcmVtb3ZhYmxlLmNhc3RsZSksIGRlc3QpO1xufVxuXG5mdW5jdGlvbiBjYW5QcmVkcm9wKHN0YXRlOiBTdGF0ZSwgb3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXkpOiBib29sZWFuIHtcbiAgY29uc3QgcGllY2UgPSBzdGF0ZS5waWVjZXNbb3JpZ107XG4gIGNvbnN0IGRlc3RQaWVjZSA9IHN0YXRlLnBpZWNlc1tkZXN0XTtcbiAgcmV0dXJuICEhcGllY2UgJiYgZGVzdCAmJlxuICAoIWRlc3RQaWVjZSB8fCBkZXN0UGllY2UuY29sb3IgIT09IHN0YXRlLm1vdmFibGUuY29sb3IpICYmXG4gIHN0YXRlLnByZWRyb3BwYWJsZS5lbmFibGVkICYmXG4gIChwaWVjZS5yb2xlICE9PSAncGF3bicgfHwgKGRlc3RbMV0gIT09ICcxJyAmJiBkZXN0WzFdICE9PSAnOCcpKSAmJlxuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJlxuICAgIHN0YXRlLnR1cm5Db2xvciAhPT0gcGllY2UuY29sb3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RyYWdnYWJsZShzdGF0ZTogU3RhdGUsIG9yaWc6IGNnLktleSk6IGJvb2xlYW4ge1xuICBjb25zdCBwaWVjZSA9IHN0YXRlLnBpZWNlc1tvcmlnXTtcbiAgcmV0dXJuICEhcGllY2UgJiYgc3RhdGUuZHJhZ2dhYmxlLmVuYWJsZWQgJiYgKFxuICAgIHN0YXRlLm1vdmFibGUuY29sb3IgPT09ICdib3RoJyB8fCAoXG4gICAgICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID09PSBwaWVjZS5jb2xvciAmJiAoXG4gICAgICAgIHN0YXRlLnR1cm5Db2xvciA9PT0gcGllY2UuY29sb3IgfHwgc3RhdGUucHJlbW92YWJsZS5lbmFibGVkXG4gICAgICApXG4gICAgKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGxheVByZW1vdmUoc3RhdGU6IFN0YXRlKTogYm9vbGVhbiB7XG4gIGNvbnN0IG1vdmUgPSBzdGF0ZS5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGlmICghbW92ZSkgcmV0dXJuIGZhbHNlO1xuICBjb25zdCBvcmlnID0gbW92ZVswXSwgZGVzdCA9IG1vdmVbMV07XG4gIGxldCBzdWNjZXNzID0gZmFsc2U7XG4gIGlmIChjYW5Nb3ZlKHN0YXRlLCBvcmlnLCBkZXN0KSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGJhc2VVc2VyTW92ZShzdGF0ZSwgb3JpZywgZGVzdCk7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc3QgbWV0YWRhdGE6IGNnLk1vdmVNZXRhZGF0YSA9IHsgcHJlbW92ZTogdHJ1ZSB9O1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSkgbWV0YWRhdGEuY2FwdHVyZWQgPSByZXN1bHQ7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyLCBvcmlnLCBkZXN0LCBtZXRhZGF0YSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVtb3ZlKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwbGF5UHJlZHJvcChzdGF0ZTogU3RhdGUsIHZhbGlkYXRlOiAoZHJvcDogY2cuRHJvcCkgPT4gYm9vbGVhbik6IGJvb2xlYW4ge1xuICBsZXQgZHJvcCA9IHN0YXRlLnByZWRyb3BwYWJsZS5jdXJyZW50LFxuICBzdWNjZXNzID0gZmFsc2U7XG4gIGlmICghZHJvcCkgcmV0dXJuIGZhbHNlO1xuICBpZiAodmFsaWRhdGUoZHJvcCkpIHtcbiAgICBjb25zdCBwaWVjZSA9IHtcbiAgICAgIHJvbGU6IGRyb3Aucm9sZSxcbiAgICAgIGNvbG9yOiBzdGF0ZS5tb3ZhYmxlLmNvbG9yXG4gICAgfSBhcyBjZy5QaWVjZTtcbiAgICBpZiAoYmFzZU5ld1BpZWNlKHN0YXRlLCBwaWVjZSwgZHJvcC5rZXkpKSB7XG4gICAgICBjYWxsVXNlckZ1bmN0aW9uKHN0YXRlLm1vdmFibGUuZXZlbnRzLmFmdGVyTmV3UGllY2UsIGRyb3Aucm9sZSwgZHJvcC5rZXksIHtcbiAgICAgICAgcHJlZHJvcDogdHJ1ZVxuICAgICAgfSk7XG4gICAgICBzdWNjZXNzID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgdW5zZXRQcmVkcm9wKHN0YXRlKTtcbiAgcmV0dXJuIHN1Y2Nlc3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWxNb3ZlKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICB1bnNldFByZW1vdmUoc3RhdGUpO1xuICB1bnNldFByZWRyb3Aoc3RhdGUpO1xuICB1bnNlbGVjdChzdGF0ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBzdGF0ZS5tb3ZhYmxlLmNvbG9yID1cbiAgc3RhdGUubW92YWJsZS5kZXN0cyA9XG4gIHN0YXRlLmFuaW1hdGlvbi5jdXJyZW50ID0gdW5kZWZpbmVkO1xuICBjYW5jZWxNb3ZlKHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEtleUF0RG9tUG9zKHBvczogY2cuTnVtYmVyUGFpciwgYXNXaGl0ZTogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogY2cuS2V5IHwgdW5kZWZpbmVkIHtcbiAgbGV0IGZpbGUgPSBNYXRoLmNlaWwoOCAqICgocG9zWzBdIC0gYm91bmRzLmxlZnQpIC8gYm91bmRzLndpZHRoKSk7XG4gIGlmICghYXNXaGl0ZSkgZmlsZSA9IDkgLSBmaWxlO1xuICBsZXQgcmFuayA9IE1hdGguY2VpbCg4IC0gKDggKiAoKHBvc1sxXSAtIGJvdW5kcy50b3ApIC8gYm91bmRzLmhlaWdodCkpKTtcbiAgaWYgKCFhc1doaXRlKSByYW5rID0gOSAtIHJhbms7XG4gIHJldHVybiAoZmlsZSA+IDAgJiYgZmlsZSA8IDkgJiYgcmFuayA+IDAgJiYgcmFuayA8IDkpID8gcG9zMmtleShbZmlsZSwgcmFua10pIDogdW5kZWZpbmVkO1xufVxuIiwiaW1wb3J0IHsgQXBpLCBzdGFydCB9IGZyb20gJy4vYXBpJ1xuaW1wb3J0IHsgQ29uZmlnLCBjb25maWd1cmUgfSBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7IFN0YXRlLCBkZWZhdWx0cyB9IGZyb20gJy4vc3RhdGUnXG5cbmltcG9ydCByZW5kZXJXcmFwIGZyb20gJy4vd3JhcCc7XG5pbXBvcnQgKiBhcyBldmVudHMgZnJvbSAnLi9ldmVudHMnXG5pbXBvcnQgcmVuZGVyIGZyb20gJy4vcmVuZGVyJztcbmltcG9ydCAqIGFzIHN2ZyBmcm9tICcuL3N2Zyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVzc2dyb3VuZChlbGVtZW50OiBIVE1MRWxlbWVudCwgY29uZmlnPzogQ29uZmlnKTogQXBpIHtcblxuICBjb25zdCBzdGF0ZSA9IGRlZmF1bHRzKCkgYXMgU3RhdGU7XG5cbiAgY29uZmlndXJlKHN0YXRlLCBjb25maWcgfHwge30pO1xuXG4gIGZ1bmN0aW9uIHJlZHJhd0FsbCgpIHtcbiAgICBsZXQgcHJldlVuYmluZCA9IHN0YXRlLmRvbSAmJiBzdGF0ZS5kb20udW5iaW5kO1xuICAgIC8vIGZpcnN0IGVuc3VyZSB0aGUgY2ctd3JhcCBjbGFzcyBpcyBzZXRcbiAgICAvLyBzbyBib3VuZHMgY2FsY3VsYXRpb24gY2FuIHVzZSB0aGUgQ1NTIHdpZHRoL2hlaWdodCB2YWx1ZXNcbiAgICAvLyBhZGQgdGhhdCBjbGFzcyB5b3Vyc2VsZiB0byB0aGUgZWxlbWVudCBiZWZvcmUgY2FsbGluZyBjaGVzc2dyb3VuZFxuICAgIC8vIGZvciBhIHNsaWdodCBwZXJmb3JtYW5jZSBpbXByb3ZlbWVudCEgKGF2b2lkcyByZWNvbXB1dGluZyBzdHlsZSlcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NnLXdyYXAnKTtcbiAgICAvLyBjb21wdXRlIGJvdW5kcyBmcm9tIGV4aXN0aW5nIGJvYXJkIGVsZW1lbnQgaWYgcG9zc2libGVcbiAgICAvLyB0aGlzIGFsbG93cyBub24tc3F1YXJlIGJvYXJkcyBmcm9tIENTUyB0byBiZSBoYW5kbGVkIChmb3IgM0QpXG4gICAgY29uc3QgcmVsYXRpdmUgPSBzdGF0ZS52aWV3T25seSAmJiAhc3RhdGUuZHJhd2FibGUudmlzaWJsZTtcbiAgICBjb25zdCBlbGVtZW50cyA9IHJlbmRlcldyYXAoZWxlbWVudCwgc3RhdGUsIHJlbGF0aXZlKTtcbiAgICBjb25zdCBib3VuZHMgPSB1dGlsLm1lbW8oKCkgPT4gZWxlbWVudHMuYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpO1xuICAgIGNvbnN0IHJlZHJhd05vdyA9IChza2lwU3ZnPzogYm9vbGVhbikgPT4ge1xuICAgICAgcmVuZGVyKHN0YXRlKTtcbiAgICAgIGlmICghc2tpcFN2ZyAmJiBlbGVtZW50cy5zdmcpIHN2Zy5yZW5kZXJTdmcoc3RhdGUsIGVsZW1lbnRzLnN2Zyk7XG4gICAgfTtcbiAgICBzdGF0ZS5kb20gPSB7XG4gICAgICBlbGVtZW50czogZWxlbWVudHMsXG4gICAgICBib3VuZHM6IGJvdW5kcyxcbiAgICAgIHJlZHJhdzogZGVib3VuY2VSZWRyYXcocmVkcmF3Tm93KSxcbiAgICAgIHJlZHJhd05vdzogcmVkcmF3Tm93LFxuICAgICAgdW5iaW5kOiBwcmV2VW5iaW5kLFxuICAgICAgcmVsYXRpdmVcbiAgICB9O1xuICAgIHN0YXRlLmRyYXdhYmxlLnByZXZTdmdIYXNoID0gJyc7XG4gICAgcmVkcmF3Tm93KGZhbHNlKTtcbiAgICBldmVudHMuYmluZEJvYXJkKHN0YXRlKTtcbiAgICBpZiAoIXByZXZVbmJpbmQpIHN0YXRlLmRvbS51bmJpbmQgPSBldmVudHMuYmluZERvY3VtZW50KHN0YXRlLCByZWRyYXdBbGwpO1xuICAgIHN0YXRlLmV2ZW50cy5pbnNlcnQgJiYgc3RhdGUuZXZlbnRzLmluc2VydChlbGVtZW50cyk7XG4gIH1cbiAgcmVkcmF3QWxsKCk7XG5cbiAgY29uc3QgYXBpID0gc3RhcnQoc3RhdGUsIHJlZHJhd0FsbCk7XG5cbiAgcmV0dXJuIGFwaTtcbn07XG5cbmZ1bmN0aW9uIGRlYm91bmNlUmVkcmF3KHJlZHJhd05vdzogKHNraXBTdmc/OiBib29sZWFuKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gIGxldCByZWRyYXdpbmcgPSBmYWxzZTtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBpZiAocmVkcmF3aW5nKSByZXR1cm47XG4gICAgcmVkcmF3aW5nID0gdHJ1ZTtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgcmVkcmF3Tm93KCk7XG4gICAgICByZWRyYXdpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHNldENoZWNrLCBzZXRTZWxlY3RlZCB9IGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyByZWFkIGFzIGZlblJlYWQgfSBmcm9tICcuL2ZlbidcbmltcG9ydCB7IERyYXdTaGFwZSwgRHJhd0JydXNoIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGludGVyZmFjZSBDb25maWcge1xuICBmZW4/OiBjZy5GRU47IC8vIGNoZXNzIHBvc2l0aW9uIGluIEZvcnN5dGggbm90YXRpb25cbiAgb3JpZW50YXRpb24/OiBjZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHdoaXRlIHwgYmxhY2tcbiAgdHVybkNvbG9yPzogY2cuQ29sb3I7IC8vIHR1cm4gdG8gcGxheS4gd2hpdGUgfCBibGFja1xuICBjaGVjaz86IGNnLkNvbG9yIHwgYm9vbGVhbjsgLy8gdHJ1ZSBmb3IgY3VycmVudCBjb2xvciwgZmFsc2UgdG8gdW5zZXRcbiAgbGFzdE1vdmU/OiBjZy5LZXlbXTsgLy8gc3F1YXJlcyBwYXJ0IG9mIHRoZSBsYXN0IG1vdmUgW1wiYzNcIiwgXCJjNFwiXVxuICBzZWxlY3RlZD86IGNnLktleTsgLy8gc3F1YXJlIGN1cnJlbnRseSBzZWxlY3RlZCBcImExXCJcbiAgY29vcmRpbmF0ZXM/OiBib29sZWFuOyAvLyBpbmNsdWRlIGNvb3JkcyBhdHRyaWJ1dGVzXG4gIGF1dG9DYXN0bGU/OiBib29sZWFuOyAvLyBpbW1lZGlhdGVseSBjb21wbGV0ZSB0aGUgY2FzdGxlIGJ5IG1vdmluZyB0aGUgcm9vayBhZnRlciBraW5nIG1vdmVcbiAgdmlld09ubHk/OiBib29sZWFuOyAvLyBkb24ndCBiaW5kIGV2ZW50czogdGhlIHVzZXIgd2lsbCBuZXZlciBiZSBhYmxlIHRvIG1vdmUgcGllY2VzIGFyb3VuZFxuICBkaXNhYmxlQ29udGV4dE1lbnU/OiBib29sZWFuOyAvLyBiZWNhdXNlIHdobyBuZWVkcyBhIGNvbnRleHQgbWVudSBvbiBhIGNoZXNzYm9hcmRcbiAgcmVzaXphYmxlPzogYm9vbGVhbjsgLy8gbGlzdGVucyB0byBjaGVzc2dyb3VuZC5yZXNpemUgb24gZG9jdW1lbnQuYm9keSB0byBjbGVhciBib3VuZHMgY2FjaGVcbiAgYWRkUGllY2VaSW5kZXg/OiBib29sZWFuOyAvLyBhZGRzIHotaW5kZXggdmFsdWVzIHRvIHBpZWNlcyAoZm9yIDNEKVxuICAvLyBwaWVjZUtleTogYm9vbGVhbjsgLy8gYWRkIGEgZGF0YS1rZXkgYXR0cmlidXRlIHRvIHBpZWNlIGVsZW1lbnRzXG4gIGhpZ2hsaWdodD86IHtcbiAgICBsYXN0TW92ZT86IGJvb2xlYW47IC8vIGFkZCBsYXN0LW1vdmUgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrPzogYm9vbGVhbjsgLy8gYWRkIGNoZWNrIGNsYXNzIHRvIHNxdWFyZXNcbiAgfTtcbiAgYW5pbWF0aW9uPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuO1xuICAgIGR1cmF0aW9uPzogbnVtYmVyO1xuICB9O1xuICBtb3ZhYmxlPzoge1xuICAgIGZyZWU/OiBib29sZWFuOyAvLyBhbGwgbW92ZXMgYXJlIHZhbGlkIC0gYm9hcmQgZWRpdG9yXG4gICAgY29sb3I/OiBjZy5Db2xvciB8ICdib3RoJzsgLy8gY29sb3IgdGhhdCBjYW4gbW92ZS4gd2hpdGUgfCBibGFjayB8IGJvdGggfCB1bmRlZmluZWRcbiAgICBkZXN0cz86IHtcbiAgICAgIFtrZXk6IHN0cmluZ106IGNnLktleVtdXG4gICAgfTsgLy8gdmFsaWQgbW92ZXMuIHtcImEyXCIgW1wiYTNcIiBcImE0XCJdIFwiYjFcIiBbXCJhM1wiIFwiYzNcIl19XG4gICAgc2hvd0Rlc3RzPzogYm9vbGVhbjsgLy8gd2hldGhlciB0byBhZGQgdGhlIG1vdmUtZGVzdCBjbGFzcyBvbiBzcXVhcmVzXG4gICAgZXZlbnRzPzoge1xuICAgICAgYWZ0ZXI/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgbW92ZSBoYXMgYmVlbiBwbGF5ZWRcbiAgICAgIGFmdGVyTmV3UGllY2U/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXksIG1ldGFkYXRhOiBjZy5Nb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciBhIG5ldyBwaWVjZSBpcyBkcm9wcGVkIG9uIHRoZSBib2FyZFxuICAgIH07XG4gICAgcm9va0Nhc3RsZT86IGJvb2xlYW4gLy8gY2FzdGxlIGJ5IG1vdmluZyB0aGUga2luZyB0byB0aGUgcm9va1xuICB9O1xuICBwcmVtb3ZhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVtb3ZlcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBzaG93RGVzdHM/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBjYXN0bGU/OiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFsbG93IGtpbmcgY2FzdGxlIHByZW1vdmVzXG4gICAgZGVzdHM/OiBjZy5LZXlbXTsgLy8gcHJlbW92ZSBkZXN0aW5hdGlvbnMgZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICAgIGV2ZW50cz86IHtcbiAgICAgIHNldD86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE/OiBjZy5TZXRQcmVtb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgIC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH1cbiAgfTtcbiAgcHJlZHJvcHBhYmxlPzoge1xuICAgIGVuYWJsZWQ/OiBib29sZWFuOyAvLyBhbGxvdyBwcmVkcm9wcyBmb3IgY29sb3IgdGhhdCBjYW4gbm90IG1vdmVcbiAgICBldmVudHM/OiB7XG4gICAgICBzZXQ/OiAocm9sZTogY2cuUm9sZSwga2V5OiBjZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlZHJvcCBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHVuc2V0XG4gICAgfVxuICB9O1xuICBkcmFnZ2FibGU/OiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U/OiBudW1iZXI7IC8vIG1pbmltdW0gZGlzdGFuY2UgdG8gaW5pdGlhdGUgYSBkcmFnOyBpbiBwaXhlbHNcbiAgICBhdXRvRGlzdGFuY2U/OiBib29sZWFuOyAvLyBsZXRzIGNoZXNzZ3JvdW5kIHNldCBkaXN0YW5jZSB0byB6ZXJvIHdoZW4gdXNlciBkcmFncyBwaWVjZXNcbiAgICBjZW50ZXJQaWVjZT86IGJvb2xlYW47IC8vIGNlbnRlciB0aGUgcGllY2Ugb24gY3Vyc29yIGF0IGRyYWcgc3RhcnRcbiAgICBzaG93R2hvc3Q/OiBib29sZWFuOyAvLyBzaG93IGdob3N0IG9mIHBpZWNlIGJlaW5nIGRyYWdnZWRcbiAgICBkZWxldGVPbkRyb3BPZmY/OiBib29sZWFuOyAvLyBkZWxldGUgYSBwaWVjZSB3aGVuIGl0IGlzIGRyb3BwZWQgb2ZmIHRoZSBib2FyZFxuICB9O1xuICBzZWxlY3RhYmxlPzoge1xuICAgIC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBlbmFibGVkPzogYm9vbGVhblxuICB9O1xuICBldmVudHM/OiB7XG4gICAgY2hhbmdlPzogKCkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBvbiB0aGUgYm9hcmRcbiAgICAvLyBjYWxsZWQgYWZ0ZXIgYSBwaWVjZSBoYXMgYmVlbiBtb3ZlZC5cbiAgICAvLyBjYXB0dXJlZFBpZWNlIGlzIHVuZGVmaW5lZCBvciBsaWtlIHtjb2xvcjogJ3doaXRlJzsgJ3JvbGUnOiAncXVlZW4nfVxuICAgIG1vdmU/OiAob3JpZzogY2cuS2V5LCBkZXN0OiBjZy5LZXksIGNhcHR1cmVkUGllY2U/OiBjZy5QaWVjZSkgPT4gdm9pZDtcbiAgICBkcm9wTmV3UGllY2U/OiAocGllY2U6IGNnLlBpZWNlLCBrZXk6IGNnLktleSkgPT4gdm9pZDtcbiAgICBzZWxlY3Q/OiAoa2V5OiBjZy5LZXkpID0+IHZvaWQ7IC8vIGNhbGxlZCB3aGVuIGEgc3F1YXJlIGlzIHNlbGVjdGVkXG4gICAgaW5zZXJ0PzogKGVsZW1lbnRzOiBjZy5FbGVtZW50cykgPT4gdm9pZDsgLy8gd2hlbiB0aGUgYm9hcmQgRE9NIGhhcyBiZWVuIChyZSlpbnNlcnRlZFxuICB9O1xuICBkcmF3YWJsZT86IHtcbiAgICBlbmFibGVkPzogYm9vbGVhbjsgLy8gY2FuIGRyYXdcbiAgICB2aXNpYmxlPzogYm9vbGVhbjsgLy8gY2FuIHZpZXdcbiAgICBlcmFzZU9uQ2xpY2s/OiBib29sZWFuO1xuICAgIHNoYXBlcz86IERyYXdTaGFwZVtdO1xuICAgIGF1dG9TaGFwZXM/OiBEcmF3U2hhcGVbXTtcbiAgICBicnVzaGVzPzogRHJhd0JydXNoW107XG4gICAgcGllY2VzPzoge1xuICAgICAgYmFzZVVybD86IHN0cmluZztcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZShzdGF0ZTogU3RhdGUsIGNvbmZpZzogQ29uZmlnKSB7XG5cbiAgLy8gZG9uJ3QgbWVyZ2UgZGVzdGluYXRpb25zLiBKdXN0IG92ZXJyaWRlLlxuICBpZiAoY29uZmlnLm1vdmFibGUgJiYgY29uZmlnLm1vdmFibGUuZGVzdHMpIHN0YXRlLm1vdmFibGUuZGVzdHMgPSB1bmRlZmluZWQ7XG5cbiAgbWVyZ2Uoc3RhdGUsIGNvbmZpZyk7XG5cbiAgLy8gaWYgYSBmZW4gd2FzIHByb3ZpZGVkLCByZXBsYWNlIHRoZSBwaWVjZXNcbiAgaWYgKGNvbmZpZy5mZW4pIHtcbiAgICBzdGF0ZS5waWVjZXMgPSBmZW5SZWFkKGNvbmZpZy5mZW4pO1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICB9XG5cbiAgLy8gYXBwbHkgY29uZmlnIHZhbHVlcyB0aGF0IGNvdWxkIGJlIHVuZGVmaW5lZCB5ZXQgbWVhbmluZ2Z1bFxuICBpZiAoY29uZmlnLmhhc093blByb3BlcnR5KCdjaGVjaycpKSBzZXRDaGVjayhzdGF0ZSwgY29uZmlnLmNoZWNrIHx8IGZhbHNlKTtcbiAgaWYgKGNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgnbGFzdE1vdmUnKSAmJiAhY29uZmlnLmxhc3RNb3ZlKSBzdGF0ZS5sYXN0TW92ZSA9IHVuZGVmaW5lZDtcbiAgLy8gaW4gY2FzZSBvZiBaSCBkcm9wIGxhc3QgbW92ZSwgdGhlcmUncyBhIHNpbmdsZSBzcXVhcmUuXG4gIC8vIGlmIHRoZSBwcmV2aW91cyBsYXN0IG1vdmUgaGFkIHR3byBzcXVhcmVzLFxuICAvLyB0aGUgbWVyZ2UgYWxnb3JpdGhtIHdpbGwgaW5jb3JyZWN0bHkga2VlcCB0aGUgc2Vjb25kIHNxdWFyZS5cbiAgZWxzZSBpZiAoY29uZmlnLmxhc3RNb3ZlKSBzdGF0ZS5sYXN0TW92ZSA9IGNvbmZpZy5sYXN0TW92ZTtcblxuICAvLyBmaXggbW92ZS9wcmVtb3ZlIGRlc3RzXG4gIGlmIChzdGF0ZS5zZWxlY3RlZCkgc2V0U2VsZWN0ZWQoc3RhdGUsIHN0YXRlLnNlbGVjdGVkKTtcblxuICAvLyBubyBuZWVkIGZvciBzdWNoIHNob3J0IGFuaW1hdGlvbnNcbiAgaWYgKCFzdGF0ZS5hbmltYXRpb24uZHVyYXRpb24gfHwgc3RhdGUuYW5pbWF0aW9uLmR1cmF0aW9uIDwgMTAwKSBzdGF0ZS5hbmltYXRpb24uZW5hYmxlZCA9IGZhbHNlO1xuXG4gIGlmICghc3RhdGUubW92YWJsZS5yb29rQ2FzdGxlICYmIHN0YXRlLm1vdmFibGUuZGVzdHMpIHtcbiAgICBjb25zdCByYW5rID0gc3RhdGUubW92YWJsZS5jb2xvciA9PT0gJ3doaXRlJyA/IDEgOiA4O1xuICAgIGNvbnN0IGtpbmdTdGFydFBvcyA9ICdlJyArIHJhbms7XG4gICAgY29uc3QgZGVzdHMgPSBzdGF0ZS5tb3ZhYmxlLmRlc3RzW2tpbmdTdGFydFBvc107XG4gICAgY29uc3Qga2luZyA9IHN0YXRlLnBpZWNlc1traW5nU3RhcnRQb3NdO1xuICAgIGlmICghZGVzdHMgfHwgIWtpbmcgfHwga2luZy5yb2xlICE9PSAna2luZycpIHJldHVybjtcbiAgICBzdGF0ZS5tb3ZhYmxlLmRlc3RzW2tpbmdTdGFydFBvc10gPSBkZXN0cy5maWx0ZXIoZCA9PlxuICAgICAgISgoZCA9PT0gJ2EnICsgcmFuaykgJiYgZGVzdHMuaW5kZXhPZignYycgKyByYW5rIGFzIGNnLktleSkgIT09IC0xKSAmJlxuICAgICAgICAhKChkID09PSAnaCcgKyByYW5rKSAmJiBkZXN0cy5pbmRleE9mKCdnJyArIHJhbmsgYXMgY2cuS2V5KSAhPT0gLTEpXG4gICAgKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gbWVyZ2UoYmFzZTogYW55LCBleHRlbmQ6IGFueSkge1xuICBmb3IgKGxldCBrZXkgaW4gZXh0ZW5kKSB7XG4gICAgaWYgKGlzT2JqZWN0KGJhc2Vba2V5XSkgJiYgaXNPYmplY3QoZXh0ZW5kW2tleV0pKSBtZXJnZShiYXNlW2tleV0sIGV4dGVuZFtrZXldKTtcbiAgICBlbHNlIGJhc2Vba2V5XSA9IGV4dGVuZFtrZXldO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG86IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgYm9hcmQgZnJvbSAnLi9ib2FyZCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgY2xlYXIgYXMgZHJhd0NsZWFyIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IGFuaW0gfSBmcm9tICcuL2FuaW0nXG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhZ0N1cnJlbnQge1xuICBvcmlnOiBjZy5LZXk7IC8vIG9yaWcga2V5IG9mIGRyYWdnaW5nIHBpZWNlXG4gIG9yaWdQb3M6IGNnLlBvcztcbiAgcGllY2U6IGNnLlBpZWNlO1xuICByZWw6IGNnLk51bWJlclBhaXI7IC8vIHg7IHkgb2YgdGhlIHBpZWNlIGF0IG9yaWdpbmFsIHBvc2l0aW9uXG4gIGVwb3M6IGNnLk51bWJlclBhaXI7IC8vIGluaXRpYWwgZXZlbnQgcG9zaXRpb25cbiAgcG9zOiBjZy5OdW1iZXJQYWlyOyAvLyByZWxhdGl2ZSBjdXJyZW50IHBvc2l0aW9uXG4gIGRlYzogY2cuTnVtYmVyUGFpcjsgLy8gcGllY2UgY2VudGVyIGRlY2F5XG4gIHN0YXJ0ZWQ6IGJvb2xlYW47IC8vIHdoZXRoZXIgdGhlIGRyYWcgaGFzIHN0YXJ0ZWQ7IGFzIHBlciB0aGUgZGlzdGFuY2Ugc2V0dGluZ1xuICBlbGVtZW50OiBjZy5QaWVjZU5vZGUgfCAoKCkgPT4gY2cuUGllY2VOb2RlIHwgdW5kZWZpbmVkKTtcbiAgbmV3UGllY2U/OiBib29sZWFuOyAvLyBpdCBpdCBhIG5ldyBwaWVjZSBmcm9tIG91dHNpZGUgdGhlIGJvYXJkXG4gIGZvcmNlPzogYm9vbGVhbjsgLy8gY2FuIHRoZSBuZXcgcGllY2UgcmVwbGFjZSBhbiBleGlzdGluZyBvbmUgKGVkaXRvcilcbiAgcHJldmlvdXNseVNlbGVjdGVkPzogY2cuS2V5O1xuICBvcmlnaW5UYXJnZXQ6IEV2ZW50VGFyZ2V0IHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHM6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIGlmIChlLmJ1dHRvbiAhPT0gdW5kZWZpbmVkICYmIGUuYnV0dG9uICE9PSAwKSByZXR1cm47IC8vIG9ubHkgdG91Y2ggb3IgbGVmdCBjbGlja1xuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47IC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGNvbnN0IGFzV2hpdGUgPSBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLFxuICBib3VuZHMgPSBzLmRvbS5ib3VuZHMoKSxcbiAgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcixcbiAgb3JpZyA9IGJvYXJkLmdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCBhc1doaXRlLCBib3VuZHMpO1xuICBpZiAoIW9yaWcpIHJldHVybjtcbiAgY29uc3QgcGllY2UgPSBzLnBpZWNlc1tvcmlnXTtcbiAgY29uc3QgcHJldmlvdXNseVNlbGVjdGVkID0gcy5zZWxlY3RlZDtcbiAgaWYgKCFwcmV2aW91c2x5U2VsZWN0ZWQgJiYgcy5kcmF3YWJsZS5lbmFibGVkICYmIChcbiAgICBzLmRyYXdhYmxlLmVyYXNlT25DbGljayB8fCAoIXBpZWNlIHx8IHBpZWNlLmNvbG9yICE9PSBzLnR1cm5Db2xvcilcbiAgKSkgZHJhd0NsZWFyKHMpO1xuICAvLyBQcmV2ZW50IHRvdWNoIHNjcm9sbCBhbmQgY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnQsIGlmIHRoZXJlXG4gIC8vIGlzIGFuIGludGVudCB0byBpbnRlcmFjdCB3aXRoIHRoZSBib2FyZC4gSWYgbm8gY29sb3IgaXMgbW92YWJsZVxuICAvLyAoYW5kIHRoZSBib2FyZCBpcyBub3QgZm9yIHZpZXdpbmcgb25seSksIHRvdWNoZXMgYXJlIGxpa2VseSBpbnRlbmRlZCB0b1xuICAvLyBzZWxlY3Qgc3F1YXJlcy5cbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoc3RhcnQnICYmIGUuY2FuY2VsYWJsZSAhPT0gZmFsc2UgJiZcbiAgICAgICghZS50b3VjaGVzIHx8ICFzLm1vdmFibGUuY29sb3IgfHwgcGllY2UgfHwgcHJldmlvdXNseVNlbGVjdGVkIHx8IHBpZWNlQ2xvc2VUbyhzLCBwb3NpdGlvbikpKVxuICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgY29uc3QgaGFkUHJlbW92ZSA9ICEhcy5wcmVtb3ZhYmxlLmN1cnJlbnQ7XG4gIGNvbnN0IGhhZFByZWRyb3AgPSAhIXMucHJlZHJvcHBhYmxlLmN1cnJlbnQ7XG4gIHMuc3RhdHMuY3RybEtleSA9IGUuY3RybEtleTtcbiAgaWYgKHMuc2VsZWN0ZWQgJiYgYm9hcmQuY2FuTW92ZShzLCBzLnNlbGVjdGVkLCBvcmlnKSkge1xuICAgIGFuaW0oc3RhdGUgPT4gYm9hcmQuc2VsZWN0U3F1YXJlKHN0YXRlLCBvcmlnKSwgcyk7XG4gIH0gZWxzZSB7XG4gICAgYm9hcmQuc2VsZWN0U3F1YXJlKHMsIG9yaWcpO1xuICB9XG4gIGNvbnN0IHN0aWxsU2VsZWN0ZWQgPSBzLnNlbGVjdGVkID09PSBvcmlnO1xuICBjb25zdCBlbGVtZW50ID0gcGllY2VFbGVtZW50QnlLZXkocywgb3JpZyk7XG4gIGlmIChwaWVjZSAmJiBlbGVtZW50ICYmIHN0aWxsU2VsZWN0ZWQgJiYgYm9hcmQuaXNEcmFnZ2FibGUocywgb3JpZykpIHtcbiAgICBjb25zdCBzcXVhcmVCb3VuZHMgPSBjb21wdXRlU3F1YXJlQm91bmRzKG9yaWcsIGFzV2hpdGUsIGJvdW5kcyk7XG4gICAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICAgIG9yaWc6IG9yaWcsXG4gICAgICBvcmlnUG9zOiB1dGlsLmtleTJwb3Mob3JpZyksXG4gICAgICBwaWVjZTogcGllY2UsXG4gICAgICByZWw6IHBvc2l0aW9uLFxuICAgICAgZXBvczogcG9zaXRpb24sXG4gICAgICBwb3M6IFswLCAwXSxcbiAgICAgIGRlYzogcy5kcmFnZ2FibGUuY2VudGVyUGllY2UgPyBbXG4gICAgICAgIHBvc2l0aW9uWzBdIC0gKHNxdWFyZUJvdW5kcy5sZWZ0ICsgc3F1YXJlQm91bmRzLndpZHRoIC8gMiksXG4gICAgICAgIHBvc2l0aW9uWzFdIC0gKHNxdWFyZUJvdW5kcy50b3AgKyBzcXVhcmVCb3VuZHMuaGVpZ2h0IC8gMilcbiAgICAgIF0gOiBbMCwgMF0sXG4gICAgICBzdGFydGVkOiBzLmRyYWdnYWJsZS5hdXRvRGlzdGFuY2UgJiYgcy5zdGF0cy5kcmFnZ2VkLFxuICAgICAgZWxlbWVudDogZWxlbWVudCxcbiAgICAgIHByZXZpb3VzbHlTZWxlY3RlZDogcHJldmlvdXNseVNlbGVjdGVkLFxuICAgICAgb3JpZ2luVGFyZ2V0OiBlLnRhcmdldFxuICAgIH07XG4gICAgZWxlbWVudC5jZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RyYWdnaW5nJyk7XG4gICAgLy8gcGxhY2UgZ2hvc3RcbiAgICBjb25zdCBnaG9zdCA9IHMuZG9tLmVsZW1lbnRzLmdob3N0O1xuICAgIGlmIChnaG9zdCkge1xuICAgICAgZ2hvc3QuY2xhc3NOYW1lID0gYGdob3N0ICR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gO1xuICAgICAgdXRpbC50cmFuc2xhdGVBYnMoZ2hvc3QsIHV0aWwucG9zVG9UcmFuc2xhdGVBYnMoYm91bmRzKSh1dGlsLmtleTJwb3Mob3JpZyksIGFzV2hpdGUpKTtcbiAgICAgIHV0aWwuc2V0VmlzaWJsZShnaG9zdCwgdHJ1ZSk7XG4gICAgfVxuICAgIHByb2Nlc3NEcmFnKHMpO1xuICB9IGVsc2Uge1xuICAgIGlmIChoYWRQcmVtb3ZlKSBib2FyZC51bnNldFByZW1vdmUocyk7XG4gICAgaWYgKGhhZFByZWRyb3ApIGJvYXJkLnVuc2V0UHJlZHJvcChzKTtcbiAgfVxuICBzLmRvbS5yZWRyYXcoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBpZWNlQ2xvc2VUbyhzOiBTdGF0ZSwgcG9zOiBjZy5Qb3MpOiBib29sZWFuIHtcbiAgY29uc3QgYXNXaGl0ZSA9IHMub3JpZW50YXRpb24gPT09ICd3aGl0ZScsXG4gIGJvdW5kcyA9IHMuZG9tLmJvdW5kcygpLFxuICByYWRpdXNTcSA9IE1hdGgucG93KGJvdW5kcy53aWR0aCAvIDgsIDIpO1xuICBmb3IgKGxldCBrZXkgaW4gcy5waWVjZXMpIHtcbiAgICBjb25zdCBzcXVhcmVCb3VuZHMgPSBjb21wdXRlU3F1YXJlQm91bmRzKGtleSBhcyBjZy5LZXksIGFzV2hpdGUsIGJvdW5kcyksXG4gICAgY2VudGVyOiBjZy5Qb3MgPSBbXG4gICAgICBzcXVhcmVCb3VuZHMubGVmdCArIHNxdWFyZUJvdW5kcy53aWR0aCAvIDIsXG4gICAgICBzcXVhcmVCb3VuZHMudG9wICsgc3F1YXJlQm91bmRzLmhlaWdodCAvIDJcbiAgICBdO1xuICAgIGlmICh1dGlsLmRpc3RhbmNlU3EoY2VudGVyLCBwb3MpIDw9IHJhZGl1c1NxKSByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkcmFnTmV3UGllY2UoczogU3RhdGUsIHBpZWNlOiBjZy5QaWVjZSwgZTogY2cuTW91Y2hFdmVudCwgZm9yY2U/OiBib29sZWFuKTogdm9pZCB7XG5cbiAgY29uc3Qga2V5OiBjZy5LZXkgPSAnYTAnO1xuXG4gIHMucGllY2VzW2tleV0gPSBwaWVjZTtcblxuICBzLmRvbS5yZWRyYXcoKTtcblxuICBjb25zdCBwb3NpdGlvbiA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyLFxuICBhc1doaXRlID0gcy5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJyxcbiAgYm91bmRzID0gcy5kb20uYm91bmRzKCksXG4gIHNxdWFyZUJvdW5kcyA9IGNvbXB1dGVTcXVhcmVCb3VuZHMoa2V5LCBhc1doaXRlLCBib3VuZHMpO1xuXG4gIGNvbnN0IHJlbDogY2cuTnVtYmVyUGFpciA9IFtcbiAgICAoYXNXaGl0ZSA/IDAgOiA3KSAqIHNxdWFyZUJvdW5kcy53aWR0aCArIGJvdW5kcy5sZWZ0LFxuICAgIChhc1doaXRlID8gOCA6IC0xKSAqIHNxdWFyZUJvdW5kcy5oZWlnaHQgKyBib3VuZHMudG9wXG4gIF07XG5cbiAgcy5kcmFnZ2FibGUuY3VycmVudCA9IHtcbiAgICBvcmlnOiBrZXksXG4gICAgb3JpZ1BvczogdXRpbC5rZXkycG9zKGtleSksXG4gICAgcGllY2U6IHBpZWNlLFxuICAgIHJlbDogcmVsLFxuICAgIGVwb3M6IHBvc2l0aW9uLFxuICAgIHBvczogW3Bvc2l0aW9uWzBdIC0gcmVsWzBdLCBwb3NpdGlvblsxXSAtIHJlbFsxXV0sXG4gICAgZGVjOiBbLXNxdWFyZUJvdW5kcy53aWR0aCAvIDIsIC1zcXVhcmVCb3VuZHMuaGVpZ2h0IC8gMl0sXG4gICAgc3RhcnRlZDogdHJ1ZSxcbiAgICBlbGVtZW50OiAoKSA9PiBwaWVjZUVsZW1lbnRCeUtleShzLCBrZXkpLFxuICAgIG9yaWdpblRhcmdldDogZS50YXJnZXQsXG4gICAgbmV3UGllY2U6IHRydWUsXG4gICAgZm9yY2U6IGZvcmNlIHx8IGZhbHNlXG4gIH07XG4gIHByb2Nlc3NEcmFnKHMpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRHJhZyhzOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gICAgaWYgKCFjdXIpIHJldHVybjtcbiAgICAvLyBjYW5jZWwgYW5pbWF0aW9ucyB3aGlsZSBkcmFnZ2luZ1xuICAgIGlmIChzLmFuaW1hdGlvbi5jdXJyZW50ICYmIHMuYW5pbWF0aW9uLmN1cnJlbnQucGxhbi5hbmltc1tjdXIub3JpZ10pIHMuYW5pbWF0aW9uLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgLy8gaWYgbW92aW5nIHBpZWNlIGlzIGdvbmUsIGNhbmNlbFxuICAgIGNvbnN0IG9yaWdQaWVjZSA9IHMucGllY2VzW2N1ci5vcmlnXTtcbiAgICBpZiAoIW9yaWdQaWVjZSB8fCAhdXRpbC5zYW1lUGllY2Uob3JpZ1BpZWNlLCBjdXIucGllY2UpKSBjYW5jZWwocyk7XG4gICAgZWxzZSB7XG4gICAgICBpZiAoIWN1ci5zdGFydGVkICYmIHV0aWwuZGlzdGFuY2VTcShjdXIuZXBvcywgY3VyLnJlbCkgPj0gTWF0aC5wb3cocy5kcmFnZ2FibGUuZGlzdGFuY2UsIDIpKSBjdXIuc3RhcnRlZCA9IHRydWU7XG4gICAgICBpZiAoY3VyLnN0YXJ0ZWQpIHtcblxuICAgICAgICAvLyBzdXBwb3J0IGxhenkgZWxlbWVudHNcbiAgICAgICAgaWYgKHR5cGVvZiBjdXIuZWxlbWVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnN0IGZvdW5kID0gY3VyLmVsZW1lbnQoKTtcbiAgICAgICAgICBpZiAoIWZvdW5kKSByZXR1cm47XG4gICAgICAgICAgY3VyLmVsZW1lbnQgPSBmb3VuZDtcbiAgICAgICAgICBjdXIuZWxlbWVudC5jZ0RyYWdnaW5nID0gdHJ1ZTtcbiAgICAgICAgICBjdXIuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdkcmFnZ2luZycpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYXNXaGl0ZSA9IHMub3JpZW50YXRpb24gPT09ICd3aGl0ZScsXG4gICAgICAgIGJvdW5kcyA9IHMuZG9tLmJvdW5kcygpO1xuICAgICAgICBjdXIucG9zID0gW1xuICAgICAgICAgIGN1ci5lcG9zWzBdIC0gY3VyLnJlbFswXSxcbiAgICAgICAgICBjdXIuZXBvc1sxXSAtIGN1ci5yZWxbMV1cbiAgICAgICAgXTtcblxuICAgICAgICAvLyBtb3ZlIHBpZWNlXG4gICAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gdXRpbC5wb3NUb1RyYW5zbGF0ZUFicyhib3VuZHMpKGN1ci5vcmlnUG9zLCBhc1doaXRlKTtcbiAgICAgICAgdHJhbnNsYXRpb25bMF0gKz0gY3VyLnBvc1swXSArIGN1ci5kZWNbMF07XG4gICAgICAgIHRyYW5zbGF0aW9uWzFdICs9IGN1ci5wb3NbMV0gKyBjdXIuZGVjWzFdO1xuICAgICAgICB1dGlsLnRyYW5zbGF0ZUFicyhjdXIuZWxlbWVudCwgdHJhbnNsYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICBwcm9jZXNzRHJhZyhzKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlKHM6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KTogdm9pZCB7XG4gIC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChzLmRyYWdnYWJsZS5jdXJyZW50ICYmICghZS50b3VjaGVzIHx8IGUudG91Y2hlcy5sZW5ndGggPCAyKSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQuZXBvcyA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmQoczogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgY29uc3QgY3VyID0gcy5kcmFnZ2FibGUuY3VycmVudDtcbiAgaWYgKCFjdXIpIHJldHVybjtcbiAgLy8gY3JlYXRlIG5vIGNvcnJlc3BvbmRpbmcgbW91c2UgZXZlbnRcbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBlLmNhbmNlbGFibGUgIT09IGZhbHNlKSBlLnByZXZlbnREZWZhdWx0KCk7XG4gIC8vIGNvbXBhcmluZyB3aXRoIHRoZSBvcmlnaW4gdGFyZ2V0IGlzIGFuIGVhc3kgd2F5IHRvIHRlc3QgdGhhdCB0aGUgZW5kIGV2ZW50XG4gIC8vIGhhcyB0aGUgc2FtZSB0b3VjaCBvcmlnaW5cbiAgaWYgKGUudHlwZSA9PT0gJ3RvdWNoZW5kJyAmJiBjdXIgJiYgY3VyLm9yaWdpblRhcmdldCAhPT0gZS50YXJnZXQgJiYgIWN1ci5uZXdQaWVjZSkge1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJvYXJkLnVuc2V0UHJlbW92ZShzKTtcbiAgYm9hcmQudW5zZXRQcmVkcm9wKHMpO1xuICAvLyB0b3VjaGVuZCBoYXMgbm8gcG9zaXRpb247IHNvIHVzZSB0aGUgbGFzdCB0b3VjaG1vdmUgcG9zaXRpb24gaW5zdGVhZFxuICBjb25zdCBldmVudFBvczogY2cuTnVtYmVyUGFpciA9IHV0aWwuZXZlbnRQb3NpdGlvbihlKSB8fCBjdXIuZXBvcztcbiAgY29uc3QgZGVzdCA9IGJvYXJkLmdldEtleUF0RG9tUG9zKGV2ZW50UG9zLCBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLCBzLmRvbS5ib3VuZHMoKSk7XG4gIGlmIChkZXN0ICYmIGN1ci5zdGFydGVkKSB7XG4gICAgaWYgKGN1ci5uZXdQaWVjZSkgYm9hcmQuZHJvcE5ld1BpZWNlKHMsIGN1ci5vcmlnLCBkZXN0LCBjdXIuZm9yY2UpO1xuICAgIGVsc2Uge1xuICAgICAgcy5zdGF0cy5jdHJsS2V5ID0gZS5jdHJsS2V5O1xuICAgICAgaWYgKGJvYXJkLnVzZXJNb3ZlKHMsIGN1ci5vcmlnLCBkZXN0KSkgcy5zdGF0cy5kcmFnZ2VkID0gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY3VyLm5ld1BpZWNlKSB7XG4gICAgZGVsZXRlIHMucGllY2VzW2N1ci5vcmlnXTtcbiAgfSBlbHNlIGlmIChzLmRyYWdnYWJsZS5kZWxldGVPbkRyb3BPZmYpIHtcbiAgICBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIGJvYXJkLmNhbGxVc2VyRnVuY3Rpb24ocy5ldmVudHMuY2hhbmdlKTtcbiAgfVxuICBpZiAoY3VyICYmIGN1ci5vcmlnID09PSBjdXIucHJldmlvdXNseVNlbGVjdGVkICYmIChjdXIub3JpZyA9PT0gZGVzdCB8fCAhZGVzdCkpXG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gIGVsc2UgaWYgKCFzLnNlbGVjdGFibGUuZW5hYmxlZCkgYm9hcmQudW5zZWxlY3Qocyk7XG5cbiAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuXG4gIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gIHMuZG9tLnJlZHJhdygpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGN1ciA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQ7XG4gIGlmIChjdXIpIHtcbiAgICBpZiAoY3VyLm5ld1BpZWNlKSBkZWxldGUgcy5waWVjZXNbY3VyLm9yaWddO1xuICAgIHMuZHJhZ2dhYmxlLmN1cnJlbnQgPSB1bmRlZmluZWQ7XG4gICAgYm9hcmQudW5zZWxlY3Qocyk7XG4gICAgcmVtb3ZlRHJhZ0VsZW1lbnRzKHMpO1xuICAgIHMuZG9tLnJlZHJhdygpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZURyYWdFbGVtZW50cyhzOiBTdGF0ZSkge1xuICBjb25zdCBlID0gcy5kb20uZWxlbWVudHM7XG4gIGlmIChlLmdob3N0KSB1dGlsLnNldFZpc2libGUoZS5naG9zdCwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQm91bmRzKGtleTogY2cuS2V5LCBhc1doaXRlOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpIHtcbiAgY29uc3QgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gIGlmICghYXNXaGl0ZSkge1xuICAgIHBvc1swXSA9IDkgLSBwb3NbMF07XG4gICAgcG9zWzFdID0gOSAtIHBvc1sxXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGxlZnQ6IGJvdW5kcy5sZWZ0ICsgYm91bmRzLndpZHRoICogKHBvc1swXSAtIDEpIC8gOCxcbiAgICB0b3A6IGJvdW5kcy50b3AgKyBib3VuZHMuaGVpZ2h0ICogKDggLSBwb3NbMV0pIC8gOCxcbiAgICB3aWR0aDogYm91bmRzLndpZHRoIC8gOCxcbiAgICBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQgLyA4XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBpZWNlRWxlbWVudEJ5S2V5KHM6IFN0YXRlLCBrZXk6IGNnLktleSk6IGNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCB7XG4gIGxldCBlbCA9IHMuZG9tLmVsZW1lbnRzLmJvYXJkLmZpcnN0Q2hpbGQgYXMgY2cuUGllY2VOb2RlO1xuICB3aGlsZSAoZWwpIHtcbiAgICBpZiAoZWwuY2dLZXkgPT09IGtleSAmJiBlbC50YWdOYW1lID09PSAnUElFQ0UnKSByZXR1cm4gZWw7XG4gICAgZWwgPSBlbC5uZXh0U2libGluZyBhcyBjZy5QaWVjZU5vZGU7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IHVuc2VsZWN0LCBjYW5jZWxNb3ZlLCBnZXRLZXlBdERvbVBvcyB9IGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgeyBldmVudFBvc2l0aW9uLCBpc1JpZ2h0QnV0dG9uIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGludGVyZmFjZSBEcmF3U2hhcGUge1xuICBvcmlnOiBjZy5LZXk7XG4gIGRlc3Q/OiBjZy5LZXk7XG4gIGJydXNoOiBzdHJpbmc7XG4gIG1vZGlmaWVycz86IERyYXdNb2RpZmllcnM7XG4gIHBpZWNlPzogRHJhd1NoYXBlUGllY2U7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd1NoYXBlUGllY2Uge1xuICByb2xlOiBjZy5Sb2xlO1xuICBjb2xvcjogY2cuQ29sb3I7XG4gIHNjYWxlPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdCcnVzaCB7XG4gIGtleTogc3RyaW5nO1xuICBjb2xvcjogc3RyaW5nO1xuICBvcGFjaXR5OiBudW1iZXI7XG4gIGxpbmVXaWR0aDogbnVtYmVyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0JydXNoZXMge1xuICBbbmFtZTogc3RyaW5nXTogRHJhd0JydXNoO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdNb2RpZmllcnMge1xuICBsaW5lV2lkdGg/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd2FibGUge1xuICBlbmFibGVkOiBib29sZWFuOyAvLyBjYW4gZHJhd1xuICB2aXNpYmxlOiBib29sZWFuOyAvLyBjYW4gdmlld1xuICBlcmFzZU9uQ2xpY2s6IGJvb2xlYW47XG4gIG9uQ2hhbmdlPzogKHNoYXBlczogRHJhd1NoYXBlW10pID0+IHZvaWQ7XG4gIHNoYXBlczogRHJhd1NoYXBlW107IC8vIHVzZXIgc2hhcGVzXG4gIGF1dG9TaGFwZXM6IERyYXdTaGFwZVtdOyAvLyBjb21wdXRlciBzaGFwZXNcbiAgY3VycmVudD86IERyYXdDdXJyZW50O1xuICBicnVzaGVzOiBEcmF3QnJ1c2hlcztcbiAgLy8gZHJhd2FibGUgU1ZHIHBpZWNlczsgdXNlZCBmb3IgY3Jhenlob3VzZSBkcm9wXG4gIHBpZWNlczoge1xuICAgIGJhc2VVcmw6IHN0cmluZ1xuICB9LFxuICBwcmV2U3ZnSGFzaDogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRHJhd0N1cnJlbnQge1xuICBvcmlnOiBjZy5LZXk7IC8vIG9yaWcga2V5IG9mIGRyYXdpbmdcbiAgZGVzdD86IGNnLktleTsgLy8gc2hhcGUgZGVzdCwgb3IgdW5kZWZpbmVkIGZvciBjaXJjbGVcbiAgbW91c2VTcT86IGNnLktleTsgLy8gc3F1YXJlIGJlaW5nIG1vdXNlZCBvdmVyXG4gIHBvczogY2cuTnVtYmVyUGFpcjsgLy8gcmVsYXRpdmUgY3VycmVudCBwb3NpdGlvblxuICBicnVzaDogc3RyaW5nOyAvLyBicnVzaCBuYW1lIGZvciBzaGFwZVxufVxuXG5jb25zdCBicnVzaGVzID0gWydncmVlbicsICdyZWQnLCAnYmx1ZScsICd5ZWxsb3cnXTtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KHN0YXRlOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoZS50b3VjaGVzICYmIGUudG91Y2hlcy5sZW5ndGggPiAxKSByZXR1cm47IC8vIHN1cHBvcnQgb25lIGZpbmdlciB0b3VjaCBvbmx5XG4gIGlmIChlLnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG4gIGUuY3RybEtleSA/IHVuc2VsZWN0KHN0YXRlKSA6IGNhbmNlbE1vdmUoc3RhdGUpO1xuICBjb25zdCBwb3NpdGlvbiA9IGV2ZW50UG9zaXRpb24oZSkgYXMgY2cuTnVtYmVyUGFpcjtcbiAgY29uc3Qgb3JpZyA9IGdldEtleUF0RG9tUG9zKHBvc2l0aW9uLCBzdGF0ZS5vcmllbnRhdGlvbiA9PT0gJ3doaXRlJywgc3RhdGUuZG9tLmJvdW5kcygpKTtcbiAgaWYgKCFvcmlnKSByZXR1cm47XG4gIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQgPSB7XG4gICAgb3JpZzogb3JpZyxcbiAgICBwb3M6IHBvc2l0aW9uLFxuICAgIGJydXNoOiBldmVudEJydXNoKGUpXG4gIH07XG4gIHByb2Nlc3NEcmF3KHN0YXRlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NEcmF3KHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IGN1ciA9IHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQ7XG4gICAgaWYgKGN1cikge1xuICAgICAgY29uc3QgbW91c2VTcSA9IGdldEtleUF0RG9tUG9zKGN1ci5wb3MsIHN0YXRlLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLCBzdGF0ZS5kb20uYm91bmRzKCkpO1xuICAgICAgaWYgKG1vdXNlU3EgIT09IGN1ci5tb3VzZVNxKSB7XG4gICAgICAgIGN1ci5tb3VzZVNxID0gbW91c2VTcTtcbiAgICAgICAgY3VyLmRlc3QgPSBtb3VzZVNxICE9PSBjdXIub3JpZyA/IG1vdXNlU3EgOiB1bmRlZmluZWQ7XG4gICAgICAgIHN0YXRlLmRvbS5yZWRyYXdOb3coKTtcbiAgICAgIH1cbiAgICAgIHByb2Nlc3NEcmF3KHN0YXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZShzdGF0ZTogU3RhdGUsIGU6IGNnLk1vdWNoRXZlbnQpOiB2b2lkIHtcbiAgaWYgKHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQpIHN0YXRlLmRyYXdhYmxlLmN1cnJlbnQucG9zID0gZXZlbnRQb3NpdGlvbihlKSBhcyBjZy5OdW1iZXJQYWlyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBjb25zdCBjdXIgPSBzdGF0ZS5kcmF3YWJsZS5jdXJyZW50O1xuICBpZiAoY3VyKSB7XG4gICAgaWYgKGN1ci5tb3VzZVNxKSBhZGRTaGFwZShzdGF0ZS5kcmF3YWJsZSwgY3VyKTtcbiAgICBjYW5jZWwoc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW5jZWwoc3RhdGU6IFN0YXRlKTogdm9pZCB7XG4gIGlmIChzdGF0ZS5kcmF3YWJsZS5jdXJyZW50KSB7XG4gICAgc3RhdGUuZHJhd2FibGUuY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyKHN0YXRlOiBTdGF0ZSk6IHZvaWQge1xuICBpZiAoc3RhdGUuZHJhd2FibGUuc2hhcGVzLmxlbmd0aCkge1xuICAgIHN0YXRlLmRyYXdhYmxlLnNoYXBlcyA9IFtdO1xuICAgIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgICBvbkNoYW5nZShzdGF0ZS5kcmF3YWJsZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRCcnVzaChlOiBjZy5Nb3VjaEV2ZW50KTogc3RyaW5nIHtcbiAgY29uc3QgYTogbnVtYmVyID0gZS5zaGlmdEtleSAmJiBpc1JpZ2h0QnV0dG9uKGUpID8gMSA6IDA7XG4gIGNvbnN0IGI6IG51bWJlciA9IGUuYWx0S2V5ID8gMiA6IDA7XG4gIHJldHVybiBicnVzaGVzW2EgKyBiXTtcbn1cblxuZnVuY3Rpb24gbm90PEE+KGY6IChhOiBBKSA9PiBib29sZWFuKTogKGE6IEEpID0+IGJvb2xlYW4ge1xuICByZXR1cm4gKHg6IEEpID0+ICFmKHgpO1xufVxuXG5mdW5jdGlvbiBhZGRTaGFwZShkcmF3YWJsZTogRHJhd2FibGUsIGN1cjogRHJhd0N1cnJlbnQpOiB2b2lkIHtcbiAgY29uc3Qgc2FtZVNoYXBlID0gKHM6IERyYXdTaGFwZSkgPT4ge1xuICAgIHJldHVybiBzLm9yaWcgPT09IGN1ci5vcmlnICYmIHMuZGVzdCA9PT0gY3VyLmRlc3Q7XG4gIH07XG4gIGNvbnN0IHNpbWlsYXIgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKHNhbWVTaGFwZSlbMF07XG4gIGlmIChzaW1pbGFyKSBkcmF3YWJsZS5zaGFwZXMgPSBkcmF3YWJsZS5zaGFwZXMuZmlsdGVyKG5vdChzYW1lU2hhcGUpKTtcbiAgaWYgKCFzaW1pbGFyIHx8IHNpbWlsYXIuYnJ1c2ggIT09IGN1ci5icnVzaCkgZHJhd2FibGUuc2hhcGVzLnB1c2goY3VyKTtcbiAgb25DaGFuZ2UoZHJhd2FibGUpO1xufVxuXG5mdW5jdGlvbiBvbkNoYW5nZShkcmF3YWJsZTogRHJhd2FibGUpOiB2b2lkIHtcbiAgaWYgKGRyYXdhYmxlLm9uQ2hhbmdlKSBkcmF3YWJsZS5vbkNoYW5nZShkcmF3YWJsZS5zaGFwZXMpO1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcbmltcG9ydCAqIGFzIGJvYXJkIGZyb20gJy4vYm9hcmQnXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGNhbmNlbCBhcyBjYW5jZWxEcmFnIH0gZnJvbSAnLi9kcmFnJ1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0RHJvcE1vZGUoczogU3RhdGUsIHBpZWNlPzogY2cuUGllY2UpOiB2b2lkIHtcbiAgcy5kcm9wbW9kZSA9IHtcbiAgICBhY3RpdmU6IHRydWUsXG4gICAgcGllY2VcbiAgfTtcbiAgY2FuY2VsRHJhZyhzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbmNlbERyb3BNb2RlKHM6IFN0YXRlKTogdm9pZCB7XG4gIHMuZHJvcG1vZGUgPSB7XG4gICAgYWN0aXZlOiBmYWxzZVxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZHJvcChzOiBTdGF0ZSwgZTogY2cuTW91Y2hFdmVudCk6IHZvaWQge1xuICBpZiAoIXMuZHJvcG1vZGUuYWN0aXZlKSByZXR1cm47XG5cbiAgYm9hcmQudW5zZXRQcmVtb3ZlKHMpO1xuICBib2FyZC51bnNldFByZWRyb3Aocyk7XG5cbiAgY29uc3QgcGllY2UgPSBzLmRyb3Btb2RlLnBpZWNlO1xuXG4gIGlmIChwaWVjZSkge1xuICAgIHMucGllY2VzLmEwID0gcGllY2U7XG4gICAgY29uc3QgcG9zaXRpb24gPSB1dGlsLmV2ZW50UG9zaXRpb24oZSk7XG4gICAgY29uc3QgZGVzdCA9IHBvc2l0aW9uICYmIGJvYXJkLmdldEtleUF0RG9tUG9zKFxuICAgICAgcG9zaXRpb24sIHMub3JpZW50YXRpb24gPT09ICd3aGl0ZScsIHMuZG9tLmJvdW5kcygpKTtcbiAgICBpZiAoZGVzdCkgYm9hcmQuZHJvcE5ld1BpZWNlKHMsICdhMCcsIGRlc3QpO1xuICB9XG4gIHMuZG9tLnJlZHJhdygpO1xufSIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCAqIGFzIGRyYWcgZnJvbSAnLi9kcmFnJ1xuaW1wb3J0ICogYXMgZHJhdyBmcm9tICcuL2RyYXcnXG5pbXBvcnQgeyBkcm9wIH0gZnJvbSAnLi9kcm9wJ1xuaW1wb3J0IHsgaXNSaWdodEJ1dHRvbiB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnXG5cbnR5cGUgTW91Y2hCaW5kID0gKGU6IGNnLk1vdWNoRXZlbnQpID0+IHZvaWQ7XG50eXBlIFN0YXRlTW91Y2hCaW5kID0gKGQ6IFN0YXRlLCBlOiBjZy5Nb3VjaEV2ZW50KSA9PiB2b2lkO1xuXG5leHBvcnQgZnVuY3Rpb24gYmluZEJvYXJkKHM6IFN0YXRlKTogdm9pZCB7XG5cbiAgaWYgKHMudmlld09ubHkpIHJldHVybjtcblxuICBjb25zdCBib2FyZEVsID0gcy5kb20uZWxlbWVudHMuYm9hcmQsXG4gIG9uU3RhcnQgPSBzdGFydERyYWdPckRyYXcocyk7XG5cblxuICAvLyB0b3VjaHN0YXJ0IGNhbid0IGJlIHBhc3NpdmUgYmVjYXVzZSB3ZSBkaXNhYmxlIHNjcm9sbC5cbiAgYm9hcmRFbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25TdGFydCBhcyBFdmVudExpc3RlbmVyLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uU3RhcnQgYXMgRXZlbnRMaXN0ZW5lciwgeyBwYXNzaXZlOiB0cnVlIH0pO1xuXG4gIGlmIChzLmRpc2FibGVDb250ZXh0TWVudSB8fCBzLmRyYXdhYmxlLmVuYWJsZWQpIHtcbiAgICBib2FyZEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZSA9PiBlLnByZXZlbnREZWZhdWx0KCkpO1xuICB9XG59XG5cbi8vIHJldHVybnMgdGhlIHVuYmluZCBmdW5jdGlvblxuZXhwb3J0IGZ1bmN0aW9uIGJpbmREb2N1bWVudChzOiBTdGF0ZSwgcmVkcmF3QWxsOiBjZy5SZWRyYXcpOiBjZy5VbmJpbmQge1xuXG4gIGNvbnN0IHVuYmluZHM6IGNnLlVuYmluZFtdID0gW107XG5cbiAgaWYgKCFzLmRvbS5yZWxhdGl2ZSAmJiBzLnJlc2l6YWJsZSkge1xuICAgIGNvbnN0IG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgcy5kb20uYm91bmRzLmNsZWFyKCk7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVkcmF3QWxsKTtcbiAgICB9O1xuICAgIHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LmJvZHksICdjaGVzc2dyb3VuZC5yZXNpemUnLCBvblJlc2l6ZSkpO1xuICB9XG5cbiAgaWYgKCFzLnZpZXdPbmx5KSB7XG5cbiAgICBjb25zdCBvbm1vdmU6IE1vdWNoQmluZCA9IGRyYWdPckRyYXcocywgZHJhZy5tb3ZlLCBkcmF3Lm1vdmUpO1xuICAgIGNvbnN0IG9uZW5kOiBNb3VjaEJpbmQgPSBkcmFnT3JEcmF3KHMsIGRyYWcuZW5kLCBkcmF3LmVuZCk7XG5cbiAgICBbJ3RvdWNobW92ZScsICdtb3VzZW1vdmUnXS5mb3JFYWNoKGV2ID0+IHVuYmluZHMucHVzaCh1bmJpbmRhYmxlKGRvY3VtZW50LCBldiwgb25tb3ZlKSkpO1xuICAgIFsndG91Y2hlbmQnLCAnbW91c2V1cCddLmZvckVhY2goZXYgPT4gdW5iaW5kcy5wdXNoKHVuYmluZGFibGUoZG9jdW1lbnQsIGV2LCBvbmVuZCkpKTtcblxuICAgIGNvbnN0IG9uU2Nyb2xsID0gKCkgPT4gcy5kb20uYm91bmRzLmNsZWFyKCk7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUod2luZG93LCAnc2Nyb2xsJywgb25TY3JvbGwsIHsgcGFzc2l2ZTogdHJ1ZSB9KSk7XG4gICAgdW5iaW5kcy5wdXNoKHVuYmluZGFibGUod2luZG93LCAncmVzaXplJywgb25TY3JvbGwsIHsgcGFzc2l2ZTogdHJ1ZSB9KSk7XG4gIH1cblxuICByZXR1cm4gKCkgPT4gdW5iaW5kcy5mb3JFYWNoKGYgPT4gZigpKTtcbn1cblxuZnVuY3Rpb24gdW5iaW5kYWJsZShlbDogRXZlbnRUYXJnZXQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogTW91Y2hCaW5kLCBvcHRpb25zPzogYW55KTogY2cuVW5iaW5kIHtcbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrIGFzIEV2ZW50TGlzdGVuZXIsIG9wdGlvbnMpO1xuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrIGFzIEV2ZW50TGlzdGVuZXIpO1xufVxuXG5mdW5jdGlvbiBzdGFydERyYWdPckRyYXcoczogU3RhdGUpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gZSA9PiB7XG4gICAgaWYgKHMuZHJhZ2dhYmxlLmN1cnJlbnQpIGRyYWcuY2FuY2VsKHMpO1xuICAgIGVsc2UgaWYgKHMuZHJhd2FibGUuY3VycmVudCkgZHJhdy5jYW5jZWwocyk7XG4gICAgZWxzZSBpZiAoZS5zaGlmdEtleSB8fCBpc1JpZ2h0QnV0dG9uKGUpKSB7IGlmIChzLmRyYXdhYmxlLmVuYWJsZWQpIGRyYXcuc3RhcnQocywgZSk7IH1cbiAgICBlbHNlIGlmICghcy52aWV3T25seSkge1xuICAgICAgaWYgKHMuZHJvcG1vZGUuYWN0aXZlKSBkcm9wKHMsIGUpO1xuICAgICAgZWxzZSBkcmFnLnN0YXJ0KHMsIGUpO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZHJhZ09yRHJhdyhzOiBTdGF0ZSwgd2l0aERyYWc6IFN0YXRlTW91Y2hCaW5kLCB3aXRoRHJhdzogU3RhdGVNb3VjaEJpbmQpOiBNb3VjaEJpbmQge1xuICByZXR1cm4gZSA9PiB7XG4gICAgaWYgKGUuc2hpZnRLZXkgfHwgaXNSaWdodEJ1dHRvbihlKSkgeyBpZiAocy5kcmF3YWJsZS5lbmFibGVkKSB3aXRoRHJhdyhzLCBlKTsgfVxuICAgIGVsc2UgaWYgKCFzLnZpZXdPbmx5KSB3aXRoRHJhZyhzLCBlKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IEtleSB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGV4cGxvc2lvbihzdGF0ZTogU3RhdGUsIGtleXM6IEtleVtdKTogdm9pZCB7XG4gIHN0YXRlLmV4cGxvZGluZyA9IHtcbiAgICBzdGFnZTogMSxcbiAgICBrZXlzOiBrZXlzXG4gIH07XG4gIHN0YXRlLmRvbS5yZWRyYXcoKTtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgc2V0U3RhZ2Uoc3RhdGUsIDIpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gc2V0U3RhZ2Uoc3RhdGUsIHVuZGVmaW5lZCksIDEyMCk7XG4gIH0sIDEyMCk7XG59XG5cbmZ1bmN0aW9uIHNldFN0YWdlKHN0YXRlOiBTdGF0ZSwgc3RhZ2U6IG51bWJlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICBpZiAoc3RhdGUuZXhwbG9kaW5nKSB7XG4gICAgaWYgKHN0YWdlKSBzdGF0ZS5leHBsb2Rpbmcuc3RhZ2UgPSBzdGFnZTtcbiAgICBlbHNlIHN0YXRlLmV4cGxvZGluZyA9IHVuZGVmaW5lZDtcbiAgICBzdGF0ZS5kb20ucmVkcmF3KCk7XG4gIH1cbn1cbiIsImltcG9ydCB7IHBvczJrZXksIGludlJhbmtzIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGNvbnN0IGluaXRpYWw6IGNnLkZFTiA9ICdybmJxa2Juci9wcHBwcHBwcC84LzgvOC84L1BQUFBQUFBQL1JOQlFLQk5SJztcblxuY29uc3Qgcm9sZXM6IHsgW2xldHRlcjogc3RyaW5nXTogY2cuUm9sZSB9ID0geyBwOiAncGF3bicsIHI6ICdyb29rJywgbjogJ2tuaWdodCcsIGI6ICdiaXNob3AnLCBxOiAncXVlZW4nLCBrOiAna2luZycgfTtcblxuY29uc3QgbGV0dGVycyA9IHsgcGF3bjogJ3AnLCByb29rOiAncicsIGtuaWdodDogJ24nLCBiaXNob3A6ICdiJywgcXVlZW46ICdxJywga2luZzogJ2snIH07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkKGZlbjogY2cuRkVOKTogY2cuUGllY2VzIHtcbiAgaWYgKGZlbiA9PT0gJ3N0YXJ0JykgZmVuID0gaW5pdGlhbDtcbiAgY29uc3QgcGllY2VzOiBjZy5QaWVjZXMgPSB7fTtcbiAgbGV0IHJvdzogbnVtYmVyID0gODtcbiAgbGV0IGNvbDogbnVtYmVyID0gMDtcbiAgZm9yIChjb25zdCBjIG9mIGZlbikge1xuICAgIHN3aXRjaCAoYykge1xuICAgICAgY2FzZSAnICc6IHJldHVybiBwaWVjZXM7XG4gICAgICBjYXNlICcvJzpcbiAgICAgICAgLS1yb3c7XG4gICAgICAgIGlmIChyb3cgPT09IDApIHJldHVybiBwaWVjZXM7XG4gICAgICAgIGNvbCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnfic6XG4gICAgICAgIGNvbnN0IHBpZWNlID0gcGllY2VzW3BvczJrZXkoW2NvbCwgcm93XSldO1xuICAgICAgICBpZiAocGllY2UpIHBpZWNlLnByb21vdGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb25zdCBuYiA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgaWYgKG5iIDwgNTcpIGNvbCArPSBuYiAtIDQ4O1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICArK2NvbDtcbiAgICAgICAgICBjb25zdCByb2xlID0gYy50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIHBpZWNlc1twb3Mya2V5KFtjb2wsIHJvd10pXSA9IHtcbiAgICAgICAgICAgIHJvbGU6IHJvbGVzW3JvbGVdLFxuICAgICAgICAgICAgY29sb3I6IChjID09PSByb2xlID8gJ2JsYWNrJyA6ICd3aGl0ZScpIGFzIGNnLkNvbG9yXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcGllY2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGUocGllY2VzOiBjZy5QaWVjZXMpOiBjZy5GRU4ge1xuICByZXR1cm4gaW52UmFua3MubWFwKHkgPT4gY2cucmFua3MubWFwKHggPT4ge1xuICAgICAgY29uc3QgcGllY2UgPSBwaWVjZXNbcG9zMmtleShbeCwgeV0pXTtcbiAgICAgIGlmIChwaWVjZSkge1xuICAgICAgICBjb25zdCBsZXR0ZXIgPSBsZXR0ZXJzW3BpZWNlLnJvbGVdO1xuICAgICAgICByZXR1cm4gcGllY2UuY29sb3IgPT09ICd3aGl0ZScgPyBsZXR0ZXIudG9VcHBlckNhc2UoKSA6IGxldHRlcjtcbiAgICAgIH0gZWxzZSByZXR1cm4gJzEnO1xuICAgIH0pLmpvaW4oJycpXG4gICkuam9pbignLycpLnJlcGxhY2UoLzF7Mix9L2csIHMgPT4gcy5sZW5ndGgudG9TdHJpbmcoKSk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2NoZXNzZ3JvdW5kXCIpLkNoZXNzZ3JvdW5kO1xuIiwiaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwnXG5pbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJ1xuXG50eXBlIE1vYmlsaXR5ID0gKHgxOm51bWJlciwgeTE6bnVtYmVyLCB4MjpudW1iZXIsIHkyOm51bWJlcikgPT4gYm9vbGVhbjtcblxuZnVuY3Rpb24gZGlmZihhOiBudW1iZXIsIGI6bnVtYmVyKTpudW1iZXIge1xuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpO1xufVxuXG5mdW5jdGlvbiBwYXduKGNvbG9yOiBjZy5Db2xvcik6IE1vYmlsaXR5IHtcbiAgcmV0dXJuICh4MSwgeTEsIHgyLCB5MikgPT4gZGlmZih4MSwgeDIpIDwgMiAmJiAoXG4gICAgY29sb3IgPT09ICd3aGl0ZScgPyAoXG4gICAgICAvLyBhbGxvdyAyIHNxdWFyZXMgZnJvbSAxIGFuZCA4LCBmb3IgaG9yZGVcbiAgICAgIHkyID09PSB5MSArIDEgfHwgKHkxIDw9IDIgJiYgeTIgPT09ICh5MSArIDIpICYmIHgxID09PSB4MilcbiAgICApIDogKFxuICAgICAgeTIgPT09IHkxIC0gMSB8fCAoeTEgPj0gNyAmJiB5MiA9PT0gKHkxIC0gMikgJiYgeDEgPT09IHgyKVxuICAgIClcbiAgKTtcbn1cblxuY29uc3Qga25pZ2h0OiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICBjb25zdCB4ZCA9IGRpZmYoeDEsIHgyKTtcbiAgY29uc3QgeWQgPSBkaWZmKHkxLCB5Mik7XG4gIHJldHVybiAoeGQgPT09IDEgJiYgeWQgPT09IDIpIHx8ICh4ZCA9PT0gMiAmJiB5ZCA9PT0gMSk7XG59XG5cbmNvbnN0IGJpc2hvcDogTW9iaWxpdHkgPSAoeDEsIHkxLCB4MiwgeTIpID0+IHtcbiAgcmV0dXJuIGRpZmYoeDEsIHgyKSA9PT0gZGlmZih5MSwgeTIpO1xufVxuXG5jb25zdCByb29rOiBNb2JpbGl0eSA9ICh4MSwgeTEsIHgyLCB5MikgPT4ge1xuICByZXR1cm4geDEgPT09IHgyIHx8IHkxID09PSB5Mjtcbn1cblxuY29uc3QgcXVlZW46IE1vYmlsaXR5ID0gKHgxLCB5MSwgeDIsIHkyKSA9PiB7XG4gIHJldHVybiBiaXNob3AoeDEsIHkxLCB4MiwgeTIpIHx8IHJvb2soeDEsIHkxLCB4MiwgeTIpO1xufVxuXG5mdW5jdGlvbiBraW5nKGNvbG9yOiBjZy5Db2xvciwgcm9va0ZpbGVzOiBudW1iZXJbXSwgY2FuQ2FzdGxlOiBib29sZWFuKTogTW9iaWxpdHkge1xuICByZXR1cm4gKHgxLCB5MSwgeDIsIHkyKSAgPT4gKFxuICAgIGRpZmYoeDEsIHgyKSA8IDIgJiYgZGlmZih5MSwgeTIpIDwgMlxuICApIHx8IChcbiAgICBjYW5DYXN0bGUgJiYgeTEgPT09IHkyICYmIHkxID09PSAoY29sb3IgPT09ICd3aGl0ZScgPyAxIDogOCkgJiYgKFxuICAgICAgKHgxID09PSA1ICYmICh4MiA9PT0gMyB8fCB4MiA9PT0gNykpIHx8IHV0aWwuY29udGFpbnNYKHJvb2tGaWxlcywgeDIpXG4gICAgKVxuICApO1xufVxuXG5mdW5jdGlvbiByb29rRmlsZXNPZihwaWVjZXM6IGNnLlBpZWNlcywgY29sb3I6IGNnLkNvbG9yKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhwaWVjZXMpLmZpbHRlcihrZXkgPT4ge1xuICAgIGNvbnN0IHBpZWNlID0gcGllY2VzW2tleV07XG4gICAgcmV0dXJuIHBpZWNlICYmIHBpZWNlLmNvbG9yID09PSBjb2xvciAmJiBwaWVjZS5yb2xlID09PSAncm9vayc7XG4gIH0pLm1hcCgoa2V5OiBzdHJpbmcgKSA9PiB1dGlsLmtleTJwb3Moa2V5IGFzIGNnLktleSlbMF0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcmVtb3ZlKHBpZWNlczogY2cuUGllY2VzLCBrZXk6IGNnLktleSwgY2FuQ2FzdGxlOiBib29sZWFuKTogY2cuS2V5W10ge1xuICBjb25zdCBwaWVjZSA9IHBpZWNlc1trZXldISxcbiAgcG9zID0gdXRpbC5rZXkycG9zKGtleSk7XG4gIGxldCBtb2JpbGl0eTogTW9iaWxpdHk7XG4gIHN3aXRjaCAocGllY2Uucm9sZSkge1xuICAgIGNhc2UgJ3Bhd24nOlxuICAgICAgbW9iaWxpdHkgPSBwYXduKHBpZWNlLmNvbG9yKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2tuaWdodCc6XG4gICAgICBtb2JpbGl0eSA9IGtuaWdodDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2Jpc2hvcCc6XG4gICAgICBtb2JpbGl0eSA9IGJpc2hvcDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Jvb2snOlxuICAgICAgbW9iaWxpdHkgPSByb29rO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncXVlZW4nOlxuICAgICAgbW9iaWxpdHkgPSBxdWVlbjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2tpbmcnOlxuICAgICAgbW9iaWxpdHkgPSBraW5nKHBpZWNlLmNvbG9yLCByb29rRmlsZXNPZihwaWVjZXMsIHBpZWNlLmNvbG9yKSwgY2FuQ2FzdGxlKTtcbiAgICAgIGJyZWFrO1xuICB9XG4gIHJldHVybiB1dGlsLmFsbEtleXMubWFwKHV0aWwua2V5MnBvcykuZmlsdGVyKHBvczIgPT4ge1xuICAgIHJldHVybiAocG9zWzBdICE9PSBwb3MyWzBdIHx8IHBvc1sxXSAhPT0gcG9zMlsxXSkgJiYgbW9iaWxpdHkocG9zWzBdLCBwb3NbMV0sIHBvczJbMF0sIHBvczJbMV0pO1xuICB9KS5tYXAodXRpbC5wb3Mya2V5KTtcbn07XG4iLCJpbXBvcnQgeyBTdGF0ZSB9IGZyb20gJy4vc3RhdGUnXG5pbXBvcnQgeyBrZXkycG9zLCBjcmVhdGVFbCB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgQW5pbUN1cnJlbnQsIEFuaW1WZWN0b3JzLCBBbmltVmVjdG9yLCBBbmltRmFkaW5ncyB9IGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuLy8gYCRjb2xvciAkcm9sZWBcbnR5cGUgUGllY2VOYW1lID0gc3RyaW5nO1xuXG5pbnRlcmZhY2UgU2FtZVBpZWNlcyB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfVxuaW50ZXJmYWNlIFNhbWVTcXVhcmVzIHsgW2tleTogc3RyaW5nXTogYm9vbGVhbiB9XG5pbnRlcmZhY2UgTW92ZWRQaWVjZXMgeyBbcGllY2VOYW1lOiBzdHJpbmddOiBjZy5QaWVjZU5vZGVbXSB9XG5pbnRlcmZhY2UgTW92ZWRTcXVhcmVzIHsgW2NsYXNzTmFtZTogc3RyaW5nXTogY2cuU3F1YXJlTm9kZVtdIH1cbmludGVyZmFjZSBTcXVhcmVDbGFzc2VzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH1cblxuLy8gcG9ydGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3ZlbG9jZS9saWNob2JpbGUvYmxvYi9tYXN0ZXIvc3JjL2pzL2NoZXNzZ3JvdW5kL3ZpZXcuanNcbi8vIGluIGNhc2Ugb2YgYnVncywgYmxhbWUgQHZlbG9jZVxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyKHM6IFN0YXRlKTogdm9pZCB7XG4gIGNvbnN0IGFzV2hpdGU6IGJvb2xlYW4gPSBzLm9yaWVudGF0aW9uID09PSAnd2hpdGUnLFxuICBwb3NUb1RyYW5zbGF0ZSA9IHMuZG9tLnJlbGF0aXZlID8gdXRpbC5wb3NUb1RyYW5zbGF0ZVJlbCA6IHV0aWwucG9zVG9UcmFuc2xhdGVBYnMocy5kb20uYm91bmRzKCkpLFxuICB0cmFuc2xhdGUgPSBzLmRvbS5yZWxhdGl2ZSA/IHV0aWwudHJhbnNsYXRlUmVsIDogdXRpbC50cmFuc2xhdGVBYnMsXG4gIGJvYXJkRWw6IEhUTUxFbGVtZW50ID0gcy5kb20uZWxlbWVudHMuYm9hcmQsXG4gIHBpZWNlczogY2cuUGllY2VzID0gcy5waWVjZXMsXG4gIGN1ckFuaW06IEFuaW1DdXJyZW50IHwgdW5kZWZpbmVkID0gcy5hbmltYXRpb24uY3VycmVudCxcbiAgYW5pbXM6IEFuaW1WZWN0b3JzID0gY3VyQW5pbSA/IGN1ckFuaW0ucGxhbi5hbmltcyA6IHt9LFxuICBmYWRpbmdzOiBBbmltRmFkaW5ncyA9IGN1ckFuaW0gPyBjdXJBbmltLnBsYW4uZmFkaW5ncyA6IHt9LFxuICBjdXJEcmFnOiBEcmFnQ3VycmVudCB8IHVuZGVmaW5lZCA9IHMuZHJhZ2dhYmxlLmN1cnJlbnQsXG4gIHNxdWFyZXM6IFNxdWFyZUNsYXNzZXMgPSBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzKSxcbiAgc2FtZVBpZWNlczogU2FtZVBpZWNlcyA9IHt9LFxuICBzYW1lU3F1YXJlczogU2FtZVNxdWFyZXMgPSB7fSxcbiAgbW92ZWRQaWVjZXM6IE1vdmVkUGllY2VzID0ge30sXG4gIG1vdmVkU3F1YXJlczogTW92ZWRTcXVhcmVzID0ge30sXG4gIHBpZWNlc0tleXM6IGNnLktleVtdID0gT2JqZWN0LmtleXMocGllY2VzKSBhcyBjZy5LZXlbXTtcbiAgbGV0IGs6IGNnLktleSxcbiAgcDogY2cuUGllY2UgfCB1bmRlZmluZWQsXG4gIGVsOiBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlLFxuICBwaWVjZUF0S2V5OiBjZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgZWxQaWVjZU5hbWU6IFBpZWNlTmFtZSxcbiAgYW5pbTogQW5pbVZlY3RvciB8IHVuZGVmaW5lZCxcbiAgZmFkaW5nOiBjZy5QaWVjZSB8IHVuZGVmaW5lZCxcbiAgcE12ZHNldDogY2cuUGllY2VOb2RlW10sXG4gIHBNdmQ6IGNnLlBpZWNlTm9kZSB8IHVuZGVmaW5lZCxcbiAgc012ZHNldDogY2cuU3F1YXJlTm9kZVtdLFxuICBzTXZkOiBjZy5TcXVhcmVOb2RlIHwgdW5kZWZpbmVkO1xuXG4gIC8vIHdhbGsgb3ZlciBhbGwgYm9hcmQgZG9tIGVsZW1lbnRzLCBhcHBseSBhbmltYXRpb25zIGFuZCBmbGFnIG1vdmVkIHBpZWNlc1xuICBlbCA9IGJvYXJkRWwuZmlyc3RDaGlsZCBhcyBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlO1xuICB3aGlsZSAoZWwpIHtcbiAgICBrID0gZWwuY2dLZXk7XG4gICAgaWYgKGlzUGllY2VOb2RlKGVsKSkge1xuICAgICAgcGllY2VBdEtleSA9IHBpZWNlc1trXTtcbiAgICAgIGFuaW0gPSBhbmltc1trXTtcbiAgICAgIGZhZGluZyA9IGZhZGluZ3Nba107XG4gICAgICBlbFBpZWNlTmFtZSA9IGVsLmNnUGllY2U7XG4gICAgICAvLyBpZiBwaWVjZSBub3QgYmVpbmcgZHJhZ2dlZCBhbnltb3JlLCByZW1vdmUgZHJhZ2dpbmcgc3R5bGVcbiAgICAgIGlmIChlbC5jZ0RyYWdnaW5nICYmICghY3VyRHJhZyB8fCBjdXJEcmFnLm9yaWcgIT09IGspKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdnaW5nJyk7XG4gICAgICAgIHRyYW5zbGF0ZShlbCwgcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhrKSwgYXNXaGl0ZSkpO1xuICAgICAgICBlbC5jZ0RyYWdnaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyByZW1vdmUgZmFkaW5nIGNsYXNzIGlmIGl0IHN0aWxsIHJlbWFpbnNcbiAgICAgIGlmICghZmFkaW5nICYmIGVsLmNnRmFkaW5nKSB7XG4gICAgICAgIGVsLmNnRmFkaW5nID0gZmFsc2U7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgfVxuICAgICAgLy8gdGhlcmUgaXMgbm93IGEgcGllY2UgYXQgdGhpcyBkb20ga2V5XG4gICAgICBpZiAocGllY2VBdEtleSkge1xuICAgICAgICAvLyBjb250aW51ZSBhbmltYXRpb24gaWYgYWxyZWFkeSBhbmltYXRpbmcgYW5kIHNhbWUgcGllY2VcbiAgICAgICAgLy8gKG90aGVyd2lzZSBpdCBjb3VsZCBhbmltYXRlIGEgY2FwdHVyZWQgcGllY2UpXG4gICAgICAgIGlmIChhbmltICYmIGVsLmNnQW5pbWF0aW5nICYmIGVsUGllY2VOYW1lID09PSBwaWVjZU5hbWVPZihwaWVjZUF0S2V5KSkge1xuICAgICAgICAgIGNvbnN0IHBvcyA9IGtleTJwb3Moayk7XG4gICAgICAgICAgcG9zWzBdICs9IGFuaW1bMl07XG4gICAgICAgICAgcG9zWzFdICs9IGFuaW1bM107XG4gICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnYW5pbScpO1xuICAgICAgICAgIHRyYW5zbGF0ZShlbCwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1doaXRlKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuY2dBbmltYXRpbmcpIHtcbiAgICAgICAgICBlbC5jZ0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2FuaW0nKTtcbiAgICAgICAgICB0cmFuc2xhdGUoZWwsIHBvc1RvVHJhbnNsYXRlKGtleTJwb3MoayksIGFzV2hpdGUpKTtcbiAgICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleCkgZWwuc3R5bGUuekluZGV4ID0gcG9zWkluZGV4KGtleTJwb3MoayksIGFzV2hpdGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNhbWUgcGllY2U6IGZsYWcgYXMgc2FtZVxuICAgICAgICBpZiAoZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKHBpZWNlQXRLZXkpICYmICghZmFkaW5nIHx8ICFlbC5jZ0ZhZGluZykpIHtcbiAgICAgICAgICBzYW1lUGllY2VzW2tdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkaWZmZXJlbnQgcGllY2U6IGZsYWcgYXMgbW92ZWQgdW5sZXNzIGl0IGlzIGEgZmFkaW5nIHBpZWNlXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChmYWRpbmcgJiYgZWxQaWVjZU5hbWUgPT09IHBpZWNlTmFtZU9mKGZhZGluZykpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2ZhZGluZycpO1xuICAgICAgICAgICAgZWwuY2dGYWRpbmcgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobW92ZWRQaWVjZXNbZWxQaWVjZU5hbWVdKSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0ucHVzaChlbCk7XG4gICAgICAgICAgICBlbHNlIG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXSA9IFtlbF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZTogZmxhZyBhcyBtb3ZlZFxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0pIG1vdmVkUGllY2VzW2VsUGllY2VOYW1lXS5wdXNoKGVsKTtcbiAgICAgICAgZWxzZSBtb3ZlZFBpZWNlc1tlbFBpZWNlTmFtZV0gPSBbZWxdO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpc1NxdWFyZU5vZGUoZWwpKSB7XG4gICAgICBjb25zdCBjbiA9IGVsLmNsYXNzTmFtZTtcbiAgICAgIGlmIChzcXVhcmVzW2tdID09PSBjbikgc2FtZVNxdWFyZXNba10gPSB0cnVlO1xuICAgICAgZWxzZSBpZiAobW92ZWRTcXVhcmVzW2NuXSkgbW92ZWRTcXVhcmVzW2NuXS5wdXNoKGVsKTtcbiAgICAgIGVsc2UgbW92ZWRTcXVhcmVzW2NuXSA9IFtlbF07XG4gICAgfVxuICAgIGVsID0gZWwubmV4dFNpYmxpbmcgYXMgY2cuUGllY2VOb2RlIHwgY2cuU3F1YXJlTm9kZTtcbiAgfVxuXG4gIC8vIHdhbGsgb3ZlciBhbGwgc3F1YXJlcyBpbiBjdXJyZW50IHNldCwgYXBwbHkgZG9tIGNoYW5nZXMgdG8gbW92ZWQgc3F1YXJlc1xuICAvLyBvciBhcHBlbmQgbmV3IHNxdWFyZXNcbiAgZm9yIChjb25zdCBzayBpbiBzcXVhcmVzKSB7XG4gICAgaWYgKCFzYW1lU3F1YXJlc1tza10pIHtcbiAgICAgIHNNdmRzZXQgPSBtb3ZlZFNxdWFyZXNbc3F1YXJlc1tza11dO1xuICAgICAgc012ZCA9IHNNdmRzZXQgJiYgc012ZHNldC5wb3AoKTtcbiAgICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gcG9zVG9UcmFuc2xhdGUoa2V5MnBvcyhzayBhcyBjZy5LZXkpLCBhc1doaXRlKTtcbiAgICAgIGlmIChzTXZkKSB7XG4gICAgICAgIHNNdmQuY2dLZXkgPSBzayBhcyBjZy5LZXk7XG4gICAgICAgIHRyYW5zbGF0ZShzTXZkLCB0cmFuc2xhdGlvbik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3Qgc3F1YXJlTm9kZSA9IGNyZWF0ZUVsKCdzcXVhcmUnLCBzcXVhcmVzW3NrXSkgYXMgY2cuU3F1YXJlTm9kZTtcbiAgICAgICAgc3F1YXJlTm9kZS5jZ0tleSA9IHNrIGFzIGNnLktleTtcbiAgICAgICAgdHJhbnNsYXRlKHNxdWFyZU5vZGUsIHRyYW5zbGF0aW9uKTtcbiAgICAgICAgYm9hcmRFbC5pbnNlcnRCZWZvcmUoc3F1YXJlTm9kZSwgYm9hcmRFbC5maXJzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyB3YWxrIG92ZXIgYWxsIHBpZWNlcyBpbiBjdXJyZW50IHNldCwgYXBwbHkgZG9tIGNoYW5nZXMgdG8gbW92ZWQgcGllY2VzXG4gIC8vIG9yIGFwcGVuZCBuZXcgcGllY2VzXG4gIGZvciAoY29uc3QgaiBpbiBwaWVjZXNLZXlzKSB7XG4gICAgayA9IHBpZWNlc0tleXNbal07XG4gICAgcCA9IHBpZWNlc1trXSE7XG4gICAgYW5pbSA9IGFuaW1zW2tdO1xuICAgIGlmICghc2FtZVBpZWNlc1trXSkge1xuICAgICAgcE12ZHNldCA9IG1vdmVkUGllY2VzW3BpZWNlTmFtZU9mKHApXTtcbiAgICAgIHBNdmQgPSBwTXZkc2V0ICYmIHBNdmRzZXQucG9wKCk7XG4gICAgICAvLyBhIHNhbWUgcGllY2Ugd2FzIG1vdmVkXG4gICAgICBpZiAocE12ZCkge1xuICAgICAgICAvLyBhcHBseSBkb20gY2hhbmdlc1xuICAgICAgICBwTXZkLmNnS2V5ID0gaztcbiAgICAgICAgaWYgKHBNdmQuY2dGYWRpbmcpIHtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5yZW1vdmUoJ2ZhZGluZycpO1xuICAgICAgICAgIHBNdmQuY2dGYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3MgPSBrZXkycG9zKGspO1xuICAgICAgICBpZiAocy5hZGRQaWVjZVpJbmRleCkgcE12ZC5zdHlsZS56SW5kZXggPSBwb3NaSW5kZXgocG9zLCBhc1doaXRlKTtcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwTXZkLmNnQW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwTXZkLmNsYXNzTGlzdC5hZGQoJ2FuaW0nKTtcbiAgICAgICAgICBwb3NbMF0gKz0gYW5pbVsyXTtcbiAgICAgICAgICBwb3NbMV0gKz0gYW5pbVszXTtcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2xhdGUocE12ZCwgcG9zVG9UcmFuc2xhdGUocG9zLCBhc1doaXRlKSk7XG4gICAgICB9XG4gICAgICAvLyBubyBwaWVjZSBpbiBtb3ZlZCBvYmo6IGluc2VydCB0aGUgbmV3IHBpZWNlXG4gICAgICAvLyBhc3N1bWVzIHRoZSBuZXcgcGllY2UgaXMgbm90IGJlaW5nIGRyYWdnZWRcbiAgICAgIGVsc2Uge1xuXG4gICAgICAgIGNvbnN0IHBpZWNlTmFtZSA9IHBpZWNlTmFtZU9mKHApLFxuICAgICAgICBwaWVjZU5vZGUgPSBjcmVhdGVFbCgncGllY2UnLCBwaWVjZU5hbWUpIGFzIGNnLlBpZWNlTm9kZSxcbiAgICAgICAgcG9zID0ga2V5MnBvcyhrKTtcblxuICAgICAgICBwaWVjZU5vZGUuY2dQaWVjZSA9IHBpZWNlTmFtZTtcbiAgICAgICAgcGllY2VOb2RlLmNnS2V5ID0gaztcbiAgICAgICAgaWYgKGFuaW0pIHtcbiAgICAgICAgICBwaWVjZU5vZGUuY2dBbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBvc1swXSArPSBhbmltWzJdO1xuICAgICAgICAgIHBvc1sxXSArPSBhbmltWzNdO1xuICAgICAgICB9XG4gICAgICAgIHRyYW5zbGF0ZShwaWVjZU5vZGUsIHBvc1RvVHJhbnNsYXRlKHBvcywgYXNXaGl0ZSkpO1xuXG4gICAgICAgIGlmIChzLmFkZFBpZWNlWkluZGV4KSBwaWVjZU5vZGUuc3R5bGUuekluZGV4ID0gcG9zWkluZGV4KHBvcywgYXNXaGl0ZSk7XG5cbiAgICAgICAgYm9hcmRFbC5hcHBlbmRDaGlsZChwaWVjZU5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIHJlbW92ZSBhbnkgZWxlbWVudCB0aGF0IHJlbWFpbnMgaW4gdGhlIG1vdmVkIHNldHNcbiAgZm9yIChjb25zdCBpIGluIG1vdmVkUGllY2VzKSByZW1vdmVOb2RlcyhzLCBtb3ZlZFBpZWNlc1tpXSk7XG4gIGZvciAoY29uc3QgaSBpbiBtb3ZlZFNxdWFyZXMpIHJlbW92ZU5vZGVzKHMsIG1vdmVkU3F1YXJlc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGlzUGllY2VOb2RlKGVsOiBjZy5QaWVjZU5vZGUgfCBjZy5TcXVhcmVOb2RlKTogZWwgaXMgY2cuUGllY2VOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdQSUVDRSc7XG59XG5mdW5jdGlvbiBpc1NxdWFyZU5vZGUoZWw6IGNnLlBpZWNlTm9kZSB8IGNnLlNxdWFyZU5vZGUpOiBlbCBpcyBjZy5TcXVhcmVOb2RlIHtcbiAgcmV0dXJuIGVsLnRhZ05hbWUgPT09ICdTUVVBUkUnO1xufVxuXG5mdW5jdGlvbiByZW1vdmVOb2RlcyhzOiBTdGF0ZSwgbm9kZXM6IEhUTUxFbGVtZW50W10pOiB2b2lkIHtcbiAgZm9yIChjb25zdCBpIGluIG5vZGVzKSBzLmRvbS5lbGVtZW50cy5ib2FyZC5yZW1vdmVDaGlsZChub2Rlc1tpXSk7XG59XG5cbmZ1bmN0aW9uIHBvc1pJbmRleChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbik6IHN0cmluZyB7XG4gIGxldCB6ID0gMiArIChwb3NbMV0gLSAxKSAqIDggKyAoOCAtIHBvc1swXSk7XG4gIGlmIChhc1doaXRlKSB6ID0gNjcgLSB6O1xuICByZXR1cm4geiArICcnO1xufVxuXG5mdW5jdGlvbiBwaWVjZU5hbWVPZihwaWVjZTogY2cuUGllY2UpOiBzdHJpbmcge1xuICByZXR1cm4gYCR7cGllY2UuY29sb3J9ICR7cGllY2Uucm9sZX1gO1xufVxuXG5mdW5jdGlvbiBjb21wdXRlU3F1YXJlQ2xhc3NlcyhzOiBTdGF0ZSk6IFNxdWFyZUNsYXNzZXMge1xuICBjb25zdCBzcXVhcmVzOiBTcXVhcmVDbGFzc2VzID0ge307XG4gIGxldCBpOiBhbnksIGs6IGNnLktleTtcbiAgaWYgKHMubGFzdE1vdmUgJiYgcy5oaWdobGlnaHQubGFzdE1vdmUpIGZvciAoaSBpbiBzLmxhc3RNb3ZlKSB7XG4gICAgYWRkU3F1YXJlKHNxdWFyZXMsIHMubGFzdE1vdmVbaV0sICdsYXN0LW1vdmUnKTtcbiAgfVxuICBpZiAocy5jaGVjayAmJiBzLmhpZ2hsaWdodC5jaGVjaykgYWRkU3F1YXJlKHNxdWFyZXMsIHMuY2hlY2ssICdjaGVjaycpO1xuICBpZiAocy5zZWxlY3RlZCkge1xuICAgIGFkZFNxdWFyZShzcXVhcmVzLCBzLnNlbGVjdGVkLCAnc2VsZWN0ZWQnKTtcbiAgICBpZiAocy5tb3ZhYmxlLnNob3dEZXN0cykge1xuICAgICAgY29uc3QgZGVzdHMgPSBzLm1vdmFibGUuZGVzdHMgJiYgcy5tb3ZhYmxlLmRlc3RzW3Muc2VsZWN0ZWRdO1xuICAgICAgaWYgKGRlc3RzKSBmb3IgKGkgaW4gZGVzdHMpIHtcbiAgICAgICAgayA9IGRlc3RzW2ldO1xuICAgICAgICBhZGRTcXVhcmUoc3F1YXJlcywgaywgJ21vdmUtZGVzdCcgKyAocy5waWVjZXNba10gPyAnIG9jJyA6ICcnKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBwRGVzdHMgPSBzLnByZW1vdmFibGUuZGVzdHM7XG4gICAgICBpZiAocERlc3RzKSBmb3IgKGkgaW4gcERlc3RzKSB7XG4gICAgICAgIGsgPSBwRGVzdHNbaV07XG4gICAgICAgIGFkZFNxdWFyZShzcXVhcmVzLCBrLCAncHJlbW92ZS1kZXN0JyArIChzLnBpZWNlc1trXSA/ICcgb2MnIDogJycpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3QgcHJlbW92ZSA9IHMucHJlbW92YWJsZS5jdXJyZW50O1xuICBpZiAocHJlbW92ZSkgZm9yIChpIGluIHByZW1vdmUpIGFkZFNxdWFyZShzcXVhcmVzLCBwcmVtb3ZlW2ldLCAnY3VycmVudC1wcmVtb3ZlJyk7XG4gIGVsc2UgaWYgKHMucHJlZHJvcHBhYmxlLmN1cnJlbnQpIGFkZFNxdWFyZShzcXVhcmVzLCBzLnByZWRyb3BwYWJsZS5jdXJyZW50LmtleSwgJ2N1cnJlbnQtcHJlbW92ZScpO1xuXG4gIGNvbnN0IG8gPSBzLmV4cGxvZGluZztcbiAgaWYgKG8pIGZvciAoaSBpbiBvLmtleXMpIGFkZFNxdWFyZShzcXVhcmVzLCBvLmtleXNbaV0sICdleHBsb2RpbmcnICsgby5zdGFnZSk7XG5cbiAgcmV0dXJuIHNxdWFyZXM7XG59XG5cbmZ1bmN0aW9uIGFkZFNxdWFyZShzcXVhcmVzOiBTcXVhcmVDbGFzc2VzLCBrZXk6IGNnLktleSwga2xhc3M6IHN0cmluZyk6IHZvaWQge1xuICBpZiAoc3F1YXJlc1trZXldKSBzcXVhcmVzW2tleV0gKz0gJyAnICsga2xhc3M7XG4gIGVsc2Ugc3F1YXJlc1trZXldID0ga2xhc3M7XG59XG4iLCJpbXBvcnQgKiBhcyBmZW4gZnJvbSAnLi9mZW4nXG5pbXBvcnQgeyBBbmltQ3VycmVudCB9IGZyb20gJy4vYW5pbSdcbmltcG9ydCB7IERyYWdDdXJyZW50IH0gZnJvbSAnLi9kcmFnJ1xuaW1wb3J0IHsgRHJhd2FibGUgfSBmcm9tICcuL2RyYXcnXG5pbXBvcnQgeyB0aW1lciB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCAqIGFzIGNnIGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0YXRlIHtcbiAgcGllY2VzOiBjZy5QaWVjZXM7XG4gIG9yaWVudGF0aW9uOiBjZy5Db2xvcjsgLy8gYm9hcmQgb3JpZW50YXRpb24uIHdoaXRlIHwgYmxhY2tcbiAgdHVybkNvbG9yOiBjZy5Db2xvcjsgLy8gdHVybiB0byBwbGF5LiB3aGl0ZSB8IGJsYWNrXG4gIGNoZWNrPzogY2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IGluIGNoZWNrIFwiYTJcIlxuICBsYXN0TW92ZT86IGNnLktleVtdOyAvLyBzcXVhcmVzIHBhcnQgb2YgdGhlIGxhc3QgbW92ZSBbXCJjM1wiOyBcImM0XCJdXG4gIHNlbGVjdGVkPzogY2cuS2V5OyAvLyBzcXVhcmUgY3VycmVudGx5IHNlbGVjdGVkIFwiYTFcIlxuICBjb29yZGluYXRlczogYm9vbGVhbjsgLy8gaW5jbHVkZSBjb29yZHMgYXR0cmlidXRlc1xuICBhdXRvQ2FzdGxlOiBib29sZWFuOyAvLyBpbW1lZGlhdGVseSBjb21wbGV0ZSB0aGUgY2FzdGxlIGJ5IG1vdmluZyB0aGUgcm9vayBhZnRlciBraW5nIG1vdmVcbiAgdmlld09ubHk6IGJvb2xlYW47IC8vIGRvbid0IGJpbmQgZXZlbnRzOiB0aGUgdXNlciB3aWxsIG5ldmVyIGJlIGFibGUgdG8gbW92ZSBwaWVjZXMgYXJvdW5kXG4gIGRpc2FibGVDb250ZXh0TWVudTogYm9vbGVhbjsgLy8gYmVjYXVzZSB3aG8gbmVlZHMgYSBjb250ZXh0IG1lbnUgb24gYSBjaGVzc2JvYXJkXG4gIHJlc2l6YWJsZTogYm9vbGVhbjsgLy8gbGlzdGVucyB0byBjaGVzc2dyb3VuZC5yZXNpemUgb24gZG9jdW1lbnQuYm9keSB0byBjbGVhciBib3VuZHMgY2FjaGVcbiAgYWRkUGllY2VaSW5kZXg6IGJvb2xlYW47IC8vIGFkZHMgei1pbmRleCB2YWx1ZXMgdG8gcGllY2VzIChmb3IgM0QpXG4gIHBpZWNlS2V5OiBib29sZWFuOyAvLyBhZGQgYSBkYXRhLWtleSBhdHRyaWJ1dGUgdG8gcGllY2UgZWxlbWVudHNcbiAgaGlnaGxpZ2h0OiB7XG4gICAgbGFzdE1vdmU6IGJvb2xlYW47IC8vIGFkZCBsYXN0LW1vdmUgY2xhc3MgdG8gc3F1YXJlc1xuICAgIGNoZWNrOiBib29sZWFuOyAvLyBhZGQgY2hlY2sgY2xhc3MgdG8gc3F1YXJlc1xuICB9O1xuICBhbmltYXRpb246IHtcbiAgICBlbmFibGVkOiBib29sZWFuO1xuICAgIGR1cmF0aW9uOiBudW1iZXI7XG4gICAgY3VycmVudD86IEFuaW1DdXJyZW50O1xuICB9O1xuICBtb3ZhYmxlOiB7XG4gICAgZnJlZTogYm9vbGVhbjsgLy8gYWxsIG1vdmVzIGFyZSB2YWxpZCAtIGJvYXJkIGVkaXRvclxuICAgIGNvbG9yPzogY2cuQ29sb3IgfCAnYm90aCc7IC8vIGNvbG9yIHRoYXQgY2FuIG1vdmUuIHdoaXRlIHwgYmxhY2sgfCBib3RoXG4gICAgZGVzdHM/OiBjZy5EZXN0czsgLy8gdmFsaWQgbW92ZXMuIHtcImEyXCIgW1wiYTNcIiBcImE0XCJdIFwiYjFcIiBbXCJhM1wiIFwiYzNcIl19XG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBldmVudHM6IHtcbiAgICAgIGFmdGVyPzogKG9yaWc6IGNnLktleSwgZGVzdDogY2cuS2V5LCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIG1vdmUgaGFzIGJlZW4gcGxheWVkXG4gICAgICBhZnRlck5ld1BpZWNlPzogKHJvbGU6IGNnLlJvbGUsIGtleTogY2cuS2V5LCBtZXRhZGF0YTogY2cuTW92ZU1ldGFkYXRhKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgYSBuZXcgcGllY2UgaXMgZHJvcHBlZCBvbiB0aGUgYm9hcmRcbiAgICB9O1xuICAgIHJvb2tDYXN0bGU6IGJvb2xlYW4gLy8gY2FzdGxlIGJ5IG1vdmluZyB0aGUga2luZyB0byB0aGUgcm9va1xuICB9O1xuICBwcmVtb3ZhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlbW92ZXMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgc2hvd0Rlc3RzOiBib29sZWFuOyAvLyB3aGV0aGVyIHRvIGFkZCB0aGUgcHJlbW92ZS1kZXN0IGNsYXNzIG9uIHNxdWFyZXNcbiAgICBjYXN0bGU6IGJvb2xlYW47IC8vIHdoZXRoZXIgdG8gYWxsb3cga2luZyBjYXN0bGUgcHJlbW92ZXNcbiAgICBkZXN0cz86IGNnLktleVtdOyAvLyBwcmVtb3ZlIGRlc3RpbmF0aW9ucyBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uXG4gICAgY3VycmVudD86IGNnLktleVBhaXI7IC8vIGtleXMgb2YgdGhlIGN1cnJlbnQgc2F2ZWQgcHJlbW92ZSBbXCJlMlwiIFwiZTRcIl1cbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgbWV0YWRhdGE/OiBjZy5TZXRQcmVtb3ZlTWV0YWRhdGEpID0+IHZvaWQ7IC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiBzZXRcbiAgICAgIHVuc2V0PzogKCkgPT4gdm9pZDsgIC8vIGNhbGxlZCBhZnRlciB0aGUgcHJlbW92ZSBoYXMgYmVlbiB1bnNldFxuICAgIH1cbiAgfTtcbiAgcHJlZHJvcHBhYmxlOiB7XG4gICAgZW5hYmxlZDogYm9vbGVhbjsgLy8gYWxsb3cgcHJlZHJvcHMgZm9yIGNvbG9yIHRoYXQgY2FuIG5vdCBtb3ZlXG4gICAgY3VycmVudD86IHsgLy8gY3VycmVudCBzYXZlZCBwcmVkcm9wIHtyb2xlOiAna25pZ2h0Jzsga2V5OiAnZTQnfVxuICAgICAgcm9sZTogY2cuUm9sZTtcbiAgICAgIGtleTogY2cuS2V5XG4gICAgfTtcbiAgICBldmVudHM6IHtcbiAgICAgIHNldD86IChyb2xlOiBjZy5Sb2xlLCBrZXk6IGNnLktleSkgPT4gdm9pZDsgLy8gY2FsbGVkIGFmdGVyIHRoZSBwcmVkcm9wIGhhcyBiZWVuIHNldFxuICAgICAgdW5zZXQ/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHByZWRyb3AgaGFzIGJlZW4gdW5zZXRcbiAgICB9XG4gIH07XG4gIGRyYWdnYWJsZToge1xuICAgIGVuYWJsZWQ6IGJvb2xlYW47IC8vIGFsbG93IG1vdmVzICYgcHJlbW92ZXMgdG8gdXNlIGRyYWcnbiBkcm9wXG4gICAgZGlzdGFuY2U6IG51bWJlcjsgLy8gbWluaW11bSBkaXN0YW5jZSB0byBpbml0aWF0ZSBhIGRyYWc7IGluIHBpeGVsc1xuICAgIGF1dG9EaXN0YW5jZTogYm9vbGVhbjsgLy8gbGV0cyBjaGVzc2dyb3VuZCBzZXQgZGlzdGFuY2UgdG8gemVybyB3aGVuIHVzZXIgZHJhZ3MgcGllY2VzXG4gICAgY2VudGVyUGllY2U6IGJvb2xlYW47IC8vIGNlbnRlciB0aGUgcGllY2Ugb24gY3Vyc29yIGF0IGRyYWcgc3RhcnRcbiAgICBzaG93R2hvc3Q6IGJvb2xlYW47IC8vIHNob3cgZ2hvc3Qgb2YgcGllY2UgYmVpbmcgZHJhZ2dlZFxuICAgIGRlbGV0ZU9uRHJvcE9mZjogYm9vbGVhbjsgLy8gZGVsZXRlIGEgcGllY2Ugd2hlbiBpdCBpcyBkcm9wcGVkIG9mZiB0aGUgYm9hcmRcbiAgICBjdXJyZW50PzogRHJhZ0N1cnJlbnQ7XG4gIH07XG4gIGRyb3Btb2RlOiB7XG4gICAgYWN0aXZlOiBib29sZWFuO1xuICAgIHBpZWNlPzogY2cuUGllY2U7XG4gIH1cbiAgc2VsZWN0YWJsZToge1xuICAgIC8vIGRpc2FibGUgdG8gZW5mb3JjZSBkcmFnZ2luZyBvdmVyIGNsaWNrLWNsaWNrIG1vdmVcbiAgICBlbmFibGVkOiBib29sZWFuXG4gIH07XG4gIHN0YXRzOiB7XG4gICAgLy8gd2FzIGxhc3QgcGllY2UgZHJhZ2dlZCBvciBjbGlja2VkP1xuICAgIC8vIG5lZWRzIGRlZmF1bHQgdG8gZmFsc2UgZm9yIHRvdWNoXG4gICAgZHJhZ2dlZDogYm9vbGVhbixcbiAgICBjdHJsS2V5PzogYm9vbGVhblxuICB9O1xuICBldmVudHM6IHtcbiAgICBjaGFuZ2U/OiAoKSA9PiB2b2lkOyAvLyBjYWxsZWQgYWZ0ZXIgdGhlIHNpdHVhdGlvbiBjaGFuZ2VzIG9uIHRoZSBib2FyZFxuICAgIC8vIGNhbGxlZCBhZnRlciBhIHBpZWNlIGhhcyBiZWVuIG1vdmVkLlxuICAgIC8vIGNhcHR1cmVkUGllY2UgaXMgdW5kZWZpbmVkIG9yIGxpa2Uge2NvbG9yOiAnd2hpdGUnOyAncm9sZSc6ICdxdWVlbid9XG4gICAgbW92ZT86IChvcmlnOiBjZy5LZXksIGRlc3Q6IGNnLktleSwgY2FwdHVyZWRQaWVjZT86IGNnLlBpZWNlKSA9PiB2b2lkO1xuICAgIGRyb3BOZXdQaWVjZT86IChwaWVjZTogY2cuUGllY2UsIGtleTogY2cuS2V5KSA9PiB2b2lkO1xuICAgIHNlbGVjdD86IChrZXk6IGNnLktleSkgPT4gdm9pZCAvLyBjYWxsZWQgd2hlbiBhIHNxdWFyZSBpcyBzZWxlY3RlZFxuICAgIGluc2VydD86IChlbGVtZW50czogY2cuRWxlbWVudHMpID0+IHZvaWQ7IC8vIHdoZW4gdGhlIGJvYXJkIERPTSBoYXMgYmVlbiAocmUpaW5zZXJ0ZWRcbiAgfTtcbiAgZHJhd2FibGU6IERyYXdhYmxlLFxuICBleHBsb2Rpbmc/OiBjZy5FeHBsb2Rpbmc7XG4gIGRvbTogY2cuRG9tLFxuICBob2xkOiBjZy5UaW1lclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdHMoKTogUGFydGlhbDxTdGF0ZT4ge1xuICByZXR1cm4ge1xuICAgIHBpZWNlczogZmVuLnJlYWQoZmVuLmluaXRpYWwpLFxuICAgIG9yaWVudGF0aW9uOiAnd2hpdGUnLFxuICAgIHR1cm5Db2xvcjogJ3doaXRlJyxcbiAgICBjb29yZGluYXRlczogdHJ1ZSxcbiAgICBhdXRvQ2FzdGxlOiB0cnVlLFxuICAgIHZpZXdPbmx5OiBmYWxzZSxcbiAgICBkaXNhYmxlQ29udGV4dE1lbnU6IGZhbHNlLFxuICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICBhZGRQaWVjZVpJbmRleDogZmFsc2UsXG4gICAgcGllY2VLZXk6IGZhbHNlLFxuICAgIGhpZ2hsaWdodDoge1xuICAgICAgbGFzdE1vdmU6IHRydWUsXG4gICAgICBjaGVjazogdHJ1ZVxuICAgIH0sXG4gICAgYW5pbWF0aW9uOiB7XG4gICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgZHVyYXRpb246IDIwMFxuICAgIH0sXG4gICAgbW92YWJsZToge1xuICAgICAgZnJlZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiAnYm90aCcsXG4gICAgICBzaG93RGVzdHM6IHRydWUsXG4gICAgICBldmVudHM6IHt9LFxuICAgICAgcm9va0Nhc3RsZTogdHJ1ZVxuICAgIH0sXG4gICAgcHJlbW92YWJsZToge1xuICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIHNob3dEZXN0czogdHJ1ZSxcbiAgICAgIGNhc3RsZTogdHJ1ZSxcbiAgICAgIGV2ZW50czoge31cbiAgICB9LFxuICAgIHByZWRyb3BwYWJsZToge1xuICAgICAgZW5hYmxlZDogZmFsc2UsXG4gICAgICBldmVudHM6IHt9XG4gICAgfSxcbiAgICBkcmFnZ2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICBkaXN0YW5jZTogMyxcbiAgICAgIGF1dG9EaXN0YW5jZTogdHJ1ZSxcbiAgICAgIGNlbnRlclBpZWNlOiB0cnVlLFxuICAgICAgc2hvd0dob3N0OiB0cnVlLFxuICAgICAgZGVsZXRlT25Ecm9wT2ZmOiBmYWxzZVxuICAgIH0sXG4gICAgZHJvcG1vZGU6IHtcbiAgICAgIGFjdGl2ZTogZmFsc2VcbiAgICB9LFxuICAgIHNlbGVjdGFibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWVcbiAgICB9LFxuICAgIHN0YXRzOiB7XG4gICAgICAvLyBvbiB0b3VjaHNjcmVlbiwgZGVmYXVsdCB0byBcInRhcC10YXBcIiBtb3Zlc1xuICAgICAgLy8gaW5zdGVhZCBvZiBkcmFnXG4gICAgICBkcmFnZ2VkOiAhKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdylcbiAgICB9LFxuICAgIGV2ZW50czoge30sXG4gICAgZHJhd2FibGU6IHtcbiAgICAgIGVuYWJsZWQ6IHRydWUsIC8vIGNhbiBkcmF3XG4gICAgICB2aXNpYmxlOiB0cnVlLCAvLyBjYW4gdmlld1xuICAgICAgZXJhc2VPbkNsaWNrOiB0cnVlLFxuICAgICAgc2hhcGVzOiBbXSxcbiAgICAgIGF1dG9TaGFwZXM6IFtdLFxuICAgICAgYnJ1c2hlczoge1xuICAgICAgICBncmVlbjogeyBrZXk6ICdnJywgY29sb3I6ICcjMTU3ODFCJywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICByZWQ6IHsga2V5OiAncicsIGNvbG9yOiAnIzg4MjAyMCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgYmx1ZTogeyBrZXk6ICdiJywgY29sb3I6ICcjMDAzMDg4Jywgb3BhY2l0eTogMSwgbGluZVdpZHRoOiAxMCB9LFxuICAgICAgICB5ZWxsb3c6IHsga2V5OiAneScsIGNvbG9yOiAnI2U2OGYwMCcsIG9wYWNpdHk6IDEsIGxpbmVXaWR0aDogMTAgfSxcbiAgICAgICAgcGFsZUJsdWU6IHsga2V5OiAncGInLCBjb2xvcjogJyMwMDMwODgnLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZUdyZWVuOiB7IGtleTogJ3BnJywgY29sb3I6ICcjMTU3ODFCJywgb3BhY2l0eTogMC40LCBsaW5lV2lkdGg6IDE1IH0sXG4gICAgICAgIHBhbGVSZWQ6IHsga2V5OiAncHInLCBjb2xvcjogJyM4ODIwMjAnLCBvcGFjaXR5OiAwLjQsIGxpbmVXaWR0aDogMTUgfSxcbiAgICAgICAgcGFsZUdyZXk6IHsga2V5OiAncGdyJywgY29sb3I6ICcjNGE0YTRhJywgb3BhY2l0eTogMC4zNSwgbGluZVdpZHRoOiAxNSB9XG4gICAgICB9LFxuICAgICAgcGllY2VzOiB7XG4gICAgICAgIGJhc2VVcmw6ICdodHRwczovL2xpY2hlc3MxLm9yZy9hc3NldHMvcGllY2UvY2J1cm5ldHQvJ1xuICAgICAgfSxcbiAgICAgIHByZXZTdmdIYXNoOiAnJ1xuICAgIH0sXG4gICAgaG9sZDogdGltZXIoKVxuICB9O1xufVxuIiwiaW1wb3J0IHsgU3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuaW1wb3J0IHsga2V5MnBvcyB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IERyYXdhYmxlLCBEcmF3U2hhcGUsIERyYXdTaGFwZVBpZWNlLCBEcmF3QnJ1c2gsIERyYXdCcnVzaGVzLCBEcmF3TW9kaWZpZXJzIH0gZnJvbSAnLi9kcmF3J1xuaW1wb3J0ICogYXMgY2cgZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogU1ZHRWxlbWVudCB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdGFnTmFtZSk7XG59XG5cbmludGVyZmFjZSBTaGFwZSB7XG4gIHNoYXBlOiBEcmF3U2hhcGU7XG4gIGN1cnJlbnQ6IGJvb2xlYW47XG4gIGhhc2g6IEhhc2g7XG59XG5cbmludGVyZmFjZSBDdXN0b21CcnVzaGVzIHtcbiAgW2hhc2g6IHN0cmluZ106IERyYXdCcnVzaFxufVxuXG5pbnRlcmZhY2UgQXJyb3dEZXN0cyB7XG4gIFtrZXk6IHN0cmluZ106IG51bWJlcjsgLy8gaG93IG1hbnkgYXJyb3dzIGxhbmQgb24gYSBzcXVhcmVcbn1cblxudHlwZSBIYXNoID0gc3RyaW5nO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyU3ZnKHN0YXRlOiBTdGF0ZSwgcm9vdDogU1ZHRWxlbWVudCk6IHZvaWQge1xuXG4gIGNvbnN0IGQgPSBzdGF0ZS5kcmF3YWJsZSxcbiAgY3VyRCA9IGQuY3VycmVudCxcbiAgY3VyID0gY3VyRCAmJiBjdXJELm1vdXNlU3EgPyBjdXJEIGFzIERyYXdTaGFwZSA6IHVuZGVmaW5lZCxcbiAgYXJyb3dEZXN0czogQXJyb3dEZXN0cyA9IHt9O1xuXG4gIGQuc2hhcGVzLmNvbmNhdChkLmF1dG9TaGFwZXMpLmNvbmNhdChjdXIgPyBbY3VyXSA6IFtdKS5mb3JFYWNoKHMgPT4ge1xuICAgIGlmIChzLmRlc3QpIGFycm93RGVzdHNbcy5kZXN0XSA9IChhcnJvd0Rlc3RzW3MuZGVzdF0gfHwgMCkgKyAxO1xuICB9KTtcblxuICBjb25zdCBzaGFwZXM6IFNoYXBlW10gPSBkLnNoYXBlcy5jb25jYXQoZC5hdXRvU2hhcGVzKS5tYXAoKHM6IERyYXdTaGFwZSkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzaGFwZTogcyxcbiAgICAgIGN1cnJlbnQ6IGZhbHNlLFxuICAgICAgaGFzaDogc2hhcGVIYXNoKHMsIGFycm93RGVzdHMsIGZhbHNlKVxuICAgIH07XG4gIH0pO1xuICBpZiAoY3VyKSBzaGFwZXMucHVzaCh7XG4gICAgc2hhcGU6IGN1cixcbiAgICBjdXJyZW50OiB0cnVlLFxuICAgIGhhc2g6IHNoYXBlSGFzaChjdXIsIGFycm93RGVzdHMsIHRydWUpXG4gIH0pO1xuXG4gIGNvbnN0IGZ1bGxIYXNoID0gc2hhcGVzLm1hcChzYyA9PiBzYy5oYXNoKS5qb2luKCcnKTtcbiAgaWYgKGZ1bGxIYXNoID09PSBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCkgcmV0dXJuO1xuICBzdGF0ZS5kcmF3YWJsZS5wcmV2U3ZnSGFzaCA9IGZ1bGxIYXNoO1xuXG4gIGNvbnN0IGRlZnNFbCA9IHJvb3QuZmlyc3RDaGlsZCBhcyBTVkdFbGVtZW50O1xuXG4gIHN5bmNEZWZzKGQsIHNoYXBlcywgZGVmc0VsKTtcbiAgc3luY1NoYXBlcyhzdGF0ZSwgc2hhcGVzLCBkLmJydXNoZXMsIGFycm93RGVzdHMsIHJvb3QsIGRlZnNFbCk7XG59XG5cbi8vIGFwcGVuZCBvbmx5LiBEb24ndCB0cnkgdG8gdXBkYXRlL3JlbW92ZS5cbmZ1bmN0aW9uIHN5bmNEZWZzKGQ6IERyYXdhYmxlLCBzaGFwZXM6IFNoYXBlW10sIGRlZnNFbDogU1ZHRWxlbWVudCkge1xuICBjb25zdCBicnVzaGVzOiBDdXN0b21CcnVzaGVzID0ge307XG4gIGxldCBicnVzaDogRHJhd0JydXNoO1xuICBzaGFwZXMuZm9yRWFjaChzID0+IHtcbiAgICBpZiAocy5zaGFwZS5kZXN0KSB7XG4gICAgICBicnVzaCA9IGQuYnJ1c2hlc1tzLnNoYXBlLmJydXNoXTtcbiAgICAgIGlmIChzLnNoYXBlLm1vZGlmaWVycykgYnJ1c2ggPSBtYWtlQ3VzdG9tQnJ1c2goYnJ1c2gsIHMuc2hhcGUubW9kaWZpZXJzKTtcbiAgICAgIGJydXNoZXNbYnJ1c2gua2V5XSA9IGJydXNoO1xuICAgIH1cbiAgfSk7XG4gIGNvbnN0IGtleXNJbkRvbToge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG4gIGxldCBlbDogU1ZHRWxlbWVudCA9IGRlZnNFbC5maXJzdENoaWxkIGFzIFNWR0VsZW1lbnQ7XG4gIHdoaWxlKGVsKSB7XG4gICAga2V5c0luRG9tW2VsLmdldEF0dHJpYnV0ZSgnY2dLZXknKSBhcyBzdHJpbmddID0gdHJ1ZTtcbiAgICBlbCA9IGVsLm5leHRTaWJsaW5nIGFzIFNWR0VsZW1lbnQ7XG4gIH1cbiAgZm9yIChsZXQga2V5IGluIGJydXNoZXMpIHtcbiAgICBpZiAoIWtleXNJbkRvbVtrZXldKSBkZWZzRWwuYXBwZW5kQ2hpbGQocmVuZGVyTWFya2VyKGJydXNoZXNba2V5XSkpO1xuICB9XG59XG5cbi8vIGFwcGVuZCBhbmQgcmVtb3ZlIG9ubHkuIE5vIHVwZGF0ZXMuXG5mdW5jdGlvbiBzeW5jU2hhcGVzKHN0YXRlOiBTdGF0ZSwgc2hhcGVzOiBTaGFwZVtdLCBicnVzaGVzOiBEcmF3QnJ1c2hlcywgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgcm9vdDogU1ZHRWxlbWVudCwgZGVmc0VsOiBTVkdFbGVtZW50KTogdm9pZCB7XG4gIGNvbnN0IGJvdW5kcyA9IHN0YXRlLmRvbS5ib3VuZHMoKSxcbiAgaGFzaGVzSW5Eb206IHtbaGFzaDogc3RyaW5nXTogYm9vbGVhbn0gPSB7fSxcbiAgdG9SZW1vdmU6IFNWR0VsZW1lbnRbXSA9IFtdO1xuICBzaGFwZXMuZm9yRWFjaChzYyA9PiB7IGhhc2hlc0luRG9tW3NjLmhhc2hdID0gZmFsc2U7IH0pO1xuICBsZXQgZWw6IFNWR0VsZW1lbnQgPSBkZWZzRWwubmV4dFNpYmxpbmcgYXMgU1ZHRWxlbWVudCwgZWxIYXNoOiBIYXNoO1xuICB3aGlsZShlbCkge1xuICAgIGVsSGFzaCA9IGVsLmdldEF0dHJpYnV0ZSgnY2dIYXNoJykgYXMgSGFzaDtcbiAgICAvLyBmb3VuZCBhIHNoYXBlIGVsZW1lbnQgdGhhdCdzIGhlcmUgdG8gc3RheVxuICAgIGlmIChoYXNoZXNJbkRvbS5oYXNPd25Qcm9wZXJ0eShlbEhhc2gpKSBoYXNoZXNJbkRvbVtlbEhhc2hdID0gdHJ1ZTtcbiAgICAvLyBvciByZW1vdmUgaXRcbiAgICBlbHNlIHRvUmVtb3ZlLnB1c2goZWwpO1xuICAgIGVsID0gZWwubmV4dFNpYmxpbmcgYXMgU1ZHRWxlbWVudDtcbiAgfVxuICAvLyByZW1vdmUgb2xkIHNoYXBlc1xuICB0b1JlbW92ZS5mb3JFYWNoKGVsID0+IHJvb3QucmVtb3ZlQ2hpbGQoZWwpKTtcbiAgLy8gaW5zZXJ0IHNoYXBlcyB0aGF0IGFyZSBub3QgeWV0IGluIGRvbVxuICBzaGFwZXMuZm9yRWFjaChzYyA9PiB7XG4gICAgaWYgKCFoYXNoZXNJbkRvbVtzYy5oYXNoXSkgcm9vdC5hcHBlbmRDaGlsZChyZW5kZXJTaGFwZShzdGF0ZSwgc2MsIGJydXNoZXMsIGFycm93RGVzdHMsIGJvdW5kcykpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2hhcGVIYXNoKHtvcmlnLCBkZXN0LCBicnVzaCwgcGllY2UsIG1vZGlmaWVyc306IERyYXdTaGFwZSwgYXJyb3dEZXN0czogQXJyb3dEZXN0cywgY3VycmVudDogYm9vbGVhbik6IEhhc2gge1xuICByZXR1cm4gW2N1cnJlbnQsIG9yaWcsIGRlc3QsIGJydXNoLCBkZXN0ICYmIGFycm93RGVzdHNbZGVzdF0gPiAxLFxuICAgIHBpZWNlICYmIHBpZWNlSGFzaChwaWVjZSksXG4gICAgbW9kaWZpZXJzICYmIG1vZGlmaWVyc0hhc2gobW9kaWZpZXJzKVxuICBdLmZpbHRlcih4ID0+IHgpLmpvaW4oJycpO1xufVxuXG5mdW5jdGlvbiBwaWVjZUhhc2gocGllY2U6IERyYXdTaGFwZVBpZWNlKTogSGFzaCB7XG4gIHJldHVybiBbcGllY2UuY29sb3IsIHBpZWNlLnJvbGUsIHBpZWNlLnNjYWxlXS5maWx0ZXIoeCA9PiB4KS5qb2luKCcnKTtcbn1cblxuZnVuY3Rpb24gbW9kaWZpZXJzSGFzaChtOiBEcmF3TW9kaWZpZXJzKTogSGFzaCB7XG4gIHJldHVybiAnJyArIChtLmxpbmVXaWR0aCB8fCAnJyk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclNoYXBlKHN0YXRlOiBTdGF0ZSwge3NoYXBlLCBjdXJyZW50LCBoYXNofTogU2hhcGUsIGJydXNoZXM6IERyYXdCcnVzaGVzLCBhcnJvd0Rlc3RzOiBBcnJvd0Rlc3RzLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgbGV0IGVsOiBTVkdFbGVtZW50O1xuICBpZiAoc2hhcGUucGllY2UpIGVsID0gcmVuZGVyUGllY2UoXG4gICAgc3RhdGUuZHJhd2FibGUucGllY2VzLmJhc2VVcmwsXG4gICAgb3JpZW50KGtleTJwb3Moc2hhcGUub3JpZyksIHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICBzaGFwZS5waWVjZSxcbiAgICBib3VuZHMpO1xuICBlbHNlIHtcbiAgICBjb25zdCBvcmlnID0gb3JpZW50KGtleTJwb3Moc2hhcGUub3JpZyksIHN0YXRlLm9yaWVudGF0aW9uKTtcbiAgICBpZiAoc2hhcGUub3JpZyAmJiBzaGFwZS5kZXN0KSB7XG4gICAgICBsZXQgYnJ1c2g6IERyYXdCcnVzaCA9IGJydXNoZXNbc2hhcGUuYnJ1c2hdO1xuICAgICAgaWYgKHNoYXBlLm1vZGlmaWVycykgYnJ1c2ggPSBtYWtlQ3VzdG9tQnJ1c2goYnJ1c2gsIHNoYXBlLm1vZGlmaWVycyk7XG4gICAgICBlbCA9IHJlbmRlckFycm93KFxuICAgICAgICBicnVzaCxcbiAgICAgICAgb3JpZyxcbiAgICAgICAgb3JpZW50KGtleTJwb3Moc2hhcGUuZGVzdCksIHN0YXRlLm9yaWVudGF0aW9uKSxcbiAgICAgICAgY3VycmVudCxcbiAgICAgICAgYXJyb3dEZXN0c1tzaGFwZS5kZXN0XSA+IDEsXG4gICAgICAgIGJvdW5kcyk7XG4gICAgfVxuICAgIGVsc2UgZWwgPSByZW5kZXJDaXJjbGUoYnJ1c2hlc1tzaGFwZS5icnVzaF0sIG9yaWcsIGN1cnJlbnQsIGJvdW5kcyk7XG4gIH1cbiAgZWwuc2V0QXR0cmlidXRlKCdjZ0hhc2gnLCBoYXNoKTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiByZW5kZXJDaXJjbGUoYnJ1c2g6IERyYXdCcnVzaCwgcG9zOiBjZy5Qb3MsIGN1cnJlbnQ6IGJvb2xlYW4sIGJvdW5kczogQ2xpZW50UmVjdCk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBvID0gcG9zMnB4KHBvcywgYm91bmRzKSxcbiAgd2lkdGhzID0gY2lyY2xlV2lkdGgoYm91bmRzKSxcbiAgcmFkaXVzID0gKGJvdW5kcy53aWR0aCArIGJvdW5kcy5oZWlnaHQpIC8gMzI7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2NpcmNsZScpLCB7XG4gICAgc3Ryb2tlOiBicnVzaC5jb2xvcixcbiAgICAnc3Ryb2tlLXdpZHRoJzogd2lkdGhzW2N1cnJlbnQgPyAwIDogMV0sXG4gICAgZmlsbDogJ25vbmUnLFxuICAgIG9wYWNpdHk6IG9wYWNpdHkoYnJ1c2gsIGN1cnJlbnQpLFxuICAgIGN4OiBvWzBdLFxuICAgIGN5OiBvWzFdLFxuICAgIHI6IHJhZGl1cyAtIHdpZHRoc1sxXSAvIDJcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFycm93KGJydXNoOiBEcmF3QnJ1c2gsIG9yaWc6IGNnLlBvcywgZGVzdDogY2cuUG9zLCBjdXJyZW50OiBib29sZWFuLCBzaG9ydGVuOiBib29sZWFuLCBib3VuZHM6IENsaWVudFJlY3QpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbSA9IGFycm93TWFyZ2luKGJvdW5kcywgc2hvcnRlbiAmJiAhY3VycmVudCksXG4gIGEgPSBwb3MycHgob3JpZywgYm91bmRzKSxcbiAgYiA9IHBvczJweChkZXN0LCBib3VuZHMpLFxuICBkeCA9IGJbMF0gLSBhWzBdLFxuICBkeSA9IGJbMV0gLSBhWzFdLFxuICBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KSxcbiAgeG8gPSBNYXRoLmNvcyhhbmdsZSkgKiBtLFxuICB5byA9IE1hdGguc2luKGFuZ2xlKSAqIG07XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2xpbmUnKSwge1xuICAgIHN0cm9rZTogYnJ1c2guY29sb3IsXG4gICAgJ3N0cm9rZS13aWR0aCc6IGxpbmVXaWR0aChicnVzaCwgY3VycmVudCwgYm91bmRzKSxcbiAgICAnc3Ryb2tlLWxpbmVjYXAnOiAncm91bmQnLFxuICAgICdtYXJrZXItZW5kJzogJ3VybCgjYXJyb3doZWFkLScgKyBicnVzaC5rZXkgKyAnKScsXG4gICAgb3BhY2l0eTogb3BhY2l0eShicnVzaCwgY3VycmVudCksXG4gICAgeDE6IGFbMF0sXG4gICAgeTE6IGFbMV0sXG4gICAgeDI6IGJbMF0gLSB4byxcbiAgICB5MjogYlsxXSAtIHlvXG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQaWVjZShiYXNlVXJsOiBzdHJpbmcsIHBvczogY2cuUG9zLCBwaWVjZTogRHJhd1NoYXBlUGllY2UsIGJvdW5kczogQ2xpZW50UmVjdCk6IFNWR0VsZW1lbnQge1xuICBjb25zdCBvID0gcG9zMnB4KHBvcywgYm91bmRzKSxcbiAgc2l6ZSA9IGJvdW5kcy53aWR0aCAvIDggKiAocGllY2Uuc2NhbGUgfHwgMSksXG4gIG5hbWUgPSBwaWVjZS5jb2xvclswXSArIChwaWVjZS5yb2xlID09PSAna25pZ2h0JyA/ICduJyA6IHBpZWNlLnJvbGVbMF0pLnRvVXBwZXJDYXNlKCk7XG4gIHJldHVybiBzZXRBdHRyaWJ1dGVzKGNyZWF0ZUVsZW1lbnQoJ2ltYWdlJyksIHtcbiAgICBjbGFzc05hbWU6IGAke3BpZWNlLnJvbGV9ICR7cGllY2UuY29sb3J9YCxcbiAgICB4OiBvWzBdIC0gc2l6ZSAvIDIsXG4gICAgeTogb1sxXSAtIHNpemUgLyAyLFxuICAgIHdpZHRoOiBzaXplLFxuICAgIGhlaWdodDogc2l6ZSxcbiAgICBocmVmOiBiYXNlVXJsICsgbmFtZSArICcuc3ZnJ1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWFya2VyKGJydXNoOiBEcmF3QnJ1c2gpOiBTVkdFbGVtZW50IHtcbiAgY29uc3QgbWFya2VyID0gc2V0QXR0cmlidXRlcyhjcmVhdGVFbGVtZW50KCdtYXJrZXInKSwge1xuICAgIGlkOiAnYXJyb3doZWFkLScgKyBicnVzaC5rZXksXG4gICAgb3JpZW50OiAnYXV0bycsXG4gICAgbWFya2VyV2lkdGg6IDQsXG4gICAgbWFya2VySGVpZ2h0OiA4LFxuICAgIHJlZlg6IDIuMDUsXG4gICAgcmVmWTogMi4wMVxuICB9KTtcbiAgbWFya2VyLmFwcGVuZENoaWxkKHNldEF0dHJpYnV0ZXMoY3JlYXRlRWxlbWVudCgncGF0aCcpLCB7XG4gICAgZDogJ00wLDAgVjQgTDMsMiBaJyxcbiAgICBmaWxsOiBicnVzaC5jb2xvclxuICB9KSk7XG4gIG1hcmtlci5zZXRBdHRyaWJ1dGUoJ2NnS2V5JywgYnJ1c2gua2V5KTtcbiAgcmV0dXJuIG1hcmtlcjtcbn1cblxuZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhlbDogU1ZHRWxlbWVudCwgYXR0cnM6IHsgW2tleTogc3RyaW5nXTogYW55IH0pOiBTVkdFbGVtZW50IHtcbiAgZm9yIChsZXQga2V5IGluIGF0dHJzKSBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyc1trZXldKTtcbiAgcmV0dXJuIGVsO1xufVxuXG5mdW5jdGlvbiBvcmllbnQocG9zOiBjZy5Qb3MsIGNvbG9yOiBjZy5Db2xvcik6IGNnLlBvcyB7XG4gIHJldHVybiBjb2xvciA9PT0gJ3doaXRlJyA/IHBvcyA6IFs5IC0gcG9zWzBdLCA5IC0gcG9zWzFdXTtcbn1cblxuZnVuY3Rpb24gbWFrZUN1c3RvbUJydXNoKGJhc2U6IERyYXdCcnVzaCwgbW9kaWZpZXJzOiBEcmF3TW9kaWZpZXJzKTogRHJhd0JydXNoIHtcbiAgY29uc3QgYnJ1c2g6IFBhcnRpYWw8RHJhd0JydXNoPiA9IHtcbiAgICBjb2xvcjogYmFzZS5jb2xvcixcbiAgICBvcGFjaXR5OiBNYXRoLnJvdW5kKGJhc2Uub3BhY2l0eSAqIDEwKSAvIDEwLFxuICAgIGxpbmVXaWR0aDogTWF0aC5yb3VuZChtb2RpZmllcnMubGluZVdpZHRoIHx8IGJhc2UubGluZVdpZHRoKVxuICB9O1xuICBicnVzaC5rZXkgPSBbYmFzZS5rZXksIG1vZGlmaWVycy5saW5lV2lkdGhdLmZpbHRlcih4ID0+IHgpLmpvaW4oJycpO1xuICByZXR1cm4gYnJ1c2ggYXMgRHJhd0JydXNoO1xufVxuXG5mdW5jdGlvbiBjaXJjbGVXaWR0aChib3VuZHM6IENsaWVudFJlY3QpOiBbbnVtYmVyLCBudW1iZXJdIHtcbiAgY29uc3QgYmFzZSA9IGJvdW5kcy53aWR0aCAvIDUxMjtcbiAgcmV0dXJuIFszICogYmFzZSwgNCAqIGJhc2VdO1xufVxuXG5mdW5jdGlvbiBsaW5lV2lkdGgoYnJ1c2g6IERyYXdCcnVzaCwgY3VycmVudDogYm9vbGVhbiwgYm91bmRzOiBDbGllbnRSZWN0KTogbnVtYmVyIHtcbiAgcmV0dXJuIChicnVzaC5saW5lV2lkdGggfHwgMTApICogKGN1cnJlbnQgPyAwLjg1IDogMSkgLyA1MTIgKiBib3VuZHMud2lkdGg7XG59XG5cbmZ1bmN0aW9uIG9wYWNpdHkoYnJ1c2g6IERyYXdCcnVzaCwgY3VycmVudDogYm9vbGVhbik6IG51bWJlciB7XG4gIHJldHVybiAoYnJ1c2gub3BhY2l0eSB8fCAxKSAqIChjdXJyZW50ID8gMC45IDogMSk7XG59XG5cbmZ1bmN0aW9uIGFycm93TWFyZ2luKGJvdW5kczogQ2xpZW50UmVjdCwgc2hvcnRlbjogYm9vbGVhbik6IG51bWJlciB7XG4gIHJldHVybiAoc2hvcnRlbiA/IDIwIDogMTApIC8gNTEyICogYm91bmRzLndpZHRoO1xufVxuXG5mdW5jdGlvbiBwb3MycHgocG9zOiBjZy5Qb3MsIGJvdW5kczogQ2xpZW50UmVjdCk6IGNnLk51bWJlclBhaXIge1xuICByZXR1cm4gWyhwb3NbMF0gLSAwLjUpICogYm91bmRzLndpZHRoIC8gOCwgKDguNSAtIHBvc1sxXSkgKiBib3VuZHMuaGVpZ2h0IC8gOF07XG59XG4iLCJleHBvcnQgdHlwZSBDb2xvciA9ICd3aGl0ZScgfCAnYmxhY2snO1xuZXhwb3J0IHR5cGUgUm9sZSA9ICdraW5nJyB8ICdxdWVlbicgfCAncm9vaycgfCAnYmlzaG9wJyB8ICdrbmlnaHQnIHwgJ3Bhd24nO1xuZXhwb3J0IHR5cGUgS2V5ID0gJ2EwJyB8ICdhMScgfCAnYjEnIHwgJ2MxJyB8ICdkMScgfCAnZTEnIHwgJ2YxJyB8ICdnMScgfCAnaDEnIHwgJ2EyJyB8ICdiMicgfCAnYzInIHwgJ2QyJyB8ICdlMicgfCAnZjInIHwgJ2cyJyB8ICdoMicgfCAnYTMnIHwgJ2IzJyB8ICdjMycgfCAnZDMnIHwgJ2UzJyB8ICdmMycgfCAnZzMnIHwgJ2gzJyB8ICdhNCcgfCAnYjQnIHwgJ2M0JyB8ICdkNCcgfCAnZTQnIHwgJ2Y0JyB8ICdnNCcgfCAnaDQnIHwgJ2E1JyB8ICdiNScgfCAnYzUnIHwgJ2Q1JyB8ICdlNScgfCAnZjUnIHwgJ2c1JyB8ICdoNScgfCAnYTYnIHwgJ2I2JyB8ICdjNicgfCAnZDYnIHwgJ2U2JyB8ICdmNicgfCAnZzYnIHwgJ2g2JyB8ICdhNycgfCAnYjcnIHwgJ2M3JyB8ICdkNycgfCAnZTcnIHwgJ2Y3JyB8ICdnNycgfCAnaDcnIHwgJ2E4JyB8ICdiOCcgfCAnYzgnIHwgJ2Q4JyB8ICdlOCcgfCAnZjgnIHwgJ2c4JyB8ICdoOCc7XG5leHBvcnQgdHlwZSBGaWxlID0gJ2EnIHwgJ2InIHwgJ2MnIHwgJ2QnIHwgJ2UnIHwgJ2YnIHwgJ2cnIHwgJ2gnO1xuZXhwb3J0IHR5cGUgUmFuayA9IDEgfCAyIHwgMyB8IDQgfCA1IHwgNiB8IDcgfCA4O1xuZXhwb3J0IHR5cGUgRkVOID0gc3RyaW5nO1xuZXhwb3J0IHR5cGUgUG9zID0gW251bWJlciwgbnVtYmVyXTtcbmV4cG9ydCBpbnRlcmZhY2UgUGllY2Uge1xuICByb2xlOiBSb2xlO1xuICBjb2xvcjogQ29sb3I7XG4gIHByb21vdGVkPzogYm9vbGVhbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgRHJvcCB7XG4gIHJvbGU6IFJvbGU7XG4gIGtleTogS2V5O1xufVxuZXhwb3J0IGludGVyZmFjZSBQaWVjZXMge1xuICBba2V5OiBzdHJpbmddOiBQaWVjZSB8IHVuZGVmaW5lZDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VzRGlmZiB7XG4gIFtrZXk6IHN0cmluZ106IFBpZWNlIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgdHlwZSBLZXlQYWlyID0gW0tleSwgS2V5XTtcblxuZXhwb3J0IHR5cGUgTnVtYmVyUGFpciA9IFtudW1iZXIsIG51bWJlcl07XG5cbmV4cG9ydCB0eXBlIE51bWJlclF1YWQgPSBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcblxuZXhwb3J0IGludGVyZmFjZSBEZXN0cyB7XG4gIFtrZXk6IHN0cmluZ106IEtleVtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWxlbWVudHMge1xuICBib2FyZDogSFRNTEVsZW1lbnQ7XG4gIGNvbnRhaW5lcjogSFRNTEVsZW1lbnQ7XG4gIGdob3N0PzogSFRNTEVsZW1lbnQ7XG4gIHN2Zz86IFNWR0VsZW1lbnQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIERvbSB7XG4gIGVsZW1lbnRzOiBFbGVtZW50cyxcbiAgYm91bmRzOiBNZW1vPENsaWVudFJlY3Q+O1xuICByZWRyYXc6ICgpID0+IHZvaWQ7XG4gIHJlZHJhd05vdzogKHNraXBTdmc/OiBib29sZWFuKSA9PiB2b2lkO1xuICB1bmJpbmQ/OiBVbmJpbmQ7XG4gIGRlc3Ryb3llZD86IGJvb2xlYW47XG4gIHJlbGF0aXZlPzogYm9vbGVhbjsgLy8gZG9uJ3QgY29tcHV0ZSBib3VuZHMsIHVzZSByZWxhdGl2ZSAlIHRvIHBsYWNlIHBpZWNlc1xufVxuZXhwb3J0IGludGVyZmFjZSBFeHBsb2Rpbmcge1xuICBzdGFnZTogbnVtYmVyO1xuICBrZXlzOiBLZXlbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNb3ZlTWV0YWRhdGEge1xuICBwcmVtb3ZlOiBib29sZWFuO1xuICBjdHJsS2V5PzogYm9vbGVhbjtcbiAgaG9sZFRpbWU/OiBudW1iZXI7XG4gIGNhcHR1cmVkPzogUGllY2U7XG4gIHByZWRyb3A/OiBib29sZWFuO1xufVxuZXhwb3J0IGludGVyZmFjZSBTZXRQcmVtb3ZlTWV0YWRhdGEge1xuICBjdHJsS2V5PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IHR5cGUgV2luZG93RXZlbnQgPSAnb25zY3JvbGwnIHwgJ29ucmVzaXplJztcblxuZXhwb3J0IHR5cGUgTW91Y2hFdmVudCA9IE1vdXNlRXZlbnQgJiBUb3VjaEV2ZW50O1xuXG5leHBvcnQgaW50ZXJmYWNlIEtleWVkTm9kZSBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgY2dLZXk6IEtleTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgUGllY2VOb2RlIGV4dGVuZHMgS2V5ZWROb2RlIHtcbiAgY2dQaWVjZTogc3RyaW5nO1xuICBjZ0FuaW1hdGluZz86IGJvb2xlYW47XG4gIGNnRmFkaW5nPzogYm9vbGVhbjtcbiAgY2dEcmFnZ2luZz86IGJvb2xlYW47XG59XG5leHBvcnQgaW50ZXJmYWNlIFNxdWFyZU5vZGUgZXh0ZW5kcyBLZXllZE5vZGUgeyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWVtbzxBPiB7ICgpOiBBOyBjbGVhcjogKCkgPT4gdm9pZDsgfVxuXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVyIHtcbiAgc3RhcnQ6ICgpID0+IHZvaWQ7XG4gIGNhbmNlbDogKCkgPT4gdm9pZDtcbiAgc3RvcDogKCkgPT4gbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBSZWRyYXcgPSAoKSA9PiB2b2lkO1xuZXhwb3J0IHR5cGUgVW5iaW5kID0gKCkgPT4gdm9pZDtcbmV4cG9ydCB0eXBlIE1pbGxpc2Vjb25kcyA9IG51bWJlcjtcbmV4cG9ydCB0eXBlIEtIeiA9IG51bWJlcjtcblxuZXhwb3J0IGNvbnN0IGZpbGVzOiBGaWxlW10gPSBbJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJywgJ2cnLCAnaCddO1xuZXhwb3J0IGNvbnN0IHJhbmtzOiBSYW5rW10gPSBbMSwgMiwgMywgNCwgNSwgNiwgNywgOF07XG4iLCJpbXBvcnQgKiBhcyBjZyBmcm9tICcuL3R5cGVzJztcblxuZXhwb3J0IGNvbnN0IGNvbG9yczogY2cuQ29sb3JbXSA9IFsnd2hpdGUnLCAnYmxhY2snXTtcblxuZXhwb3J0IGNvbnN0IGludlJhbmtzOiBjZy5SYW5rW10gPSBbOCwgNywgNiwgNSwgNCwgMywgMiwgMV07XG5cbmV4cG9ydCBjb25zdCBhbGxLZXlzOiBjZy5LZXlbXSA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQoLi4uY2cuZmlsZXMubWFwKGMgPT4gY2cucmFua3MubWFwKHIgPT4gYytyKSkpO1xuXG5leHBvcnQgY29uc3QgcG9zMmtleSA9IChwb3M6IGNnLlBvcykgPT4gYWxsS2V5c1s4ICogcG9zWzBdICsgcG9zWzFdIC0gOV07XG5cbmV4cG9ydCBjb25zdCBrZXkycG9zID0gKGs6IGNnLktleSkgPT4gW2suY2hhckNvZGVBdCgwKSAtIDk2LCBrLmNoYXJDb2RlQXQoMSkgLSA0OF0gYXMgY2cuUG9zO1xuXG5leHBvcnQgZnVuY3Rpb24gbWVtbzxBPihmOiAoKSA9PiBBKTogY2cuTWVtbzxBPiB7XG4gIGxldCB2OiBBIHwgdW5kZWZpbmVkO1xuICBjb25zdCByZXQ6IGFueSA9ICgpID0+IHtcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB2ID0gZigpO1xuICAgIHJldHVybiB2O1xuICB9O1xuICByZXQuY2xlYXIgPSAoKSA9PiB7IHYgPSB1bmRlZmluZWQ7IH07XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCBjb25zdCB0aW1lcjogKCkgPT4gY2cuVGltZXIgPSAoKSA9PiB7XG4gIGxldCBzdGFydEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIHJldHVybiB7XG4gICAgc3RhcnQoKSB7IHN0YXJ0QXQgPSBEYXRlLm5vdygpOyB9LFxuICAgIGNhbmNlbCgpIHsgc3RhcnRBdCA9IHVuZGVmaW5lZDsgfSxcbiAgICBzdG9wKCkge1xuICAgICAgaWYgKCFzdGFydEF0KSByZXR1cm4gMDtcbiAgICAgIGNvbnN0IHRpbWUgPSBEYXRlLm5vdygpIC0gc3RhcnRBdDtcbiAgICAgIHN0YXJ0QXQgPSB1bmRlZmluZWQ7XG4gICAgICByZXR1cm4gdGltZTtcbiAgICB9XG4gIH07XG59XG5cbmV4cG9ydCBjb25zdCBvcHBvc2l0ZSA9IChjOiBjZy5Db2xvcikgPT4gYyA9PT0gJ3doaXRlJyA/ICdibGFjaycgOiAnd2hpdGUnO1xuXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNYPFg+KHhzOiBYW10gfCB1bmRlZmluZWQsIHg6IFgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHhzICE9PSB1bmRlZmluZWQgJiYgeHMuaW5kZXhPZih4KSAhPT0gLTE7XG59XG5cbmV4cG9ydCBjb25zdCBkaXN0YW5jZVNxOiAocG9zMTogY2cuUG9zLCBwb3MyOiBjZy5Qb3MpID0+IG51bWJlciA9IChwb3MxLCBwb3MyKSA9PiB7XG4gIHJldHVybiBNYXRoLnBvdyhwb3MxWzBdIC0gcG9zMlswXSwgMikgKyBNYXRoLnBvdyhwb3MxWzFdIC0gcG9zMlsxXSwgMik7XG59XG5cbmV4cG9ydCBjb25zdCBzYW1lUGllY2U6IChwMTogY2cuUGllY2UsIHAyOiBjZy5QaWVjZSkgPT4gYm9vbGVhbiA9IChwMSwgcDIpID0+XG4gIHAxLnJvbGUgPT09IHAyLnJvbGUgJiYgcDEuY29sb3IgPT09IHAyLmNvbG9yO1xuXG5jb25zdCBwb3NUb1RyYW5zbGF0ZUJhc2U6IChwb3M6IGNnLlBvcywgYXNXaGl0ZTogYm9vbGVhbiwgeEZhY3RvcjogbnVtYmVyLCB5RmFjdG9yOiBudW1iZXIpID0+IGNnLk51bWJlclBhaXIgPVxuKHBvcywgYXNXaGl0ZSwgeEZhY3RvciwgeUZhY3RvcikgPT4gW1xuICAoYXNXaGl0ZSA/IHBvc1swXSAtIDEgOiA4IC0gcG9zWzBdKSAqIHhGYWN0b3IsXG4gIChhc1doaXRlID8gOCAtIHBvc1sxXSA6IHBvc1sxXSAtIDEpICogeUZhY3RvclxuXTtcblxuZXhwb3J0IGNvbnN0IHBvc1RvVHJhbnNsYXRlQWJzID0gKGJvdW5kczogQ2xpZW50UmVjdCkgPT4ge1xuICBjb25zdCB4RmFjdG9yID0gYm91bmRzLndpZHRoIC8gOCxcbiAgeUZhY3RvciA9IGJvdW5kcy5oZWlnaHQgLyA4O1xuICByZXR1cm4gKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBwb3NUb1RyYW5zbGF0ZUJhc2UocG9zLCBhc1doaXRlLCB4RmFjdG9yLCB5RmFjdG9yKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwb3NUb1RyYW5zbGF0ZVJlbDogKHBvczogY2cuUG9zLCBhc1doaXRlOiBib29sZWFuKSA9PiBjZy5OdW1iZXJQYWlyID1cbiAgKHBvcywgYXNXaGl0ZSkgPT4gcG9zVG9UcmFuc2xhdGVCYXNlKHBvcywgYXNXaGl0ZSwgMTIuNSwgMTIuNSk7XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVBYnMgPSAoZWw6IEhUTUxFbGVtZW50LCBwb3M6IGNnLlBvcykgPT4ge1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cG9zWzBdfXB4LCR7cG9zWzFdfXB4KWA7XG59XG5cbmV4cG9ydCBjb25zdCB0cmFuc2xhdGVSZWwgPSAoZWw6IEhUTUxFbGVtZW50LCBwZXJjZW50czogY2cuTnVtYmVyUGFpcikgPT4ge1xuICBlbC5zdHlsZS5sZWZ0ID0gcGVyY2VudHNbMF0gKyAnJSc7XG4gIGVsLnN0eWxlLnRvcCA9IHBlcmNlbnRzWzFdICsgJyUnO1xufVxuXG5leHBvcnQgY29uc3Qgc2V0VmlzaWJsZSA9IChlbDogSFRNTEVsZW1lbnQsIHY6IGJvb2xlYW4pID0+IHtcbiAgZWwuc3R5bGUudmlzaWJpbGl0eSA9IHYgPyAndmlzaWJsZScgOiAnaGlkZGVuJztcbn1cblxuLy8gdG91Y2hlbmQgaGFzIG5vIHBvc2l0aW9uIVxuZXhwb3J0IGNvbnN0IGV2ZW50UG9zaXRpb246IChlOiBjZy5Nb3VjaEV2ZW50KSA9PiBjZy5OdW1iZXJQYWlyIHwgdW5kZWZpbmVkID0gZSA9PiB7XG4gIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRYID09PSAwKSByZXR1cm4gW2UuY2xpZW50WCwgZS5jbGllbnRZXTtcbiAgaWYgKGUudG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXNbMF0pIHJldHVybiBbZS50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFgsIGUudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZXTtcbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGNvbnN0IGlzUmlnaHRCdXR0b24gPSAoZTogTW91c2VFdmVudCkgPT4gZS5idXR0b25zID09PSAyIHx8IGUuYnV0dG9uID09PSAyO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlRWwgPSAodGFnTmFtZTogc3RyaW5nLCBjbGFzc05hbWU/OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICBpZiAoY2xhc3NOYW1lKSBlbC5jbGFzc05hbWUgPSBjbGFzc05hbWU7XG4gIHJldHVybiBlbDtcbn1cbiIsImltcG9ydCB7IFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcbmltcG9ydCB7IGNvbG9ycywgc2V0VmlzaWJsZSwgY3JlYXRlRWwgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBmaWxlcywgcmFua3MgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHsgY3JlYXRlRWxlbWVudCBhcyBjcmVhdGVTVkcgfSBmcm9tICcuL3N2ZydcbmltcG9ydCB7IEVsZW1lbnRzIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd3JhcChlbGVtZW50OiBIVE1MRWxlbWVudCwgczogU3RhdGUsIHJlbGF0aXZlOiBib29sZWFuKTogRWxlbWVudHMge1xuXG4gIC8vIC5jZy13cmFwIChlbGVtZW50IHBhc3NlZCB0byBDaGVzc2dyb3VuZClcbiAgLy8gICBjZy1oZWxwZXIgKDEyLjUlKVxuICAvLyAgICAgY2ctY29udGFpbmVyICg4MDAlKVxuICAvLyAgICAgICBjZy1ib2FyZFxuICAvLyAgICAgICBzdmdcbiAgLy8gICAgICAgY29vcmRzLnJhbmtzXG4gIC8vICAgICAgIGNvb3Jkcy5maWxlc1xuICAvLyAgICAgICBwaWVjZS5naG9zdFxuXG4gIGVsZW1lbnQuaW5uZXJIVE1MID0gJyc7XG5cbiAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjZy13cmFwJyk7XG4gIGNvbG9ycy5mb3JFYWNoKGMgPT4ge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSgnb3JpZW50YXRpb24tJyArIGMsIHMub3JpZW50YXRpb24gPT09IGMpO1xuICB9KTtcbiAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdtYW5pcHVsYWJsZScsICFzLnZpZXdPbmx5KTtcblxuICBjb25zdCBoZWxwZXIgPSBjcmVhdGVFbCgnY2ctaGVscGVyJyk7XG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaGVscGVyKTtcbiAgY29uc3QgY29udGFpbmVyID0gY3JlYXRlRWwoJ2NnLWNvbnRhaW5lcicpO1xuICBoZWxwZXIuYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcblxuICBjb25zdCBib2FyZCA9IGNyZWF0ZUVsKCdjZy1ib2FyZCcpO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQoYm9hcmQpO1xuXG4gIGxldCBzdmc6IFNWR0VsZW1lbnQgfCB1bmRlZmluZWQ7XG4gIGlmIChzLmRyYXdhYmxlLnZpc2libGUgJiYgIXJlbGF0aXZlKSB7XG4gICAgc3ZnID0gY3JlYXRlU1ZHKCdzdmcnKTtcbiAgICBzdmcuYXBwZW5kQ2hpbGQoY3JlYXRlU1ZHKCdkZWZzJykpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzdmcpO1xuICB9XG5cbiAgaWYgKHMuY29vcmRpbmF0ZXMpIHtcbiAgICBjb25zdCBvcmllbnRDbGFzcyA9IHMub3JpZW50YXRpb24gPT09ICdibGFjaycgPyAnIGJsYWNrJyA6ICcnO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMocmFua3MsICdyYW5rcycgKyBvcmllbnRDbGFzcykpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJDb29yZHMoZmlsZXMsICdmaWxlcycgKyBvcmllbnRDbGFzcykpO1xuICB9XG5cbiAgbGV0IGdob3N0OiBIVE1MRWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgaWYgKHMuZHJhZ2dhYmxlLnNob3dHaG9zdCAmJiAhcmVsYXRpdmUpIHtcbiAgICBnaG9zdCA9IGNyZWF0ZUVsKCdwaWVjZScsICdnaG9zdCcpO1xuICAgIHNldFZpc2libGUoZ2hvc3QsIGZhbHNlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2hvc3QpO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBib2FyZCxcbiAgICBjb250YWluZXIsXG4gICAgZ2hvc3QsXG4gICAgc3ZnXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbmRlckNvb3JkcyhlbGVtczogYW55W10sIGNsYXNzTmFtZTogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBlbCA9IGNyZWF0ZUVsKCdjb29yZHMnLCBjbGFzc05hbWUpO1xuICBsZXQgZjogSFRNTEVsZW1lbnQ7XG4gIGZvciAobGV0IGkgaW4gZWxlbXMpIHtcbiAgICBmID0gY3JlYXRlRWwoJ2Nvb3JkJyk7XG4gICAgZi50ZXh0Q29udGVudCA9IGVsZW1zW2ldO1xuICAgIGVsLmFwcGVuZENoaWxkKGYpO1xuICB9XG4gIHJldHVybiBlbDtcbn1cbiJdfQ==
