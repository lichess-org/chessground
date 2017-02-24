(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.ChessgroundExamples = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Copyright (c) 2016, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/

/* minified license below  */

/* @license
 * Copyright (c) 2016, Jeff Hlywa (jhlywa@gmail.com)
 * Released under the BSD license
 * https://github.com/jhlywa/chess.js/blob/master/LICENSE
 */

var Chess = function(fen) {

  /* jshint indent: false */

  var BLACK = 'b';
  var WHITE = 'w';

  var EMPTY = -1;

  var PAWN = 'p';
  var KNIGHT = 'n';
  var BISHOP = 'b';
  var ROOK = 'r';
  var QUEEN = 'q';
  var KING = 'k';

  var SYMBOLS = 'pnbrqkPNBRQK';

  var DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  var POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

  var PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15]
  };

  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14,  18, 33, 31,  14],
    b: [-17, -15,  17,  15],
    r: [-16,   1,  16,  -1],
    q: [-17, -16, -15,   1,  17, 16, 15,  -1],
    k: [-17, -16, -15,   1,  17, 16, 15,  -1]
  };

  var ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
  ];

  var RAYS = [
     17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
      0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
      0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
      0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
      0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
      1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
      0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
      0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
      0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
      0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
    -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
  ];

  var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

  var FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q'
  };

  var BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64
  };

  var RANK_1 = 7;
  var RANK_2 = 6;
  var RANK_3 = 5;
  var RANK_4 = 4;
  var RANK_5 = 3;
  var RANK_6 = 2;
  var RANK_7 = 1;
  var RANK_8 = 0;

  var SQUARES = {
    a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
    a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
    a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
    a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
    a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
    a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
    a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
  };

  var ROOKS = {
    w: [{square: SQUARES.a1, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h1, flag: BITS.KSIDE_CASTLE}],
    b: [{square: SQUARES.a8, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h8, flag: BITS.KSIDE_CASTLE}]
  };

  var board = new Array(128);
  var kings = {w: EMPTY, b: EMPTY};
  var turn = WHITE;
  var castling = {w: 0, b: 0};
  var ep_square = EMPTY;
  var half_moves = 0;
  var move_number = 1;
  var history = [];
  var header = {};

  /* if the user passes in a fen string, load it, else default to
   * starting position
   */
  if (typeof fen === 'undefined') {
    load(DEFAULT_POSITION);
  } else {
    load(fen);
  }

  function clear() {
    board = new Array(128);
    kings = {w: EMPTY, b: EMPTY};
    turn = WHITE;
    castling = {w: 0, b: 0};
    ep_square = EMPTY;
    half_moves = 0;
    move_number = 1;
    history = [];
    header = {};
    update_setup(generate_fen());
  }

  function reset() {
    load(DEFAULT_POSITION);
  }

  function load(fen) {
    var tokens = fen.split(/\s+/);
    var position = tokens[0];
    var square = 0;

    if (!validate_fen(fen).valid) {
      return false;
    }

    clear();

    for (var i = 0; i < position.length; i++) {
      var piece = position.charAt(i);

      if (piece === '/') {
        square += 8;
      } else if (is_digit(piece)) {
        square += parseInt(piece, 10);
      } else {
        var color = (piece < 'a') ? WHITE : BLACK;
        put({type: piece.toLowerCase(), color: color}, algebraic(square));
        square++;
      }
    }

    turn = tokens[1];

    if (tokens[2].indexOf('K') > -1) {
      castling.w |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('Q') > -1) {
      castling.w |= BITS.QSIDE_CASTLE;
    }
    if (tokens[2].indexOf('k') > -1) {
      castling.b |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('q') > -1) {
      castling.b |= BITS.QSIDE_CASTLE;
    }

    ep_square = (tokens[3] === '-') ? EMPTY : SQUARES[tokens[3]];
    half_moves = parseInt(tokens[4], 10);
    move_number = parseInt(tokens[5], 10);

    update_setup(generate_fen());

    return true;
  }

  /* TODO: this function is pretty much crap - it validates structure but
   * completely ignores content (e.g. doesn't verify that each side has a king)
   * ... we should rewrite this, and ditch the silly error_number field while
   * we're at it
   */
  function validate_fen(fen) {
    var errors = {
       0: 'No errors.',
       1: 'FEN string must contain six space-delimited fields.',
       2: '6th field (move number) must be a positive integer.',
       3: '5th field (half move counter) must be a non-negative integer.',
       4: '4th field (en-passant square) is invalid.',
       5: '3rd field (castling availability) is invalid.',
       6: '2nd field (side to move) is invalid.',
       7: '1st field (piece positions) does not contain 8 \'/\'-delimited rows.',
       8: '1st field (piece positions) is invalid [consecutive numbers].',
       9: '1st field (piece positions) is invalid [invalid piece].',
      10: '1st field (piece positions) is invalid [row too large].',
      11: 'Illegal en-passant square',
    };

    /* 1st criterion: 6 space-seperated fields? */
    var tokens = fen.split(/\s+/);
    if (tokens.length !== 6) {
      return {valid: false, error_number: 1, error: errors[1]};
    }

    /* 2nd criterion: move number field is a integer value > 0? */
    if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
      return {valid: false, error_number: 2, error: errors[2]};
    }

    /* 3rd criterion: half move counter is an integer >= 0? */
    if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
      return {valid: false, error_number: 3, error: errors[3]};
    }

    /* 4th criterion: 4th field is a valid e.p.-string? */
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
      return {valid: false, error_number: 4, error: errors[4]};
    }

    /* 5th criterion: 3th field is a valid castle-string? */
    if( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
      return {valid: false, error_number: 5, error: errors[5]};
    }

    /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
    if (!/^(w|b)$/.test(tokens[1])) {
      return {valid: false, error_number: 6, error: errors[6]};
    }

    /* 7th criterion: 1st field contains 8 rows? */
    var rows = tokens[0].split('/');
    if (rows.length !== 8) {
      return {valid: false, error_number: 7, error: errors[7]};
    }

    /* 8th criterion: every row is valid? */
    for (var i = 0; i < rows.length; i++) {
      /* check for right sum of fields AND not two numbers in succession */
      var sum_fields = 0;
      var previous_was_number = false;

      for (var k = 0; k < rows[i].length; k++) {
        if (!isNaN(rows[i][k])) {
          if (previous_was_number) {
            return {valid: false, error_number: 8, error: errors[8]};
          }
          sum_fields += parseInt(rows[i][k], 10);
          previous_was_number = true;
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            return {valid: false, error_number: 9, error: errors[9]};
          }
          sum_fields += 1;
          previous_was_number = false;
        }
      }
      if (sum_fields !== 8) {
        return {valid: false, error_number: 10, error: errors[10]};
      }
    }

    if ((tokens[3][1] == '3' && tokens[1] == 'w') ||
        (tokens[3][1] == '6' && tokens[1] == 'b')) {
          return {valid: false, error_number: 11, error: errors[11]};
    }

    /* everything's okay! */
    return {valid: true, error_number: 0, error: errors[0]};
  }

  function generate_fen() {
    var empty = 0;
    var fen = '';

    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (board[i] == null) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        var color = board[i].color;
        var piece = board[i].type;

        fen += (color === WHITE) ?
                 piece.toUpperCase() : piece.toLowerCase();
      }

      if ((i + 1) & 0x88) {
        if (empty > 0) {
          fen += empty;
        }

        if (i !== SQUARES.h1) {
          fen += '/';
        }

        empty = 0;
        i += 8;
      }
    }

    var cflags = '';
    if (castling[WHITE] & BITS.KSIDE_CASTLE) { cflags += 'K'; }
    if (castling[WHITE] & BITS.QSIDE_CASTLE) { cflags += 'Q'; }
    if (castling[BLACK] & BITS.KSIDE_CASTLE) { cflags += 'k'; }
    if (castling[BLACK] & BITS.QSIDE_CASTLE) { cflags += 'q'; }

    /* do we have an empty castling flag? */
    cflags = cflags || '-';
    var epflags = (ep_square === EMPTY) ? '-' : algebraic(ep_square);

    return [fen, turn, cflags, epflags, half_moves, move_number].join(' ');
  }

  function set_header(args) {
    for (var i = 0; i < args.length; i += 2) {
      if (typeof args[i] === 'string' &&
          typeof args[i + 1] === 'string') {
        header[args[i]] = args[i + 1];
      }
    }
    return header;
  }

  /* called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object.  if the FEN is
   * equal to the default position, the SetUp and FEN are deleted
   * the setup is only updated if history.length is zero, ie moves haven't been
   * made.
   */
  function update_setup(fen) {
    if (history.length > 0) return;

    if (fen !== DEFAULT_POSITION) {
      header['SetUp'] = '1';
      header['FEN'] = fen;
    } else {
      delete header['SetUp'];
      delete header['FEN'];
    }
  }

  function get(square) {
    var piece = board[SQUARES[square]];
    return (piece) ? {type: piece.type, color: piece.color} : null;
  }

  function put(piece, square) {
    /* check for valid piece object */
    if (!('type' in piece && 'color' in piece)) {
      return false;
    }

    /* check for piece */
    if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
      return false;
    }

    /* check for valid square */
    if (!(square in SQUARES)) {
      return false;
    }

    var sq = SQUARES[square];

    /* don't let the user place more than one king */
    if (piece.type == KING &&
        !(kings[piece.color] == EMPTY || kings[piece.color] == sq)) {
      return false;
    }

    board[sq] = {type: piece.type, color: piece.color};
    if (piece.type === KING) {
      kings[piece.color] = sq;
    }

    update_setup(generate_fen());

    return true;
  }

  function remove(square) {
    var piece = get(square);
    board[SQUARES[square]] = null;
    if (piece && piece.type === KING) {
      kings[piece.color] = EMPTY;
    }

    update_setup(generate_fen());

    return piece;
  }

  function build_move(board, from, to, flags, promotion) {
    var move = {
      color: turn,
      from: from,
      to: to,
      flags: flags,
      piece: board[from].type
    };

    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move.promotion = promotion;
    }

    if (board[to]) {
      move.captured = board[to].type;
    } else if (flags & BITS.EP_CAPTURE) {
        move.captured = PAWN;
    }
    return move;
  }

  function generate_moves(options) {
    function add_move(board, moves, from, to, flags) {
      /* if pawn promotion */
      if (board[from].type === PAWN &&
         (rank(to) === RANK_8 || rank(to) === RANK_1)) {
          var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
          for (var i = 0, len = pieces.length; i < len; i++) {
            moves.push(build_move(board, from, to, flags, pieces[i]));
          }
      } else {
       moves.push(build_move(board, from, to, flags));
      }
    }

    var moves = [];
    var us = turn;
    var them = swap_color(us);
    var second_rank = {b: RANK_7, w: RANK_2};

    var first_sq = SQUARES.a8;
    var last_sq = SQUARES.h1;
    var single_square = false;

    /* do we want legal moves? */
    var legal = (typeof options !== 'undefined' && 'legal' in options) ?
                options.legal : true;

    /* are we generating moves for a single square? */
    if (typeof options !== 'undefined' && 'square' in options) {
      if (options.square in SQUARES) {
        first_sq = last_sq = SQUARES[options.square];
        single_square = true;
      } else {
        /* invalid square */
        return [];
      }
    }

    for (var i = first_sq; i <= last_sq; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) { i += 7; continue; }

      var piece = board[i];
      if (piece == null || piece.color !== us) {
        continue;
      }

      if (piece.type === PAWN) {
        /* single square, non-capturing */
        var square = i + PAWN_OFFSETS[us][0];
        if (board[square] == null) {
            add_move(board, moves, i, square, BITS.NORMAL);

          /* double square */
          var square = i + PAWN_OFFSETS[us][1];
          if (second_rank[us] === rank(i) && board[square] == null) {
            add_move(board, moves, i, square, BITS.BIG_PAWN);
          }
        }

        /* pawn captures */
        for (j = 2; j < 4; j++) {
          var square = i + PAWN_OFFSETS[us][j];
          if (square & 0x88) continue;

          if (board[square] != null &&
              board[square].color === them) {
              add_move(board, moves, i, square, BITS.CAPTURE);
          } else if (square === ep_square) {
              add_move(board, moves, i, ep_square, BITS.EP_CAPTURE);
          }
        }
      } else {
        for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
          var offset = PIECE_OFFSETS[piece.type][j];
          var square = i;

          while (true) {
            square += offset;
            if (square & 0x88) break;

            if (board[square] == null) {
              add_move(board, moves, i, square, BITS.NORMAL);
            } else {
              if (board[square].color === us) break;
              add_move(board, moves, i, square, BITS.CAPTURE);
              break;
            }

            /* break, if knight or king */
            if (piece.type === 'n' || piece.type === 'k') break;
          }
        }
      }
    }

    /* check for castling if: a) we're generating all moves, or b) we're doing
     * single square move generation on the king's square
     */
    if ((!single_square) || last_sq === kings[us]) {
      /* king-side castling */
      if (castling[us] & BITS.KSIDE_CASTLE) {
        var castling_from = kings[us];
        var castling_to = castling_from + 2;

        if (board[castling_from + 1] == null &&
            board[castling_to]       == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from + 1) &&
            !attacked(them, castling_to)) {
          add_move(board, moves, kings[us] , castling_to,
                   BITS.KSIDE_CASTLE);
        }
      }

      /* queen-side castling */
      if (castling[us] & BITS.QSIDE_CASTLE) {
        var castling_from = kings[us];
        var castling_to = castling_from - 2;

        if (board[castling_from - 1] == null &&
            board[castling_from - 2] == null &&
            board[castling_from - 3] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from - 1) &&
            !attacked(them, castling_to)) {
          add_move(board, moves, kings[us], castling_to,
                   BITS.QSIDE_CASTLE);
        }
      }
    }

    /* return all pseudo-legal moves (this includes moves that allow the king
     * to be captured)
     */
    if (!legal) {
      return moves;
    }

    /* filter out illegal moves */
    var legal_moves = [];
    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(us)) {
        legal_moves.push(moves[i]);
      }
      undo_move();
    }

    return legal_moves;
  }

  /* convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   *
   * @param {boolean} sloppy Use the sloppy SAN generator to work around over
   * disambiguation bugs in Fritz and Chessbase.  See below:
   *
   * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
   * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
   * 4. ... Ne7 is technically the valid SAN
   */
  function move_to_san(move, sloppy) {

    var output = '';

    if (move.flags & BITS.KSIDE_CASTLE) {
      output = 'O-O';
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      output = 'O-O-O';
    } else {
      var disambiguator = get_disambiguator(move, sloppy);

      if (move.piece !== PAWN) {
        output += move.piece.toUpperCase() + disambiguator;
      }

      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (move.piece === PAWN) {
          output += algebraic(move.from)[0];
        }
        output += 'x';
      }

      output += algebraic(move.to);

      if (move.flags & BITS.PROMOTION) {
        output += '=' + move.promotion.toUpperCase();
      }
    }

    make_move(move);
    if (in_check()) {
      if (in_checkmate()) {
        output += '#';
      } else {
        output += '+';
      }
    }
    undo_move();

    return output;
  }

  // parses all of the decorators out of a SAN string
  function stripped_san(move) {
    return move.replace(/=/,'').replace(/[+#]?[?!]*$/,'');
  }

  function attacked(color, square) {
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) { i += 7; continue; }

      /* if empty square or wrong color */
      if (board[i] == null || board[i].color !== color) continue;

      var piece = board[i];
      var difference = i - square;
      var index = difference + 119;

      if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
        if (piece.type === PAWN) {
          if (difference > 0) {
            if (piece.color === WHITE) return true;
          } else {
            if (piece.color === BLACK) return true;
          }
          continue;
        }

        /* if the piece is a knight or a king */
        if (piece.type === 'n' || piece.type === 'k') return true;

        var offset = RAYS[index];
        var j = i + offset;

        var blocked = false;
        while (j !== square) {
          if (board[j] != null) { blocked = true; break; }
          j += offset;
        }

        if (!blocked) return true;
      }
    }

    return false;
  }

  function king_attacked(color) {
    return attacked(swap_color(color), kings[color]);
  }

  function in_check() {
    return king_attacked(turn);
  }

  function in_checkmate() {
    return in_check() && generate_moves().length === 0;
  }

  function in_stalemate() {
    return !in_check() && generate_moves().length === 0;
  }

  function insufficient_material() {
    var pieces = {};
    var bishops = [];
    var num_pieces = 0;
    var sq_color = 0;

    for (var i = SQUARES.a8; i<= SQUARES.h1; i++) {
      sq_color = (sq_color + 1) % 2;
      if (i & 0x88) { i += 7; continue; }

      var piece = board[i];
      if (piece) {
        pieces[piece.type] = (piece.type in pieces) ?
                              pieces[piece.type] + 1 : 1;
        if (piece.type === BISHOP) {
          bishops.push(sq_color);
        }
        num_pieces++;
      }
    }

    /* k vs. k */
    if (num_pieces === 2) { return true; }

    /* k vs. kn .... or .... k vs. kb */
    else if (num_pieces === 3 && (pieces[BISHOP] === 1 ||
                                 pieces[KNIGHT] === 1)) { return true; }

    /* kb vs. kb where any number of bishops are all on the same color */
    else if (num_pieces === pieces[BISHOP] + 2) {
      var sum = 0;
      var len = bishops.length;
      for (var i = 0; i < len; i++) {
        sum += bishops[i];
      }
      if (sum === 0 || sum === len) { return true; }
    }

    return false;
  }

  function in_threefold_repetition() {
    /* TODO: while this function is fine for casual use, a better
     * implementation would use a Zobrist key (instead of FEN). the
     * Zobrist key would be maintained in the make_move/undo_move functions,
     * avoiding the costly that we do below.
     */
    var moves = [];
    var positions = {};
    var repetition = false;

    while (true) {
      var move = undo_move();
      if (!move) break;
      moves.push(move);
    }

    while (true) {
      /* remove the last two fields in the FEN string, they're not needed
       * when checking for draw by rep */
      var fen = generate_fen().split(' ').slice(0,4).join(' ');

      /* has the position occurred three or move times */
      positions[fen] = (fen in positions) ? positions[fen] + 1 : 1;
      if (positions[fen] >= 3) {
        repetition = true;
      }

      if (!moves.length) {
        break;
      }
      make_move(moves.pop());
    }

    return repetition;
  }

  function push(move) {
    history.push({
      move: move,
      kings: {b: kings.b, w: kings.w},
      turn: turn,
      castling: {b: castling.b, w: castling.w},
      ep_square: ep_square,
      half_moves: half_moves,
      move_number: move_number
    });
  }

  function make_move(move) {
    var us = turn;
    var them = swap_color(us);
    push(move);

    board[move.to] = board[move.from];
    board[move.from] = null;

    /* if ep capture, remove the captured pawn */
    if (move.flags & BITS.EP_CAPTURE) {
      if (turn === BLACK) {
        board[move.to - 16] = null;
      } else {
        board[move.to + 16] = null;
      }
    }

    /* if pawn promotion, replace with new piece */
    if (move.flags & BITS.PROMOTION) {
      board[move.to] = {type: move.promotion, color: us};
    }

    /* if we moved the king */
    if (board[move.to].type === KING) {
      kings[board[move.to].color] = move.to;

      /* if we castled, move the rook next to the king */
      if (move.flags & BITS.KSIDE_CASTLE) {
        var castling_to = move.to - 1;
        var castling_from = move.to + 1;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        var castling_to = move.to + 1;
        var castling_from = move.to - 2;
        board[castling_to] = board[castling_from];
        board[castling_from] = null;
      }

      /* turn off castling */
      castling[us] = '';
    }

    /* turn off castling if we move a rook */
    if (castling[us]) {
      for (var i = 0, len = ROOKS[us].length; i < len; i++) {
        if (move.from === ROOKS[us][i].square &&
            castling[us] & ROOKS[us][i].flag) {
          castling[us] ^= ROOKS[us][i].flag;
          break;
        }
      }
    }

    /* turn off castling if we capture a rook */
    if (castling[them]) {
      for (var i = 0, len = ROOKS[them].length; i < len; i++) {
        if (move.to === ROOKS[them][i].square &&
            castling[them] & ROOKS[them][i].flag) {
          castling[them] ^= ROOKS[them][i].flag;
          break;
        }
      }
    }

    /* if big pawn move, update the en passant square */
    if (move.flags & BITS.BIG_PAWN) {
      if (turn === 'b') {
        ep_square = move.to - 16;
      } else {
        ep_square = move.to + 16;
      }
    } else {
      ep_square = EMPTY;
    }

    /* reset the 50 move counter if a pawn is moved or a piece is captured */
    if (move.piece === PAWN) {
      half_moves = 0;
    } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      half_moves = 0;
    } else {
      half_moves++;
    }

    if (turn === BLACK) {
      move_number++;
    }
    turn = swap_color(turn);
  }

  function undo_move() {
    var old = history.pop();
    if (old == null) { return null; }

    var move = old.move;
    kings = old.kings;
    turn = old.turn;
    castling = old.castling;
    ep_square = old.ep_square;
    half_moves = old.half_moves;
    move_number = old.move_number;

    var us = turn;
    var them = swap_color(turn);

    board[move.from] = board[move.to];
    board[move.from].type = move.piece;  // to undo any promotions
    board[move.to] = null;

    if (move.flags & BITS.CAPTURE) {
      board[move.to] = {type: move.captured, color: them};
    } else if (move.flags & BITS.EP_CAPTURE) {
      var index;
      if (us === BLACK) {
        index = move.to - 16;
      } else {
        index = move.to + 16;
      }
      board[index] = {type: PAWN, color: them};
    }


    if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
      var castling_to, castling_from;
      if (move.flags & BITS.KSIDE_CASTLE) {
        castling_to = move.to + 1;
        castling_from = move.to - 1;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        castling_to = move.to - 2;
        castling_from = move.to + 1;
      }

      board[castling_to] = board[castling_from];
      board[castling_from] = null;
    }

    return move;
  }

  /* this function is used to uniquely identify ambiguous moves */
  function get_disambiguator(move, sloppy) {
    var moves = generate_moves({legal: !sloppy});

    var from = move.from;
    var to = move.to;
    var piece = move.piece;

    var ambiguities = 0;
    var same_rank = 0;
    var same_file = 0;

    for (var i = 0, len = moves.length; i < len; i++) {
      var ambig_from = moves[i].from;
      var ambig_to = moves[i].to;
      var ambig_piece = moves[i].piece;

      /* if a move of the same piece type ends on the same to square, we'll
       * need to add a disambiguator to the algebraic notation
       */
      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++;

        if (rank(from) === rank(ambig_from)) {
          same_rank++;
        }

        if (file(from) === file(ambig_from)) {
          same_file++;
        }
      }
    }

    if (ambiguities > 0) {
      /* if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      if (same_rank > 0 && same_file > 0) {
        return algebraic(from);
      }
      /* if the moving piece rests on the same file, use the rank symbol as the
       * disambiguator
       */
      else if (same_file > 0) {
        return algebraic(from).charAt(1);
      }
      /* else use the file symbol */
      else {
        return algebraic(from).charAt(0);
      }
    }

    return '';
  }

  function ascii() {
    var s = '   +------------------------+\n';
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* display the rank */
      if (file(i) === 0) {
        s += ' ' + '87654321'[rank(i)] + ' |';
      }

      /* empty piece */
      if (board[i] == null) {
        s += ' . ';
      } else {
        var piece = board[i].type;
        var color = board[i].color;
        var symbol = (color === WHITE) ?
                     piece.toUpperCase() : piece.toLowerCase();
        s += ' ' + symbol + ' ';
      }

      if ((i + 1) & 0x88) {
        s += '|\n';
        i += 8;
      }
    }
    s += '   +------------------------+\n';
    s += '     a  b  c  d  e  f  g  h\n';

    return s;
  }

  // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
  function move_from_san(move, sloppy) {
    // strip off any move decorations: e.g Nf3+?!
    var clean_move = stripped_san(move);

    // if we're using the sloppy parser run a regex to grab piece, to, and from
    // this should parse invalid SAN like: Pe2-e4, Rc1c4, Qf3xf7
    if (sloppy) {
      var matches = clean_move.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/);
      if (matches) {
        var piece = matches[1];
        var from = matches[2];
        var to = matches[3];
        var promotion = matches[4];
      }
    }

    var moves = generate_moves();
    for (var i = 0, len = moves.length; i < len; i++) {
      // try the strict parser first, then the sloppy parser if requested
      // by the user
      if ((clean_move === stripped_san(move_to_san(moves[i]))) ||
          (sloppy && clean_move === stripped_san(move_to_san(moves[i], true)))) {
        return moves[i];
      } else {
        if (matches &&
            (!piece || piece.toLowerCase() == moves[i].piece) &&
            SQUARES[from] == moves[i].from &&
            SQUARES[to] == moves[i].to &&
            (!promotion || promotion.toLowerCase() == moves[i].promotion)) {
          return moves[i];
        }
      }
    }

    return null;
  }


  /*****************************************************************************
   * UTILITY FUNCTIONS
   ****************************************************************************/
  function rank(i) {
    return i >> 4;
  }

  function file(i) {
    return i & 15;
  }

  function algebraic(i){
    var f = file(i), r = rank(i);
    return 'abcdefgh'.substring(f,f+1) + '87654321'.substring(r,r+1);
  }

  function swap_color(c) {
    return c === WHITE ? BLACK : WHITE;
  }

  function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1;
  }

  /* pretty = external move object */
  function make_pretty(ugly_move) {
    var move = clone(ugly_move);
    move.san = move_to_san(move, false);
    move.to = algebraic(move.to);
    move.from = algebraic(move.from);

    var flags = '';

    for (var flag in BITS) {
      if (BITS[flag] & move.flags) {
        flags += FLAGS[flag];
      }
    }
    move.flags = flags;

    return move;
  }

  function clone(obj) {
    var dupe = (obj instanceof Array) ? [] : {};

    for (var property in obj) {
      if (typeof property === 'object') {
        dupe[property] = clone(obj[property]);
      } else {
        dupe[property] = obj[property];
      }
    }

    return dupe;
  }

  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  /*****************************************************************************
   * DEBUGGING UTILITIES
   ****************************************************************************/
  function perft(depth) {
    var moves = generate_moves({legal: false});
    var nodes = 0;
    var color = turn;

    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(color)) {
        if (depth - 1 > 0) {
          var child_nodes = perft(depth - 1);
          nodes += child_nodes;
        } else {
          nodes++;
        }
      }
      undo_move();
    }

    return nodes;
  }

  return {
    /***************************************************************************
     * PUBLIC CONSTANTS (is there a better way to do this?)
     **************************************************************************/
    WHITE: WHITE,
    BLACK: BLACK,
    PAWN: PAWN,
    KNIGHT: KNIGHT,
    BISHOP: BISHOP,
    ROOK: ROOK,
    QUEEN: QUEEN,
    KING: KING,
    SQUARES: (function() {
                /* from the ECMA-262 spec (section 12.6.4):
                 * "The mechanics of enumerating the properties ... is
                 * implementation dependent"
                 * so: for (var sq in SQUARES) { keys.push(sq); } might not be
                 * ordered correctly
                 */
                var keys = [];
                for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
                  if (i & 0x88) { i += 7; continue; }
                  keys.push(algebraic(i));
                }
                return keys;
              })(),
    FLAGS: FLAGS,

    /***************************************************************************
     * PUBLIC API
     **************************************************************************/
    load: function(fen) {
      return load(fen);
    },

    reset: function() {
      return reset();
    },

    moves: function(options) {
      /* The internal representation of a chess move is in 0x88 format, and
       * not meant to be human-readable.  The code below converts the 0x88
       * square coordinates to algebraic coordinates.  It also prunes an
       * unnecessary move keys resulting from a verbose call.
       */

      var ugly_moves = generate_moves(options);
      var moves = [];

      for (var i = 0, len = ugly_moves.length; i < len; i++) {

        /* does the user want a full move object (most likely not), or just
         * SAN
         */
        if (typeof options !== 'undefined' && 'verbose' in options &&
            options.verbose) {
          moves.push(make_pretty(ugly_moves[i]));
        } else {
          moves.push(move_to_san(ugly_moves[i], false));
        }
      }

      return moves;
    },

    in_check: function() {
      return in_check();
    },

    in_checkmate: function() {
      return in_checkmate();
    },

    in_stalemate: function() {
      return in_stalemate();
    },

    in_draw: function() {
      return half_moves >= 100 ||
             in_stalemate() ||
             insufficient_material() ||
             in_threefold_repetition();
    },

    insufficient_material: function() {
      return insufficient_material();
    },

    in_threefold_repetition: function() {
      return in_threefold_repetition();
    },

    game_over: function() {
      return half_moves >= 100 ||
             in_checkmate() ||
             in_stalemate() ||
             insufficient_material() ||
             in_threefold_repetition();
    },

    validate_fen: function(fen) {
      return validate_fen(fen);
    },

    fen: function() {
      return generate_fen();
    },

    pgn: function(options) {
      /* using the specification from http://www.chessclub.com/help/PGN-spec
       * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
       */
      var newline = (typeof options === 'object' &&
                     typeof options.newline_char === 'string') ?
                     options.newline_char : '\n';
      var max_width = (typeof options === 'object' &&
                       typeof options.max_width === 'number') ?
                       options.max_width : 0;
      var result = [];
      var header_exists = false;

      /* add the PGN header headerrmation */
      for (var i in header) {
        /* TODO: order of enumerated properties in header object is not
         * guaranteed, see ECMA-262 spec (section 12.6.4)
         */
        result.push('[' + i + ' \"' + header[i] + '\"]' + newline);
        header_exists = true;
      }

      if (header_exists && history.length) {
        result.push(newline);
      }

      /* pop all of history onto reversed_history */
      var reversed_history = [];
      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      var moves = [];
      var move_string = '';

      /* build the list of moves.  a move_string looks like: "3. e3 e6" */
      while (reversed_history.length > 0) {
        var move = reversed_history.pop();

        /* if the position started with black to move, start PGN with 1. ... */
        if (!history.length && move.color === 'b') {
          move_string = move_number + '. ...';
        } else if (move.color === 'w') {
          /* store the previous generated move_string if we have one */
          if (move_string.length) {
            moves.push(move_string);
          }
          move_string = move_number + '.';
        }

        move_string = move_string + ' ' + move_to_san(move, false);
        make_move(move);
      }

      /* are there any other leftover moves? */
      if (move_string.length) {
        moves.push(move_string);
      }

      /* is there a result? */
      if (typeof header.Result !== 'undefined') {
        moves.push(header.Result);
      }

      /* history should be back to what is was before we started generating PGN,
       * so join together moves
       */
      if (max_width === 0) {
        return result.join('') + moves.join(' ');
      }

      /* wrap the PGN output at max_width */
      var current_width = 0;
      for (var i = 0; i < moves.length; i++) {
        /* if the current move will push past max_width */
        if (current_width + moves[i].length > max_width && i !== 0) {

          /* don't end the line with whitespace */
          if (result[result.length - 1] === ' ') {
            result.pop();
          }

          result.push(newline);
          current_width = 0;
        } else if (i !== 0) {
          result.push(' ');
          current_width++;
        }
        result.push(moves[i]);
        current_width += moves[i].length;
      }

      return result.join('');
    },

    load_pgn: function(pgn, options) {
      // allow the user to specify the sloppy move parser to work around over
      // disambiguation bugs in Fritz and Chessbase
      var sloppy = (typeof options !== 'undefined' && 'sloppy' in options) ?
                    options.sloppy : false;

      function mask(str) {
        return str.replace(/\\/g, '\\');
      }

      function has_keys(object) {
        for (var key in object) {
          return true;
        }
        return false;
      }

      function parse_pgn_header(header, options) {
        var newline_char = (typeof options === 'object' &&
                            typeof options.newline_char === 'string') ?
                            options.newline_char : '\r?\n';
        var header_obj = {};
        var headers = header.split(new RegExp(mask(newline_char)));
        var key = '';
        var value = '';

        for (var i = 0; i < headers.length; i++) {
          key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
          value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\]$/, '$1');
          if (trim(key).length > 0) {
            header_obj[key] = value;
          }
        }

        return header_obj;
      }

      var newline_char = (typeof options === 'object' &&
                          typeof options.newline_char === 'string') ?
                          options.newline_char : '\r?\n';
      var regex = new RegExp('^(\\[(.|' + mask(newline_char) + ')*\\])' +
                             '(' + mask(newline_char) + ')*' +
                             '1.(' + mask(newline_char) + '|.)*$', 'g');

      /* get header part of the PGN file */
      var header_string = pgn.replace(regex, '$1');

      /* no info part given, begins with moves */
      if (header_string[0] !== '[') {
        header_string = '';
      }

      reset();

      /* parse PGN header */
      var headers = parse_pgn_header(header_string, options);
      for (var key in headers) {
        set_header([key, headers[key]]);
      }

      /* load the starting position indicated by [Setup '1'] and
      * [FEN position] */
      if (headers['SetUp'] === '1') {
          if (!(('FEN' in headers) && load(headers['FEN']))) {
            return false;
          }
      }

      /* delete header to get the moves */
      var ms = pgn.replace(header_string, '').replace(new RegExp(mask(newline_char), 'g'), ' ');

      /* delete comments */
      ms = ms.replace(/(\{[^}]+\})+?/g, '');

      /* delete recursive annotation variations */
      var rav_regex = /(\([^\(\)]+\))+?/g
      while (rav_regex.test(ms)) {
        ms = ms.replace(rav_regex, '');
      }

      /* delete move numbers */
      ms = ms.replace(/\d+\.(\.\.)?/g, '');

      /* delete ... indicating black to move */
      ms = ms.replace(/\.\.\./g, '');

      /* delete numeric annotation glyphs */
      ms = ms.replace(/\$\d+/g, '');

      /* trim and get array of moves */
      var moves = trim(ms).split(new RegExp(/\s+/));

      /* delete empty entries */
      moves = moves.join(',').replace(/,,+/g, ',').split(',');
      var move = '';

      for (var half_move = 0; half_move < moves.length - 1; half_move++) {
        move = move_from_san(moves[half_move], sloppy);

        /* move not possible! (don't clear the board to examine to show the
         * latest valid position)
         */
        if (move == null) {
          return false;
        } else {
          make_move(move);
        }
      }

      /* examine last move */
      move = moves[moves.length - 1];
      if (POSSIBLE_RESULTS.indexOf(move) > -1) {
        if (has_keys(header) && typeof header.Result === 'undefined') {
          set_header(['Result', move]);
        }
      }
      else {
        move = move_from_san(move, sloppy);
        if (move == null) {
          return false;
        } else {
          make_move(move);
        }
      }
      return true;
    },

    header: function() {
      return set_header(arguments);
    },

    ascii: function() {
      return ascii();
    },

    turn: function() {
      return turn;
    },

    move: function(move, options) {
      /* The move function can be called with in the following parameters:
       *
       * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
       *
       * .move({ from: 'h7', <- where the 'move' is a move object (additional
       *         to :'h8',      fields are ignored)
       *         promotion: 'q',
       *      })
       */

      // allow the user to specify the sloppy move parser to work around over
      // disambiguation bugs in Fritz and Chessbase
      var sloppy = (typeof options !== 'undefined' && 'sloppy' in options) ?
                    options.sloppy : false;

      var move_obj = null;

      if (typeof move === 'string') {
        move_obj = move_from_san(move, sloppy);
      } else if (typeof move === 'object') {
        var moves = generate_moves();

        /* convert the pretty move object to an ugly move object */
        for (var i = 0, len = moves.length; i < len; i++) {
          if (move.from === algebraic(moves[i].from) &&
              move.to === algebraic(moves[i].to) &&
              (!('promotion' in moves[i]) ||
              move.promotion === moves[i].promotion)) {
            move_obj = moves[i];
            break;
          }
        }
      }

      /* failed to find move */
      if (!move_obj) {
        return null;
      }

      /* need to make a copy of move because we can't generate SAN after the
       * move is made
       */
      var pretty_move = make_pretty(move_obj);

      make_move(move_obj);

      return pretty_move;
    },

    undo: function() {
      var move = undo_move();
      return (move) ? make_pretty(move) : null;
    },

    clear: function() {
      return clear();
    },

    put: function(piece, square) {
      return put(piece, square);
    },

    get: function(square) {
      return get(square);
    },

    remove: function(square) {
      return remove(square);
    },

    perft: function(depth) {
      return perft(depth);
    },

    square_color: function(square) {
      if (square in SQUARES) {
        var sq_0x88 = SQUARES[square];
        return ((rank(sq_0x88) + file(sq_0x88)) % 2 === 0) ? 'light' : 'dark';
      }

      return null;
    },

    history: function(options) {
      var reversed_history = [];
      var move_history = [];
      var verbose = (typeof options !== 'undefined' && 'verbose' in options &&
                     options.verbose);

      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      while (reversed_history.length > 0) {
        var move = reversed_history.pop();
        if (verbose) {
          move_history.push(make_pretty(move));
        } else {
          move_history.push(move_to_san(move));
        }
        make_move(move);
      }

      return move_history;
    }

  };
};

/* export Chess object if using node or any other CommonJS compatible
 * environment */
if (typeof exports !== 'undefined') exports.Chess = Chess;
/* export Chess object for any RequireJS compatible environment */
if (typeof define !== 'undefined') define( function () { return Chess;  });

},{}],2:[function(require,module,exports){
(function (process){
  /* globals require, module */

  'use strict';

  /**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Detect click event
   */
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {string|!Function|!Object} path
   * @param {Function=} fn
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(/** @type {string} */ (path));
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {string}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {string} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options) {
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) return;
    page.current = '';
    page.len = 0;
    running = false;
    document.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} dispatch
   * @param {boolean=} push
   * @return {!Context}
   * @api public
   */

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) page.dispatch(ctx);
    if (false !== ctx.handled && false !== push) ctx.pushState();
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object=} state
   * @api public
   */

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
      });
    }
  };


  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {string} from - if param 'to' is undefined redirects to 'from'
   * @param {string=} to
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(/** @type {!string} */ (to));
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} init
   * @param {boolean=} dispatch
   * @return {!Context}
   * @api public
   */


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Context} ctx
   * @api private
   */
  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */
  function unhandled(ctx) {
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {string} val - URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @constructor
   * @param {string} path
   * @param {Object=} state
   * @api public
   */

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @constructor
   * @param {string} path
   * @param {Object=} options
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {string} path
   * @param {Object} params
   * @return {boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    var loaded = false;
    if ('undefined' === typeof window) {
      return;
    }
    if (document.readyState === 'complete') {
      loaded = true;
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          loaded = true;
        }, 0);
      });
    }
    return function onpopstate(e) {
      if (!loaded) return;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    // use shadow dom when available
    var el = e.path ? e.path[0] : e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

}).call(this,require('_process'))

},{"_process":5,"path-to-regexp":3}],3:[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var suffix = res[6]
    var asterisk = res[7]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
    }
  }

  return function (obj) {
    var path = ''
    var data = obj || {}

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = encodeURIComponent(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.pattern

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || []

  if (!isarray(keys)) {
    options = keys
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

},{"isarray":4}],4:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],5:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],6:[function(require,module,exports){
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

},{"./is":8,"./vnode":14}],7:[function(require,module,exports){
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
    parentNode.insertBefore(newNode, referenceNode);
}
function removeChild(node, child) {
    node.removeChild(child);
}
function appendChild(node, child) {
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

},{}],8:[function(require,module,exports){
"use strict";
exports.array = Array.isArray;
function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
}
exports.primitive = primitive;

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
"use strict";
function invokeHandler(handler, vnode, event) {
    if (typeof handler === "function") {
        // call function handler
        handler.call(vnode, event, vnode);
    }
    else if (typeof handler === "object") {
        // call handler with arguments
        if (typeof handler[0] === "function") {
            // special case for single argument for performance
            if (handler.length === 2) {
                handler[0].call(vnode, handler[1], event, vnode);
            }
            else {
                var args = handler.slice(1);
                args.push(event);
                args.push(vnode);
                handler[0].apply(vnode, args);
            }
        }
        else {
            // call multiple handlers
            for (var i = 0; i < handler.length; i++) {
                invokeHandler(handler[i]);
            }
        }
    }
}
function handleEvent(event, vnode) {
    var name = event.type, on = vnode.data.on;
    // call event handler(s) if exists
    if (on && on[name]) {
        invokeHandler(on[name], vnode, event);
    }
}
function createListener() {
    return function handler(event) {
        handleEvent(event, handler.vnode);
    };
}
function updateEventListeners(oldVnode, vnode) {
    var oldOn = oldVnode.data.on, oldListener = oldVnode.listener, oldElm = oldVnode.elm, on = vnode && vnode.data.on, elm = (vnode && vnode.elm), name;
    // optimization for reused immutable handlers
    if (oldOn === on) {
        return;
    }
    // remove existing listeners which no longer used
    if (oldOn && oldListener) {
        // if element changed or deleted we remove all existing listeners unconditionally
        if (!on) {
            for (name in oldOn) {
                // remove listener if element was changed or existing listeners removed
                oldElm.removeEventListener(name, oldListener, false);
            }
        }
        else {
            for (name in oldOn) {
                // remove listener if existing listener removed
                if (!on[name]) {
                    oldElm.removeEventListener(name, oldListener, false);
                }
            }
        }
    }
    // add new listeners which has not already attached
    if (on) {
        // reuse existing listener or create new
        var listener = vnode.listener = oldVnode.listener || createListener();
        // update vnode for listener
        listener.vnode = vnode;
        // if element changed or added we add all needed listeners unconditionally
        if (!oldOn) {
            for (name in on) {
                // add listener if element was changed or new listeners added
                elm.addEventListener(name, listener, false);
            }
        }
        else {
            for (name in on) {
                // add listener if new listener added
                if (!oldOn[name]) {
                    elm.addEventListener(name, listener, false);
                }
            }
        }
    }
}
exports.eventListenersModule = {
    create: updateEventListeners,
    update: updateEventListeners,
    destroy: updateEventListeners
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.eventListenersModule;

},{}],12:[function(require,module,exports){
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

},{"./h":6,"./htmldomapi":7,"./is":8,"./thunk":13,"./vnode":14}],13:[function(require,module,exports){
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

},{"./h":6}],14:[function(require,module,exports){
"use strict";
function vnode(sel, data, children, text, elm) {
    var key = data === undefined ? undefined : data.key;
    return { sel: sel, data: data, children: children,
        text: text, elm: elm, key: key };
}
exports.vnode = vnode;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = vnode;

},{}],15:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.defaults = {
    name: 'Default configuration',
    run: function (el) {
        window.Chessground(el);
    }
};
exports.fromFen = {
    name: 'From FEN, from black POV',
    run: function (el) {
        window.Chessground(el, {
            fen: '2r3k1/pp2Qpbp/4b1p1/3p4/3n1PP1/2N4P/Pq6/R2K1B1R w -',
            orientation: 'black'
        });
    }
};
exports.orientationToggle = {
    name: 'Orientation toggle',
    run: function (el) {
        var cg = window.Chessground(el, {
            fen: '2r3k1/pp2Qpbp/4b1p1/3p4/3n1PP1/2N4P/Pq6/R2K1B1R w -',
            orientation: 'black'
        });
        var button = document.createElement('button');
        button.innerHTML = 'Toggle orientation';
        button.addEventListener('click', cg.toggleOrientation);
        el.parentNode.appendChild(button);
    }
};

},{}],16:[function(require,module,exports){
/// <reference path="./index.d.ts" />
"use strict";
exports.__esModule = true;
var snabbdom_1 = require("snabbdom");
var class_1 = require("snabbdom/modules/class");
var attributes_1 = require("snabbdom/modules/attributes");
var eventlisteners_1 = require("snabbdom/modules/eventlisteners");
var page = require("page");
var basics = require("./basics");
var play = require("./play");
var patch = snabbdom_1.init([class_1["default"], attributes_1["default"], eventlisteners_1["default"]]);
function run(element) {
    var examples = [
        basics.defaults, basics.fromFen, basics.orientationToggle,
        play.initial
    ];
    var example, vnode;
    function redraw() {
        vnode = patch(vnode || element, render());
    }
    function runExample(vnode) {
        var el = vnode.elm;
        el.innerHTML = '';
        example.run(el);
    }
    function render() {
        return snabbdom_1.h('div#chessground-examples', [
            snabbdom_1.h('menu', examples.map(function (ex, id) {
                return snabbdom_1.h('a', {
                    "class": {
                        active: example.name === ex.name
                    },
                    on: { click: function () { return page("/" + id); } }
                }, ex.name);
            })),
            snabbdom_1.h('section', [
                snabbdom_1.h('div.chessground.wood.small.merida.coordinates', {
                    hook: {
                        insert: runExample,
                        postpatch: runExample
                    }
                }),
                snabbdom_1.h('p', example.name)
            ])
        ]);
    }
    page({ click: false, popstate: false, dispatch: false, hashbang: true });
    page('/:id', function (ctx) {
        example = examples[parseInt(ctx.params.id) || 0];
        redraw();
    });
    page(location.hash.slice(2) || '/0');
}
exports.run = run;

},{"./basics":15,"./play":17,"page":2,"snabbdom":12,"snabbdom/modules/attributes":9,"snabbdom/modules/class":10,"snabbdom/modules/eventlisteners":11}],17:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var chess_js_1 = require("chess.js");
var util_1 = require("./util");
exports.initial = {
    name: 'Play legal moves from initial position',
    run: function (el) {
        var chess = new chess_js_1.Chess();
        var cg = window.Chessground(el, {
            movable: {
                color: 'white',
                free: false,
                dests: util_1.toDests(chess)
            }
        });
        cg.set({
            movable: {
                events: {
                    after: function (orig, dest) {
                        chess.move({ from: orig, to: dest });
                        cg.set({
                            turnColor: util_1.toColor(chess),
                            movable: {
                                color: util_1.toColor(chess),
                                dests: util_1.toDests(chess)
                            }
                        });
                    }
                }
            }
        });
    }
};

},{"./util":18,"chess.js":1}],18:[function(require,module,exports){
"use strict";
exports.__esModule = true;
function toDests(chess) {
    var dests = {};
    chess.SQUARES.forEach(function (s) {
        var ms = chess.moves({ square: s, verbose: true });
        if (ms.length)
            dests[s] = ms.map(function (m) { return m.to; });
    });
    return dests;
}
exports.toDests = toDests;
function toColor(chess) {
    return (chess.turn() === 'w') ? 'white' : 'black';
}
exports.toColor = toColor;

},{}]},{},[16])(16)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2hlc3MuanMvY2hlc3MuanMiLCJub2RlX21vZHVsZXMvcGFnZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYXRoLXRvLXJlZ2V4cC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wYXRoLXRvLXJlZ2V4cC9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vaC5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9odG1sZG9tYXBpLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL2lzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL2NsYXNzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdGh1bmsuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCJzcmMvYmFzaWNzLnRzIiwic3JjL21haW4udHMiLCJzcmMvcGxheS50cyIsInNyYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ptREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzltQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFlBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDUGEsUUFBQSxRQUFRLEdBQVk7SUFDL0IsSUFBSSxFQUFFLHVCQUF1QjtJQUM3QixHQUFHLFlBQUMsRUFBRTtRQUNKLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekIsQ0FBQztDQUNGLENBQUM7QUFDVyxRQUFBLE9BQU8sR0FBWTtJQUM5QixJQUFJLEVBQUUsMEJBQTBCO0lBQ2hDLEdBQUcsWUFBQyxFQUFFO1FBQ0osTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUU7WUFDckIsR0FBRyxFQUFDLHFEQUFxRDtZQUN6RCxXQUFXLEVBQUUsT0FBTztTQUNyQixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0YsQ0FBQztBQUNXLFFBQUEsaUJBQWlCLEdBQVk7SUFDeEMsSUFBSSxFQUFFLG9CQUFvQjtJQUMxQixHQUFHLFlBQUMsRUFBRTtRQUNKLElBQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFO1lBQ2hDLEdBQUcsRUFBQyxxREFBcUQ7WUFDekQsV0FBVyxFQUFFLE9BQU87U0FDckIsQ0FBQyxDQUFDO1FBQ0gsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRCxNQUFNLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkQsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsQ0FBQztDQUNGLENBQUM7OztBQzdCRixxQ0FBcUM7OztBQUVyQyxxQ0FBbUM7QUFFbkMsZ0RBQTJDO0FBQzNDLDBEQUFxRDtBQUNyRCxrRUFBd0Q7QUFDeEQsMkJBQTRCO0FBRTVCLGlDQUFrQztBQUNsQyw2QkFBOEI7QUFFOUIsSUFBTSxLQUFLLEdBQUcsZUFBSSxDQUFDLENBQUMsa0JBQUssRUFBRSx1QkFBVSxFQUFFLDJCQUFTLENBQUMsQ0FBQyxDQUFDO0FBRW5ELGFBQW9CLE9BQWdCO0lBRWxDLElBQU0sUUFBUSxHQUFjO1FBQzFCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsaUJBQWlCO1FBQ3pELElBQUksQ0FBQyxPQUFPO0tBQ2IsQ0FBQztJQUVGLElBQUksT0FBZ0IsRUFBRSxLQUFZLENBQUM7SUFFbkM7UUFDRSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssSUFBSSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsb0JBQW9CLEtBQVk7UUFDOUIsSUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQWtCLENBQUM7UUFDcEMsRUFBRSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBRUQ7UUFDRSxNQUFNLENBQUMsWUFBQyxDQUFDLDBCQUEwQixFQUFFO1lBQ25DLFlBQUMsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEVBQUUsRUFBRSxFQUFFO2dCQUM1QixNQUFNLENBQUMsWUFBQyxDQUFDLEdBQUcsRUFBRTtvQkFDWixPQUFLLEVBQUU7d0JBQ0wsTUFBTSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLElBQUk7cUJBQ2pDO29CQUNELEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxjQUFNLE9BQUEsSUFBSSxDQUFDLE1BQUksRUFBSSxDQUFDLEVBQWQsQ0FBYyxFQUFFO2lCQUNwQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBQ0gsWUFBQyxDQUFDLFNBQVMsRUFBRTtnQkFDWCxZQUFDLENBQUMsK0NBQStDLEVBQUU7b0JBQ2pELElBQUksRUFBRTt3QkFDSixNQUFNLEVBQUUsVUFBVTt3QkFDbEIsU0FBUyxFQUFFLFVBQVU7cUJBQ3RCO2lCQUNGLENBQUM7Z0JBQ0YsWUFBQyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDO2FBQ3JCLENBQUM7U0FDSCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDekUsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFBLEdBQUc7UUFDZCxPQUFPLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sRUFBRSxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQS9DRCxrQkErQ0M7Ozs7O0FDN0RELHFDQUFpQztBQUNqQywrQkFBeUM7QUFFNUIsUUFBQSxPQUFPLEdBQVk7SUFDOUIsSUFBSSxFQUFFLHdDQUF3QztJQUM5QyxHQUFHLFlBQUMsRUFBRTtRQUNKLElBQU0sS0FBSyxHQUFHLElBQUksZ0JBQUssRUFBRSxDQUFDO1FBQzFCLElBQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFO1lBQ2hDLE9BQU8sRUFBRTtnQkFDUCxLQUFLLEVBQUUsT0FBTztnQkFDZCxJQUFJLEVBQUUsS0FBSztnQkFDWCxLQUFLLEVBQUUsY0FBTyxDQUFDLEtBQUssQ0FBQzthQUN0QjtTQUNGLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDTCxPQUFPLEVBQUU7Z0JBQ1AsTUFBTSxFQUFFO29CQUNOLEtBQUssWUFBQyxJQUFJLEVBQUUsSUFBSTt3QkFDZCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzt3QkFDbkMsRUFBRSxDQUFDLEdBQUcsQ0FBQzs0QkFDTCxTQUFTLEVBQUUsY0FBTyxDQUFDLEtBQUssQ0FBQzs0QkFDekIsT0FBTyxFQUFFO2dDQUNQLEtBQUssRUFBRSxjQUFPLENBQUMsS0FBSyxDQUFDO2dDQUNyQixLQUFLLEVBQUUsY0FBTyxDQUFDLEtBQUssQ0FBQzs2QkFDdEI7eUJBQ0YsQ0FBQyxDQUFDO29CQUNMLENBQUM7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRixDQUFDOzs7OztBQy9CRixpQkFBd0IsS0FBVTtJQUNoQyxJQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDakIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO1FBQ3JCLElBQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ25ELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxFQUFFLEVBQUosQ0FBSSxDQUFDLENBQUM7SUFDOUMsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQVBELDBCQU9DO0FBRUQsaUJBQXdCLEtBQVU7SUFDaEMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsQ0FBQyxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDcEQsQ0FBQztBQUZELDBCQUVDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYsIEplZmYgSGx5d2EgKGpobHl3YUBnbWFpbC5jb20pXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gKlxuICogMS4gUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLFxuICogICAgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqIDIuIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSxcbiAqICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb25cbiAqICAgIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGUgZGlzdHJpYnV0aW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlMgXCJBUyBJU1wiXG4gKiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1QgTElNSVRFRCBUTywgVEhFXG4gKiBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRVxuICogQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFQgT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFXG4gKiBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SXG4gKiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRlxuICogU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTXG4gKiBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTlxuICogQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSlcbiAqIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFXG4gKiBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4vKiBtaW5pZmllZCBsaWNlbnNlIGJlbG93ICAqL1xuXG4vKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IChjKSAyMDE2LCBKZWZmIEhseXdhIChqaGx5d2FAZ21haWwuY29tKVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIEJTRCBsaWNlbnNlXG4gKiBodHRwczovL2dpdGh1Yi5jb20vamhseXdhL2NoZXNzLmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqL1xuXG52YXIgQ2hlc3MgPSBmdW5jdGlvbihmZW4pIHtcblxuICAvKiBqc2hpbnQgaW5kZW50OiBmYWxzZSAqL1xuXG4gIHZhciBCTEFDSyA9ICdiJztcbiAgdmFyIFdISVRFID0gJ3cnO1xuXG4gIHZhciBFTVBUWSA9IC0xO1xuXG4gIHZhciBQQVdOID0gJ3AnO1xuICB2YXIgS05JR0hUID0gJ24nO1xuICB2YXIgQklTSE9QID0gJ2InO1xuICB2YXIgUk9PSyA9ICdyJztcbiAgdmFyIFFVRUVOID0gJ3EnO1xuICB2YXIgS0lORyA9ICdrJztcblxuICB2YXIgU1lNQk9MUyA9ICdwbmJycWtQTkJSUUsnO1xuXG4gIHZhciBERUZBVUxUX1BPU0lUSU9OID0gJ3JuYnFrYm5yL3BwcHBwcHBwLzgvOC84LzgvUFBQUFBQUFAvUk5CUUtCTlIgdyBLUWtxIC0gMCAxJztcblxuICB2YXIgUE9TU0lCTEVfUkVTVUxUUyA9IFsnMS0wJywgJzAtMScsICcxLzItMS8yJywgJyonXTtcblxuICB2YXIgUEFXTl9PRkZTRVRTID0ge1xuICAgIGI6IFsxNiwgMzIsIDE3LCAxNV0sXG4gICAgdzogWy0xNiwgLTMyLCAtMTcsIC0xNV1cbiAgfTtcblxuICB2YXIgUElFQ0VfT0ZGU0VUUyA9IHtcbiAgICBuOiBbLTE4LCAtMzMsIC0zMSwgLTE0LCAgMTgsIDMzLCAzMSwgIDE0XSxcbiAgICBiOiBbLTE3LCAtMTUsICAxNywgIDE1XSxcbiAgICByOiBbLTE2LCAgIDEsICAxNiwgIC0xXSxcbiAgICBxOiBbLTE3LCAtMTYsIC0xNSwgICAxLCAgMTcsIDE2LCAxNSwgIC0xXSxcbiAgICBrOiBbLTE3LCAtMTYsIC0xNSwgICAxLCAgMTcsIDE2LCAxNSwgIC0xXVxuICB9O1xuXG4gIHZhciBBVFRBQ0tTID0gW1xuICAgIDIwLCAwLCAwLCAwLCAwLCAwLCAwLCAyNCwgIDAsIDAsIDAsIDAsIDAsIDAsMjAsIDAsXG4gICAgIDAsMjAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwyMCwgMCwgMCxcbiAgICAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMjQsICAwLCAwLCAwLCAwLDIwLCAwLCAwLCAwLFxuICAgICAwLCAwLCAwLDIwLCAwLCAwLCAwLCAyNCwgIDAsIDAsIDAsMjAsIDAsIDAsIDAsIDAsXG4gICAgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDI0LCAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMCxcbiAgICAgMCwgMCwgMCwgMCwgMCwyMCwgMiwgMjQsICAyLDIwLCAwLCAwLCAwLCAwLCAwLCAwLFxuICAgICAwLCAwLCAwLCAwLCAwLCAyLDUzLCA1NiwgNTMsIDIsIDAsIDAsIDAsIDAsIDAsIDAsXG4gICAgMjQsMjQsMjQsMjQsMjQsMjQsNTYsICAwLCA1NiwyNCwyNCwyNCwyNCwyNCwyNCwgMCxcbiAgICAgMCwgMCwgMCwgMCwgMCwgMiw1MywgNTYsIDUzLCAyLCAwLCAwLCAwLCAwLCAwLCAwLFxuICAgICAwLCAwLCAwLCAwLCAwLDIwLCAyLCAyNCwgIDIsMjAsIDAsIDAsIDAsIDAsIDAsIDAsXG4gICAgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDI0LCAgMCwgMCwyMCwgMCwgMCwgMCwgMCwgMCxcbiAgICAgMCwgMCwgMCwyMCwgMCwgMCwgMCwgMjQsICAwLCAwLCAwLDIwLCAwLCAwLCAwLCAwLFxuICAgICAwLCAwLDIwLCAwLCAwLCAwLCAwLCAyNCwgIDAsIDAsIDAsIDAsMjAsIDAsIDAsIDAsXG4gICAgIDAsMjAsIDAsIDAsIDAsIDAsIDAsIDI0LCAgMCwgMCwgMCwgMCwgMCwyMCwgMCwgMCxcbiAgICAyMCwgMCwgMCwgMCwgMCwgMCwgMCwgMjQsICAwLCAwLCAwLCAwLCAwLCAwLDIwXG4gIF07XG5cbiAgdmFyIFJBWVMgPSBbXG4gICAgIDE3LCAgMCwgIDAsICAwLCAgMCwgIDAsICAwLCAxNiwgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwgMTUsIDAsXG4gICAgICAwLCAxNywgIDAsICAwLCAgMCwgIDAsICAwLCAxNiwgIDAsICAwLCAgMCwgIDAsICAwLCAxNSwgIDAsIDAsXG4gICAgICAwLCAgMCwgMTcsICAwLCAgMCwgIDAsICAwLCAxNiwgIDAsICAwLCAgMCwgIDAsIDE1LCAgMCwgIDAsIDAsXG4gICAgICAwLCAgMCwgIDAsIDE3LCAgMCwgIDAsICAwLCAxNiwgIDAsICAwLCAgMCwgMTUsICAwLCAgMCwgIDAsIDAsXG4gICAgICAwLCAgMCwgIDAsICAwLCAxNywgIDAsICAwLCAxNiwgIDAsICAwLCAxNSwgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgICAwLCAgMCwgIDAsICAwLCAgMCwgMTcsICAwLCAxNiwgIDAsIDE1LCAgMCwgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsIDE3LCAxNiwgMTUsICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgICAxLCAgMSwgIDEsICAxLCAgMSwgIDEsICAxLCAgMCwgLTEsIC0xLCAgLTEsLTEsIC0xLCAtMSwgLTEsIDAsXG4gICAgICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsLTE1LC0xNiwtMTcsICAwLCAgMCwgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgICAwLCAgMCwgIDAsICAwLCAgMCwtMTUsICAwLC0xNiwgIDAsLTE3LCAgMCwgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgICAwLCAgMCwgIDAsICAwLC0xNSwgIDAsICAwLC0xNiwgIDAsICAwLC0xNywgIDAsICAwLCAgMCwgIDAsIDAsXG4gICAgICAwLCAgMCwgIDAsLTE1LCAgMCwgIDAsICAwLC0xNiwgIDAsICAwLCAgMCwtMTcsICAwLCAgMCwgIDAsIDAsXG4gICAgICAwLCAgMCwtMTUsICAwLCAgMCwgIDAsICAwLC0xNiwgIDAsICAwLCAgMCwgIDAsLTE3LCAgMCwgIDAsIDAsXG4gICAgICAwLC0xNSwgIDAsICAwLCAgMCwgIDAsICAwLC0xNiwgIDAsICAwLCAgMCwgIDAsICAwLC0xNywgIDAsIDAsXG4gICAgLTE1LCAgMCwgIDAsICAwLCAgMCwgIDAsICAwLC0xNiwgIDAsICAwLCAgMCwgIDAsICAwLCAgMCwtMTdcbiAgXTtcblxuICB2YXIgU0hJRlRTID0geyBwOiAwLCBuOiAxLCBiOiAyLCByOiAzLCBxOiA0LCBrOiA1IH07XG5cbiAgdmFyIEZMQUdTID0ge1xuICAgIE5PUk1BTDogJ24nLFxuICAgIENBUFRVUkU6ICdjJyxcbiAgICBCSUdfUEFXTjogJ2InLFxuICAgIEVQX0NBUFRVUkU6ICdlJyxcbiAgICBQUk9NT1RJT046ICdwJyxcbiAgICBLU0lERV9DQVNUTEU6ICdrJyxcbiAgICBRU0lERV9DQVNUTEU6ICdxJ1xuICB9O1xuXG4gIHZhciBCSVRTID0ge1xuICAgIE5PUk1BTDogMSxcbiAgICBDQVBUVVJFOiAyLFxuICAgIEJJR19QQVdOOiA0LFxuICAgIEVQX0NBUFRVUkU6IDgsXG4gICAgUFJPTU9USU9OOiAxNixcbiAgICBLU0lERV9DQVNUTEU6IDMyLFxuICAgIFFTSURFX0NBU1RMRTogNjRcbiAgfTtcblxuICB2YXIgUkFOS18xID0gNztcbiAgdmFyIFJBTktfMiA9IDY7XG4gIHZhciBSQU5LXzMgPSA1O1xuICB2YXIgUkFOS180ID0gNDtcbiAgdmFyIFJBTktfNSA9IDM7XG4gIHZhciBSQU5LXzYgPSAyO1xuICB2YXIgUkFOS183ID0gMTtcbiAgdmFyIFJBTktfOCA9IDA7XG5cbiAgdmFyIFNRVUFSRVMgPSB7XG4gICAgYTg6ICAgMCwgYjg6ICAgMSwgYzg6ICAgMiwgZDg6ICAgMywgZTg6ICAgNCwgZjg6ICAgNSwgZzg6ICAgNiwgaDg6ICAgNyxcbiAgICBhNzogIDE2LCBiNzogIDE3LCBjNzogIDE4LCBkNzogIDE5LCBlNzogIDIwLCBmNzogIDIxLCBnNzogIDIyLCBoNzogIDIzLFxuICAgIGE2OiAgMzIsIGI2OiAgMzMsIGM2OiAgMzQsIGQ2OiAgMzUsIGU2OiAgMzYsIGY2OiAgMzcsIGc2OiAgMzgsIGg2OiAgMzksXG4gICAgYTU6ICA0OCwgYjU6ICA0OSwgYzU6ICA1MCwgZDU6ICA1MSwgZTU6ICA1MiwgZjU6ICA1MywgZzU6ICA1NCwgaDU6ICA1NSxcbiAgICBhNDogIDY0LCBiNDogIDY1LCBjNDogIDY2LCBkNDogIDY3LCBlNDogIDY4LCBmNDogIDY5LCBnNDogIDcwLCBoNDogIDcxLFxuICAgIGEzOiAgODAsIGIzOiAgODEsIGMzOiAgODIsIGQzOiAgODMsIGUzOiAgODQsIGYzOiAgODUsIGczOiAgODYsIGgzOiAgODcsXG4gICAgYTI6ICA5NiwgYjI6ICA5NywgYzI6ICA5OCwgZDI6ICA5OSwgZTI6IDEwMCwgZjI6IDEwMSwgZzI6IDEwMiwgaDI6IDEwMyxcbiAgICBhMTogMTEyLCBiMTogMTEzLCBjMTogMTE0LCBkMTogMTE1LCBlMTogMTE2LCBmMTogMTE3LCBnMTogMTE4LCBoMTogMTE5XG4gIH07XG5cbiAgdmFyIFJPT0tTID0ge1xuICAgIHc6IFt7c3F1YXJlOiBTUVVBUkVTLmExLCBmbGFnOiBCSVRTLlFTSURFX0NBU1RMRX0sXG4gICAgICAgIHtzcXVhcmU6IFNRVUFSRVMuaDEsIGZsYWc6IEJJVFMuS1NJREVfQ0FTVExFfV0sXG4gICAgYjogW3tzcXVhcmU6IFNRVUFSRVMuYTgsIGZsYWc6IEJJVFMuUVNJREVfQ0FTVExFfSxcbiAgICAgICAge3NxdWFyZTogU1FVQVJFUy5oOCwgZmxhZzogQklUUy5LU0lERV9DQVNUTEV9XVxuICB9O1xuXG4gIHZhciBib2FyZCA9IG5ldyBBcnJheSgxMjgpO1xuICB2YXIga2luZ3MgPSB7dzogRU1QVFksIGI6IEVNUFRZfTtcbiAgdmFyIHR1cm4gPSBXSElURTtcbiAgdmFyIGNhc3RsaW5nID0ge3c6IDAsIGI6IDB9O1xuICB2YXIgZXBfc3F1YXJlID0gRU1QVFk7XG4gIHZhciBoYWxmX21vdmVzID0gMDtcbiAgdmFyIG1vdmVfbnVtYmVyID0gMTtcbiAgdmFyIGhpc3RvcnkgPSBbXTtcbiAgdmFyIGhlYWRlciA9IHt9O1xuXG4gIC8qIGlmIHRoZSB1c2VyIHBhc3NlcyBpbiBhIGZlbiBzdHJpbmcsIGxvYWQgaXQsIGVsc2UgZGVmYXVsdCB0b1xuICAgKiBzdGFydGluZyBwb3NpdGlvblxuICAgKi9cbiAgaWYgKHR5cGVvZiBmZW4gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgbG9hZChERUZBVUxUX1BPU0lUSU9OKTtcbiAgfSBlbHNlIHtcbiAgICBsb2FkKGZlbik7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICBib2FyZCA9IG5ldyBBcnJheSgxMjgpO1xuICAgIGtpbmdzID0ge3c6IEVNUFRZLCBiOiBFTVBUWX07XG4gICAgdHVybiA9IFdISVRFO1xuICAgIGNhc3RsaW5nID0ge3c6IDAsIGI6IDB9O1xuICAgIGVwX3NxdWFyZSA9IEVNUFRZO1xuICAgIGhhbGZfbW92ZXMgPSAwO1xuICAgIG1vdmVfbnVtYmVyID0gMTtcbiAgICBoaXN0b3J5ID0gW107XG4gICAgaGVhZGVyID0ge307XG4gICAgdXBkYXRlX3NldHVwKGdlbmVyYXRlX2ZlbigpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGxvYWQoREVGQVVMVF9QT1NJVElPTik7XG4gIH1cblxuICBmdW5jdGlvbiBsb2FkKGZlbikge1xuICAgIHZhciB0b2tlbnMgPSBmZW4uc3BsaXQoL1xccysvKTtcbiAgICB2YXIgcG9zaXRpb24gPSB0b2tlbnNbMF07XG4gICAgdmFyIHNxdWFyZSA9IDA7XG5cbiAgICBpZiAoIXZhbGlkYXRlX2ZlbihmZW4pLnZhbGlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY2xlYXIoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9zaXRpb24ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwaWVjZSA9IHBvc2l0aW9uLmNoYXJBdChpKTtcblxuICAgICAgaWYgKHBpZWNlID09PSAnLycpIHtcbiAgICAgICAgc3F1YXJlICs9IDg7XG4gICAgICB9IGVsc2UgaWYgKGlzX2RpZ2l0KHBpZWNlKSkge1xuICAgICAgICBzcXVhcmUgKz0gcGFyc2VJbnQocGllY2UsIDEwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBjb2xvciA9IChwaWVjZSA8ICdhJykgPyBXSElURSA6IEJMQUNLO1xuICAgICAgICBwdXQoe3R5cGU6IHBpZWNlLnRvTG93ZXJDYXNlKCksIGNvbG9yOiBjb2xvcn0sIGFsZ2VicmFpYyhzcXVhcmUpKTtcbiAgICAgICAgc3F1YXJlKys7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHVybiA9IHRva2Vuc1sxXTtcblxuICAgIGlmICh0b2tlbnNbMl0uaW5kZXhPZignSycpID4gLTEpIHtcbiAgICAgIGNhc3RsaW5nLncgfD0gQklUUy5LU0lERV9DQVNUTEU7XG4gICAgfVxuICAgIGlmICh0b2tlbnNbMl0uaW5kZXhPZignUScpID4gLTEpIHtcbiAgICAgIGNhc3RsaW5nLncgfD0gQklUUy5RU0lERV9DQVNUTEU7XG4gICAgfVxuICAgIGlmICh0b2tlbnNbMl0uaW5kZXhPZignaycpID4gLTEpIHtcbiAgICAgIGNhc3RsaW5nLmIgfD0gQklUUy5LU0lERV9DQVNUTEU7XG4gICAgfVxuICAgIGlmICh0b2tlbnNbMl0uaW5kZXhPZigncScpID4gLTEpIHtcbiAgICAgIGNhc3RsaW5nLmIgfD0gQklUUy5RU0lERV9DQVNUTEU7XG4gICAgfVxuXG4gICAgZXBfc3F1YXJlID0gKHRva2Vuc1szXSA9PT0gJy0nKSA/IEVNUFRZIDogU1FVQVJFU1t0b2tlbnNbM11dO1xuICAgIGhhbGZfbW92ZXMgPSBwYXJzZUludCh0b2tlbnNbNF0sIDEwKTtcbiAgICBtb3ZlX251bWJlciA9IHBhcnNlSW50KHRva2Vuc1s1XSwgMTApO1xuXG4gICAgdXBkYXRlX3NldHVwKGdlbmVyYXRlX2ZlbigpKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyogVE9ETzogdGhpcyBmdW5jdGlvbiBpcyBwcmV0dHkgbXVjaCBjcmFwIC0gaXQgdmFsaWRhdGVzIHN0cnVjdHVyZSBidXRcbiAgICogY29tcGxldGVseSBpZ25vcmVzIGNvbnRlbnQgKGUuZy4gZG9lc24ndCB2ZXJpZnkgdGhhdCBlYWNoIHNpZGUgaGFzIGEga2luZylcbiAgICogLi4uIHdlIHNob3VsZCByZXdyaXRlIHRoaXMsIGFuZCBkaXRjaCB0aGUgc2lsbHkgZXJyb3JfbnVtYmVyIGZpZWxkIHdoaWxlXG4gICAqIHdlJ3JlIGF0IGl0XG4gICAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZV9mZW4oZmVuKSB7XG4gICAgdmFyIGVycm9ycyA9IHtcbiAgICAgICAwOiAnTm8gZXJyb3JzLicsXG4gICAgICAgMTogJ0ZFTiBzdHJpbmcgbXVzdCBjb250YWluIHNpeCBzcGFjZS1kZWxpbWl0ZWQgZmllbGRzLicsXG4gICAgICAgMjogJzZ0aCBmaWVsZCAobW92ZSBudW1iZXIpIG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLicsXG4gICAgICAgMzogJzV0aCBmaWVsZCAoaGFsZiBtb3ZlIGNvdW50ZXIpIG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlci4nLFxuICAgICAgIDQ6ICc0dGggZmllbGQgKGVuLXBhc3NhbnQgc3F1YXJlKSBpcyBpbnZhbGlkLicsXG4gICAgICAgNTogJzNyZCBmaWVsZCAoY2FzdGxpbmcgYXZhaWxhYmlsaXR5KSBpcyBpbnZhbGlkLicsXG4gICAgICAgNjogJzJuZCBmaWVsZCAoc2lkZSB0byBtb3ZlKSBpcyBpbnZhbGlkLicsXG4gICAgICAgNzogJzFzdCBmaWVsZCAocGllY2UgcG9zaXRpb25zKSBkb2VzIG5vdCBjb250YWluIDggXFwnL1xcJy1kZWxpbWl0ZWQgcm93cy4nLFxuICAgICAgIDg6ICcxc3QgZmllbGQgKHBpZWNlIHBvc2l0aW9ucykgaXMgaW52YWxpZCBbY29uc2VjdXRpdmUgbnVtYmVyc10uJyxcbiAgICAgICA5OiAnMXN0IGZpZWxkIChwaWVjZSBwb3NpdGlvbnMpIGlzIGludmFsaWQgW2ludmFsaWQgcGllY2VdLicsXG4gICAgICAxMDogJzFzdCBmaWVsZCAocGllY2UgcG9zaXRpb25zKSBpcyBpbnZhbGlkIFtyb3cgdG9vIGxhcmdlXS4nLFxuICAgICAgMTE6ICdJbGxlZ2FsIGVuLXBhc3NhbnQgc3F1YXJlJyxcbiAgICB9O1xuXG4gICAgLyogMXN0IGNyaXRlcmlvbjogNiBzcGFjZS1zZXBlcmF0ZWQgZmllbGRzPyAqL1xuICAgIHZhciB0b2tlbnMgPSBmZW4uc3BsaXQoL1xccysvKTtcbiAgICBpZiAodG9rZW5zLmxlbmd0aCAhPT0gNikge1xuICAgICAgcmV0dXJuIHt2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogMSwgZXJyb3I6IGVycm9yc1sxXX07XG4gICAgfVxuXG4gICAgLyogMm5kIGNyaXRlcmlvbjogbW92ZSBudW1iZXIgZmllbGQgaXMgYSBpbnRlZ2VyIHZhbHVlID4gMD8gKi9cbiAgICBpZiAoaXNOYU4odG9rZW5zWzVdKSB8fCAocGFyc2VJbnQodG9rZW5zWzVdLCAxMCkgPD0gMCkpIHtcbiAgICAgIHJldHVybiB7dmFsaWQ6IGZhbHNlLCBlcnJvcl9udW1iZXI6IDIsIGVycm9yOiBlcnJvcnNbMl19O1xuICAgIH1cblxuICAgIC8qIDNyZCBjcml0ZXJpb246IGhhbGYgbW92ZSBjb3VudGVyIGlzIGFuIGludGVnZXIgPj0gMD8gKi9cbiAgICBpZiAoaXNOYU4odG9rZW5zWzRdKSB8fCAocGFyc2VJbnQodG9rZW5zWzRdLCAxMCkgPCAwKSkge1xuICAgICAgcmV0dXJuIHt2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogMywgZXJyb3I6IGVycm9yc1szXX07XG4gICAgfVxuXG4gICAgLyogNHRoIGNyaXRlcmlvbjogNHRoIGZpZWxkIGlzIGEgdmFsaWQgZS5wLi1zdHJpbmc/ICovXG4gICAgaWYgKCEvXigtfFthYmNkZWZnaF1bMzZdKSQvLnRlc3QodG9rZW5zWzNdKSkge1xuICAgICAgcmV0dXJuIHt2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogNCwgZXJyb3I6IGVycm9yc1s0XX07XG4gICAgfVxuXG4gICAgLyogNXRoIGNyaXRlcmlvbjogM3RoIGZpZWxkIGlzIGEgdmFsaWQgY2FzdGxlLXN0cmluZz8gKi9cbiAgICBpZiggIS9eKEtRP2s/cT98UWs/cT98a3E/fHF8LSkkLy50ZXN0KHRva2Vuc1syXSkpIHtcbiAgICAgIHJldHVybiB7dmFsaWQ6IGZhbHNlLCBlcnJvcl9udW1iZXI6IDUsIGVycm9yOiBlcnJvcnNbNV19O1xuICAgIH1cblxuICAgIC8qIDZ0aCBjcml0ZXJpb246IDJuZCBmaWVsZCBpcyBcIndcIiAod2hpdGUpIG9yIFwiYlwiIChibGFjayk/ICovXG4gICAgaWYgKCEvXih3fGIpJC8udGVzdCh0b2tlbnNbMV0pKSB7XG4gICAgICByZXR1cm4ge3ZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiA2LCBlcnJvcjogZXJyb3JzWzZdfTtcbiAgICB9XG5cbiAgICAvKiA3dGggY3JpdGVyaW9uOiAxc3QgZmllbGQgY29udGFpbnMgOCByb3dzPyAqL1xuICAgIHZhciByb3dzID0gdG9rZW5zWzBdLnNwbGl0KCcvJyk7XG4gICAgaWYgKHJvd3MubGVuZ3RoICE9PSA4KSB7XG4gICAgICByZXR1cm4ge3ZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiA3LCBlcnJvcjogZXJyb3JzWzddfTtcbiAgICB9XG5cbiAgICAvKiA4dGggY3JpdGVyaW9uOiBldmVyeSByb3cgaXMgdmFsaWQ/ICovXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvKiBjaGVjayBmb3IgcmlnaHQgc3VtIG9mIGZpZWxkcyBBTkQgbm90IHR3byBudW1iZXJzIGluIHN1Y2Nlc3Npb24gKi9cbiAgICAgIHZhciBzdW1fZmllbGRzID0gMDtcbiAgICAgIHZhciBwcmV2aW91c193YXNfbnVtYmVyID0gZmFsc2U7XG5cbiAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgcm93c1tpXS5sZW5ndGg7IGsrKykge1xuICAgICAgICBpZiAoIWlzTmFOKHJvd3NbaV1ba10pKSB7XG4gICAgICAgICAgaWYgKHByZXZpb3VzX3dhc19udW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB7dmFsaWQ6IGZhbHNlLCBlcnJvcl9udW1iZXI6IDgsIGVycm9yOiBlcnJvcnNbOF19O1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdW1fZmllbGRzICs9IHBhcnNlSW50KHJvd3NbaV1ba10sIDEwKTtcbiAgICAgICAgICBwcmV2aW91c193YXNfbnVtYmVyID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIS9eW3BybmJxa1BSTkJRS10kLy50ZXN0KHJvd3NbaV1ba10pKSB7XG4gICAgICAgICAgICByZXR1cm4ge3ZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiA5LCBlcnJvcjogZXJyb3JzWzldfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgc3VtX2ZpZWxkcyArPSAxO1xuICAgICAgICAgIHByZXZpb3VzX3dhc19udW1iZXIgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN1bV9maWVsZHMgIT09IDgpIHtcbiAgICAgICAgcmV0dXJuIHt2YWxpZDogZmFsc2UsIGVycm9yX251bWJlcjogMTAsIGVycm9yOiBlcnJvcnNbMTBdfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoKHRva2Vuc1szXVsxXSA9PSAnMycgJiYgdG9rZW5zWzFdID09ICd3JykgfHxcbiAgICAgICAgKHRva2Vuc1szXVsxXSA9PSAnNicgJiYgdG9rZW5zWzFdID09ICdiJykpIHtcbiAgICAgICAgICByZXR1cm4ge3ZhbGlkOiBmYWxzZSwgZXJyb3JfbnVtYmVyOiAxMSwgZXJyb3I6IGVycm9yc1sxMV19O1xuICAgIH1cblxuICAgIC8qIGV2ZXJ5dGhpbmcncyBva2F5ISAqL1xuICAgIHJldHVybiB7dmFsaWQ6IHRydWUsIGVycm9yX251bWJlcjogMCwgZXJyb3I6IGVycm9yc1swXX07XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZV9mZW4oKSB7XG4gICAgdmFyIGVtcHR5ID0gMDtcbiAgICB2YXIgZmVuID0gJyc7XG5cbiAgICBmb3IgKHZhciBpID0gU1FVQVJFUy5hODsgaSA8PSBTUVVBUkVTLmgxOyBpKyspIHtcbiAgICAgIGlmIChib2FyZFtpXSA9PSBudWxsKSB7XG4gICAgICAgIGVtcHR5Kys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZW1wdHkgPiAwKSB7XG4gICAgICAgICAgZmVuICs9IGVtcHR5O1xuICAgICAgICAgIGVtcHR5ID0gMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29sb3IgPSBib2FyZFtpXS5jb2xvcjtcbiAgICAgICAgdmFyIHBpZWNlID0gYm9hcmRbaV0udHlwZTtcblxuICAgICAgICBmZW4gKz0gKGNvbG9yID09PSBXSElURSkgP1xuICAgICAgICAgICAgICAgICBwaWVjZS50b1VwcGVyQ2FzZSgpIDogcGllY2UudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKChpICsgMSkgJiAweDg4KSB7XG4gICAgICAgIGlmIChlbXB0eSA+IDApIHtcbiAgICAgICAgICBmZW4gKz0gZW1wdHk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaSAhPT0gU1FVQVJFUy5oMSkge1xuICAgICAgICAgIGZlbiArPSAnLyc7XG4gICAgICAgIH1cblxuICAgICAgICBlbXB0eSA9IDA7XG4gICAgICAgIGkgKz0gODtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgY2ZsYWdzID0gJyc7XG4gICAgaWYgKGNhc3RsaW5nW1dISVRFXSAmIEJJVFMuS1NJREVfQ0FTVExFKSB7IGNmbGFncyArPSAnSyc7IH1cbiAgICBpZiAoY2FzdGxpbmdbV0hJVEVdICYgQklUUy5RU0lERV9DQVNUTEUpIHsgY2ZsYWdzICs9ICdRJzsgfVxuICAgIGlmIChjYXN0bGluZ1tCTEFDS10gJiBCSVRTLktTSURFX0NBU1RMRSkgeyBjZmxhZ3MgKz0gJ2snOyB9XG4gICAgaWYgKGNhc3RsaW5nW0JMQUNLXSAmIEJJVFMuUVNJREVfQ0FTVExFKSB7IGNmbGFncyArPSAncSc7IH1cblxuICAgIC8qIGRvIHdlIGhhdmUgYW4gZW1wdHkgY2FzdGxpbmcgZmxhZz8gKi9cbiAgICBjZmxhZ3MgPSBjZmxhZ3MgfHwgJy0nO1xuICAgIHZhciBlcGZsYWdzID0gKGVwX3NxdWFyZSA9PT0gRU1QVFkpID8gJy0nIDogYWxnZWJyYWljKGVwX3NxdWFyZSk7XG5cbiAgICByZXR1cm4gW2ZlbiwgdHVybiwgY2ZsYWdzLCBlcGZsYWdzLCBoYWxmX21vdmVzLCBtb3ZlX251bWJlcl0uam9pbignICcpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0X2hlYWRlcihhcmdzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZ3NbaV0gPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgdHlwZW9mIGFyZ3NbaSArIDFdID09PSAnc3RyaW5nJykge1xuICAgICAgICBoZWFkZXJbYXJnc1tpXV0gPSBhcmdzW2kgKyAxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGhlYWRlcjtcbiAgfVxuXG4gIC8qIGNhbGxlZCB3aGVuIHRoZSBpbml0aWFsIGJvYXJkIHNldHVwIGlzIGNoYW5nZWQgd2l0aCBwdXQoKSBvciByZW1vdmUoKS5cbiAgICogbW9kaWZpZXMgdGhlIFNldFVwIGFuZCBGRU4gcHJvcGVydGllcyBvZiB0aGUgaGVhZGVyIG9iamVjdC4gIGlmIHRoZSBGRU4gaXNcbiAgICogZXF1YWwgdG8gdGhlIGRlZmF1bHQgcG9zaXRpb24sIHRoZSBTZXRVcCBhbmQgRkVOIGFyZSBkZWxldGVkXG4gICAqIHRoZSBzZXR1cCBpcyBvbmx5IHVwZGF0ZWQgaWYgaGlzdG9yeS5sZW5ndGggaXMgemVybywgaWUgbW92ZXMgaGF2ZW4ndCBiZWVuXG4gICAqIG1hZGUuXG4gICAqL1xuICBmdW5jdGlvbiB1cGRhdGVfc2V0dXAoZmVuKSB7XG4gICAgaWYgKGhpc3RvcnkubGVuZ3RoID4gMCkgcmV0dXJuO1xuXG4gICAgaWYgKGZlbiAhPT0gREVGQVVMVF9QT1NJVElPTikge1xuICAgICAgaGVhZGVyWydTZXRVcCddID0gJzEnO1xuICAgICAgaGVhZGVyWydGRU4nXSA9IGZlbjtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIGhlYWRlclsnU2V0VXAnXTtcbiAgICAgIGRlbGV0ZSBoZWFkZXJbJ0ZFTiddO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldChzcXVhcmUpIHtcbiAgICB2YXIgcGllY2UgPSBib2FyZFtTUVVBUkVTW3NxdWFyZV1dO1xuICAgIHJldHVybiAocGllY2UpID8ge3R5cGU6IHBpZWNlLnR5cGUsIGNvbG9yOiBwaWVjZS5jb2xvcn0gOiBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gcHV0KHBpZWNlLCBzcXVhcmUpIHtcbiAgICAvKiBjaGVjayBmb3IgdmFsaWQgcGllY2Ugb2JqZWN0ICovXG4gICAgaWYgKCEoJ3R5cGUnIGluIHBpZWNlICYmICdjb2xvcicgaW4gcGllY2UpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyogY2hlY2sgZm9yIHBpZWNlICovXG4gICAgaWYgKFNZTUJPTFMuaW5kZXhPZihwaWVjZS50eXBlLnRvTG93ZXJDYXNlKCkpID09PSAtMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qIGNoZWNrIGZvciB2YWxpZCBzcXVhcmUgKi9cbiAgICBpZiAoIShzcXVhcmUgaW4gU1FVQVJFUykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgc3EgPSBTUVVBUkVTW3NxdWFyZV07XG5cbiAgICAvKiBkb24ndCBsZXQgdGhlIHVzZXIgcGxhY2UgbW9yZSB0aGFuIG9uZSBraW5nICovXG4gICAgaWYgKHBpZWNlLnR5cGUgPT0gS0lORyAmJlxuICAgICAgICAhKGtpbmdzW3BpZWNlLmNvbG9yXSA9PSBFTVBUWSB8fCBraW5nc1twaWVjZS5jb2xvcl0gPT0gc3EpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYm9hcmRbc3FdID0ge3R5cGU6IHBpZWNlLnR5cGUsIGNvbG9yOiBwaWVjZS5jb2xvcn07XG4gICAgaWYgKHBpZWNlLnR5cGUgPT09IEtJTkcpIHtcbiAgICAgIGtpbmdzW3BpZWNlLmNvbG9yXSA9IHNxO1xuICAgIH1cblxuICAgIHVwZGF0ZV9zZXR1cChnZW5lcmF0ZV9mZW4oKSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZShzcXVhcmUpIHtcbiAgICB2YXIgcGllY2UgPSBnZXQoc3F1YXJlKTtcbiAgICBib2FyZFtTUVVBUkVTW3NxdWFyZV1dID0gbnVsbDtcbiAgICBpZiAocGllY2UgJiYgcGllY2UudHlwZSA9PT0gS0lORykge1xuICAgICAga2luZ3NbcGllY2UuY29sb3JdID0gRU1QVFk7XG4gICAgfVxuXG4gICAgdXBkYXRlX3NldHVwKGdlbmVyYXRlX2ZlbigpKTtcblxuICAgIHJldHVybiBwaWVjZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGJ1aWxkX21vdmUoYm9hcmQsIGZyb20sIHRvLCBmbGFncywgcHJvbW90aW9uKSB7XG4gICAgdmFyIG1vdmUgPSB7XG4gICAgICBjb2xvcjogdHVybixcbiAgICAgIGZyb206IGZyb20sXG4gICAgICB0bzogdG8sXG4gICAgICBmbGFnczogZmxhZ3MsXG4gICAgICBwaWVjZTogYm9hcmRbZnJvbV0udHlwZVxuICAgIH07XG5cbiAgICBpZiAocHJvbW90aW9uKSB7XG4gICAgICBtb3ZlLmZsYWdzIHw9IEJJVFMuUFJPTU9USU9OO1xuICAgICAgbW92ZS5wcm9tb3Rpb24gPSBwcm9tb3Rpb247XG4gICAgfVxuXG4gICAgaWYgKGJvYXJkW3RvXSkge1xuICAgICAgbW92ZS5jYXB0dXJlZCA9IGJvYXJkW3RvXS50eXBlO1xuICAgIH0gZWxzZSBpZiAoZmxhZ3MgJiBCSVRTLkVQX0NBUFRVUkUpIHtcbiAgICAgICAgbW92ZS5jYXB0dXJlZCA9IFBBV047XG4gICAgfVxuICAgIHJldHVybiBtb3ZlO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVfbW92ZXMob3B0aW9ucykge1xuICAgIGZ1bmN0aW9uIGFkZF9tb3ZlKGJvYXJkLCBtb3ZlcywgZnJvbSwgdG8sIGZsYWdzKSB7XG4gICAgICAvKiBpZiBwYXduIHByb21vdGlvbiAqL1xuICAgICAgaWYgKGJvYXJkW2Zyb21dLnR5cGUgPT09IFBBV04gJiZcbiAgICAgICAgIChyYW5rKHRvKSA9PT0gUkFOS184IHx8IHJhbmsodG8pID09PSBSQU5LXzEpKSB7XG4gICAgICAgICAgdmFyIHBpZWNlcyA9IFtRVUVFTiwgUk9PSywgQklTSE9QLCBLTklHSFRdO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwaWVjZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIG1vdmVzLnB1c2goYnVpbGRfbW92ZShib2FyZCwgZnJvbSwgdG8sIGZsYWdzLCBwaWVjZXNbaV0pKTtcbiAgICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgIG1vdmVzLnB1c2goYnVpbGRfbW92ZShib2FyZCwgZnJvbSwgdG8sIGZsYWdzKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG1vdmVzID0gW107XG4gICAgdmFyIHVzID0gdHVybjtcbiAgICB2YXIgdGhlbSA9IHN3YXBfY29sb3IodXMpO1xuICAgIHZhciBzZWNvbmRfcmFuayA9IHtiOiBSQU5LXzcsIHc6IFJBTktfMn07XG5cbiAgICB2YXIgZmlyc3Rfc3EgPSBTUVVBUkVTLmE4O1xuICAgIHZhciBsYXN0X3NxID0gU1FVQVJFUy5oMTtcbiAgICB2YXIgc2luZ2xlX3NxdWFyZSA9IGZhbHNlO1xuXG4gICAgLyogZG8gd2Ugd2FudCBsZWdhbCBtb3Zlcz8gKi9cbiAgICB2YXIgbGVnYWwgPSAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdsZWdhbCcgaW4gb3B0aW9ucykgP1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubGVnYWwgOiB0cnVlO1xuXG4gICAgLyogYXJlIHdlIGdlbmVyYXRpbmcgbW92ZXMgZm9yIGEgc2luZ2xlIHNxdWFyZT8gKi9cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICdzcXVhcmUnIGluIG9wdGlvbnMpIHtcbiAgICAgIGlmIChvcHRpb25zLnNxdWFyZSBpbiBTUVVBUkVTKSB7XG4gICAgICAgIGZpcnN0X3NxID0gbGFzdF9zcSA9IFNRVUFSRVNbb3B0aW9ucy5zcXVhcmVdO1xuICAgICAgICBzaW5nbGVfc3F1YXJlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGludmFsaWQgc3F1YXJlICovXG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gZmlyc3Rfc3E7IGkgPD0gbGFzdF9zcTsgaSsrKSB7XG4gICAgICAvKiBkaWQgd2UgcnVuIG9mZiB0aGUgZW5kIG9mIHRoZSBib2FyZCAqL1xuICAgICAgaWYgKGkgJiAweDg4KSB7IGkgKz0gNzsgY29udGludWU7IH1cblxuICAgICAgdmFyIHBpZWNlID0gYm9hcmRbaV07XG4gICAgICBpZiAocGllY2UgPT0gbnVsbCB8fCBwaWVjZS5jb2xvciAhPT0gdXMpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwaWVjZS50eXBlID09PSBQQVdOKSB7XG4gICAgICAgIC8qIHNpbmdsZSBzcXVhcmUsIG5vbi1jYXB0dXJpbmcgKi9cbiAgICAgICAgdmFyIHNxdWFyZSA9IGkgKyBQQVdOX09GRlNFVFNbdXNdWzBdO1xuICAgICAgICBpZiAoYm9hcmRbc3F1YXJlXSA9PSBudWxsKSB7XG4gICAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5OT1JNQUwpO1xuXG4gICAgICAgICAgLyogZG91YmxlIHNxdWFyZSAqL1xuICAgICAgICAgIHZhciBzcXVhcmUgPSBpICsgUEFXTl9PRkZTRVRTW3VzXVsxXTtcbiAgICAgICAgICBpZiAoc2Vjb25kX3JhbmtbdXNdID09PSByYW5rKGkpICYmIGJvYXJkW3NxdWFyZV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgYWRkX21vdmUoYm9hcmQsIG1vdmVzLCBpLCBzcXVhcmUsIEJJVFMuQklHX1BBV04pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHBhd24gY2FwdHVyZXMgKi9cbiAgICAgICAgZm9yIChqID0gMjsgaiA8IDQ7IGorKykge1xuICAgICAgICAgIHZhciBzcXVhcmUgPSBpICsgUEFXTl9PRkZTRVRTW3VzXVtqXTtcbiAgICAgICAgICBpZiAoc3F1YXJlICYgMHg4OCkgY29udGludWU7XG5cbiAgICAgICAgICBpZiAoYm9hcmRbc3F1YXJlXSAhPSBudWxsICYmXG4gICAgICAgICAgICAgIGJvYXJkW3NxdWFyZV0uY29sb3IgPT09IHRoZW0pIHtcbiAgICAgICAgICAgICAgYWRkX21vdmUoYm9hcmQsIG1vdmVzLCBpLCBzcXVhcmUsIEJJVFMuQ0FQVFVSRSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChzcXVhcmUgPT09IGVwX3NxdWFyZSkge1xuICAgICAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIGVwX3NxdWFyZSwgQklUUy5FUF9DQVBUVVJFKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwLCBsZW4gPSBQSUVDRV9PRkZTRVRTW3BpZWNlLnR5cGVdLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgdmFyIG9mZnNldCA9IFBJRUNFX09GRlNFVFNbcGllY2UudHlwZV1bal07XG4gICAgICAgICAgdmFyIHNxdWFyZSA9IGk7XG5cbiAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgICAgc3F1YXJlICs9IG9mZnNldDtcbiAgICAgICAgICAgIGlmIChzcXVhcmUgJiAweDg4KSBicmVhaztcblxuICAgICAgICAgICAgaWYgKGJvYXJkW3NxdWFyZV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGksIHNxdWFyZSwgQklUUy5OT1JNQUwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKGJvYXJkW3NxdWFyZV0uY29sb3IgPT09IHVzKSBicmVhaztcbiAgICAgICAgICAgICAgYWRkX21vdmUoYm9hcmQsIG1vdmVzLCBpLCBzcXVhcmUsIEJJVFMuQ0FQVFVSRSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBicmVhaywgaWYga25pZ2h0IG9yIGtpbmcgKi9cbiAgICAgICAgICAgIGlmIChwaWVjZS50eXBlID09PSAnbicgfHwgcGllY2UudHlwZSA9PT0gJ2snKSBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBjaGVjayBmb3IgY2FzdGxpbmcgaWY6IGEpIHdlJ3JlIGdlbmVyYXRpbmcgYWxsIG1vdmVzLCBvciBiKSB3ZSdyZSBkb2luZ1xuICAgICAqIHNpbmdsZSBzcXVhcmUgbW92ZSBnZW5lcmF0aW9uIG9uIHRoZSBraW5nJ3Mgc3F1YXJlXG4gICAgICovXG4gICAgaWYgKCghc2luZ2xlX3NxdWFyZSkgfHwgbGFzdF9zcSA9PT0ga2luZ3NbdXNdKSB7XG4gICAgICAvKiBraW5nLXNpZGUgY2FzdGxpbmcgKi9cbiAgICAgIGlmIChjYXN0bGluZ1t1c10gJiBCSVRTLktTSURFX0NBU1RMRSkge1xuICAgICAgICB2YXIgY2FzdGxpbmdfZnJvbSA9IGtpbmdzW3VzXTtcbiAgICAgICAgdmFyIGNhc3RsaW5nX3RvID0gY2FzdGxpbmdfZnJvbSArIDI7XG5cbiAgICAgICAgaWYgKGJvYXJkW2Nhc3RsaW5nX2Zyb20gKyAxXSA9PSBudWxsICYmXG4gICAgICAgICAgICBib2FyZFtjYXN0bGluZ190b10gICAgICAgPT0gbnVsbCAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGtpbmdzW3VzXSkgJiZcbiAgICAgICAgICAgICFhdHRhY2tlZCh0aGVtLCBjYXN0bGluZ19mcm9tICsgMSkgJiZcbiAgICAgICAgICAgICFhdHRhY2tlZCh0aGVtLCBjYXN0bGluZ190bykpIHtcbiAgICAgICAgICBhZGRfbW92ZShib2FyZCwgbW92ZXMsIGtpbmdzW3VzXSAsIGNhc3RsaW5nX3RvLFxuICAgICAgICAgICAgICAgICAgIEJJVFMuS1NJREVfQ0FTVExFKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKiBxdWVlbi1zaWRlIGNhc3RsaW5nICovXG4gICAgICBpZiAoY2FzdGxpbmdbdXNdICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgICAgdmFyIGNhc3RsaW5nX2Zyb20gPSBraW5nc1t1c107XG4gICAgICAgIHZhciBjYXN0bGluZ190byA9IGNhc3RsaW5nX2Zyb20gLSAyO1xuXG4gICAgICAgIGlmIChib2FyZFtjYXN0bGluZ19mcm9tIC0gMV0gPT0gbnVsbCAmJlxuICAgICAgICAgICAgYm9hcmRbY2FzdGxpbmdfZnJvbSAtIDJdID09IG51bGwgJiZcbiAgICAgICAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb20gLSAzXSA9PSBudWxsICYmXG4gICAgICAgICAgICAhYXR0YWNrZWQodGhlbSwga2luZ3NbdXNdKSAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGNhc3RsaW5nX2Zyb20gLSAxKSAmJlxuICAgICAgICAgICAgIWF0dGFja2VkKHRoZW0sIGNhc3RsaW5nX3RvKSkge1xuICAgICAgICAgIGFkZF9tb3ZlKGJvYXJkLCBtb3Zlcywga2luZ3NbdXNdLCBjYXN0bGluZ190byxcbiAgICAgICAgICAgICAgICAgICBCSVRTLlFTSURFX0NBU1RMRSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiByZXR1cm4gYWxsIHBzZXVkby1sZWdhbCBtb3ZlcyAodGhpcyBpbmNsdWRlcyBtb3ZlcyB0aGF0IGFsbG93IHRoZSBraW5nXG4gICAgICogdG8gYmUgY2FwdHVyZWQpXG4gICAgICovXG4gICAgaWYgKCFsZWdhbCkge1xuICAgICAgcmV0dXJuIG1vdmVzO1xuICAgIH1cblxuICAgIC8qIGZpbHRlciBvdXQgaWxsZWdhbCBtb3ZlcyAqL1xuICAgIHZhciBsZWdhbF9tb3ZlcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbWFrZV9tb3ZlKG1vdmVzW2ldKTtcbiAgICAgIGlmICgha2luZ19hdHRhY2tlZCh1cykpIHtcbiAgICAgICAgbGVnYWxfbW92ZXMucHVzaChtb3Zlc1tpXSk7XG4gICAgICB9XG4gICAgICB1bmRvX21vdmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGVnYWxfbW92ZXM7XG4gIH1cblxuICAvKiBjb252ZXJ0IGEgbW92ZSBmcm9tIDB4ODggY29vcmRpbmF0ZXMgdG8gU3RhbmRhcmQgQWxnZWJyYWljIE5vdGF0aW9uXG4gICAqIChTQU4pXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2xvcHB5IFVzZSB0aGUgc2xvcHB5IFNBTiBnZW5lcmF0b3IgdG8gd29yayBhcm91bmQgb3ZlclxuICAgKiBkaXNhbWJpZ3VhdGlvbiBidWdzIGluIEZyaXR6IGFuZCBDaGVzc2Jhc2UuICBTZWUgYmVsb3c6XG4gICAqXG4gICAqIHIxYnFrYm5yL3BwcDJwcHAvMm41LzFCMXBQMy80UDMvOC9QUFBQMlBQL1JOQlFLMU5SIGIgS1FrcSAtIDIgNFxuICAgKiA0LiAuLi4gTmdlNyBpcyBvdmVybHkgZGlzYW1iaWd1YXRlZCBiZWNhdXNlIHRoZSBrbmlnaHQgb24gYzYgaXMgcGlubmVkXG4gICAqIDQuIC4uLiBOZTcgaXMgdGVjaG5pY2FsbHkgdGhlIHZhbGlkIFNBTlxuICAgKi9cbiAgZnVuY3Rpb24gbW92ZV90b19zYW4obW92ZSwgc2xvcHB5KSB7XG5cbiAgICB2YXIgb3V0cHV0ID0gJyc7XG5cbiAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuS1NJREVfQ0FTVExFKSB7XG4gICAgICBvdXRwdXQgPSAnTy1PJztcbiAgICB9IGVsc2UgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLlFTSURFX0NBU1RMRSkge1xuICAgICAgb3V0cHV0ID0gJ08tTy1PJztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGRpc2FtYmlndWF0b3IgPSBnZXRfZGlzYW1iaWd1YXRvcihtb3ZlLCBzbG9wcHkpO1xuXG4gICAgICBpZiAobW92ZS5waWVjZSAhPT0gUEFXTikge1xuICAgICAgICBvdXRwdXQgKz0gbW92ZS5waWVjZS50b1VwcGVyQ2FzZSgpICsgZGlzYW1iaWd1YXRvcjtcbiAgICAgIH1cblxuICAgICAgaWYgKG1vdmUuZmxhZ3MgJiAoQklUUy5DQVBUVVJFIHwgQklUUy5FUF9DQVBUVVJFKSkge1xuICAgICAgICBpZiAobW92ZS5waWVjZSA9PT0gUEFXTikge1xuICAgICAgICAgIG91dHB1dCArPSBhbGdlYnJhaWMobW92ZS5mcm9tKVswXTtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXQgKz0gJ3gnO1xuICAgICAgfVxuXG4gICAgICBvdXRwdXQgKz0gYWxnZWJyYWljKG1vdmUudG8pO1xuXG4gICAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuUFJPTU9USU9OKSB7XG4gICAgICAgIG91dHB1dCArPSAnPScgKyBtb3ZlLnByb21vdGlvbi50b1VwcGVyQ2FzZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIG1ha2VfbW92ZShtb3ZlKTtcbiAgICBpZiAoaW5fY2hlY2soKSkge1xuICAgICAgaWYgKGluX2NoZWNrbWF0ZSgpKSB7XG4gICAgICAgIG91dHB1dCArPSAnIyc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQgKz0gJysnO1xuICAgICAgfVxuICAgIH1cbiAgICB1bmRvX21vdmUoKTtcblxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH1cblxuICAvLyBwYXJzZXMgYWxsIG9mIHRoZSBkZWNvcmF0b3JzIG91dCBvZiBhIFNBTiBzdHJpbmdcbiAgZnVuY3Rpb24gc3RyaXBwZWRfc2FuKG1vdmUpIHtcbiAgICByZXR1cm4gbW92ZS5yZXBsYWNlKC89LywnJykucmVwbGFjZSgvWysjXT9bPyFdKiQvLCcnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGF0dGFja2VkKGNvbG9yLCBzcXVhcmUpIHtcbiAgICBmb3IgKHZhciBpID0gU1FVQVJFUy5hODsgaSA8PSBTUVVBUkVTLmgxOyBpKyspIHtcbiAgICAgIC8qIGRpZCB3ZSBydW4gb2ZmIHRoZSBlbmQgb2YgdGhlIGJvYXJkICovXG4gICAgICBpZiAoaSAmIDB4ODgpIHsgaSArPSA3OyBjb250aW51ZTsgfVxuXG4gICAgICAvKiBpZiBlbXB0eSBzcXVhcmUgb3Igd3JvbmcgY29sb3IgKi9cbiAgICAgIGlmIChib2FyZFtpXSA9PSBudWxsIHx8IGJvYXJkW2ldLmNvbG9yICE9PSBjb2xvcikgY29udGludWU7XG5cbiAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldO1xuICAgICAgdmFyIGRpZmZlcmVuY2UgPSBpIC0gc3F1YXJlO1xuICAgICAgdmFyIGluZGV4ID0gZGlmZmVyZW5jZSArIDExOTtcblxuICAgICAgaWYgKEFUVEFDS1NbaW5kZXhdICYgKDEgPDwgU0hJRlRTW3BpZWNlLnR5cGVdKSkge1xuICAgICAgICBpZiAocGllY2UudHlwZSA9PT0gUEFXTikge1xuICAgICAgICAgIGlmIChkaWZmZXJlbmNlID4gMCkge1xuICAgICAgICAgICAgaWYgKHBpZWNlLmNvbG9yID09PSBXSElURSkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwaWVjZS5jb2xvciA9PT0gQkxBQ0spIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIGlmIHRoZSBwaWVjZSBpcyBhIGtuaWdodCBvciBhIGtpbmcgKi9cbiAgICAgICAgaWYgKHBpZWNlLnR5cGUgPT09ICduJyB8fCBwaWVjZS50eXBlID09PSAnaycpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIHZhciBvZmZzZXQgPSBSQVlTW2luZGV4XTtcbiAgICAgICAgdmFyIGogPSBpICsgb2Zmc2V0O1xuXG4gICAgICAgIHZhciBibG9ja2VkID0gZmFsc2U7XG4gICAgICAgIHdoaWxlIChqICE9PSBzcXVhcmUpIHtcbiAgICAgICAgICBpZiAoYm9hcmRbal0gIT0gbnVsbCkgeyBibG9ja2VkID0gdHJ1ZTsgYnJlYWs7IH1cbiAgICAgICAgICBqICs9IG9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYmxvY2tlZCkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24ga2luZ19hdHRhY2tlZChjb2xvcikge1xuICAgIHJldHVybiBhdHRhY2tlZChzd2FwX2NvbG9yKGNvbG9yKSwga2luZ3NbY29sb3JdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluX2NoZWNrKCkge1xuICAgIHJldHVybiBraW5nX2F0dGFja2VkKHR1cm4pO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5fY2hlY2ttYXRlKCkge1xuICAgIHJldHVybiBpbl9jaGVjaygpICYmIGdlbmVyYXRlX21vdmVzKCkubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5fc3RhbGVtYXRlKCkge1xuICAgIHJldHVybiAhaW5fY2hlY2soKSAmJiBnZW5lcmF0ZV9tb3ZlcygpLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluc3VmZmljaWVudF9tYXRlcmlhbCgpIHtcbiAgICB2YXIgcGllY2VzID0ge307XG4gICAgdmFyIGJpc2hvcHMgPSBbXTtcbiAgICB2YXIgbnVtX3BpZWNlcyA9IDA7XG4gICAgdmFyIHNxX2NvbG9yID0gMDtcblxuICAgIGZvciAodmFyIGkgPSBTUVVBUkVTLmE4OyBpPD0gU1FVQVJFUy5oMTsgaSsrKSB7XG4gICAgICBzcV9jb2xvciA9IChzcV9jb2xvciArIDEpICUgMjtcbiAgICAgIGlmIChpICYgMHg4OCkgeyBpICs9IDc7IGNvbnRpbnVlOyB9XG5cbiAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldO1xuICAgICAgaWYgKHBpZWNlKSB7XG4gICAgICAgIHBpZWNlc1twaWVjZS50eXBlXSA9IChwaWVjZS50eXBlIGluIHBpZWNlcykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGllY2VzW3BpZWNlLnR5cGVdICsgMSA6IDE7XG4gICAgICAgIGlmIChwaWVjZS50eXBlID09PSBCSVNIT1ApIHtcbiAgICAgICAgICBiaXNob3BzLnB1c2goc3FfY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIG51bV9waWVjZXMrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBrIHZzLiBrICovXG4gICAgaWYgKG51bV9waWVjZXMgPT09IDIpIHsgcmV0dXJuIHRydWU7IH1cblxuICAgIC8qIGsgdnMuIGtuIC4uLi4gb3IgLi4uLiBrIHZzLiBrYiAqL1xuICAgIGVsc2UgaWYgKG51bV9waWVjZXMgPT09IDMgJiYgKHBpZWNlc1tCSVNIT1BdID09PSAxIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaWVjZXNbS05JR0hUXSA9PT0gMSkpIHsgcmV0dXJuIHRydWU7IH1cblxuICAgIC8qIGtiIHZzLiBrYiB3aGVyZSBhbnkgbnVtYmVyIG9mIGJpc2hvcHMgYXJlIGFsbCBvbiB0aGUgc2FtZSBjb2xvciAqL1xuICAgIGVsc2UgaWYgKG51bV9waWVjZXMgPT09IHBpZWNlc1tCSVNIT1BdICsgMikge1xuICAgICAgdmFyIHN1bSA9IDA7XG4gICAgICB2YXIgbGVuID0gYmlzaG9wcy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHN1bSArPSBiaXNob3BzW2ldO1xuICAgICAgfVxuICAgICAgaWYgKHN1bSA9PT0gMCB8fCBzdW0gPT09IGxlbikgeyByZXR1cm4gdHJ1ZTsgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluX3RocmVlZm9sZF9yZXBldGl0aW9uKCkge1xuICAgIC8qIFRPRE86IHdoaWxlIHRoaXMgZnVuY3Rpb24gaXMgZmluZSBmb3IgY2FzdWFsIHVzZSwgYSBiZXR0ZXJcbiAgICAgKiBpbXBsZW1lbnRhdGlvbiB3b3VsZCB1c2UgYSBab2JyaXN0IGtleSAoaW5zdGVhZCBvZiBGRU4pLiB0aGVcbiAgICAgKiBab2JyaXN0IGtleSB3b3VsZCBiZSBtYWludGFpbmVkIGluIHRoZSBtYWtlX21vdmUvdW5kb19tb3ZlIGZ1bmN0aW9ucyxcbiAgICAgKiBhdm9pZGluZyB0aGUgY29zdGx5IHRoYXQgd2UgZG8gYmVsb3cuXG4gICAgICovXG4gICAgdmFyIG1vdmVzID0gW107XG4gICAgdmFyIHBvc2l0aW9ucyA9IHt9O1xuICAgIHZhciByZXBldGl0aW9uID0gZmFsc2U7XG5cbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIG1vdmUgPSB1bmRvX21vdmUoKTtcbiAgICAgIGlmICghbW92ZSkgYnJlYWs7XG4gICAgICBtb3Zlcy5wdXNoKG1vdmUpO1xuICAgIH1cblxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAvKiByZW1vdmUgdGhlIGxhc3QgdHdvIGZpZWxkcyBpbiB0aGUgRkVOIHN0cmluZywgdGhleSdyZSBub3QgbmVlZGVkXG4gICAgICAgKiB3aGVuIGNoZWNraW5nIGZvciBkcmF3IGJ5IHJlcCAqL1xuICAgICAgdmFyIGZlbiA9IGdlbmVyYXRlX2ZlbigpLnNwbGl0KCcgJykuc2xpY2UoMCw0KS5qb2luKCcgJyk7XG5cbiAgICAgIC8qIGhhcyB0aGUgcG9zaXRpb24gb2NjdXJyZWQgdGhyZWUgb3IgbW92ZSB0aW1lcyAqL1xuICAgICAgcG9zaXRpb25zW2Zlbl0gPSAoZmVuIGluIHBvc2l0aW9ucykgPyBwb3NpdGlvbnNbZmVuXSArIDEgOiAxO1xuICAgICAgaWYgKHBvc2l0aW9uc1tmZW5dID49IDMpIHtcbiAgICAgICAgcmVwZXRpdGlvbiA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghbW92ZXMubGVuZ3RoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbWFrZV9tb3ZlKG1vdmVzLnBvcCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVwZXRpdGlvbjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHB1c2gobW92ZSkge1xuICAgIGhpc3RvcnkucHVzaCh7XG4gICAgICBtb3ZlOiBtb3ZlLFxuICAgICAga2luZ3M6IHtiOiBraW5ncy5iLCB3OiBraW5ncy53fSxcbiAgICAgIHR1cm46IHR1cm4sXG4gICAgICBjYXN0bGluZzoge2I6IGNhc3RsaW5nLmIsIHc6IGNhc3RsaW5nLnd9LFxuICAgICAgZXBfc3F1YXJlOiBlcF9zcXVhcmUsXG4gICAgICBoYWxmX21vdmVzOiBoYWxmX21vdmVzLFxuICAgICAgbW92ZV9udW1iZXI6IG1vdmVfbnVtYmVyXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlX21vdmUobW92ZSkge1xuICAgIHZhciB1cyA9IHR1cm47XG4gICAgdmFyIHRoZW0gPSBzd2FwX2NvbG9yKHVzKTtcbiAgICBwdXNoKG1vdmUpO1xuXG4gICAgYm9hcmRbbW92ZS50b10gPSBib2FyZFttb3ZlLmZyb21dO1xuICAgIGJvYXJkW21vdmUuZnJvbV0gPSBudWxsO1xuXG4gICAgLyogaWYgZXAgY2FwdHVyZSwgcmVtb3ZlIHRoZSBjYXB0dXJlZCBwYXduICovXG4gICAgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLkVQX0NBUFRVUkUpIHtcbiAgICAgIGlmICh0dXJuID09PSBCTEFDSykge1xuICAgICAgICBib2FyZFttb3ZlLnRvIC0gMTZdID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJvYXJkW21vdmUudG8gKyAxNl0gPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qIGlmIHBhd24gcHJvbW90aW9uLCByZXBsYWNlIHdpdGggbmV3IHBpZWNlICovXG4gICAgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLlBST01PVElPTikge1xuICAgICAgYm9hcmRbbW92ZS50b10gPSB7dHlwZTogbW92ZS5wcm9tb3Rpb24sIGNvbG9yOiB1c307XG4gICAgfVxuXG4gICAgLyogaWYgd2UgbW92ZWQgdGhlIGtpbmcgKi9cbiAgICBpZiAoYm9hcmRbbW92ZS50b10udHlwZSA9PT0gS0lORykge1xuICAgICAga2luZ3NbYm9hcmRbbW92ZS50b10uY29sb3JdID0gbW92ZS50bztcblxuICAgICAgLyogaWYgd2UgY2FzdGxlZCwgbW92ZSB0aGUgcm9vayBuZXh0IHRvIHRoZSBraW5nICovXG4gICAgICBpZiAobW92ZS5mbGFncyAmIEJJVFMuS1NJREVfQ0FTVExFKSB7XG4gICAgICAgIHZhciBjYXN0bGluZ190byA9IG1vdmUudG8gLSAxO1xuICAgICAgICB2YXIgY2FzdGxpbmdfZnJvbSA9IG1vdmUudG8gKyAxO1xuICAgICAgICBib2FyZFtjYXN0bGluZ190b10gPSBib2FyZFtjYXN0bGluZ19mcm9tXTtcbiAgICAgICAgYm9hcmRbY2FzdGxpbmdfZnJvbV0gPSBudWxsO1xuICAgICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgICAgdmFyIGNhc3RsaW5nX3RvID0gbW92ZS50byArIDE7XG4gICAgICAgIHZhciBjYXN0bGluZ19mcm9tID0gbW92ZS50byAtIDI7XG4gICAgICAgIGJvYXJkW2Nhc3RsaW5nX3RvXSA9IGJvYXJkW2Nhc3RsaW5nX2Zyb21dO1xuICAgICAgICBib2FyZFtjYXN0bGluZ19mcm9tXSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8qIHR1cm4gb2ZmIGNhc3RsaW5nICovXG4gICAgICBjYXN0bGluZ1t1c10gPSAnJztcbiAgICB9XG5cbiAgICAvKiB0dXJuIG9mZiBjYXN0bGluZyBpZiB3ZSBtb3ZlIGEgcm9vayAqL1xuICAgIGlmIChjYXN0bGluZ1t1c10pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBST09LU1t1c10ubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKG1vdmUuZnJvbSA9PT0gUk9PS1NbdXNdW2ldLnNxdWFyZSAmJlxuICAgICAgICAgICAgY2FzdGxpbmdbdXNdICYgUk9PS1NbdXNdW2ldLmZsYWcpIHtcbiAgICAgICAgICBjYXN0bGluZ1t1c10gXj0gUk9PS1NbdXNdW2ldLmZsYWc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiB0dXJuIG9mZiBjYXN0bGluZyBpZiB3ZSBjYXB0dXJlIGEgcm9vayAqL1xuICAgIGlmIChjYXN0bGluZ1t0aGVtXSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IFJPT0tTW3RoZW1dLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChtb3ZlLnRvID09PSBST09LU1t0aGVtXVtpXS5zcXVhcmUgJiZcbiAgICAgICAgICAgIGNhc3RsaW5nW3RoZW1dICYgUk9PS1NbdGhlbV1baV0uZmxhZykge1xuICAgICAgICAgIGNhc3RsaW5nW3RoZW1dIF49IFJPT0tTW3RoZW1dW2ldLmZsYWc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBpZiBiaWcgcGF3biBtb3ZlLCB1cGRhdGUgdGhlIGVuIHBhc3NhbnQgc3F1YXJlICovXG4gICAgaWYgKG1vdmUuZmxhZ3MgJiBCSVRTLkJJR19QQVdOKSB7XG4gICAgICBpZiAodHVybiA9PT0gJ2InKSB7XG4gICAgICAgIGVwX3NxdWFyZSA9IG1vdmUudG8gLSAxNjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVwX3NxdWFyZSA9IG1vdmUudG8gKyAxNjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXBfc3F1YXJlID0gRU1QVFk7XG4gICAgfVxuXG4gICAgLyogcmVzZXQgdGhlIDUwIG1vdmUgY291bnRlciBpZiBhIHBhd24gaXMgbW92ZWQgb3IgYSBwaWVjZSBpcyBjYXB0dXJlZCAqL1xuICAgIGlmIChtb3ZlLnBpZWNlID09PSBQQVdOKSB7XG4gICAgICBoYWxmX21vdmVzID0gMDtcbiAgICB9IGVsc2UgaWYgKG1vdmUuZmxhZ3MgJiAoQklUUy5DQVBUVVJFIHwgQklUUy5FUF9DQVBUVVJFKSkge1xuICAgICAgaGFsZl9tb3ZlcyA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhbGZfbW92ZXMrKztcbiAgICB9XG5cbiAgICBpZiAodHVybiA9PT0gQkxBQ0spIHtcbiAgICAgIG1vdmVfbnVtYmVyKys7XG4gICAgfVxuICAgIHR1cm4gPSBzd2FwX2NvbG9yKHR1cm4pO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5kb19tb3ZlKCkge1xuICAgIHZhciBvbGQgPSBoaXN0b3J5LnBvcCgpO1xuICAgIGlmIChvbGQgPT0gbnVsbCkgeyByZXR1cm4gbnVsbDsgfVxuXG4gICAgdmFyIG1vdmUgPSBvbGQubW92ZTtcbiAgICBraW5ncyA9IG9sZC5raW5ncztcbiAgICB0dXJuID0gb2xkLnR1cm47XG4gICAgY2FzdGxpbmcgPSBvbGQuY2FzdGxpbmc7XG4gICAgZXBfc3F1YXJlID0gb2xkLmVwX3NxdWFyZTtcbiAgICBoYWxmX21vdmVzID0gb2xkLmhhbGZfbW92ZXM7XG4gICAgbW92ZV9udW1iZXIgPSBvbGQubW92ZV9udW1iZXI7XG5cbiAgICB2YXIgdXMgPSB0dXJuO1xuICAgIHZhciB0aGVtID0gc3dhcF9jb2xvcih0dXJuKTtcblxuICAgIGJvYXJkW21vdmUuZnJvbV0gPSBib2FyZFttb3ZlLnRvXTtcbiAgICBib2FyZFttb3ZlLmZyb21dLnR5cGUgPSBtb3ZlLnBpZWNlOyAgLy8gdG8gdW5kbyBhbnkgcHJvbW90aW9uc1xuICAgIGJvYXJkW21vdmUudG9dID0gbnVsbDtcblxuICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5DQVBUVVJFKSB7XG4gICAgICBib2FyZFttb3ZlLnRvXSA9IHt0eXBlOiBtb3ZlLmNhcHR1cmVkLCBjb2xvcjogdGhlbX07XG4gICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgQklUUy5FUF9DQVBUVVJFKSB7XG4gICAgICB2YXIgaW5kZXg7XG4gICAgICBpZiAodXMgPT09IEJMQUNLKSB7XG4gICAgICAgIGluZGV4ID0gbW92ZS50byAtIDE2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXggPSBtb3ZlLnRvICsgMTY7XG4gICAgICB9XG4gICAgICBib2FyZFtpbmRleF0gPSB7dHlwZTogUEFXTiwgY29sb3I6IHRoZW19O1xuICAgIH1cblxuXG4gICAgaWYgKG1vdmUuZmxhZ3MgJiAoQklUUy5LU0lERV9DQVNUTEUgfCBCSVRTLlFTSURFX0NBU1RMRSkpIHtcbiAgICAgIHZhciBjYXN0bGluZ190bywgY2FzdGxpbmdfZnJvbTtcbiAgICAgIGlmIChtb3ZlLmZsYWdzICYgQklUUy5LU0lERV9DQVNUTEUpIHtcbiAgICAgICAgY2FzdGxpbmdfdG8gPSBtb3ZlLnRvICsgMTtcbiAgICAgICAgY2FzdGxpbmdfZnJvbSA9IG1vdmUudG8gLSAxO1xuICAgICAgfSBlbHNlIGlmIChtb3ZlLmZsYWdzICYgQklUUy5RU0lERV9DQVNUTEUpIHtcbiAgICAgICAgY2FzdGxpbmdfdG8gPSBtb3ZlLnRvIC0gMjtcbiAgICAgICAgY2FzdGxpbmdfZnJvbSA9IG1vdmUudG8gKyAxO1xuICAgICAgfVxuXG4gICAgICBib2FyZFtjYXN0bGluZ190b10gPSBib2FyZFtjYXN0bGluZ19mcm9tXTtcbiAgICAgIGJvYXJkW2Nhc3RsaW5nX2Zyb21dID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gbW92ZTtcbiAgfVxuXG4gIC8qIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byB1bmlxdWVseSBpZGVudGlmeSBhbWJpZ3VvdXMgbW92ZXMgKi9cbiAgZnVuY3Rpb24gZ2V0X2Rpc2FtYmlndWF0b3IobW92ZSwgc2xvcHB5KSB7XG4gICAgdmFyIG1vdmVzID0gZ2VuZXJhdGVfbW92ZXMoe2xlZ2FsOiAhc2xvcHB5fSk7XG5cbiAgICB2YXIgZnJvbSA9IG1vdmUuZnJvbTtcbiAgICB2YXIgdG8gPSBtb3ZlLnRvO1xuICAgIHZhciBwaWVjZSA9IG1vdmUucGllY2U7XG5cbiAgICB2YXIgYW1iaWd1aXRpZXMgPSAwO1xuICAgIHZhciBzYW1lX3JhbmsgPSAwO1xuICAgIHZhciBzYW1lX2ZpbGUgPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1vdmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB2YXIgYW1iaWdfZnJvbSA9IG1vdmVzW2ldLmZyb207XG4gICAgICB2YXIgYW1iaWdfdG8gPSBtb3Zlc1tpXS50bztcbiAgICAgIHZhciBhbWJpZ19waWVjZSA9IG1vdmVzW2ldLnBpZWNlO1xuXG4gICAgICAvKiBpZiBhIG1vdmUgb2YgdGhlIHNhbWUgcGllY2UgdHlwZSBlbmRzIG9uIHRoZSBzYW1lIHRvIHNxdWFyZSwgd2UnbGxcbiAgICAgICAqIG5lZWQgdG8gYWRkIGEgZGlzYW1iaWd1YXRvciB0byB0aGUgYWxnZWJyYWljIG5vdGF0aW9uXG4gICAgICAgKi9cbiAgICAgIGlmIChwaWVjZSA9PT0gYW1iaWdfcGllY2UgJiYgZnJvbSAhPT0gYW1iaWdfZnJvbSAmJiB0byA9PT0gYW1iaWdfdG8pIHtcbiAgICAgICAgYW1iaWd1aXRpZXMrKztcblxuICAgICAgICBpZiAocmFuayhmcm9tKSA9PT0gcmFuayhhbWJpZ19mcm9tKSkge1xuICAgICAgICAgIHNhbWVfcmFuaysrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGUoZnJvbSkgPT09IGZpbGUoYW1iaWdfZnJvbSkpIHtcbiAgICAgICAgICBzYW1lX2ZpbGUrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhbWJpZ3VpdGllcyA+IDApIHtcbiAgICAgIC8qIGlmIHRoZXJlIGV4aXN0cyBhIHNpbWlsYXIgbW92aW5nIHBpZWNlIG9uIHRoZSBzYW1lIHJhbmsgYW5kIGZpbGUgYXNcbiAgICAgICAqIHRoZSBtb3ZlIGluIHF1ZXN0aW9uLCB1c2UgdGhlIHNxdWFyZSBhcyB0aGUgZGlzYW1iaWd1YXRvclxuICAgICAgICovXG4gICAgICBpZiAoc2FtZV9yYW5rID4gMCAmJiBzYW1lX2ZpbGUgPiAwKSB7XG4gICAgICAgIHJldHVybiBhbGdlYnJhaWMoZnJvbSk7XG4gICAgICB9XG4gICAgICAvKiBpZiB0aGUgbW92aW5nIHBpZWNlIHJlc3RzIG9uIHRoZSBzYW1lIGZpbGUsIHVzZSB0aGUgcmFuayBzeW1ib2wgYXMgdGhlXG4gICAgICAgKiBkaXNhbWJpZ3VhdG9yXG4gICAgICAgKi9cbiAgICAgIGVsc2UgaWYgKHNhbWVfZmlsZSA+IDApIHtcbiAgICAgICAgcmV0dXJuIGFsZ2VicmFpYyhmcm9tKS5jaGFyQXQoMSk7XG4gICAgICB9XG4gICAgICAvKiBlbHNlIHVzZSB0aGUgZmlsZSBzeW1ib2wgKi9cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gYWxnZWJyYWljKGZyb20pLmNoYXJBdCgwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBmdW5jdGlvbiBhc2NpaSgpIHtcbiAgICB2YXIgcyA9ICcgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xcbic7XG4gICAgZm9yICh2YXIgaSA9IFNRVUFSRVMuYTg7IGkgPD0gU1FVQVJFUy5oMTsgaSsrKSB7XG4gICAgICAvKiBkaXNwbGF5IHRoZSByYW5rICovXG4gICAgICBpZiAoZmlsZShpKSA9PT0gMCkge1xuICAgICAgICBzICs9ICcgJyArICc4NzY1NDMyMSdbcmFuayhpKV0gKyAnIHwnO1xuICAgICAgfVxuXG4gICAgICAvKiBlbXB0eSBwaWVjZSAqL1xuICAgICAgaWYgKGJvYXJkW2ldID09IG51bGwpIHtcbiAgICAgICAgcyArPSAnIC4gJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwaWVjZSA9IGJvYXJkW2ldLnR5cGU7XG4gICAgICAgIHZhciBjb2xvciA9IGJvYXJkW2ldLmNvbG9yO1xuICAgICAgICB2YXIgc3ltYm9sID0gKGNvbG9yID09PSBXSElURSkgP1xuICAgICAgICAgICAgICAgICAgICAgcGllY2UudG9VcHBlckNhc2UoKSA6IHBpZWNlLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHMgKz0gJyAnICsgc3ltYm9sICsgJyAnO1xuICAgICAgfVxuXG4gICAgICBpZiAoKGkgKyAxKSAmIDB4ODgpIHtcbiAgICAgICAgcyArPSAnfFxcbic7XG4gICAgICAgIGkgKz0gODtcbiAgICAgIH1cbiAgICB9XG4gICAgcyArPSAnICAgKy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLStcXG4nO1xuICAgIHMgKz0gJyAgICAgYSAgYiAgYyAgZCAgZSAgZiAgZyAgaFxcbic7XG5cbiAgICByZXR1cm4gcztcbiAgfVxuXG4gIC8vIGNvbnZlcnQgYSBtb3ZlIGZyb20gU3RhbmRhcmQgQWxnZWJyYWljIE5vdGF0aW9uIChTQU4pIHRvIDB4ODggY29vcmRpbmF0ZXNcbiAgZnVuY3Rpb24gbW92ZV9mcm9tX3Nhbihtb3ZlLCBzbG9wcHkpIHtcbiAgICAvLyBzdHJpcCBvZmYgYW55IG1vdmUgZGVjb3JhdGlvbnM6IGUuZyBOZjMrPyFcbiAgICB2YXIgY2xlYW5fbW92ZSA9IHN0cmlwcGVkX3Nhbihtb3ZlKTtcblxuICAgIC8vIGlmIHdlJ3JlIHVzaW5nIHRoZSBzbG9wcHkgcGFyc2VyIHJ1biBhIHJlZ2V4IHRvIGdyYWIgcGllY2UsIHRvLCBhbmQgZnJvbVxuICAgIC8vIHRoaXMgc2hvdWxkIHBhcnNlIGludmFsaWQgU0FOIGxpa2U6IFBlMi1lNCwgUmMxYzQsIFFmM3hmN1xuICAgIGlmIChzbG9wcHkpIHtcbiAgICAgIHZhciBtYXRjaGVzID0gY2xlYW5fbW92ZS5tYXRjaCgvKFtwbmJycWtQTkJSUUtdKT8oW2EtaF1bMS04XSl4Py0/KFthLWhdWzEtOF0pKFtxcmJuUVJCTl0pPy8pO1xuICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgdmFyIHBpZWNlID0gbWF0Y2hlc1sxXTtcbiAgICAgICAgdmFyIGZyb20gPSBtYXRjaGVzWzJdO1xuICAgICAgICB2YXIgdG8gPSBtYXRjaGVzWzNdO1xuICAgICAgICB2YXIgcHJvbW90aW9uID0gbWF0Y2hlc1s0XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbW92ZXMgPSBnZW5lcmF0ZV9tb3ZlcygpO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgLy8gdHJ5IHRoZSBzdHJpY3QgcGFyc2VyIGZpcnN0LCB0aGVuIHRoZSBzbG9wcHkgcGFyc2VyIGlmIHJlcXVlc3RlZFxuICAgICAgLy8gYnkgdGhlIHVzZXJcbiAgICAgIGlmICgoY2xlYW5fbW92ZSA9PT0gc3RyaXBwZWRfc2FuKG1vdmVfdG9fc2FuKG1vdmVzW2ldKSkpIHx8XG4gICAgICAgICAgKHNsb3BweSAmJiBjbGVhbl9tb3ZlID09PSBzdHJpcHBlZF9zYW4obW92ZV90b19zYW4obW92ZXNbaV0sIHRydWUpKSkpIHtcbiAgICAgICAgcmV0dXJuIG1vdmVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG1hdGNoZXMgJiZcbiAgICAgICAgICAgICghcGllY2UgfHwgcGllY2UudG9Mb3dlckNhc2UoKSA9PSBtb3Zlc1tpXS5waWVjZSkgJiZcbiAgICAgICAgICAgIFNRVUFSRVNbZnJvbV0gPT0gbW92ZXNbaV0uZnJvbSAmJlxuICAgICAgICAgICAgU1FVQVJFU1t0b10gPT0gbW92ZXNbaV0udG8gJiZcbiAgICAgICAgICAgICghcHJvbW90aW9uIHx8IHByb21vdGlvbi50b0xvd2VyQ2FzZSgpID09IG1vdmVzW2ldLnByb21vdGlvbikpIHtcbiAgICAgICAgICByZXR1cm4gbW92ZXNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG5cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqIFVUSUxJVFkgRlVOQ1RJT05TXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICBmdW5jdGlvbiByYW5rKGkpIHtcbiAgICByZXR1cm4gaSA+PiA0O1xuICB9XG5cbiAgZnVuY3Rpb24gZmlsZShpKSB7XG4gICAgcmV0dXJuIGkgJiAxNTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFsZ2VicmFpYyhpKXtcbiAgICB2YXIgZiA9IGZpbGUoaSksIHIgPSByYW5rKGkpO1xuICAgIHJldHVybiAnYWJjZGVmZ2gnLnN1YnN0cmluZyhmLGYrMSkgKyAnODc2NTQzMjEnLnN1YnN0cmluZyhyLHIrMSk7XG4gIH1cblxuICBmdW5jdGlvbiBzd2FwX2NvbG9yKGMpIHtcbiAgICByZXR1cm4gYyA9PT0gV0hJVEUgPyBCTEFDSyA6IFdISVRFO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNfZGlnaXQoYykge1xuICAgIHJldHVybiAnMDEyMzQ1Njc4OScuaW5kZXhPZihjKSAhPT0gLTE7XG4gIH1cblxuICAvKiBwcmV0dHkgPSBleHRlcm5hbCBtb3ZlIG9iamVjdCAqL1xuICBmdW5jdGlvbiBtYWtlX3ByZXR0eSh1Z2x5X21vdmUpIHtcbiAgICB2YXIgbW92ZSA9IGNsb25lKHVnbHlfbW92ZSk7XG4gICAgbW92ZS5zYW4gPSBtb3ZlX3RvX3Nhbihtb3ZlLCBmYWxzZSk7XG4gICAgbW92ZS50byA9IGFsZ2VicmFpYyhtb3ZlLnRvKTtcbiAgICBtb3ZlLmZyb20gPSBhbGdlYnJhaWMobW92ZS5mcm9tKTtcblxuICAgIHZhciBmbGFncyA9ICcnO1xuXG4gICAgZm9yICh2YXIgZmxhZyBpbiBCSVRTKSB7XG4gICAgICBpZiAoQklUU1tmbGFnXSAmIG1vdmUuZmxhZ3MpIHtcbiAgICAgICAgZmxhZ3MgKz0gRkxBR1NbZmxhZ107XG4gICAgICB9XG4gICAgfVxuICAgIG1vdmUuZmxhZ3MgPSBmbGFncztcblxuICAgIHJldHVybiBtb3ZlO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xvbmUob2JqKSB7XG4gICAgdmFyIGR1cGUgPSAob2JqIGluc3RhbmNlb2YgQXJyYXkpID8gW10gOiB7fTtcblxuICAgIGZvciAodmFyIHByb3BlcnR5IGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZHVwZVtwcm9wZXJ0eV0gPSBjbG9uZShvYmpbcHJvcGVydHldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGR1cGVbcHJvcGVydHldID0gb2JqW3Byb3BlcnR5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZHVwZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyaW0oc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gIH1cblxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogREVCVUdHSU5HIFVUSUxJVElFU1xuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgZnVuY3Rpb24gcGVyZnQoZGVwdGgpIHtcbiAgICB2YXIgbW92ZXMgPSBnZW5lcmF0ZV9tb3Zlcyh7bGVnYWw6IGZhbHNlfSk7XG4gICAgdmFyIG5vZGVzID0gMDtcbiAgICB2YXIgY29sb3IgPSB0dXJuO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1vdmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBtYWtlX21vdmUobW92ZXNbaV0pO1xuICAgICAgaWYgKCFraW5nX2F0dGFja2VkKGNvbG9yKSkge1xuICAgICAgICBpZiAoZGVwdGggLSAxID4gMCkge1xuICAgICAgICAgIHZhciBjaGlsZF9ub2RlcyA9IHBlcmZ0KGRlcHRoIC0gMSk7XG4gICAgICAgICAgbm9kZXMgKz0gY2hpbGRfbm9kZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbm9kZXMrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdW5kb19tb3ZlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5vZGVzO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogUFVCTElDIENPTlNUQU5UUyAoaXMgdGhlcmUgYSBiZXR0ZXIgd2F5IHRvIGRvIHRoaXM/KVxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICBXSElURTogV0hJVEUsXG4gICAgQkxBQ0s6IEJMQUNLLFxuICAgIFBBV046IFBBV04sXG4gICAgS05JR0hUOiBLTklHSFQsXG4gICAgQklTSE9QOiBCSVNIT1AsXG4gICAgUk9PSzogUk9PSyxcbiAgICBRVUVFTjogUVVFRU4sXG4gICAgS0lORzogS0lORyxcbiAgICBTUVVBUkVTOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLyogZnJvbSB0aGUgRUNNQS0yNjIgc3BlYyAoc2VjdGlvbiAxMi42LjQpOlxuICAgICAgICAgICAgICAgICAqIFwiVGhlIG1lY2hhbmljcyBvZiBlbnVtZXJhdGluZyB0aGUgcHJvcGVydGllcyAuLi4gaXNcbiAgICAgICAgICAgICAgICAgKiBpbXBsZW1lbnRhdGlvbiBkZXBlbmRlbnRcIlxuICAgICAgICAgICAgICAgICAqIHNvOiBmb3IgKHZhciBzcSBpbiBTUVVBUkVTKSB7IGtleXMucHVzaChzcSk7IH0gbWlnaHQgbm90IGJlXG4gICAgICAgICAgICAgICAgICogb3JkZXJlZCBjb3JyZWN0bHlcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB2YXIga2V5cyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSBTUVVBUkVTLmE4OyBpIDw9IFNRVUFSRVMuaDE7IGkrKykge1xuICAgICAgICAgICAgICAgICAgaWYgKGkgJiAweDg4KSB7IGkgKz0gNzsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgIGtleXMucHVzaChhbGdlYnJhaWMoaSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgICAgICAgICAgfSkoKSxcbiAgICBGTEFHUzogRkxBR1MsXG5cbiAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAgICogUFVCTElDIEFQSVxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiAgICBsb2FkOiBmdW5jdGlvbihmZW4pIHtcbiAgICAgIHJldHVybiBsb2FkKGZlbik7XG4gICAgfSxcblxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXNldCgpO1xuICAgIH0sXG5cbiAgICBtb3ZlczogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgLyogVGhlIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIGEgY2hlc3MgbW92ZSBpcyBpbiAweDg4IGZvcm1hdCwgYW5kXG4gICAgICAgKiBub3QgbWVhbnQgdG8gYmUgaHVtYW4tcmVhZGFibGUuICBUaGUgY29kZSBiZWxvdyBjb252ZXJ0cyB0aGUgMHg4OFxuICAgICAgICogc3F1YXJlIGNvb3JkaW5hdGVzIHRvIGFsZ2VicmFpYyBjb29yZGluYXRlcy4gIEl0IGFsc28gcHJ1bmVzIGFuXG4gICAgICAgKiB1bm5lY2Vzc2FyeSBtb3ZlIGtleXMgcmVzdWx0aW5nIGZyb20gYSB2ZXJib3NlIGNhbGwuXG4gICAgICAgKi9cblxuICAgICAgdmFyIHVnbHlfbW92ZXMgPSBnZW5lcmF0ZV9tb3ZlcyhvcHRpb25zKTtcbiAgICAgIHZhciBtb3ZlcyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdWdseV9tb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXG4gICAgICAgIC8qIGRvZXMgdGhlIHVzZXIgd2FudCBhIGZ1bGwgbW92ZSBvYmplY3QgKG1vc3QgbGlrZWx5IG5vdCksIG9yIGp1c3RcbiAgICAgICAgICogU0FOXG4gICAgICAgICAqL1xuICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgIT09ICd1bmRlZmluZWQnICYmICd2ZXJib3NlJyBpbiBvcHRpb25zICYmXG4gICAgICAgICAgICBvcHRpb25zLnZlcmJvc2UpIHtcbiAgICAgICAgICBtb3Zlcy5wdXNoKG1ha2VfcHJldHR5KHVnbHlfbW92ZXNbaV0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtb3Zlcy5wdXNoKG1vdmVfdG9fc2FuKHVnbHlfbW92ZXNbaV0sIGZhbHNlKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1vdmVzO1xuICAgIH0sXG5cbiAgICBpbl9jaGVjazogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gaW5fY2hlY2soKTtcbiAgICB9LFxuXG4gICAgaW5fY2hlY2ttYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpbl9jaGVja21hdGUoKTtcbiAgICB9LFxuXG4gICAgaW5fc3RhbGVtYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpbl9zdGFsZW1hdGUoKTtcbiAgICB9LFxuXG4gICAgaW5fZHJhdzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gaGFsZl9tb3ZlcyA+PSAxMDAgfHxcbiAgICAgICAgICAgICBpbl9zdGFsZW1hdGUoKSB8fFxuICAgICAgICAgICAgIGluc3VmZmljaWVudF9tYXRlcmlhbCgpIHx8XG4gICAgICAgICAgICAgaW5fdGhyZWVmb2xkX3JlcGV0aXRpb24oKTtcbiAgICB9LFxuXG4gICAgaW5zdWZmaWNpZW50X21hdGVyaWFsOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpbnN1ZmZpY2llbnRfbWF0ZXJpYWwoKTtcbiAgICB9LFxuXG4gICAgaW5fdGhyZWVmb2xkX3JlcGV0aXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGluX3RocmVlZm9sZF9yZXBldGl0aW9uKCk7XG4gICAgfSxcblxuICAgIGdhbWVfb3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gaGFsZl9tb3ZlcyA+PSAxMDAgfHxcbiAgICAgICAgICAgICBpbl9jaGVja21hdGUoKSB8fFxuICAgICAgICAgICAgIGluX3N0YWxlbWF0ZSgpIHx8XG4gICAgICAgICAgICAgaW5zdWZmaWNpZW50X21hdGVyaWFsKCkgfHxcbiAgICAgICAgICAgICBpbl90aHJlZWZvbGRfcmVwZXRpdGlvbigpO1xuICAgIH0sXG5cbiAgICB2YWxpZGF0ZV9mZW46IGZ1bmN0aW9uKGZlbikge1xuICAgICAgcmV0dXJuIHZhbGlkYXRlX2ZlbihmZW4pO1xuICAgIH0sXG5cbiAgICBmZW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGdlbmVyYXRlX2ZlbigpO1xuICAgIH0sXG5cbiAgICBwZ246IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgIC8qIHVzaW5nIHRoZSBzcGVjaWZpY2F0aW9uIGZyb20gaHR0cDovL3d3dy5jaGVzc2NsdWIuY29tL2hlbHAvUEdOLXNwZWNcbiAgICAgICAqIGV4YW1wbGUgZm9yIGh0bWwgdXNhZ2U6IC5wZ24oeyBtYXhfd2lkdGg6IDcyLCBuZXdsaW5lX2NoYXI6IFwiPGJyIC8+XCIgfSlcbiAgICAgICAqL1xuICAgICAgdmFyIG5ld2xpbmUgPSAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgICAgICB0eXBlb2Ygb3B0aW9ucy5uZXdsaW5lX2NoYXIgPT09ICdzdHJpbmcnKSA/XG4gICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm5ld2xpbmVfY2hhciA6ICdcXG4nO1xuICAgICAgdmFyIG1heF93aWR0aCA9ICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIG9wdGlvbnMubWF4X3dpZHRoID09PSAnbnVtYmVyJykgP1xuICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm1heF93aWR0aCA6IDA7XG4gICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICB2YXIgaGVhZGVyX2V4aXN0cyA9IGZhbHNlO1xuXG4gICAgICAvKiBhZGQgdGhlIFBHTiBoZWFkZXIgaGVhZGVycm1hdGlvbiAqL1xuICAgICAgZm9yICh2YXIgaSBpbiBoZWFkZXIpIHtcbiAgICAgICAgLyogVE9ETzogb3JkZXIgb2YgZW51bWVyYXRlZCBwcm9wZXJ0aWVzIGluIGhlYWRlciBvYmplY3QgaXMgbm90XG4gICAgICAgICAqIGd1YXJhbnRlZWQsIHNlZSBFQ01BLTI2MiBzcGVjIChzZWN0aW9uIDEyLjYuNClcbiAgICAgICAgICovXG4gICAgICAgIHJlc3VsdC5wdXNoKCdbJyArIGkgKyAnIFxcXCInICsgaGVhZGVyW2ldICsgJ1xcXCJdJyArIG5ld2xpbmUpO1xuICAgICAgICBoZWFkZXJfZXhpc3RzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGhlYWRlcl9leGlzdHMgJiYgaGlzdG9yeS5sZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0LnB1c2gobmV3bGluZSk7XG4gICAgICB9XG5cbiAgICAgIC8qIHBvcCBhbGwgb2YgaGlzdG9yeSBvbnRvIHJldmVyc2VkX2hpc3RvcnkgKi9cbiAgICAgIHZhciByZXZlcnNlZF9oaXN0b3J5ID0gW107XG4gICAgICB3aGlsZSAoaGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldmVyc2VkX2hpc3RvcnkucHVzaCh1bmRvX21vdmUoKSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBtb3ZlcyA9IFtdO1xuICAgICAgdmFyIG1vdmVfc3RyaW5nID0gJyc7XG5cbiAgICAgIC8qIGJ1aWxkIHRoZSBsaXN0IG9mIG1vdmVzLiAgYSBtb3ZlX3N0cmluZyBsb29rcyBsaWtlOiBcIjMuIGUzIGU2XCIgKi9cbiAgICAgIHdoaWxlIChyZXZlcnNlZF9oaXN0b3J5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIG1vdmUgPSByZXZlcnNlZF9oaXN0b3J5LnBvcCgpO1xuXG4gICAgICAgIC8qIGlmIHRoZSBwb3NpdGlvbiBzdGFydGVkIHdpdGggYmxhY2sgdG8gbW92ZSwgc3RhcnQgUEdOIHdpdGggMS4gLi4uICovXG4gICAgICAgIGlmICghaGlzdG9yeS5sZW5ndGggJiYgbW92ZS5jb2xvciA9PT0gJ2InKSB7XG4gICAgICAgICAgbW92ZV9zdHJpbmcgPSBtb3ZlX251bWJlciArICcuIC4uLic7XG4gICAgICAgIH0gZWxzZSBpZiAobW92ZS5jb2xvciA9PT0gJ3cnKSB7XG4gICAgICAgICAgLyogc3RvcmUgdGhlIHByZXZpb3VzIGdlbmVyYXRlZCBtb3ZlX3N0cmluZyBpZiB3ZSBoYXZlIG9uZSAqL1xuICAgICAgICAgIGlmIChtb3ZlX3N0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG1vdmVzLnB1c2gobW92ZV9zdHJpbmcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtb3ZlX3N0cmluZyA9IG1vdmVfbnVtYmVyICsgJy4nO1xuICAgICAgICB9XG5cbiAgICAgICAgbW92ZV9zdHJpbmcgPSBtb3ZlX3N0cmluZyArICcgJyArIG1vdmVfdG9fc2FuKG1vdmUsIGZhbHNlKTtcbiAgICAgICAgbWFrZV9tb3ZlKG1vdmUpO1xuICAgICAgfVxuXG4gICAgICAvKiBhcmUgdGhlcmUgYW55IG90aGVyIGxlZnRvdmVyIG1vdmVzPyAqL1xuICAgICAgaWYgKG1vdmVfc3RyaW5nLmxlbmd0aCkge1xuICAgICAgICBtb3Zlcy5wdXNoKG1vdmVfc3RyaW5nKTtcbiAgICAgIH1cblxuICAgICAgLyogaXMgdGhlcmUgYSByZXN1bHQ/ICovXG4gICAgICBpZiAodHlwZW9mIGhlYWRlci5SZXN1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vdmVzLnB1c2goaGVhZGVyLlJlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgIC8qIGhpc3Rvcnkgc2hvdWxkIGJlIGJhY2sgdG8gd2hhdCBpcyB3YXMgYmVmb3JlIHdlIHN0YXJ0ZWQgZ2VuZXJhdGluZyBQR04sXG4gICAgICAgKiBzbyBqb2luIHRvZ2V0aGVyIG1vdmVzXG4gICAgICAgKi9cbiAgICAgIGlmIChtYXhfd2lkdGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCcnKSArIG1vdmVzLmpvaW4oJyAnKTtcbiAgICAgIH1cblxuICAgICAgLyogd3JhcCB0aGUgUEdOIG91dHB1dCBhdCBtYXhfd2lkdGggKi9cbiAgICAgIHZhciBjdXJyZW50X3dpZHRoID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW92ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLyogaWYgdGhlIGN1cnJlbnQgbW92ZSB3aWxsIHB1c2ggcGFzdCBtYXhfd2lkdGggKi9cbiAgICAgICAgaWYgKGN1cnJlbnRfd2lkdGggKyBtb3Zlc1tpXS5sZW5ndGggPiBtYXhfd2lkdGggJiYgaSAhPT0gMCkge1xuXG4gICAgICAgICAgLyogZG9uJ3QgZW5kIHRoZSBsaW5lIHdpdGggd2hpdGVzcGFjZSAqL1xuICAgICAgICAgIGlmIChyZXN1bHRbcmVzdWx0Lmxlbmd0aCAtIDFdID09PSAnICcpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXN1bHQucHVzaChuZXdsaW5lKTtcbiAgICAgICAgICBjdXJyZW50X3dpZHRoID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChpICE9PSAwKSB7XG4gICAgICAgICAgcmVzdWx0LnB1c2goJyAnKTtcbiAgICAgICAgICBjdXJyZW50X3dpZHRoKys7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2gobW92ZXNbaV0pO1xuICAgICAgICBjdXJyZW50X3dpZHRoICs9IG1vdmVzW2ldLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdC5qb2luKCcnKTtcbiAgICB9LFxuXG4gICAgbG9hZF9wZ246IGZ1bmN0aW9uKHBnbiwgb3B0aW9ucykge1xuICAgICAgLy8gYWxsb3cgdGhlIHVzZXIgdG8gc3BlY2lmeSB0aGUgc2xvcHB5IG1vdmUgcGFyc2VyIHRvIHdvcmsgYXJvdW5kIG92ZXJcbiAgICAgIC8vIGRpc2FtYmlndWF0aW9uIGJ1Z3MgaW4gRnJpdHogYW5kIENoZXNzYmFzZVxuICAgICAgdmFyIHNsb3BweSA9ICh0eXBlb2Ygb3B0aW9ucyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ3Nsb3BweScgaW4gb3B0aW9ucykgP1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnNsb3BweSA6IGZhbHNlO1xuXG4gICAgICBmdW5jdGlvbiBtYXNrKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFwnKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFzX2tleXMob2JqZWN0KSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBhcnNlX3Bnbl9oZWFkZXIoaGVhZGVyLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBuZXdsaW5lX2NoYXIgPSAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIG9wdGlvbnMubmV3bGluZV9jaGFyID09PSAnc3RyaW5nJykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubmV3bGluZV9jaGFyIDogJ1xccj9cXG4nO1xuICAgICAgICB2YXIgaGVhZGVyX29iaiA9IHt9O1xuICAgICAgICB2YXIgaGVhZGVycyA9IGhlYWRlci5zcGxpdChuZXcgUmVnRXhwKG1hc2sobmV3bGluZV9jaGFyKSkpO1xuICAgICAgICB2YXIga2V5ID0gJyc7XG4gICAgICAgIHZhciB2YWx1ZSA9ICcnO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGVhZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGtleSA9IGhlYWRlcnNbaV0ucmVwbGFjZSgvXlxcWyhbQS1aXVtBLVphLXpdKilcXHMuKlxcXSQvLCAnJDEnKTtcbiAgICAgICAgICB2YWx1ZSA9IGhlYWRlcnNbaV0ucmVwbGFjZSgvXlxcW1tBLVphLXpdK1xcc1wiKC4qKVwiXFxdJC8sICckMScpO1xuICAgICAgICAgIGlmICh0cmltKGtleSkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgaGVhZGVyX29ialtrZXldID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGhlYWRlcl9vYmo7XG4gICAgICB9XG5cbiAgICAgIHZhciBuZXdsaW5lX2NoYXIgPSAodHlwZW9mIG9wdGlvbnMgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBvcHRpb25zLm5ld2xpbmVfY2hhciA9PT0gJ3N0cmluZycpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5uZXdsaW5lX2NoYXIgOiAnXFxyP1xcbic7XG4gICAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCdeKFxcXFxbKC58JyArIG1hc2sobmV3bGluZV9jaGFyKSArICcpKlxcXFxdKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBtYXNrKG5ld2xpbmVfY2hhcikgKyAnKSonICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzEuKCcgKyBtYXNrKG5ld2xpbmVfY2hhcikgKyAnfC4pKiQnLCAnZycpO1xuXG4gICAgICAvKiBnZXQgaGVhZGVyIHBhcnQgb2YgdGhlIFBHTiBmaWxlICovXG4gICAgICB2YXIgaGVhZGVyX3N0cmluZyA9IHBnbi5yZXBsYWNlKHJlZ2V4LCAnJDEnKTtcblxuICAgICAgLyogbm8gaW5mbyBwYXJ0IGdpdmVuLCBiZWdpbnMgd2l0aCBtb3ZlcyAqL1xuICAgICAgaWYgKGhlYWRlcl9zdHJpbmdbMF0gIT09ICdbJykge1xuICAgICAgICBoZWFkZXJfc3RyaW5nID0gJyc7XG4gICAgICB9XG5cbiAgICAgIHJlc2V0KCk7XG5cbiAgICAgIC8qIHBhcnNlIFBHTiBoZWFkZXIgKi9cbiAgICAgIHZhciBoZWFkZXJzID0gcGFyc2VfcGduX2hlYWRlcihoZWFkZXJfc3RyaW5nLCBvcHRpb25zKTtcbiAgICAgIGZvciAodmFyIGtleSBpbiBoZWFkZXJzKSB7XG4gICAgICAgIHNldF9oZWFkZXIoW2tleSwgaGVhZGVyc1trZXldXSk7XG4gICAgICB9XG5cbiAgICAgIC8qIGxvYWQgdGhlIHN0YXJ0aW5nIHBvc2l0aW9uIGluZGljYXRlZCBieSBbU2V0dXAgJzEnXSBhbmRcbiAgICAgICogW0ZFTiBwb3NpdGlvbl0gKi9cbiAgICAgIGlmIChoZWFkZXJzWydTZXRVcCddID09PSAnMScpIHtcbiAgICAgICAgICBpZiAoISgoJ0ZFTicgaW4gaGVhZGVycykgJiYgbG9hZChoZWFkZXJzWydGRU4nXSkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKiBkZWxldGUgaGVhZGVyIHRvIGdldCB0aGUgbW92ZXMgKi9cbiAgICAgIHZhciBtcyA9IHBnbi5yZXBsYWNlKGhlYWRlcl9zdHJpbmcsICcnKS5yZXBsYWNlKG5ldyBSZWdFeHAobWFzayhuZXdsaW5lX2NoYXIpLCAnZycpLCAnICcpO1xuXG4gICAgICAvKiBkZWxldGUgY29tbWVudHMgKi9cbiAgICAgIG1zID0gbXMucmVwbGFjZSgvKFxce1tefV0rXFx9KSs/L2csICcnKTtcblxuICAgICAgLyogZGVsZXRlIHJlY3Vyc2l2ZSBhbm5vdGF0aW9uIHZhcmlhdGlvbnMgKi9cbiAgICAgIHZhciByYXZfcmVnZXggPSAvKFxcKFteXFwoXFwpXStcXCkpKz8vZ1xuICAgICAgd2hpbGUgKHJhdl9yZWdleC50ZXN0KG1zKSkge1xuICAgICAgICBtcyA9IG1zLnJlcGxhY2UocmF2X3JlZ2V4LCAnJyk7XG4gICAgICB9XG5cbiAgICAgIC8qIGRlbGV0ZSBtb3ZlIG51bWJlcnMgKi9cbiAgICAgIG1zID0gbXMucmVwbGFjZSgvXFxkK1xcLihcXC5cXC4pPy9nLCAnJyk7XG5cbiAgICAgIC8qIGRlbGV0ZSAuLi4gaW5kaWNhdGluZyBibGFjayB0byBtb3ZlICovXG4gICAgICBtcyA9IG1zLnJlcGxhY2UoL1xcLlxcLlxcLi9nLCAnJyk7XG5cbiAgICAgIC8qIGRlbGV0ZSBudW1lcmljIGFubm90YXRpb24gZ2x5cGhzICovXG4gICAgICBtcyA9IG1zLnJlcGxhY2UoL1xcJFxcZCsvZywgJycpO1xuXG4gICAgICAvKiB0cmltIGFuZCBnZXQgYXJyYXkgb2YgbW92ZXMgKi9cbiAgICAgIHZhciBtb3ZlcyA9IHRyaW0obXMpLnNwbGl0KG5ldyBSZWdFeHAoL1xccysvKSk7XG5cbiAgICAgIC8qIGRlbGV0ZSBlbXB0eSBlbnRyaWVzICovXG4gICAgICBtb3ZlcyA9IG1vdmVzLmpvaW4oJywnKS5yZXBsYWNlKC8sLCsvZywgJywnKS5zcGxpdCgnLCcpO1xuICAgICAgdmFyIG1vdmUgPSAnJztcblxuICAgICAgZm9yICh2YXIgaGFsZl9tb3ZlID0gMDsgaGFsZl9tb3ZlIDwgbW92ZXMubGVuZ3RoIC0gMTsgaGFsZl9tb3ZlKyspIHtcbiAgICAgICAgbW92ZSA9IG1vdmVfZnJvbV9zYW4obW92ZXNbaGFsZl9tb3ZlXSwgc2xvcHB5KTtcblxuICAgICAgICAvKiBtb3ZlIG5vdCBwb3NzaWJsZSEgKGRvbid0IGNsZWFyIHRoZSBib2FyZCB0byBleGFtaW5lIHRvIHNob3cgdGhlXG4gICAgICAgICAqIGxhdGVzdCB2YWxpZCBwb3NpdGlvbilcbiAgICAgICAgICovXG4gICAgICAgIGlmIChtb3ZlID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWFrZV9tb3ZlKG1vdmUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8qIGV4YW1pbmUgbGFzdCBtb3ZlICovXG4gICAgICBtb3ZlID0gbW92ZXNbbW92ZXMubGVuZ3RoIC0gMV07XG4gICAgICBpZiAoUE9TU0lCTEVfUkVTVUxUUy5pbmRleE9mKG1vdmUpID4gLTEpIHtcbiAgICAgICAgaWYgKGhhc19rZXlzKGhlYWRlcikgJiYgdHlwZW9mIGhlYWRlci5SZXN1bHQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgc2V0X2hlYWRlcihbJ1Jlc3VsdCcsIG1vdmVdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG1vdmUgPSBtb3ZlX2Zyb21fc2FuKG1vdmUsIHNsb3BweSk7XG4gICAgICAgIGlmIChtb3ZlID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWFrZV9tb3ZlKG1vdmUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgaGVhZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBzZXRfaGVhZGVyKGFyZ3VtZW50cyk7XG4gICAgfSxcblxuICAgIGFzY2lpOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhc2NpaSgpO1xuICAgIH0sXG5cbiAgICB0dXJuOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0dXJuO1xuICAgIH0sXG5cbiAgICBtb3ZlOiBmdW5jdGlvbihtb3ZlLCBvcHRpb25zKSB7XG4gICAgICAvKiBUaGUgbW92ZSBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIHdpdGggaW4gdGhlIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICAgICAgICpcbiAgICAgICAqIC5tb3ZlKCdOeGI3JykgICAgICA8LSB3aGVyZSAnbW92ZScgaXMgYSBjYXNlLXNlbnNpdGl2ZSBTQU4gc3RyaW5nXG4gICAgICAgKlxuICAgICAgICogLm1vdmUoeyBmcm9tOiAnaDcnLCA8LSB3aGVyZSB0aGUgJ21vdmUnIGlzIGEgbW92ZSBvYmplY3QgKGFkZGl0aW9uYWxcbiAgICAgICAqICAgICAgICAgdG8gOidoOCcsICAgICAgZmllbGRzIGFyZSBpZ25vcmVkKVxuICAgICAgICogICAgICAgICBwcm9tb3Rpb246ICdxJyxcbiAgICAgICAqICAgICAgfSlcbiAgICAgICAqL1xuXG4gICAgICAvLyBhbGxvdyB0aGUgdXNlciB0byBzcGVjaWZ5IHRoZSBzbG9wcHkgbW92ZSBwYXJzZXIgdG8gd29yayBhcm91bmQgb3ZlclxuICAgICAgLy8gZGlzYW1iaWd1YXRpb24gYnVncyBpbiBGcml0eiBhbmQgQ2hlc3NiYXNlXG4gICAgICB2YXIgc2xvcHB5ID0gKHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJyAmJiAnc2xvcHB5JyBpbiBvcHRpb25zKSA/XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuc2xvcHB5IDogZmFsc2U7XG5cbiAgICAgIHZhciBtb3ZlX29iaiA9IG51bGw7XG5cbiAgICAgIGlmICh0eXBlb2YgbW92ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbW92ZV9vYmogPSBtb3ZlX2Zyb21fc2FuKG1vdmUsIHNsb3BweSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb3ZlID09PSAnb2JqZWN0Jykge1xuICAgICAgICB2YXIgbW92ZXMgPSBnZW5lcmF0ZV9tb3ZlcygpO1xuXG4gICAgICAgIC8qIGNvbnZlcnQgdGhlIHByZXR0eSBtb3ZlIG9iamVjdCB0byBhbiB1Z2x5IG1vdmUgb2JqZWN0ICovXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBtb3Zlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGlmIChtb3ZlLmZyb20gPT09IGFsZ2VicmFpYyhtb3Zlc1tpXS5mcm9tKSAmJlxuICAgICAgICAgICAgICBtb3ZlLnRvID09PSBhbGdlYnJhaWMobW92ZXNbaV0udG8pICYmXG4gICAgICAgICAgICAgICghKCdwcm9tb3Rpb24nIGluIG1vdmVzW2ldKSB8fFxuICAgICAgICAgICAgICBtb3ZlLnByb21vdGlvbiA9PT0gbW92ZXNbaV0ucHJvbW90aW9uKSkge1xuICAgICAgICAgICAgbW92ZV9vYmogPSBtb3Zlc1tpXTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvKiBmYWlsZWQgdG8gZmluZCBtb3ZlICovXG4gICAgICBpZiAoIW1vdmVfb2JqKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvKiBuZWVkIHRvIG1ha2UgYSBjb3B5IG9mIG1vdmUgYmVjYXVzZSB3ZSBjYW4ndCBnZW5lcmF0ZSBTQU4gYWZ0ZXIgdGhlXG4gICAgICAgKiBtb3ZlIGlzIG1hZGVcbiAgICAgICAqL1xuICAgICAgdmFyIHByZXR0eV9tb3ZlID0gbWFrZV9wcmV0dHkobW92ZV9vYmopO1xuXG4gICAgICBtYWtlX21vdmUobW92ZV9vYmopO1xuXG4gICAgICByZXR1cm4gcHJldHR5X21vdmU7XG4gICAgfSxcblxuICAgIHVuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG1vdmUgPSB1bmRvX21vdmUoKTtcbiAgICAgIHJldHVybiAobW92ZSkgPyBtYWtlX3ByZXR0eShtb3ZlKSA6IG51bGw7XG4gICAgfSxcblxuICAgIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjbGVhcigpO1xuICAgIH0sXG5cbiAgICBwdXQ6IGZ1bmN0aW9uKHBpZWNlLCBzcXVhcmUpIHtcbiAgICAgIHJldHVybiBwdXQocGllY2UsIHNxdWFyZSk7XG4gICAgfSxcblxuICAgIGdldDogZnVuY3Rpb24oc3F1YXJlKSB7XG4gICAgICByZXR1cm4gZ2V0KHNxdWFyZSk7XG4gICAgfSxcblxuICAgIHJlbW92ZTogZnVuY3Rpb24oc3F1YXJlKSB7XG4gICAgICByZXR1cm4gcmVtb3ZlKHNxdWFyZSk7XG4gICAgfSxcblxuICAgIHBlcmZ0OiBmdW5jdGlvbihkZXB0aCkge1xuICAgICAgcmV0dXJuIHBlcmZ0KGRlcHRoKTtcbiAgICB9LFxuXG4gICAgc3F1YXJlX2NvbG9yOiBmdW5jdGlvbihzcXVhcmUpIHtcbiAgICAgIGlmIChzcXVhcmUgaW4gU1FVQVJFUykge1xuICAgICAgICB2YXIgc3FfMHg4OCA9IFNRVUFSRVNbc3F1YXJlXTtcbiAgICAgICAgcmV0dXJuICgocmFuayhzcV8weDg4KSArIGZpbGUoc3FfMHg4OCkpICUgMiA9PT0gMCkgPyAnbGlnaHQnIDogJ2RhcmsnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgaGlzdG9yeTogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgdmFyIHJldmVyc2VkX2hpc3RvcnkgPSBbXTtcbiAgICAgIHZhciBtb3ZlX2hpc3RvcnkgPSBbXTtcbiAgICAgIHZhciB2ZXJib3NlID0gKHR5cGVvZiBvcHRpb25zICE9PSAndW5kZWZpbmVkJyAmJiAndmVyYm9zZScgaW4gb3B0aW9ucyAmJlxuICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy52ZXJib3NlKTtcblxuICAgICAgd2hpbGUgKGhpc3RvcnkubGVuZ3RoID4gMCkge1xuICAgICAgICByZXZlcnNlZF9oaXN0b3J5LnB1c2godW5kb19tb3ZlKCkpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAocmV2ZXJzZWRfaGlzdG9yeS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBtb3ZlID0gcmV2ZXJzZWRfaGlzdG9yeS5wb3AoKTtcbiAgICAgICAgaWYgKHZlcmJvc2UpIHtcbiAgICAgICAgICBtb3ZlX2hpc3RvcnkucHVzaChtYWtlX3ByZXR0eShtb3ZlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbW92ZV9oaXN0b3J5LnB1c2gobW92ZV90b19zYW4obW92ZSkpO1xuICAgICAgICB9XG4gICAgICAgIG1ha2VfbW92ZShtb3ZlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1vdmVfaGlzdG9yeTtcbiAgICB9XG5cbiAgfTtcbn07XG5cbi8qIGV4cG9ydCBDaGVzcyBvYmplY3QgaWYgdXNpbmcgbm9kZSBvciBhbnkgb3RoZXIgQ29tbW9uSlMgY29tcGF0aWJsZVxuICogZW52aXJvbm1lbnQgKi9cbmlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIGV4cG9ydHMuQ2hlc3MgPSBDaGVzcztcbi8qIGV4cG9ydCBDaGVzcyBvYmplY3QgZm9yIGFueSBSZXF1aXJlSlMgY29tcGF0aWJsZSBlbnZpcm9ubWVudCAqL1xuaWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnKSBkZWZpbmUoIGZ1bmN0aW9uICgpIHsgcmV0dXJuIENoZXNzOyAgfSk7XG4iLCIgIC8qIGdsb2JhbHMgcmVxdWlyZSwgbW9kdWxlICovXG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKlxuICAgKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICAgKi9cblxuICB2YXIgcGF0aHRvUmVnZXhwID0gcmVxdWlyZSgncGF0aC10by1yZWdleHAnKTtcblxuICAvKipcbiAgICogTW9kdWxlIGV4cG9ydHMuXG4gICAqL1xuXG4gIG1vZHVsZS5leHBvcnRzID0gcGFnZTtcblxuICAvKipcbiAgICogRGV0ZWN0IGNsaWNrIGV2ZW50XG4gICAqL1xuICB2YXIgY2xpY2tFdmVudCA9ICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIGRvY3VtZW50KSAmJiBkb2N1bWVudC5vbnRvdWNoc3RhcnQgPyAndG91Y2hzdGFydCcgOiAnY2xpY2snO1xuXG4gIC8qKlxuICAgKiBUbyB3b3JrIHByb3Blcmx5IHdpdGggdGhlIFVSTFxuICAgKiBoaXN0b3J5LmxvY2F0aW9uIGdlbmVyYXRlZCBwb2x5ZmlsbCBpbiBodHRwczovL2dpdGh1Yi5jb20vZGV2b3RlL0hUTUw1LUhpc3RvcnktQVBJXG4gICAqL1xuXG4gIHZhciBsb2NhdGlvbiA9ICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHdpbmRvdykgJiYgKHdpbmRvdy5oaXN0b3J5LmxvY2F0aW9uIHx8IHdpbmRvdy5sb2NhdGlvbik7XG5cbiAgLyoqXG4gICAqIFBlcmZvcm0gaW5pdGlhbCBkaXNwYXRjaC5cbiAgICovXG5cbiAgdmFyIGRpc3BhdGNoID0gdHJ1ZTtcblxuXG4gIC8qKlxuICAgKiBEZWNvZGUgVVJMIGNvbXBvbmVudHMgKHF1ZXJ5IHN0cmluZywgcGF0aG5hbWUsIGhhc2gpLlxuICAgKiBBY2NvbW1vZGF0ZXMgYm90aCByZWd1bGFyIHBlcmNlbnQgZW5jb2RpbmcgYW5kIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBmb3JtYXQuXG4gICAqL1xuICB2YXIgZGVjb2RlVVJMQ29tcG9uZW50cyA9IHRydWU7XG5cbiAgLyoqXG4gICAqIEJhc2UgcGF0aC5cbiAgICovXG5cbiAgdmFyIGJhc2UgPSAnJztcblxuICAvKipcbiAgICogUnVubmluZyBmbGFnLlxuICAgKi9cblxuICB2YXIgcnVubmluZztcblxuICAvKipcbiAgICogSGFzaEJhbmcgb3B0aW9uXG4gICAqL1xuXG4gIHZhciBoYXNoYmFuZyA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBQcmV2aW91cyBjb250ZXh0LCBmb3IgY2FwdHVyaW5nXG4gICAqIHBhZ2UgZXhpdCBldmVudHMuXG4gICAqL1xuXG4gIHZhciBwcmV2Q29udGV4dDtcblxuICAvKipcbiAgICogUmVnaXN0ZXIgYHBhdGhgIHdpdGggY2FsbGJhY2sgYGZuKClgLFxuICAgKiBvciByb3V0ZSBgcGF0aGAsIG9yIHJlZGlyZWN0aW9uLFxuICAgKiBvciBgcGFnZS5zdGFydCgpYC5cbiAgICpcbiAgICogICBwYWdlKGZuKTtcbiAgICogICBwYWdlKCcqJywgZm4pO1xuICAgKiAgIHBhZ2UoJy91c2VyLzppZCcsIGxvYWQsIHVzZXIpO1xuICAgKiAgIHBhZ2UoJy91c2VyLycgKyB1c2VyLmlkLCB7IHNvbWU6ICd0aGluZycgfSk7XG4gICAqICAgcGFnZSgnL3VzZXIvJyArIHVzZXIuaWQpO1xuICAgKiAgIHBhZ2UoJy9mcm9tJywgJy90bycpXG4gICAqICAgcGFnZSgpO1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3whRnVuY3Rpb258IU9iamVjdH0gcGF0aFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9uPX0gZm5cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gcGFnZShwYXRoLCBmbikge1xuICAgIC8vIDxjYWxsYmFjaz5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHBhdGgpIHtcbiAgICAgIHJldHVybiBwYWdlKCcqJywgcGF0aCk7XG4gICAgfVxuXG4gICAgLy8gcm91dGUgPHBhdGg+IHRvIDxjYWxsYmFjayAuLi4+XG4gICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBmbikge1xuICAgICAgdmFyIHJvdXRlID0gbmV3IFJvdXRlKC8qKiBAdHlwZSB7c3RyaW5nfSAqLyAocGF0aCkpO1xuICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgcGFnZS5jYWxsYmFja3MucHVzaChyb3V0ZS5taWRkbGV3YXJlKGFyZ3VtZW50c1tpXSkpO1xuICAgICAgfVxuICAgICAgLy8gc2hvdyA8cGF0aD4gd2l0aCBbc3RhdGVdXG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHBhdGgpIHtcbiAgICAgIHBhZ2VbJ3N0cmluZycgPT09IHR5cGVvZiBmbiA/ICdyZWRpcmVjdCcgOiAnc2hvdyddKHBhdGgsIGZuKTtcbiAgICAgIC8vIHN0YXJ0IFtvcHRpb25zXVxuICAgIH0gZWxzZSB7XG4gICAgICBwYWdlLnN0YXJ0KHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsYmFjayBmdW5jdGlvbnMuXG4gICAqL1xuXG4gIHBhZ2UuY2FsbGJhY2tzID0gW107XG4gIHBhZ2UuZXhpdHMgPSBbXTtcblxuICAvKipcbiAgICogQ3VycmVudCBwYXRoIGJlaW5nIHByb2Nlc3NlZFxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKi9cbiAgcGFnZS5jdXJyZW50ID0gJyc7XG5cbiAgLyoqXG4gICAqIE51bWJlciBvZiBwYWdlcyBuYXZpZ2F0ZWQgdG8uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqXG4gICAqICAgICBwYWdlLmxlbiA9PSAwO1xuICAgKiAgICAgcGFnZSgnL2xvZ2luJyk7XG4gICAqICAgICBwYWdlLmxlbiA9PSAxO1xuICAgKi9cblxuICBwYWdlLmxlbiA9IDA7XG5cbiAgLyoqXG4gICAqIEdldCBvciBzZXQgYmFzZXBhdGggdG8gYHBhdGhgLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLmJhc2UgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgaWYgKDAgPT09IGFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBiYXNlO1xuICAgIGJhc2UgPSBwYXRoO1xuICB9O1xuXG4gIC8qKlxuICAgKiBCaW5kIHdpdGggdGhlIGdpdmVuIGBvcHRpb25zYC5cbiAgICpcbiAgICogT3B0aW9uczpcbiAgICpcbiAgICogICAgLSBgY2xpY2tgIGJpbmQgdG8gY2xpY2sgZXZlbnRzIFt0cnVlXVxuICAgKiAgICAtIGBwb3BzdGF0ZWAgYmluZCB0byBwb3BzdGF0ZSBbdHJ1ZV1cbiAgICogICAgLSBgZGlzcGF0Y2hgIHBlcmZvcm0gaW5pdGlhbCBkaXNwYXRjaCBbdHJ1ZV1cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zdGFydCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBpZiAocnVubmluZykgcmV0dXJuO1xuICAgIHJ1bm5pbmcgPSB0cnVlO1xuICAgIGlmIChmYWxzZSA9PT0gb3B0aW9ucy5kaXNwYXRjaCkgZGlzcGF0Y2ggPSBmYWxzZTtcbiAgICBpZiAoZmFsc2UgPT09IG9wdGlvbnMuZGVjb2RlVVJMQ29tcG9uZW50cykgZGVjb2RlVVJMQ29tcG9uZW50cyA9IGZhbHNlO1xuICAgIGlmIChmYWxzZSAhPT0gb3B0aW9ucy5wb3BzdGF0ZSkgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgb25wb3BzdGF0ZSwgZmFsc2UpO1xuICAgIGlmIChmYWxzZSAhPT0gb3B0aW9ucy5jbGljaykge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50LCBvbmNsaWNrLCBmYWxzZSk7XG4gICAgfVxuICAgIGlmICh0cnVlID09PSBvcHRpb25zLmhhc2hiYW5nKSBoYXNoYmFuZyA9IHRydWU7XG4gICAgaWYgKCFkaXNwYXRjaCkgcmV0dXJuO1xuICAgIHZhciB1cmwgPSAoaGFzaGJhbmcgJiYgfmxvY2F0aW9uLmhhc2guaW5kZXhPZignIyEnKSkgPyBsb2NhdGlvbi5oYXNoLnN1YnN0cigyKSArIGxvY2F0aW9uLnNlYXJjaCA6IGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uc2VhcmNoICsgbG9jYXRpb24uaGFzaDtcbiAgICBwYWdlLnJlcGxhY2UodXJsLCBudWxsLCB0cnVlLCBkaXNwYXRjaCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFVuYmluZCBjbGljayBhbmQgcG9wc3RhdGUgZXZlbnQgaGFuZGxlcnMuXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2Uuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghcnVubmluZykgcmV0dXJuO1xuICAgIHBhZ2UuY3VycmVudCA9ICcnO1xuICAgIHBhZ2UubGVuID0gMDtcbiAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihjbGlja0V2ZW50LCBvbmNsaWNrLCBmYWxzZSk7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgb25wb3BzdGF0ZSwgZmFsc2UpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTaG93IGBwYXRoYCB3aXRoIG9wdGlvbmFsIGBzdGF0ZWAgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdD19IHN0YXRlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGRpc3BhdGNoXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHB1c2hcbiAgICogQHJldHVybiB7IUNvbnRleHR9XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2Uuc2hvdyA9IGZ1bmN0aW9uKHBhdGgsIHN0YXRlLCBkaXNwYXRjaCwgcHVzaCkge1xuICAgIHZhciBjdHggPSBuZXcgQ29udGV4dChwYXRoLCBzdGF0ZSk7XG4gICAgcGFnZS5jdXJyZW50ID0gY3R4LnBhdGg7XG4gICAgaWYgKGZhbHNlICE9PSBkaXNwYXRjaCkgcGFnZS5kaXNwYXRjaChjdHgpO1xuICAgIGlmIChmYWxzZSAhPT0gY3R4LmhhbmRsZWQgJiYgZmFsc2UgIT09IHB1c2gpIGN0eC5wdXNoU3RhdGUoKTtcbiAgICByZXR1cm4gY3R4O1xuICB9O1xuXG4gIC8qKlxuICAgKiBHb2VzIGJhY2sgaW4gdGhlIGhpc3RvcnlcbiAgICogQmFjayBzaG91bGQgYWx3YXlzIGxldCB0aGUgY3VycmVudCByb3V0ZSBwdXNoIHN0YXRlIGFuZCB0aGVuIGdvIGJhY2suXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIC0gZmFsbGJhY2sgcGF0aCB0byBnbyBiYWNrIGlmIG5vIG1vcmUgaGlzdG9yeSBleGlzdHMsIGlmIHVuZGVmaW5lZCBkZWZhdWx0cyB0byBwYWdlLmJhc2VcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBzdGF0ZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLmJhY2sgPSBmdW5jdGlvbihwYXRoLCBzdGF0ZSkge1xuICAgIGlmIChwYWdlLmxlbiA+IDApIHtcbiAgICAgIC8vIHRoaXMgbWF5IG5lZWQgbW9yZSB0ZXN0aW5nIHRvIHNlZSBpZiBhbGwgYnJvd3NlcnNcbiAgICAgIC8vIHdhaXQgZm9yIHRoZSBuZXh0IHRpY2sgdG8gZ28gYmFjayBpbiBoaXN0b3J5XG4gICAgICBoaXN0b3J5LmJhY2soKTtcbiAgICAgIHBhZ2UubGVuLS07XG4gICAgfSBlbHNlIGlmIChwYXRoKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBwYWdlLnNob3cocGF0aCwgc3RhdGUpO1xuICAgICAgfSk7XG4gICAgfWVsc2V7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBwYWdlLnNob3coYmFzZSwgc3RhdGUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIHJvdXRlIHRvIHJlZGlyZWN0IGZyb20gb25lIHBhdGggdG8gb3RoZXJcbiAgICogb3IganVzdCByZWRpcmVjdCB0byBhbm90aGVyIHJvdXRlXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tIC0gaWYgcGFyYW0gJ3RvJyBpcyB1bmRlZmluZWQgcmVkaXJlY3RzIHRvICdmcm9tJ1xuICAgKiBAcGFyYW0ge3N0cmluZz19IHRvXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuICBwYWdlLnJlZGlyZWN0ID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgICAvLyBEZWZpbmUgcm91dGUgZnJvbSBhIHBhdGggdG8gYW5vdGhlclxuICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGZyb20gJiYgJ3N0cmluZycgPT09IHR5cGVvZiB0bykge1xuICAgICAgcGFnZShmcm9tLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcGFnZS5yZXBsYWNlKC8qKiBAdHlwZSB7IXN0cmluZ30gKi8gKHRvKSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gV2FpdCBmb3IgdGhlIHB1c2ggc3RhdGUgYW5kIHJlcGxhY2UgaXQgd2l0aCBhbm90aGVyXG4gICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgZnJvbSAmJiAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHRvKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBwYWdlLnJlcGxhY2UoZnJvbSk7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgYHBhdGhgIHdpdGggb3B0aW9uYWwgYHN0YXRlYCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gc3RhdGVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gaW5pdFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBkaXNwYXRjaFxuICAgKiBAcmV0dXJuIHshQ29udGV4dH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cblxuICBwYWdlLnJlcGxhY2UgPSBmdW5jdGlvbihwYXRoLCBzdGF0ZSwgaW5pdCwgZGlzcGF0Y2gpIHtcbiAgICB2YXIgY3R4ID0gbmV3IENvbnRleHQocGF0aCwgc3RhdGUpO1xuICAgIHBhZ2UuY3VycmVudCA9IGN0eC5wYXRoO1xuICAgIGN0eC5pbml0ID0gaW5pdDtcbiAgICBjdHguc2F2ZSgpOyAvLyBzYXZlIGJlZm9yZSBkaXNwYXRjaGluZywgd2hpY2ggbWF5IHJlZGlyZWN0XG4gICAgaWYgKGZhbHNlICE9PSBkaXNwYXRjaCkgcGFnZS5kaXNwYXRjaChjdHgpO1xuICAgIHJldHVybiBjdHg7XG4gIH07XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoIHRoZSBnaXZlbiBgY3R4YC5cbiAgICpcbiAgICogQHBhcmFtIHtDb250ZXh0fSBjdHhcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBwYWdlLmRpc3BhdGNoID0gZnVuY3Rpb24oY3R4KSB7XG4gICAgdmFyIHByZXYgPSBwcmV2Q29udGV4dCxcbiAgICAgIGkgPSAwLFxuICAgICAgaiA9IDA7XG5cbiAgICBwcmV2Q29udGV4dCA9IGN0eDtcblxuICAgIGZ1bmN0aW9uIG5leHRFeGl0KCkge1xuICAgICAgdmFyIGZuID0gcGFnZS5leGl0c1tqKytdO1xuICAgICAgaWYgKCFmbikgcmV0dXJuIG5leHRFbnRlcigpO1xuICAgICAgZm4ocHJldiwgbmV4dEV4aXQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5leHRFbnRlcigpIHtcbiAgICAgIHZhciBmbiA9IHBhZ2UuY2FsbGJhY2tzW2krK107XG5cbiAgICAgIGlmIChjdHgucGF0aCAhPT0gcGFnZS5jdXJyZW50KSB7XG4gICAgICAgIGN0eC5oYW5kbGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghZm4pIHJldHVybiB1bmhhbmRsZWQoY3R4KTtcbiAgICAgIGZuKGN0eCwgbmV4dEVudGVyKTtcbiAgICB9XG5cbiAgICBpZiAocHJldikge1xuICAgICAgbmV4dEV4aXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dEVudGVyKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBVbmhhbmRsZWQgYGN0eGAuIFdoZW4gaXQncyBub3QgdGhlIGluaXRpYWxcbiAgICogcG9wc3RhdGUgdGhlbiByZWRpcmVjdC4gSWYgeW91IHdpc2ggdG8gaGFuZGxlXG4gICAqIDQwNHMgb24geW91ciBvd24gdXNlIGBwYWdlKCcqJywgY2FsbGJhY2spYC5cbiAgICpcbiAgICogQHBhcmFtIHtDb250ZXh0fSBjdHhcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiB1bmhhbmRsZWQoY3R4KSB7XG4gICAgaWYgKGN0eC5oYW5kbGVkKSByZXR1cm47XG4gICAgdmFyIGN1cnJlbnQ7XG5cbiAgICBpZiAoaGFzaGJhbmcpIHtcbiAgICAgIGN1cnJlbnQgPSBiYXNlICsgbG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjIScsICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudCA9IGxvY2F0aW9uLnBhdGhuYW1lICsgbG9jYXRpb24uc2VhcmNoO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50ID09PSBjdHguY2Fub25pY2FsUGF0aCkgcmV0dXJuO1xuICAgIHBhZ2Uuc3RvcCgpO1xuICAgIGN0eC5oYW5kbGVkID0gZmFsc2U7XG4gICAgbG9jYXRpb24uaHJlZiA9IGN0eC5jYW5vbmljYWxQYXRoO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGFuIGV4aXQgcm91dGUgb24gYHBhdGhgIHdpdGhcbiAgICogY2FsbGJhY2sgYGZuKClgLCB3aGljaCB3aWxsIGJlIGNhbGxlZFxuICAgKiBvbiB0aGUgcHJldmlvdXMgY29udGV4dCB3aGVuIGEgbmV3XG4gICAqIHBhZ2UgaXMgdmlzaXRlZC5cbiAgICovXG4gIHBhZ2UuZXhpdCA9IGZ1bmN0aW9uKHBhdGgsIGZuKSB7XG4gICAgaWYgKHR5cGVvZiBwYXRoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcGFnZS5leGl0KCcqJywgcGF0aCk7XG4gICAgfVxuXG4gICAgdmFyIHJvdXRlID0gbmV3IFJvdXRlKHBhdGgpO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgKytpKSB7XG4gICAgICBwYWdlLmV4aXRzLnB1c2gocm91dGUubWlkZGxld2FyZShhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBVUkwgZW5jb2RpbmcgZnJvbSB0aGUgZ2l2ZW4gYHN0cmAuXG4gICAqIEFjY29tbW9kYXRlcyB3aGl0ZXNwYWNlIGluIGJvdGggeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICAqIGFuZCByZWd1bGFyIHBlcmNlbnQtZW5jb2RlZCBmb3JtLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsIC0gVVJMIGNvbXBvbmVudCB0byBkZWNvZGVcbiAgICovXG4gIGZ1bmN0aW9uIGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQodmFsKSB7XG4gICAgaWYgKHR5cGVvZiB2YWwgIT09ICdzdHJpbmcnKSB7IHJldHVybiB2YWw7IH1cbiAgICByZXR1cm4gZGVjb2RlVVJMQ29tcG9uZW50cyA/IGRlY29kZVVSSUNvbXBvbmVudCh2YWwucmVwbGFjZSgvXFwrL2csICcgJykpIDogdmFsO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgYSBuZXcgXCJyZXF1ZXN0XCIgYENvbnRleHRgXG4gICAqIHdpdGggdGhlIGdpdmVuIGBwYXRoYCBhbmQgb3B0aW9uYWwgaW5pdGlhbCBgc3RhdGVgLlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBzdGF0ZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBDb250ZXh0KHBhdGgsIHN0YXRlKSB7XG4gICAgaWYgKCcvJyA9PT0gcGF0aFswXSAmJiAwICE9PSBwYXRoLmluZGV4T2YoYmFzZSkpIHBhdGggPSBiYXNlICsgKGhhc2hiYW5nID8gJyMhJyA6ICcnKSArIHBhdGg7XG4gICAgdmFyIGkgPSBwYXRoLmluZGV4T2YoJz8nKTtcblxuICAgIHRoaXMuY2Fub25pY2FsUGF0aCA9IHBhdGg7XG4gICAgdGhpcy5wYXRoID0gcGF0aC5yZXBsYWNlKGJhc2UsICcnKSB8fCAnLyc7XG4gICAgaWYgKGhhc2hiYW5nKSB0aGlzLnBhdGggPSB0aGlzLnBhdGgucmVwbGFjZSgnIyEnLCAnJykgfHwgJy8nO1xuXG4gICAgdGhpcy50aXRsZSA9IGRvY3VtZW50LnRpdGxlO1xuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZSB8fCB7fTtcbiAgICB0aGlzLnN0YXRlLnBhdGggPSBwYXRoO1xuICAgIHRoaXMucXVlcnlzdHJpbmcgPSB+aSA/IGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQocGF0aC5zbGljZShpICsgMSkpIDogJyc7XG4gICAgdGhpcy5wYXRobmFtZSA9IGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQofmkgPyBwYXRoLnNsaWNlKDAsIGkpIDogcGF0aCk7XG4gICAgdGhpcy5wYXJhbXMgPSB7fTtcblxuICAgIC8vIGZyYWdtZW50XG4gICAgdGhpcy5oYXNoID0gJyc7XG4gICAgaWYgKCFoYXNoYmFuZykge1xuICAgICAgaWYgKCF+dGhpcy5wYXRoLmluZGV4T2YoJyMnKSkgcmV0dXJuO1xuICAgICAgdmFyIHBhcnRzID0gdGhpcy5wYXRoLnNwbGl0KCcjJyk7XG4gICAgICB0aGlzLnBhdGggPSBwYXJ0c1swXTtcbiAgICAgIHRoaXMuaGFzaCA9IGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQocGFydHNbMV0pIHx8ICcnO1xuICAgICAgdGhpcy5xdWVyeXN0cmluZyA9IHRoaXMucXVlcnlzdHJpbmcuc3BsaXQoJyMnKVswXTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlIGBDb250ZXh0YC5cbiAgICovXG5cbiAgcGFnZS5Db250ZXh0ID0gQ29udGV4dDtcblxuICAvKipcbiAgICogUHVzaCBzdGF0ZS5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIENvbnRleHQucHJvdG90eXBlLnB1c2hTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHBhZ2UubGVuKys7XG4gICAgaGlzdG9yeS5wdXNoU3RhdGUodGhpcy5zdGF0ZSwgdGhpcy50aXRsZSwgaGFzaGJhbmcgJiYgdGhpcy5wYXRoICE9PSAnLycgPyAnIyEnICsgdGhpcy5wYXRoIDogdGhpcy5jYW5vbmljYWxQYXRoKTtcbiAgfTtcblxuICAvKipcbiAgICogU2F2ZSB0aGUgY29udGV4dCBzdGF0ZS5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgQ29udGV4dC5wcm90b3R5cGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKHRoaXMuc3RhdGUsIHRoaXMudGl0bGUsIGhhc2hiYW5nICYmIHRoaXMucGF0aCAhPT0gJy8nID8gJyMhJyArIHRoaXMucGF0aCA6IHRoaXMuY2Fub25pY2FsUGF0aCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgYFJvdXRlYCB3aXRoIHRoZSBnaXZlbiBIVFRQIGBwYXRoYCxcbiAgICogYW5kIGFuIGFycmF5IG9mIGBjYWxsYmFja3NgIGFuZCBgb3B0aW9uc2AuXG4gICAqXG4gICAqIE9wdGlvbnM6XG4gICAqXG4gICAqICAgLSBgc2Vuc2l0aXZlYCAgICBlbmFibGUgY2FzZS1zZW5zaXRpdmUgcm91dGVzXG4gICAqICAgLSBgc3RyaWN0YCAgICAgICBlbmFibGUgc3RyaWN0IG1hdGNoaW5nIGZvciB0cmFpbGluZyBzbGFzaGVzXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdD19IG9wdGlvbnNcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIFJvdXRlKHBhdGgsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLnBhdGggPSAocGF0aCA9PT0gJyonKSA/ICcoLiopJyA6IHBhdGg7XG4gICAgdGhpcy5tZXRob2QgPSAnR0VUJztcbiAgICB0aGlzLnJlZ2V4cCA9IHBhdGh0b1JlZ2V4cCh0aGlzLnBhdGgsXG4gICAgICB0aGlzLmtleXMgPSBbXSxcbiAgICAgIG9wdGlvbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBgUm91dGVgLlxuICAgKi9cblxuICBwYWdlLlJvdXRlID0gUm91dGU7XG5cbiAgLyoqXG4gICAqIFJldHVybiByb3V0ZSBtaWRkbGV3YXJlIHdpdGhcbiAgICogdGhlIGdpdmVuIGNhbGxiYWNrIGBmbigpYC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFJvdXRlLnByb3RvdHlwZS5taWRkbGV3YXJlID0gZnVuY3Rpb24oZm4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGN0eCwgbmV4dCkge1xuICAgICAgaWYgKHNlbGYubWF0Y2goY3R4LnBhdGgsIGN0eC5wYXJhbXMpKSByZXR1cm4gZm4oY3R4LCBuZXh0KTtcbiAgICAgIG5leHQoKTtcbiAgICB9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGlzIHJvdXRlIG1hdGNoZXMgYHBhdGhgLCBpZiBzb1xuICAgKiBwb3B1bGF0ZSBgcGFyYW1zYC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtc1xuICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgUm91dGUucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24ocGF0aCwgcGFyYW1zKSB7XG4gICAgdmFyIGtleXMgPSB0aGlzLmtleXMsXG4gICAgICBxc0luZGV4ID0gcGF0aC5pbmRleE9mKCc/JyksXG4gICAgICBwYXRobmFtZSA9IH5xc0luZGV4ID8gcGF0aC5zbGljZSgwLCBxc0luZGV4KSA6IHBhdGgsXG4gICAgICBtID0gdGhpcy5yZWdleHAuZXhlYyhkZWNvZGVVUklDb21wb25lbnQocGF0aG5hbWUpKTtcblxuICAgIGlmICghbSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDEsIGxlbiA9IG0ubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2kgLSAxXTtcbiAgICAgIHZhciB2YWwgPSBkZWNvZGVVUkxFbmNvZGVkVVJJQ29tcG9uZW50KG1baV0pO1xuICAgICAgaWYgKHZhbCAhPT0gdW5kZWZpbmVkIHx8ICEoaGFzT3duUHJvcGVydHkuY2FsbChwYXJhbXMsIGtleS5uYW1lKSkpIHtcbiAgICAgICAgcGFyYW1zW2tleS5uYW1lXSA9IHZhbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuXG4gIC8qKlxuICAgKiBIYW5kbGUgXCJwb3B1bGF0ZVwiIGV2ZW50cy5cbiAgICovXG5cbiAgdmFyIG9ucG9wc3RhdGUgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBsb2FkZWQgPSBmYWxzZTtcbiAgICBpZiAoJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiB3aW5kb3cpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgIGxvYWRlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uIG9ucG9wc3RhdGUoZSkge1xuICAgICAgaWYgKCFsb2FkZWQpIHJldHVybjtcbiAgICAgIGlmIChlLnN0YXRlKSB7XG4gICAgICAgIHZhciBwYXRoID0gZS5zdGF0ZS5wYXRoO1xuICAgICAgICBwYWdlLnJlcGxhY2UocGF0aCwgZS5zdGF0ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYWdlLnNob3cobG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5oYXNoLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZmFsc2UpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCk7XG4gIC8qKlxuICAgKiBIYW5kbGUgXCJjbGlja1wiIGV2ZW50cy5cbiAgICovXG5cbiAgZnVuY3Rpb24gb25jbGljayhlKSB7XG5cbiAgICBpZiAoMSAhPT0gd2hpY2goZSkpIHJldHVybjtcblxuICAgIGlmIChlLm1ldGFLZXkgfHwgZS5jdHJsS2V5IHx8IGUuc2hpZnRLZXkpIHJldHVybjtcbiAgICBpZiAoZS5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblxuXG4gICAgLy8gZW5zdXJlIGxpbmtcbiAgICAvLyB1c2Ugc2hhZG93IGRvbSB3aGVuIGF2YWlsYWJsZVxuICAgIHZhciBlbCA9IGUucGF0aCA/IGUucGF0aFswXSA6IGUudGFyZ2V0O1xuICAgIHdoaWxlIChlbCAmJiAnQScgIT09IGVsLm5vZGVOYW1lKSBlbCA9IGVsLnBhcmVudE5vZGU7XG4gICAgaWYgKCFlbCB8fCAnQScgIT09IGVsLm5vZGVOYW1lKSByZXR1cm47XG5cblxuXG4gICAgLy8gSWdub3JlIGlmIHRhZyBoYXNcbiAgICAvLyAxLiBcImRvd25sb2FkXCIgYXR0cmlidXRlXG4gICAgLy8gMi4gcmVsPVwiZXh0ZXJuYWxcIiBhdHRyaWJ1dGVcbiAgICBpZiAoZWwuaGFzQXR0cmlidXRlKCdkb3dubG9hZCcpIHx8IGVsLmdldEF0dHJpYnV0ZSgncmVsJykgPT09ICdleHRlcm5hbCcpIHJldHVybjtcblxuICAgIC8vIGVuc3VyZSBub24taGFzaCBmb3IgdGhlIHNhbWUgcGF0aFxuICAgIHZhciBsaW5rID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgaWYgKCFoYXNoYmFuZyAmJiBlbC5wYXRobmFtZSA9PT0gbG9jYXRpb24ucGF0aG5hbWUgJiYgKGVsLmhhc2ggfHwgJyMnID09PSBsaW5rKSkgcmV0dXJuO1xuXG5cblxuICAgIC8vIENoZWNrIGZvciBtYWlsdG86IGluIHRoZSBocmVmXG4gICAgaWYgKGxpbmsgJiYgbGluay5pbmRleE9mKCdtYWlsdG86JykgPiAtMSkgcmV0dXJuO1xuXG4gICAgLy8gY2hlY2sgdGFyZ2V0XG4gICAgaWYgKGVsLnRhcmdldCkgcmV0dXJuO1xuXG4gICAgLy8geC1vcmlnaW5cbiAgICBpZiAoIXNhbWVPcmlnaW4oZWwuaHJlZikpIHJldHVybjtcblxuXG5cbiAgICAvLyByZWJ1aWxkIHBhdGhcbiAgICB2YXIgcGF0aCA9IGVsLnBhdGhuYW1lICsgZWwuc2VhcmNoICsgKGVsLmhhc2ggfHwgJycpO1xuXG4gICAgLy8gc3RyaXAgbGVhZGluZyBcIi9bZHJpdmUgbGV0dGVyXTpcIiBvbiBOVy5qcyBvbiBXaW5kb3dzXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwYXRoLm1hdGNoKC9eXFwvW2EtekEtWl06XFwvLykpIHtcbiAgICAgIHBhdGggPSBwYXRoLnJlcGxhY2UoL15cXC9bYS16QS1aXTpcXC8vLCAnLycpO1xuICAgIH1cblxuICAgIC8vIHNhbWUgcGFnZVxuICAgIHZhciBvcmlnID0gcGF0aDtcblxuICAgIGlmIChwYXRoLmluZGV4T2YoYmFzZSkgPT09IDApIHtcbiAgICAgIHBhdGggPSBwYXRoLnN1YnN0cihiYXNlLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgaWYgKGhhc2hiYW5nKSBwYXRoID0gcGF0aC5yZXBsYWNlKCcjIScsICcnKTtcblxuICAgIGlmIChiYXNlICYmIG9yaWcgPT09IHBhdGgpIHJldHVybjtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBwYWdlLnNob3cob3JpZyk7XG4gIH1cblxuICAvKipcbiAgICogRXZlbnQgYnV0dG9uLlxuICAgKi9cblxuICBmdW5jdGlvbiB3aGljaChlKSB7XG4gICAgZSA9IGUgfHwgd2luZG93LmV2ZW50O1xuICAgIHJldHVybiBudWxsID09PSBlLndoaWNoID8gZS5idXR0b24gOiBlLndoaWNoO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBocmVmYCBpcyB0aGUgc2FtZSBvcmlnaW4uXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHNhbWVPcmlnaW4oaHJlZikge1xuICAgIHZhciBvcmlnaW4gPSBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0bmFtZTtcbiAgICBpZiAobG9jYXRpb24ucG9ydCkgb3JpZ2luICs9ICc6JyArIGxvY2F0aW9uLnBvcnQ7XG4gICAgcmV0dXJuIChocmVmICYmICgwID09PSBocmVmLmluZGV4T2Yob3JpZ2luKSkpO1xuICB9XG5cbiAgcGFnZS5zYW1lT3JpZ2luID0gc2FtZU9yaWdpbjtcbiIsInZhciBpc2FycmF5ID0gcmVxdWlyZSgnaXNhcnJheScpXG5cbi8qKlxuICogRXhwb3NlIGBwYXRoVG9SZWdleHBgLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHBhdGhUb1JlZ2V4cFxubW9kdWxlLmV4cG9ydHMucGFyc2UgPSBwYXJzZVxubW9kdWxlLmV4cG9ydHMuY29tcGlsZSA9IGNvbXBpbGVcbm1vZHVsZS5leHBvcnRzLnRva2Vuc1RvRnVuY3Rpb24gPSB0b2tlbnNUb0Z1bmN0aW9uXG5tb2R1bGUuZXhwb3J0cy50b2tlbnNUb1JlZ0V4cCA9IHRva2Vuc1RvUmVnRXhwXG5cbi8qKlxuICogVGhlIG1haW4gcGF0aCBtYXRjaGluZyByZWdleHAgdXRpbGl0eS5cbiAqXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG52YXIgUEFUSF9SRUdFWFAgPSBuZXcgUmVnRXhwKFtcbiAgLy8gTWF0Y2ggZXNjYXBlZCBjaGFyYWN0ZXJzIHRoYXQgd291bGQgb3RoZXJ3aXNlIGFwcGVhciBpbiBmdXR1cmUgbWF0Y2hlcy5cbiAgLy8gVGhpcyBhbGxvd3MgdGhlIHVzZXIgdG8gZXNjYXBlIHNwZWNpYWwgY2hhcmFjdGVycyB0aGF0IHdvbid0IHRyYW5zZm9ybS5cbiAgJyhcXFxcXFxcXC4pJyxcbiAgLy8gTWF0Y2ggRXhwcmVzcy1zdHlsZSBwYXJhbWV0ZXJzIGFuZCB1bi1uYW1lZCBwYXJhbWV0ZXJzIHdpdGggYSBwcmVmaXhcbiAgLy8gYW5kIG9wdGlvbmFsIHN1ZmZpeGVzLiBNYXRjaGVzIGFwcGVhciBhczpcbiAgLy9cbiAgLy8gXCIvOnRlc3QoXFxcXGQrKT9cIiA9PiBbXCIvXCIsIFwidGVzdFwiLCBcIlxcZCtcIiwgdW5kZWZpbmVkLCBcIj9cIiwgdW5kZWZpbmVkXVxuICAvLyBcIi9yb3V0ZShcXFxcZCspXCIgID0+IFt1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBcIlxcZCtcIiwgdW5kZWZpbmVkLCB1bmRlZmluZWRdXG4gIC8vIFwiLypcIiAgICAgICAgICAgID0+IFtcIi9cIiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBcIipcIl1cbiAgJyhbXFxcXC8uXSk/KD86KD86XFxcXDooXFxcXHcrKSg/OlxcXFwoKCg/OlxcXFxcXFxcLnxbXigpXSkrKVxcXFwpKT98XFxcXCgoKD86XFxcXFxcXFwufFteKCldKSspXFxcXCkpKFsrKj9dKT98KFxcXFwqKSknXG5dLmpvaW4oJ3wnKSwgJ2cnKVxuXG4vKipcbiAqIFBhcnNlIGEgc3RyaW5nIGZvciB0aGUgcmF3IHRva2Vucy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIHBhcnNlIChzdHIpIHtcbiAgdmFyIHRva2VucyA9IFtdXG4gIHZhciBrZXkgPSAwXG4gIHZhciBpbmRleCA9IDBcbiAgdmFyIHBhdGggPSAnJ1xuICB2YXIgcmVzXG5cbiAgd2hpbGUgKChyZXMgPSBQQVRIX1JFR0VYUC5leGVjKHN0cikpICE9IG51bGwpIHtcbiAgICB2YXIgbSA9IHJlc1swXVxuICAgIHZhciBlc2NhcGVkID0gcmVzWzFdXG4gICAgdmFyIG9mZnNldCA9IHJlcy5pbmRleFxuICAgIHBhdGggKz0gc3RyLnNsaWNlKGluZGV4LCBvZmZzZXQpXG4gICAgaW5kZXggPSBvZmZzZXQgKyBtLmxlbmd0aFxuXG4gICAgLy8gSWdub3JlIGFscmVhZHkgZXNjYXBlZCBzZXF1ZW5jZXMuXG4gICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgIHBhdGggKz0gZXNjYXBlZFsxXVxuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICAvLyBQdXNoIHRoZSBjdXJyZW50IHBhdGggb250byB0aGUgdG9rZW5zLlxuICAgIGlmIChwYXRoKSB7XG4gICAgICB0b2tlbnMucHVzaChwYXRoKVxuICAgICAgcGF0aCA9ICcnXG4gICAgfVxuXG4gICAgdmFyIHByZWZpeCA9IHJlc1syXVxuICAgIHZhciBuYW1lID0gcmVzWzNdXG4gICAgdmFyIGNhcHR1cmUgPSByZXNbNF1cbiAgICB2YXIgZ3JvdXAgPSByZXNbNV1cbiAgICB2YXIgc3VmZml4ID0gcmVzWzZdXG4gICAgdmFyIGFzdGVyaXNrID0gcmVzWzddXG5cbiAgICB2YXIgcmVwZWF0ID0gc3VmZml4ID09PSAnKycgfHwgc3VmZml4ID09PSAnKidcbiAgICB2YXIgb3B0aW9uYWwgPSBzdWZmaXggPT09ICc/JyB8fCBzdWZmaXggPT09ICcqJ1xuICAgIHZhciBkZWxpbWl0ZXIgPSBwcmVmaXggfHwgJy8nXG4gICAgdmFyIHBhdHRlcm4gPSBjYXB0dXJlIHx8IGdyb3VwIHx8IChhc3RlcmlzayA/ICcuKicgOiAnW14nICsgZGVsaW1pdGVyICsgJ10rPycpXG5cbiAgICB0b2tlbnMucHVzaCh7XG4gICAgICBuYW1lOiBuYW1lIHx8IGtleSsrLFxuICAgICAgcHJlZml4OiBwcmVmaXggfHwgJycsXG4gICAgICBkZWxpbWl0ZXI6IGRlbGltaXRlcixcbiAgICAgIG9wdGlvbmFsOiBvcHRpb25hbCxcbiAgICAgIHJlcGVhdDogcmVwZWF0LFxuICAgICAgcGF0dGVybjogZXNjYXBlR3JvdXAocGF0dGVybilcbiAgICB9KVxuICB9XG5cbiAgLy8gTWF0Y2ggYW55IGNoYXJhY3RlcnMgc3RpbGwgcmVtYWluaW5nLlxuICBpZiAoaW5kZXggPCBzdHIubGVuZ3RoKSB7XG4gICAgcGF0aCArPSBzdHIuc3Vic3RyKGluZGV4KVxuICB9XG5cbiAgLy8gSWYgdGhlIHBhdGggZXhpc3RzLCBwdXNoIGl0IG9udG8gdGhlIGVuZC5cbiAgaWYgKHBhdGgpIHtcbiAgICB0b2tlbnMucHVzaChwYXRoKVxuICB9XG5cbiAgcmV0dXJuIHRva2Vuc1xufVxuXG4vKipcbiAqIENvbXBpbGUgYSBzdHJpbmcgdG8gYSB0ZW1wbGF0ZSBmdW5jdGlvbiBmb3IgdGhlIHBhdGguXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSAgIHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGNvbXBpbGUgKHN0cikge1xuICByZXR1cm4gdG9rZW5zVG9GdW5jdGlvbihwYXJzZShzdHIpKVxufVxuXG4vKipcbiAqIEV4cG9zZSBhIG1ldGhvZCBmb3IgdHJhbnNmb3JtaW5nIHRva2VucyBpbnRvIHRoZSBwYXRoIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiB0b2tlbnNUb0Z1bmN0aW9uICh0b2tlbnMpIHtcbiAgLy8gQ29tcGlsZSBhbGwgdGhlIHRva2VucyBpbnRvIHJlZ2V4cHMuXG4gIHZhciBtYXRjaGVzID0gbmV3IEFycmF5KHRva2Vucy5sZW5ndGgpXG5cbiAgLy8gQ29tcGlsZSBhbGwgdGhlIHBhdHRlcm5zIGJlZm9yZSBjb21waWxhdGlvbi5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIHRva2Vuc1tpXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG1hdGNoZXNbaV0gPSBuZXcgUmVnRXhwKCdeJyArIHRva2Vuc1tpXS5wYXR0ZXJuICsgJyQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHBhdGggPSAnJ1xuICAgIHZhciBkYXRhID0gb2JqIHx8IHt9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHRva2VuID0gdG9rZW5zW2ldXG5cbiAgICAgIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHBhdGggKz0gdG9rZW5cblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUgPSBkYXRhW3Rva2VuLm5hbWVdXG4gICAgICB2YXIgc2VnbWVudFxuXG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICBpZiAodG9rZW4ub3B0aW9uYWwpIHtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gYmUgZGVmaW5lZCcpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGlzYXJyYXkodmFsdWUpKSB7XG4gICAgICAgIGlmICghdG9rZW4ucmVwZWF0KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBub3QgcmVwZWF0LCBidXQgcmVjZWl2ZWQgXCInICsgdmFsdWUgKyAnXCInKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBub3QgYmUgZW1wdHknKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsdWUubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBzZWdtZW50ID0gZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlW2pdKVxuXG4gICAgICAgICAgaWYgKCFtYXRjaGVzW2ldLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFsbCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG1hdGNoIFwiJyArIHRva2VuLnBhdHRlcm4gKyAnXCIsIGJ1dCByZWNlaXZlZCBcIicgKyBzZWdtZW50ICsgJ1wiJylcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwYXRoICs9IChqID09PSAwID8gdG9rZW4ucHJlZml4IDogdG9rZW4uZGVsaW1pdGVyKSArIHNlZ21lbnRcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHNlZ21lbnQgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpXG5cbiAgICAgIGlmICghbWF0Y2hlc1tpXS50ZXN0KHNlZ21lbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbWF0Y2ggXCInICsgdG9rZW4ucGF0dGVybiArICdcIiwgYnV0IHJlY2VpdmVkIFwiJyArIHNlZ21lbnQgKyAnXCInKVxuICAgICAgfVxuXG4gICAgICBwYXRoICs9IHRva2VuLnByZWZpeCArIHNlZ21lbnRcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0aFxuICB9XG59XG5cbi8qKlxuICogRXNjYXBlIGEgcmVndWxhciBleHByZXNzaW9uIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmcgKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbLisqPz1eIToke30oKVtcXF18XFwvXSkvZywgJ1xcXFwkMScpXG59XG5cbi8qKlxuICogRXNjYXBlIHRoZSBjYXB0dXJpbmcgZ3JvdXAgYnkgZXNjYXBpbmcgc3BlY2lhbCBjaGFyYWN0ZXJzIGFuZCBtZWFuaW5nLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gZ3JvdXBcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZXNjYXBlR3JvdXAgKGdyb3VwKSB7XG4gIHJldHVybiBncm91cC5yZXBsYWNlKC8oWz0hOiRcXC8oKV0pL2csICdcXFxcJDEnKVxufVxuXG4vKipcbiAqIEF0dGFjaCB0aGUga2V5cyBhcyBhIHByb3BlcnR5IG9mIHRoZSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7UmVnRXhwfSByZVxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIGF0dGFjaEtleXMgKHJlLCBrZXlzKSB7XG4gIHJlLmtleXMgPSBrZXlzXG4gIHJldHVybiByZVxufVxuXG4vKipcbiAqIEdldCB0aGUgZmxhZ3MgZm9yIGEgcmVnZXhwIGZyb20gdGhlIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZsYWdzIChvcHRpb25zKSB7XG4gIHJldHVybiBvcHRpb25zLnNlbnNpdGl2ZSA/ICcnIDogJ2knXG59XG5cbi8qKlxuICogUHVsbCBvdXQga2V5cyBmcm9tIGEgcmVnZXhwLlxuICpcbiAqIEBwYXJhbSAge1JlZ0V4cH0gcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHJlZ2V4cFRvUmVnZXhwIChwYXRoLCBrZXlzKSB7XG4gIC8vIFVzZSBhIG5lZ2F0aXZlIGxvb2thaGVhZCB0byBtYXRjaCBvbmx5IGNhcHR1cmluZyBncm91cHMuXG4gIHZhciBncm91cHMgPSBwYXRoLnNvdXJjZS5tYXRjaCgvXFwoKD8hXFw/KS9nKVxuXG4gIGlmIChncm91cHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3Vwcy5sZW5ndGg7IGkrKykge1xuICAgICAga2V5cy5wdXNoKHtcbiAgICAgICAgbmFtZTogaSxcbiAgICAgICAgcHJlZml4OiBudWxsLFxuICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgIG9wdGlvbmFsOiBmYWxzZSxcbiAgICAgICAgcmVwZWF0OiBmYWxzZSxcbiAgICAgICAgcGF0dGVybjogbnVsbFxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXR0YWNoS2V5cyhwYXRoLCBrZXlzKVxufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhbiBhcnJheSBpbnRvIGEgcmVnZXhwLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSAgcGF0aFxuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXJyYXlUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICB2YXIgcGFydHMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIHBhcnRzLnB1c2gocGF0aFRvUmVnZXhwKHBhdGhbaV0sIGtleXMsIG9wdGlvbnMpLnNvdXJjZSlcbiAgfVxuXG4gIHZhciByZWdleHAgPSBuZXcgUmVnRXhwKCcoPzonICsgcGFydHMuam9pbignfCcpICsgJyknLCBmbGFncyhvcHRpb25zKSlcblxuICByZXR1cm4gYXR0YWNoS2V5cyhyZWdleHAsIGtleXMpXG59XG5cbi8qKlxuICogQ3JlYXRlIGEgcGF0aCByZWdleHAgZnJvbSBzdHJpbmcgaW5wdXQuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBzdHJpbmdUb1JlZ2V4cCAocGF0aCwga2V5cywgb3B0aW9ucykge1xuICB2YXIgdG9rZW5zID0gcGFyc2UocGF0aClcbiAgdmFyIHJlID0gdG9rZW5zVG9SZWdFeHAodG9rZW5zLCBvcHRpb25zKVxuXG4gIC8vIEF0dGFjaCBrZXlzIGJhY2sgdG8gdGhlIHJlZ2V4cC5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodHlwZW9mIHRva2Vuc1tpXSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGtleXMucHVzaCh0b2tlbnNbaV0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGF0dGFjaEtleXMocmUsIGtleXMpXG59XG5cbi8qKlxuICogRXhwb3NlIGEgZnVuY3Rpb24gZm9yIHRha2luZyB0b2tlbnMgYW5kIHJldHVybmluZyBhIFJlZ0V4cC5cbiAqXG4gKiBAcGFyYW0gIHtBcnJheX0gIHRva2Vuc1xuICogQHBhcmFtICB7QXJyYXl9ICBrZXlzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gdG9rZW5zVG9SZWdFeHAgKHRva2Vucywgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuXG4gIHZhciBzdHJpY3QgPSBvcHRpb25zLnN0cmljdFxuICB2YXIgZW5kID0gb3B0aW9ucy5lbmQgIT09IGZhbHNlXG4gIHZhciByb3V0ZSA9ICcnXG4gIHZhciBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdXG4gIHZhciBlbmRzV2l0aFNsYXNoID0gdHlwZW9mIGxhc3RUb2tlbiA9PT0gJ3N0cmluZycgJiYgL1xcLyQvLnRlc3QobGFzdFRva2VuKVxuXG4gIC8vIEl0ZXJhdGUgb3ZlciB0aGUgdG9rZW5zIGFuZCBjcmVhdGUgb3VyIHJlZ2V4cCBzdHJpbmcuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHRva2VuID0gdG9rZW5zW2ldXG5cbiAgICBpZiAodHlwZW9mIHRva2VuID09PSAnc3RyaW5nJykge1xuICAgICAgcm91dGUgKz0gZXNjYXBlU3RyaW5nKHRva2VuKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcHJlZml4ID0gZXNjYXBlU3RyaW5nKHRva2VuLnByZWZpeClcbiAgICAgIHZhciBjYXB0dXJlID0gdG9rZW4ucGF0dGVyblxuXG4gICAgICBpZiAodG9rZW4ucmVwZWF0KSB7XG4gICAgICAgIGNhcHR1cmUgKz0gJyg/OicgKyBwcmVmaXggKyBjYXB0dXJlICsgJykqJ1xuICAgICAgfVxuXG4gICAgICBpZiAodG9rZW4ub3B0aW9uYWwpIHtcbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgIGNhcHR1cmUgPSAnKD86JyArIHByZWZpeCArICcoJyArIGNhcHR1cmUgKyAnKSk/J1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhcHR1cmUgPSAnKCcgKyBjYXB0dXJlICsgJyk/J1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYXB0dXJlID0gcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpJ1xuICAgICAgfVxuXG4gICAgICByb3V0ZSArPSBjYXB0dXJlXG4gICAgfVxuICB9XG5cbiAgLy8gSW4gbm9uLXN0cmljdCBtb2RlIHdlIGFsbG93IGEgc2xhc2ggYXQgdGhlIGVuZCBvZiBtYXRjaC4gSWYgdGhlIHBhdGggdG9cbiAgLy8gbWF0Y2ggYWxyZWFkeSBlbmRzIHdpdGggYSBzbGFzaCwgd2UgcmVtb3ZlIGl0IGZvciBjb25zaXN0ZW5jeS4gVGhlIHNsYXNoXG4gIC8vIGlzIHZhbGlkIGF0IHRoZSBlbmQgb2YgYSBwYXRoIG1hdGNoLCBub3QgaW4gdGhlIG1pZGRsZS4gVGhpcyBpcyBpbXBvcnRhbnRcbiAgLy8gaW4gbm9uLWVuZGluZyBtb2RlLCB3aGVyZSBcIi90ZXN0L1wiIHNob3VsZG4ndCBtYXRjaCBcIi90ZXN0Ly9yb3V0ZVwiLlxuICBpZiAoIXN0cmljdCkge1xuICAgIHJvdXRlID0gKGVuZHNXaXRoU2xhc2ggPyByb3V0ZS5zbGljZSgwLCAtMikgOiByb3V0ZSkgKyAnKD86XFxcXC8oPz0kKSk/J1xuICB9XG5cbiAgaWYgKGVuZCkge1xuICAgIHJvdXRlICs9ICckJ1xuICB9IGVsc2Uge1xuICAgIC8vIEluIG5vbi1lbmRpbmcgbW9kZSwgd2UgbmVlZCB0aGUgY2FwdHVyaW5nIGdyb3VwcyB0byBtYXRjaCBhcyBtdWNoIGFzXG4gICAgLy8gcG9zc2libGUgYnkgdXNpbmcgYSBwb3NpdGl2ZSBsb29rYWhlYWQgdG8gdGhlIGVuZCBvciBuZXh0IHBhdGggc2VnbWVudC5cbiAgICByb3V0ZSArPSBzdHJpY3QgJiYgZW5kc1dpdGhTbGFzaCA/ICcnIDogJyg/PVxcXFwvfCQpJ1xuICB9XG5cbiAgcmV0dXJuIG5ldyBSZWdFeHAoJ14nICsgcm91dGUsIGZsYWdzKG9wdGlvbnMpKVxufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgZ2l2ZW4gcGF0aCBzdHJpbmcsIHJldHVybmluZyBhIHJlZ3VsYXIgZXhwcmVzc2lvbi5cbiAqXG4gKiBBbiBlbXB0eSBhcnJheSBjYW4gYmUgcGFzc2VkIGluIGZvciB0aGUga2V5cywgd2hpY2ggd2lsbCBob2xkIHRoZVxuICogcGxhY2Vob2xkZXIga2V5IGRlc2NyaXB0aW9ucy4gRm9yIGV4YW1wbGUsIHVzaW5nIGAvdXNlci86aWRgLCBga2V5c2Agd2lsbFxuICogY29udGFpbiBgW3sgbmFtZTogJ2lkJywgZGVsaW1pdGVyOiAnLycsIG9wdGlvbmFsOiBmYWxzZSwgcmVwZWF0OiBmYWxzZSB9XWAuXG4gKlxuICogQHBhcmFtICB7KFN0cmluZ3xSZWdFeHB8QXJyYXkpfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gICAgICAgICAgICAgICAgIFtrZXlzXVxuICogQHBhcmFtICB7T2JqZWN0fSAgICAgICAgICAgICAgICBbb3B0aW9uc11cbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcGF0aFRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIGtleXMgPSBrZXlzIHx8IFtdXG5cbiAgaWYgKCFpc2FycmF5KGtleXMpKSB7XG4gICAgb3B0aW9ucyA9IGtleXNcbiAgICBrZXlzID0gW11cbiAgfSBlbHNlIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fVxuICB9XG5cbiAgaWYgKHBhdGggaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICByZXR1cm4gcmVnZXhwVG9SZWdleHAocGF0aCwga2V5cywgb3B0aW9ucylcbiAgfVxuXG4gIGlmIChpc2FycmF5KHBhdGgpKSB7XG4gICAgcmV0dXJuIGFycmF5VG9SZWdleHAocGF0aCwga2V5cywgb3B0aW9ucylcbiAgfVxuXG4gIHJldHVybiBzdHJpbmdUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xuZnVuY3Rpb24gYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCkge1xuICAgIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuICAgIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjaGlsZERhdGEgPSBjaGlsZHJlbltpXS5kYXRhO1xuICAgICAgICAgICAgaWYgKGNoaWxkRGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYWRkTlMoY2hpbGREYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIGgoc2VsLCBiLCBjKSB7XG4gICAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gICAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhID0gYjtcbiAgICAgICAgaWYgKGlzLmFycmF5KGMpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGM7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjICYmIGMuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtjXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGlzLmFycmF5KGIpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IGI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7XG4gICAgICAgICAgICB0ZXh0ID0gYjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChiICYmIGIuc2VsKSB7XG4gICAgICAgICAgICBjaGlsZHJlbiA9IFtiXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoaXMucHJpbWl0aXZlKGNoaWxkcmVuW2ldKSlcbiAgICAgICAgICAgICAgICBjaGlsZHJlbltpXSA9IHZub2RlXzEudm5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzZWxbMF0gPT09ICdzJyAmJiBzZWxbMV0gPT09ICd2JyAmJiBzZWxbMl0gPT09ICdnJyAmJlxuICAgICAgICAoc2VsLmxlbmd0aCA9PT0gMyB8fCBzZWxbM10gPT09ICcuJyB8fCBzZWxbM10gPT09ICcjJykpIHtcbiAgICAgICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gICAgfVxuICAgIHJldHVybiB2bm9kZV8xLnZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59XG5leHBvcnRzLmggPSBoO1xuO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gaDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5mdW5jdGlvbiBjcmVhdGVUZXh0Tm9kZSh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHQpO1xufVxuZnVuY3Rpb24gY3JlYXRlQ29tbWVudCh0ZXh0KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQodGV4dCk7XG59XG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSkge1xuICAgIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQ2hpbGQobm9kZSwgY2hpbGQpIHtcbiAgICBub2RlLnJlbW92ZUNoaWxkKGNoaWxkKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKSB7XG4gICAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5mdW5jdGlvbiBwYXJlbnROb2RlKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5wYXJlbnROb2RlO1xufVxuZnVuY3Rpb24gbmV4dFNpYmxpbmcobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5leHRTaWJsaW5nO1xufVxuZnVuY3Rpb24gdGFnTmFtZShlbG0pIHtcbiAgICByZXR1cm4gZWxtLnRhZ05hbWU7XG59XG5mdW5jdGlvbiBzZXRUZXh0Q29udGVudChub2RlLCB0ZXh0KSB7XG4gICAgbm9kZS50ZXh0Q29udGVudCA9IHRleHQ7XG59XG5mdW5jdGlvbiBnZXRUZXh0Q29udGVudChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUudGV4dENvbnRlbnQ7XG59XG5mdW5jdGlvbiBpc0VsZW1lbnQobm9kZSkge1xuICAgIHJldHVybiBub2RlLm5vZGVUeXBlID09PSAxO1xufVxuZnVuY3Rpb24gaXNUZXh0KG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gMztcbn1cbmZ1bmN0aW9uIGlzQ29tbWVudChub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IDg7XG59XG5leHBvcnRzLmh0bWxEb21BcGkgPSB7XG4gICAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgICBjcmVhdGVFbGVtZW50TlM6IGNyZWF0ZUVsZW1lbnROUyxcbiAgICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gICAgY3JlYXRlQ29tbWVudDogY3JlYXRlQ29tbWVudCxcbiAgICBpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcbiAgICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gICAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICAgIHBhcmVudE5vZGU6IHBhcmVudE5vZGUsXG4gICAgbmV4dFNpYmxpbmc6IG5leHRTaWJsaW5nLFxuICAgIHRhZ05hbWU6IHRhZ05hbWUsXG4gICAgc2V0VGV4dENvbnRlbnQ6IHNldFRleHRDb250ZW50LFxuICAgIGdldFRleHRDb250ZW50OiBnZXRUZXh0Q29udGVudCxcbiAgICBpc0VsZW1lbnQ6IGlzRWxlbWVudCxcbiAgICBpc1RleHQ6IGlzVGV4dCxcbiAgICBpc0NvbW1lbnQ6IGlzQ29tbWVudCxcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLmh0bWxEb21BcGk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1odG1sZG9tYXBpLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0cy5hcnJheSA9IEFycmF5LmlzQXJyYXk7XG5mdW5jdGlvbiBwcmltaXRpdmUocykge1xuICAgIHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5wcmltaXRpdmUgPSBwcmltaXRpdmU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBOYW1lc3BhY2VVUklzID0ge1xuICAgIFwieGxpbmtcIjogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCJcbn07XG52YXIgYm9vbGVhbkF0dHJzID0gW1wiYWxsb3dmdWxsc2NyZWVuXCIsIFwiYXN5bmNcIiwgXCJhdXRvZm9jdXNcIiwgXCJhdXRvcGxheVwiLCBcImNoZWNrZWRcIiwgXCJjb21wYWN0XCIsIFwiY29udHJvbHNcIiwgXCJkZWNsYXJlXCIsXG4gICAgXCJkZWZhdWx0XCIsIFwiZGVmYXVsdGNoZWNrZWRcIiwgXCJkZWZhdWx0bXV0ZWRcIiwgXCJkZWZhdWx0c2VsZWN0ZWRcIiwgXCJkZWZlclwiLCBcImRpc2FibGVkXCIsIFwiZHJhZ2dhYmxlXCIsXG4gICAgXCJlbmFibGVkXCIsIFwiZm9ybW5vdmFsaWRhdGVcIiwgXCJoaWRkZW5cIiwgXCJpbmRldGVybWluYXRlXCIsIFwiaW5lcnRcIiwgXCJpc21hcFwiLCBcIml0ZW1zY29wZVwiLCBcImxvb3BcIiwgXCJtdWx0aXBsZVwiLFxuICAgIFwibXV0ZWRcIiwgXCJub2hyZWZcIiwgXCJub3Jlc2l6ZVwiLCBcIm5vc2hhZGVcIiwgXCJub3ZhbGlkYXRlXCIsIFwibm93cmFwXCIsIFwib3BlblwiLCBcInBhdXNlb25leGl0XCIsIFwicmVhZG9ubHlcIixcbiAgICBcInJlcXVpcmVkXCIsIFwicmV2ZXJzZWRcIiwgXCJzY29wZWRcIiwgXCJzZWFtbGVzc1wiLCBcInNlbGVjdGVkXCIsIFwic29ydGFibGVcIiwgXCJzcGVsbGNoZWNrXCIsIFwidHJhbnNsYXRlXCIsXG4gICAgXCJ0cnVlc3BlZWRcIiwgXCJ0eXBlbXVzdG1hdGNoXCIsIFwidmlzaWJsZVwiXTtcbnZhciBib29sZWFuQXR0cnNEaWN0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBib29sZWFuQXR0cnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBib29sZWFuQXR0cnNEaWN0W2Jvb2xlYW5BdHRyc1tpXV0gPSB0cnVlO1xufVxuZnVuY3Rpb24gdXBkYXRlQXR0cnMob2xkVm5vZGUsIHZub2RlKSB7XG4gICAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSwgb2xkQXR0cnMgPSBvbGRWbm9kZS5kYXRhLmF0dHJzLCBhdHRycyA9IHZub2RlLmRhdGEuYXR0cnMsIG5hbWVzcGFjZVNwbGl0O1xuICAgIGlmICghb2xkQXR0cnMgJiYgIWF0dHJzKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKG9sZEF0dHJzID09PSBhdHRycylcbiAgICAgICAgcmV0dXJuO1xuICAgIG9sZEF0dHJzID0gb2xkQXR0cnMgfHwge307XG4gICAgYXR0cnMgPSBhdHRycyB8fCB7fTtcbiAgICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gICAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgY3VyID0gYXR0cnNba2V5XTtcbiAgICAgICAgb2xkID0gb2xkQXR0cnNba2V5XTtcbiAgICAgICAgaWYgKG9sZCAhPT0gY3VyKSB7XG4gICAgICAgICAgICBpZiAoIWN1ciAmJiBib29sZWFuQXR0cnNEaWN0W2tleV0pXG4gICAgICAgICAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbmFtZXNwYWNlU3BsaXQgPSBrZXkuc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIGlmIChuYW1lc3BhY2VTcGxpdC5sZW5ndGggPiAxICYmIE5hbWVzcGFjZVVSSXMuaGFzT3duUHJvcGVydHkobmFtZXNwYWNlU3BsaXRbMF0pKVxuICAgICAgICAgICAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlTlMoTmFtZXNwYWNlVVJJc1tuYW1lc3BhY2VTcGxpdFswXV0sIGtleSwgY3VyKTtcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBjdXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vcmVtb3ZlIHJlbW92ZWQgYXR0cmlidXRlc1xuICAgIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICAgIGZvciAoa2V5IGluIG9sZEF0dHJzKSB7XG4gICAgICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuYXR0cmlidXRlc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRycyB9O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5hdHRyaWJ1dGVzTW9kdWxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXR0cmlidXRlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbmZ1bmN0aW9uIHVwZGF0ZUNsYXNzKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLCBrbGFzcyA9IHZub2RlLmRhdGEuY2xhc3M7XG4gICAgaWYgKCFvbGRDbGFzcyAmJiAha2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBpZiAob2xkQ2xhc3MgPT09IGtsYXNzKVxuICAgICAgICByZXR1cm47XG4gICAgb2xkQ2xhc3MgPSBvbGRDbGFzcyB8fCB7fTtcbiAgICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuICAgIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgICAgICBpZiAoIWtsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0LnJlbW92ZShuYW1lKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICAgICAgY3VyID0ga2xhc3NbbmFtZV07XG4gICAgICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICAgICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuZXhwb3J0cy5jbGFzc01vZHVsZSA9IHsgY3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzcyB9O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5jbGFzc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNsYXNzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gaW52b2tlSGFuZGxlcihoYW5kbGVyLCB2bm9kZSwgZXZlbnQpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAvLyBjYWxsIGZ1bmN0aW9uIGhhbmRsZXJcbiAgICAgICAgaGFuZGxlci5jYWxsKHZub2RlLCBldmVudCwgdm5vZGUpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAvLyBjYWxsIGhhbmRsZXIgd2l0aCBhcmd1bWVudHNcbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyWzBdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igc2luZ2xlIGFyZ3VtZW50IGZvciBwZXJmb3JtYW5jZVxuICAgICAgICAgICAgaWYgKGhhbmRsZXIubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlclswXS5jYWxsKHZub2RlLCBoYW5kbGVyWzFdLCBldmVudCwgdm5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBoYW5kbGVyLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChldmVudCk7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKHZub2RlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVyWzBdLmFwcGx5KHZub2RlLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNhbGwgbXVsdGlwbGUgaGFuZGxlcnNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGludm9rZUhhbmRsZXIoaGFuZGxlcltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBoYW5kbGVFdmVudChldmVudCwgdm5vZGUpIHtcbiAgICB2YXIgbmFtZSA9IGV2ZW50LnR5cGUsIG9uID0gdm5vZGUuZGF0YS5vbjtcbiAgICAvLyBjYWxsIGV2ZW50IGhhbmRsZXIocykgaWYgZXhpc3RzXG4gICAgaWYgKG9uICYmIG9uW25hbWVdKSB7XG4gICAgICAgIGludm9rZUhhbmRsZXIob25bbmFtZV0sIHZub2RlLCBldmVudCk7XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlTGlzdGVuZXIoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICAgICAgaGFuZGxlRXZlbnQoZXZlbnQsIGhhbmRsZXIudm5vZGUpO1xuICAgIH07XG59XG5mdW5jdGlvbiB1cGRhdGVFdmVudExpc3RlbmVycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIgb2xkT24gPSBvbGRWbm9kZS5kYXRhLm9uLCBvbGRMaXN0ZW5lciA9IG9sZFZub2RlLmxpc3RlbmVyLCBvbGRFbG0gPSBvbGRWbm9kZS5lbG0sIG9uID0gdm5vZGUgJiYgdm5vZGUuZGF0YS5vbiwgZWxtID0gKHZub2RlICYmIHZub2RlLmVsbSksIG5hbWU7XG4gICAgLy8gb3B0aW1pemF0aW9uIGZvciByZXVzZWQgaW1tdXRhYmxlIGhhbmRsZXJzXG4gICAgaWYgKG9sZE9uID09PSBvbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIHJlbW92ZSBleGlzdGluZyBsaXN0ZW5lcnMgd2hpY2ggbm8gbG9uZ2VyIHVzZWRcbiAgICBpZiAob2xkT24gJiYgb2xkTGlzdGVuZXIpIHtcbiAgICAgICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGRlbGV0ZWQgd2UgcmVtb3ZlIGFsbCBleGlzdGluZyBsaXN0ZW5lcnMgdW5jb25kaXRpb25hbGx5XG4gICAgICAgIGlmICghb24pIHtcbiAgICAgICAgICAgIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lciBpZiBlbGVtZW50IHdhcyBjaGFuZ2VkIG9yIGV4aXN0aW5nIGxpc3RlbmVycyByZW1vdmVkXG4gICAgICAgICAgICAgICAgb2xkRWxtLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgb2xkTGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lciBpZiBleGlzdGluZyBsaXN0ZW5lciByZW1vdmVkXG4gICAgICAgICAgICAgICAgaWYgKCFvbltuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBvbGRFbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBvbGRMaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBhZGQgbmV3IGxpc3RlbmVycyB3aGljaCBoYXMgbm90IGFscmVhZHkgYXR0YWNoZWRcbiAgICBpZiAob24pIHtcbiAgICAgICAgLy8gcmV1c2UgZXhpc3RpbmcgbGlzdGVuZXIgb3IgY3JlYXRlIG5ld1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB2bm9kZS5saXN0ZW5lciA9IG9sZFZub2RlLmxpc3RlbmVyIHx8IGNyZWF0ZUxpc3RlbmVyKCk7XG4gICAgICAgIC8vIHVwZGF0ZSB2bm9kZSBmb3IgbGlzdGVuZXJcbiAgICAgICAgbGlzdGVuZXIudm5vZGUgPSB2bm9kZTtcbiAgICAgICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGFkZGVkIHdlIGFkZCBhbGwgbmVlZGVkIGxpc3RlbmVycyB1bmNvbmRpdGlvbmFsbHlcbiAgICAgICAgaWYgKCFvbGRPbikge1xuICAgICAgICAgICAgZm9yIChuYW1lIGluIG9uKSB7XG4gICAgICAgICAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGlmIGVsZW1lbnQgd2FzIGNoYW5nZWQgb3IgbmV3IGxpc3RlbmVycyBhZGRlZFxuICAgICAgICAgICAgICAgIGVsbS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgICAgICAgICAvLyBhZGQgbGlzdGVuZXIgaWYgbmV3IGxpc3RlbmVyIGFkZGVkXG4gICAgICAgICAgICAgICAgaWYgKCFvbGRPbltuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBlbG0uYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuZXZlbnRMaXN0ZW5lcnNNb2R1bGUgPSB7XG4gICAgY3JlYXRlOiB1cGRhdGVFdmVudExpc3RlbmVycyxcbiAgICB1cGRhdGU6IHVwZGF0ZUV2ZW50TGlzdGVuZXJzLFxuICAgIGRlc3Ryb3k6IHVwZGF0ZUV2ZW50TGlzdGVuZXJzXG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5ldmVudExpc3RlbmVyc01vZHVsZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWV2ZW50bGlzdGVuZXJzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIHZub2RlXzEgPSByZXF1aXJlKFwiLi92bm9kZVwiKTtcbnZhciBpcyA9IHJlcXVpcmUoXCIuL2lzXCIpO1xudmFyIGh0bWxkb21hcGlfMSA9IHJlcXVpcmUoXCIuL2h0bWxkb21hcGlcIik7XG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG52YXIgZW1wdHlOb2RlID0gdm5vZGVfMS5kZWZhdWx0KCcnLCB7fSwgW10sIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICAgIHJldHVybiB2bm9kZTEua2V5ID09PSB2bm9kZTIua2V5ICYmIHZub2RlMS5zZWwgPT09IHZub2RlMi5zZWw7XG59XG5mdW5jdGlvbiBpc1Zub2RlKHZub2RlKSB7XG4gICAgcmV0dXJuIHZub2RlLnNlbCAhPT0gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgICB2YXIgaSwgbWFwID0ge30sIGtleSwgY2g7XG4gICAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICAgICAgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgIGtleSA9IGNoLmtleTtcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICBtYXBba2V5XSA9IGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG1hcDtcbn1cbnZhciBob29rcyA9IFsnY3JlYXRlJywgJ3VwZGF0ZScsICdyZW1vdmUnLCAnZGVzdHJveScsICdwcmUnLCAncG9zdCddO1xudmFyIGhfMSA9IHJlcXVpcmUoXCIuL2hcIik7XG5leHBvcnRzLmggPSBoXzEuaDtcbnZhciB0aHVua18xID0gcmVxdWlyZShcIi4vdGh1bmtcIik7XG5leHBvcnRzLnRodW5rID0gdGh1bmtfMS50aHVuaztcbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgZG9tQXBpKSB7XG4gICAgdmFyIGksIGosIGNicyA9IHt9O1xuICAgIHZhciBhcGkgPSBkb21BcGkgIT09IHVuZGVmaW5lZCA/IGRvbUFwaSA6IGh0bWxkb21hcGlfMS5kZWZhdWx0O1xuICAgIGZvciAoaSA9IDA7IGkgPCBob29rcy5sZW5ndGg7ICsraSkge1xuICAgICAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICAgICAgICB2YXIgaG9vayA9IG1vZHVsZXNbal1baG9va3NbaV1dO1xuICAgICAgICAgICAgaWYgKGhvb2sgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNic1tob29rc1tpXV0ucHVzaChob29rKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICAgICAgdmFyIGlkID0gZWxtLmlkID8gJyMnICsgZWxtLmlkIDogJyc7XG4gICAgICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICAgICAgcmV0dXJuIHZub2RlXzEuZGVmYXVsdChhcGkudGFnTmFtZShlbG0pLnRvTG93ZXJDYXNlKCkgKyBpZCArIGMsIHt9LCBbXSwgdW5kZWZpbmVkLCBlbG0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJtQ2IoKSB7XG4gICAgICAgICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFyZW50XzEgPSBhcGkucGFyZW50Tm9kZShjaGlsZEVsbSk7XG4gICAgICAgICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudF8xLCBjaGlsZEVsbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgICAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgICAgICAgICAgaSh2bm9kZSk7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICAgICAgaWYgKHNlbCA9PT0gJyEnKSB7XG4gICAgICAgICAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgICAgIHZub2RlLnRleHQgPSAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZub2RlLmVsbSA9IGFwaS5jcmVhdGVDb21tZW50KHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHNlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICAgICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgICAgICAgIHZhciBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICAgICAgICBpZiAoaGFzaCA8IGRvdClcbiAgICAgICAgICAgICAgICBlbG0uaWQgPSBzZWwuc2xpY2UoaGFzaCArIDEsIGRvdCk7XG4gICAgICAgICAgICBpZiAoZG90SWR4ID4gMClcbiAgICAgICAgICAgICAgICBlbG0uY2xhc3NOYW1lID0gc2VsLnNsaWNlKGRvdCArIDEpLnJlcGxhY2UoL1xcLi9nLCAnICcpO1xuICAgICAgICAgICAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2ggPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgICAgICAgICBhcGkuYXBwZW5kQ2hpbGQoZWxtLCBhcGkuY3JlYXRlVGV4dE5vZGUodm5vZGUudGV4dCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5jcmVhdGUubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICAgICAgY2JzLmNyZWF0ZVtpXShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgICAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7IC8vIFJldXNlIHZhcmlhYmxlXG4gICAgICAgICAgICBpZiAoaXNEZWYoaSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaS5jcmVhdGUpXG4gICAgICAgICAgICAgICAgICAgIGkuY3JlYXRlKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChpLmluc2VydClcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0ZWRWbm9kZVF1ZXVlLnB1c2godm5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdm5vZGUuZWxtID0gYXBpLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2bm9kZS5lbG07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgICAgZm9yICg7IHN0YXJ0SWR4IDw9IGVuZElkeDsgKytzdGFydElkeCkge1xuICAgICAgICAgICAgdmFyIGNoID0gdm5vZGVzW3N0YXJ0SWR4XTtcbiAgICAgICAgICAgIGlmIChjaCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgYmVmb3JlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBpbnZva2VEZXN0cm95SG9vayh2bm9kZSkge1xuICAgICAgICB2YXIgaSwgaiwgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICAgIGlmIChkYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5kZXN0cm95KSlcbiAgICAgICAgICAgICAgICBpKHZub2RlKTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuZGVzdHJveS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMuZGVzdHJveVtpXSh2bm9kZSk7XG4gICAgICAgICAgICBpZiAodm5vZGUuY2hpbGRyZW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCB2bm9kZS5jaGlsZHJlbi5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgICAgICAgICBpID0gdm5vZGUuY2hpbGRyZW5bal07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpICE9IG51bGwgJiYgdHlwZW9mIGkgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKGkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCkge1xuICAgICAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICAgICAgICB2YXIgaV8xID0gdm9pZCAwLCBsaXN0ZW5lcnMgPSB2b2lkIDAsIHJtID0gdm9pZCAwLCBjaCA9IHZub2Rlc1tzdGFydElkeF07XG4gICAgICAgICAgICBpZiAoY2ggIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGlmIChpc0RlZihjaC5zZWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKGNoKTtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzID0gY2JzLnJlbW92ZS5sZW5ndGggKyAxO1xuICAgICAgICAgICAgICAgICAgICBybSA9IGNyZWF0ZVJtQ2IoY2guZWxtLCBsaXN0ZW5lcnMpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGlfMSA9IDA7IGlfMSA8IGNicy5yZW1vdmUubGVuZ3RoOyArK2lfMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIGNicy5yZW1vdmVbaV8xXShjaCwgcm0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNEZWYoaV8xID0gY2guZGF0YSkgJiYgaXNEZWYoaV8xID0gaV8xLmhvb2spICYmIGlzRGVmKGlfMSA9IGlfMS5yZW1vdmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpXzEoY2gsIHJtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJtKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFwaS5yZW1vdmVDaGlsZChwYXJlbnRFbG0sIGNoLmVsbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNoaWxkcmVuKHBhcmVudEVsbSwgb2xkQ2gsIG5ld0NoLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgICAgdmFyIG9sZFN0YXJ0SWR4ID0gMCwgbmV3U3RhcnRJZHggPSAwO1xuICAgICAgICB2YXIgb2xkRW5kSWR4ID0gb2xkQ2gubGVuZ3RoIC0gMTtcbiAgICAgICAgdmFyIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFswXTtcbiAgICAgICAgdmFyIG9sZEVuZFZub2RlID0gb2xkQ2hbb2xkRW5kSWR4XTtcbiAgICAgICAgdmFyIG5ld0VuZElkeCA9IG5ld0NoLmxlbmd0aCAtIDE7XG4gICAgICAgIHZhciBuZXdTdGFydFZub2RlID0gbmV3Q2hbMF07XG4gICAgICAgIHZhciBuZXdFbmRWbm9kZSA9IG5ld0NoW25ld0VuZElkeF07XG4gICAgICAgIHZhciBvbGRLZXlUb0lkeDtcbiAgICAgICAgdmFyIGlkeEluT2xkO1xuICAgICAgICB2YXIgZWxtVG9Nb3ZlO1xuICAgICAgICB2YXIgYmVmb3JlO1xuICAgICAgICB3aGlsZSAob2xkU3RhcnRJZHggPD0gb2xkRW5kSWR4ICYmIG5ld1N0YXJ0SWR4IDw9IG5ld0VuZElkeCkge1xuICAgICAgICAgICAgaWYgKG9sZFN0YXJ0Vm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTsgLy8gVm5vZGUgbWlnaHQgaGF2ZSBiZWVuIG1vdmVkIGxlZnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG9sZEVuZFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5ld1N0YXJ0Vm5vZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG5ld0VuZFZub2RlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdFbmRWbm9kZSA9IG5ld0NoWy0tbmV3RW5kSWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoc2FtZVZub2RlKG9sZEVuZFZub2RlLCBuZXdFbmRWbm9kZSkpIHtcbiAgICAgICAgICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgICAgICAgICBuZXdFbmRWbm9kZSA9IG5ld0NoWy0tbmV3RW5kSWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSkpIHtcbiAgICAgICAgICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBvbGRTdGFydFZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKG9sZEVuZFZub2RlLmVsbSkpO1xuICAgICAgICAgICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgICAgICAgICBuZXdFbmRWbm9kZSA9IG5ld0NoWy0tbmV3RW5kSWR4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHtcbiAgICAgICAgICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBvbGRFbmRWbm9kZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAob2xkS2V5VG9JZHggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBvbGRLZXlUb0lkeCA9IGNyZWF0ZUtleVRvT2xkSWR4KG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWR4SW5PbGQgPSBvbGRLZXlUb0lkeFtuZXdTdGFydFZub2RlLmtleV07XG4gICAgICAgICAgICAgICAgaWYgKGlzVW5kZWYoaWR4SW5PbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgICAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbG1Ub01vdmUgPSBvbGRDaFtpZHhJbk9sZF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbG1Ub01vdmUuc2VsICE9PSBuZXdTdGFydFZub2RlLnNlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRjaFZub2RlKGVsbVRvTW92ZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZENoW2lkeEluT2xkXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBlbG1Ub01vdmUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob2xkU3RhcnRJZHggPiBvbGRFbmRJZHgpIHtcbiAgICAgICAgICAgIGJlZm9yZSA9IG5ld0NoW25ld0VuZElkeCArIDFdID09IG51bGwgPyBudWxsIDogbmV3Q2hbbmV3RW5kSWR4ICsgMV0uZWxtO1xuICAgICAgICAgICAgYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCBuZXdDaCwgbmV3U3RhcnRJZHgsIG5ld0VuZElkeCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChuZXdTdGFydElkeCA+IG5ld0VuZElkeCkge1xuICAgICAgICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgb2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICAgICAgdmFyIGksIGhvb2s7XG4gICAgICAgIGlmIChpc0RlZihpID0gdm5vZGUuZGF0YSkgJiYgaXNEZWYoaG9vayA9IGkuaG9vaykgJiYgaXNEZWYoaSA9IGhvb2sucHJlcGF0Y2gpKSB7XG4gICAgICAgICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVsbSA9IHZub2RlLmVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgICAgdmFyIG9sZENoID0gb2xkVm5vZGUuY2hpbGRyZW47XG4gICAgICAgIHZhciBjaCA9IHZub2RlLmNoaWxkcmVuO1xuICAgICAgICBpZiAob2xkVm5vZGUgPT09IHZub2RlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBpZiAodm5vZGUuZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnVwZGF0ZS5sZW5ndGg7ICsraSlcbiAgICAgICAgICAgICAgICBjYnMudXBkYXRlW2ldKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgICAgICAgICBpID0gdm5vZGUuZGF0YS5ob29rO1xuICAgICAgICAgICAgaWYgKGlzRGVmKGkpICYmIGlzRGVmKGkgPSBpLnVwZGF0ZSkpXG4gICAgICAgICAgICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc1VuZGVmKHZub2RlLnRleHQpKSB7XG4gICAgICAgICAgICBpZiAoaXNEZWYob2xkQ2gpICYmIGlzRGVmKGNoKSkge1xuICAgICAgICAgICAgICAgIGlmIChvbGRDaCAhPT0gY2gpXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZUNoaWxkcmVuKGVsbSwgb2xkQ2gsIGNoLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKVxuICAgICAgICAgICAgICAgICAgICBhcGkuc2V0VGV4dENvbnRlbnQoZWxtLCAnJyk7XG4gICAgICAgICAgICAgICAgYWRkVm5vZGVzKGVsbSwgbnVsbCwgY2gsIDAsIGNoLmxlbmd0aCAtIDEsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihvbGRDaCkpIHtcbiAgICAgICAgICAgICAgICByZW1vdmVWbm9kZXMoZWxtLCBvbGRDaCwgMCwgb2xkQ2gubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChpc0RlZihvbGRWbm9kZS50ZXh0KSkge1xuICAgICAgICAgICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvbGRWbm9kZS50ZXh0ICE9PSB2bm9kZS50ZXh0KSB7XG4gICAgICAgICAgICBhcGkuc2V0VGV4dENvbnRlbnQoZWxtLCB2bm9kZS50ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNEZWYoaG9vaykgJiYgaXNEZWYoaSA9IGhvb2sucG9zdHBhdGNoKSkge1xuICAgICAgICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiBwYXRjaChvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICAgICAgdmFyIGksIGVsbSwgcGFyZW50O1xuICAgICAgICB2YXIgaW5zZXJ0ZWRWbm9kZVF1ZXVlID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucHJlLmxlbmd0aDsgKytpKVxuICAgICAgICAgICAgY2JzLnByZVtpXSgpO1xuICAgICAgICBpZiAoIWlzVm5vZGUob2xkVm5vZGUpKSB7XG4gICAgICAgICAgICBvbGRWbm9kZSA9IGVtcHR5Tm9kZUF0KG9sZFZub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2FtZVZub2RlKG9sZFZub2RlLCB2bm9kZSkpIHtcbiAgICAgICAgICAgIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZWxtID0gb2xkVm5vZGUuZWxtO1xuICAgICAgICAgICAgcGFyZW50ID0gYXBpLnBhcmVudE5vZGUoZWxtKTtcbiAgICAgICAgICAgIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudCwgdm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcoZWxtKSk7XG4gICAgICAgICAgICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudCwgW29sZFZub2RlXSwgMCwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGluc2VydGVkVm5vZGVRdWV1ZS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaW5zZXJ0ZWRWbm9kZVF1ZXVlW2ldLmRhdGEuaG9vay5pbnNlcnQoaW5zZXJ0ZWRWbm9kZVF1ZXVlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnBvc3QubGVuZ3RoOyArK2kpXG4gICAgICAgICAgICBjYnMucG9zdFtpXSgpO1xuICAgICAgICByZXR1cm4gdm5vZGU7XG4gICAgfTtcbn1cbmV4cG9ydHMuaW5pdCA9IGluaXQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1zbmFiYmRvbS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBoXzEgPSByZXF1aXJlKFwiLi9oXCIpO1xuZnVuY3Rpb24gY29weVRvVGh1bmsodm5vZGUsIHRodW5rKSB7XG4gICAgdGh1bmsuZWxtID0gdm5vZGUuZWxtO1xuICAgIHZub2RlLmRhdGEuZm4gPSB0aHVuay5kYXRhLmZuO1xuICAgIHZub2RlLmRhdGEuYXJncyA9IHRodW5rLmRhdGEuYXJncztcbiAgICB0aHVuay5kYXRhID0gdm5vZGUuZGF0YTtcbiAgICB0aHVuay5jaGlsZHJlbiA9IHZub2RlLmNoaWxkcmVuO1xuICAgIHRodW5rLnRleHQgPSB2bm9kZS50ZXh0O1xuICAgIHRodW5rLmVsbSA9IHZub2RlLmVsbTtcbn1cbmZ1bmN0aW9uIGluaXQodGh1bmspIHtcbiAgICB2YXIgY3VyID0gdGh1bmsuZGF0YTtcbiAgICB2YXIgdm5vZGUgPSBjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBjdXIuYXJncyk7XG4gICAgY29weVRvVGh1bmsodm5vZGUsIHRodW5rKTtcbn1cbmZ1bmN0aW9uIHByZXBhdGNoKG9sZFZub2RlLCB0aHVuaykge1xuICAgIHZhciBpLCBvbGQgPSBvbGRWbm9kZS5kYXRhLCBjdXIgPSB0aHVuay5kYXRhO1xuICAgIHZhciBvbGRBcmdzID0gb2xkLmFyZ3MsIGFyZ3MgPSBjdXIuYXJncztcbiAgICBpZiAob2xkLmZuICE9PSBjdXIuZm4gfHwgb2xkQXJncy5sZW5ndGggIT09IGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgIGNvcHlUb1RodW5rKGN1ci5mbi5hcHBseSh1bmRlZmluZWQsIGFyZ3MpLCB0aHVuayk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGlmIChvbGRBcmdzW2ldICE9PSBhcmdzW2ldKSB7XG4gICAgICAgICAgICBjb3B5VG9UaHVuayhjdXIuZm4uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSwgdGh1bmspO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvcHlUb1RodW5rKG9sZFZub2RlLCB0aHVuayk7XG59XG5leHBvcnRzLnRodW5rID0gZnVuY3Rpb24gdGh1bmsoc2VsLCBrZXksIGZuLCBhcmdzKSB7XG4gICAgaWYgKGFyZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhcmdzID0gZm47XG4gICAgICAgIGZuID0ga2V5O1xuICAgICAgICBrZXkgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBoXzEuaChzZWwsIHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIGhvb2s6IHsgaW5pdDogaW5pdCwgcHJlcGF0Y2g6IHByZXBhdGNoIH0sXG4gICAgICAgIGZuOiBmbixcbiAgICAgICAgYXJnczogYXJnc1xuICAgIH0pO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMudGh1bms7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10aHVuay5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbmZ1bmN0aW9uIHZub2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIGVsbSkge1xuICAgIHZhciBrZXkgPSBkYXRhID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBkYXRhLmtleTtcbiAgICByZXR1cm4geyBzZWw6IHNlbCwgZGF0YTogZGF0YSwgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICB0ZXh0OiB0ZXh0LCBlbG06IGVsbSwga2V5OiBrZXkgfTtcbn1cbmV4cG9ydHMudm5vZGUgPSB2bm9kZTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHZub2RlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dm5vZGUuanMubWFwIiwiaW1wb3J0IHsgaCB9IGZyb20gJ3NuYWJiZG9tJztcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRzOiBFeGFtcGxlID0ge1xuICBuYW1lOiAnRGVmYXVsdCBjb25maWd1cmF0aW9uJyxcbiAgcnVuKGVsKSB7XG4gICAgd2luZG93LkNoZXNzZ3JvdW5kKGVsKTtcbiAgfVxufTtcbmV4cG9ydCBjb25zdCBmcm9tRmVuOiBFeGFtcGxlID0ge1xuICBuYW1lOiAnRnJvbSBGRU4sIGZyb20gYmxhY2sgUE9WJyxcbiAgcnVuKGVsKSB7XG4gICAgd2luZG93LkNoZXNzZ3JvdW5kKGVsLCB7XG4gICAgICBmZW46JzJyM2sxL3BwMlFwYnAvNGIxcDEvM3A0LzNuMVBQMS8yTjRQL1BxNi9SMksxQjFSIHcgLScsXG4gICAgICBvcmllbnRhdGlvbjogJ2JsYWNrJ1xuICAgIH0pO1xuICB9XG59O1xuZXhwb3J0IGNvbnN0IG9yaWVudGF0aW9uVG9nZ2xlOiBFeGFtcGxlID0ge1xuICBuYW1lOiAnT3JpZW50YXRpb24gdG9nZ2xlJyxcbiAgcnVuKGVsKSB7XG4gICAgY29uc3QgY2cgPSB3aW5kb3cuQ2hlc3Nncm91bmQoZWwsIHtcbiAgICAgIGZlbjonMnIzazEvcHAyUXBicC80YjFwMS8zcDQvM24xUFAxLzJONFAvUHE2L1IySzFCMVIgdyAtJyxcbiAgICAgIG9yaWVudGF0aW9uOiAnYmxhY2snXG4gICAgfSk7XG4gICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgYnV0dG9uLmlubmVySFRNTCA9ICdUb2dnbGUgb3JpZW50YXRpb24nO1xuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNnLnRvZ2dsZU9yaWVudGF0aW9uKTtcbiAgICBlbC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gIH1cbn07XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9pbmRleC5kLnRzXCIgLz5cblxuaW1wb3J0IHsgaCwgaW5pdCB9IGZyb20gJ3NuYWJiZG9tJztcbmltcG9ydCB7IFZOb2RlIH0gZnJvbSAnc25hYmJkb20vdm5vZGUnXG5pbXBvcnQga2xhc3MgZnJvbSAnc25hYmJkb20vbW9kdWxlcy9jbGFzcyc7XG5pbXBvcnQgYXR0cmlidXRlcyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnO1xuaW1wb3J0IGxpc3RlbmVycyBmcm9tICdzbmFiYmRvbS9tb2R1bGVzL2V2ZW50bGlzdGVuZXJzJztcbmltcG9ydCAqIGFzIHBhZ2UgZnJvbSAncGFnZSdcblxuaW1wb3J0ICogYXMgYmFzaWNzIGZyb20gJy4vYmFzaWNzJ1xuaW1wb3J0ICogYXMgcGxheSBmcm9tICcuL3BsYXknXG5cbmNvbnN0IHBhdGNoID0gaW5pdChba2xhc3MsIGF0dHJpYnV0ZXMsIGxpc3RlbmVyc10pO1xuXG5leHBvcnQgZnVuY3Rpb24gcnVuKGVsZW1lbnQ6IEVsZW1lbnQpIHtcblxuICBjb25zdCBleGFtcGxlczogRXhhbXBsZVtdID0gW1xuICAgIGJhc2ljcy5kZWZhdWx0cywgYmFzaWNzLmZyb21GZW4sIGJhc2ljcy5vcmllbnRhdGlvblRvZ2dsZSxcbiAgICBwbGF5LmluaXRpYWxcbiAgXTtcblxuICBsZXQgZXhhbXBsZTogRXhhbXBsZSwgdm5vZGU6IFZOb2RlO1xuXG4gIGZ1bmN0aW9uIHJlZHJhdygpIHtcbiAgICB2bm9kZSA9IHBhdGNoKHZub2RlIHx8IGVsZW1lbnQsIHJlbmRlcigpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJ1bkV4YW1wbGUodm5vZGU6IFZOb2RlKSB7XG4gICAgY29uc3QgZWwgPSB2bm9kZS5lbG0gYXMgSFRNTEVsZW1lbnQ7XG4gICAgZWwuaW5uZXJIVE1MID0gJyc7XG4gICAgZXhhbXBsZS5ydW4oZWwpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHJldHVybiBoKCdkaXYjY2hlc3Nncm91bmQtZXhhbXBsZXMnLCBbXG4gICAgICBoKCdtZW51JywgZXhhbXBsZXMubWFwKChleCwgaWQpID0+IHtcbiAgICAgICAgcmV0dXJuIGgoJ2EnLCB7XG4gICAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAgIGFjdGl2ZTogZXhhbXBsZS5uYW1lID09PSBleC5uYW1lXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvbjogeyBjbGljazogKCkgPT4gcGFnZShgLyR7aWR9YCkgfVxuICAgICAgICB9LCBleC5uYW1lKTtcbiAgICAgIH0pKSxcbiAgICAgIGgoJ3NlY3Rpb24nLCBbXG4gICAgICAgIGgoJ2Rpdi5jaGVzc2dyb3VuZC53b29kLnNtYWxsLm1lcmlkYS5jb29yZGluYXRlcycsIHtcbiAgICAgICAgICBob29rOiB7XG4gICAgICAgICAgICBpbnNlcnQ6IHJ1bkV4YW1wbGUsXG4gICAgICAgICAgICBwb3N0cGF0Y2g6IHJ1bkV4YW1wbGVcbiAgICAgICAgICB9XG4gICAgICAgIH0pLFxuICAgICAgICBoKCdwJywgZXhhbXBsZS5uYW1lKVxuICAgICAgXSlcbiAgICBdKTtcbiAgfVxuXG4gIHBhZ2UoeyBjbGljazogZmFsc2UsIHBvcHN0YXRlOiBmYWxzZSwgZGlzcGF0Y2g6IGZhbHNlLCBoYXNoYmFuZzogdHJ1ZSB9KTtcbiAgcGFnZSgnLzppZCcsIGN0eCA9PiB7XG4gICAgZXhhbXBsZSA9IGV4YW1wbGVzW3BhcnNlSW50KGN0eC5wYXJhbXMuaWQpIHx8IDBdO1xuICAgIHJlZHJhdygpO1xuICB9KTtcbiAgcGFnZShsb2NhdGlvbi5oYXNoLnNsaWNlKDIpIHx8ICcvMCcpO1xufVxuIiwiaW1wb3J0IHsgQ2hlc3MgfSBmcm9tICdjaGVzcy5qcyc7XG5pbXBvcnQgeyB0b0NvbG9yLCB0b0Rlc3RzIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbDogRXhhbXBsZSA9IHtcbiAgbmFtZTogJ1BsYXkgbGVnYWwgbW92ZXMgZnJvbSBpbml0aWFsIHBvc2l0aW9uJyxcbiAgcnVuKGVsKSB7XG4gICAgY29uc3QgY2hlc3MgPSBuZXcgQ2hlc3MoKTtcbiAgICBjb25zdCBjZyA9IHdpbmRvdy5DaGVzc2dyb3VuZChlbCwge1xuICAgICAgbW92YWJsZToge1xuICAgICAgICBjb2xvcjogJ3doaXRlJyxcbiAgICAgICAgZnJlZTogZmFsc2UsXG4gICAgICAgIGRlc3RzOiB0b0Rlc3RzKGNoZXNzKVxuICAgICAgfVxuICAgIH0pO1xuICAgIGNnLnNldCh7XG4gICAgICBtb3ZhYmxlOiB7XG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgIGFmdGVyKG9yaWcsIGRlc3QpIHtcbiAgICAgICAgICAgIGNoZXNzLm1vdmUoe2Zyb206IG9yaWcsIHRvOiBkZXN0fSk7XG4gICAgICAgICAgICBjZy5zZXQoe1xuICAgICAgICAgICAgICB0dXJuQ29sb3I6IHRvQ29sb3IoY2hlc3MpLFxuICAgICAgICAgICAgICBtb3ZhYmxlOiB7XG4gICAgICAgICAgICAgICAgY29sb3I6IHRvQ29sb3IoY2hlc3MpLFxuICAgICAgICAgICAgICAgIGRlc3RzOiB0b0Rlc3RzKGNoZXNzKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcbiIsImV4cG9ydCBmdW5jdGlvbiB0b0Rlc3RzKGNoZXNzOiBhbnkpOiBEZXN0cyB7XG4gIGNvbnN0IGRlc3RzID0ge307XG4gIGNoZXNzLlNRVUFSRVMuZm9yRWFjaChzID0+IHtcbiAgICBjb25zdCBtcyA9IGNoZXNzLm1vdmVzKHtzcXVhcmU6IHMsIHZlcmJvc2U6IHRydWV9KTtcbiAgICBpZiAobXMubGVuZ3RoKSBkZXN0c1tzXSA9IG1zLm1hcChtID0+IG0udG8pO1xuICB9KTtcbiAgcmV0dXJuIGRlc3RzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9Db2xvcihjaGVzczogYW55KTogQ29sb3Ige1xuICByZXR1cm4gKGNoZXNzLnR1cm4oKSA9PT0gJ3cnKSA/ICd3aGl0ZScgOiAnYmxhY2snO1xufVxuIl19
