
// jquery.droppabilly.js
// Version: 0.0.2
// Author: Chien-Hung Chen (github.com/chienhungchen)
// jQuery plugin for creating droppables to use with draggabilly.js
// This is suppose to be a barebones alternative (when coupled with draggabilly.js) to jQuery UI + touchpunch

// TODO: Allow clone should be on by default, allow clone needs to be able to be turned off
// Allow clone will allow '#id-draggabilly-clone'

(function($){
    "use strict";

    var methods = {
        init: function(options) {

            var curDroppabilly = this,
                flags = {
                    wasOver : false,
                    hasDropped : false,
                    hasReleased : true,
                    invokedOverFunc : false,
                    invokedOutFunc : false,
                    invokedDropFunc : false
                },
                draggies = $(options.dragsters);

            function dragMove(mouseEvent, droppabilly, draggabilly, flags) {
                //event: over
                if(methods.overlap(droppabilly, draggabilly)) {
                    flags.wasOver = true;
                    flags.invokedOutFunc = false;
                    if(!flags.hasDropped && !flags.invokedOverFunc) {
                        if(options.over(droppabilly, draggabilly)) {
                            flags.invokedOverFunc = true;
                        }
                    }
                }
                //event: out
                else if(flags.wasOver && !flags.hasReleased) {
                    if(!flags.invokedOutFunc) {
                        if(options.out(droppabilly, draggabilly)) {
                            flags.invokedOutFunc = true;
                        }
                    }
                    flags.invokedOverFunc = false;
                }
            }

            function dragEnd(mouseEvent, droppabilly, draggabilly, flags) {
                //event: drop on drop zone
                if(methods.overlap(droppabilly, draggabilly)) {
                    if(!flags.invokedDropFunc) {
                        options.drop(droppabilly, draggabilly);
                        flags.invokedDropFunc = true;
                    }
                    flags.hasDropped = true;
                }

                flags.hasReleased = true;
                flags.wasOver = false;
                flags.invokedOverFunc = false;
                flags.invokedOutFunc = false;
                flags.invokedDropFunc = false;
            }

            function dragStart(mouseEvent, droppabilly, draggabilly, flags) {
                flags.hasDropped = false;
                flags.hasReleased = false;
            }



            for(var i = 0; i < draggies.length; i++) {
                draggies[i].onmousemove = function(event) {
                    dragMove(event, curDroppabilly, $(this), flags);
                };

                draggies[i].addEventListener("touchmove", function(event) {
                    dragMove(event, curDroppabilly, $(this), flags);
                }, false);
                
                draggies[i].onmouseup = function(event) {
                    dragEnd(event, curDroppabilly, $(this), flags);
                };

                draggies[i].addEventListener("touchend", function(event) {
                    dragEnd(event, curDroppabilly, $(this), flags);
                }, false);
                
                draggies[i].onmousedown = function(event) {
                    dragStart(event, curDroppabilly, $(this), flags);
                };

                draggies[i].addEventListener("touchstart", function(event) {
                    dragStart(event, curDroppabilly, $(this), flags);
                }, false);
            }
        },
        overlap: function(a, b) {
            var p1 = methods.getPositions(a),
            p2 = methods.getPositions(b);
            return methods.comparePositions(p1[0], p2[0]) && methods.comparePositions(p1[1], p2[1]);
        },
        getPositions: function(el) {
            var pos = $(el).offset(),
            width = $(el).outerWidth(),
            height = $(el).outerHeight();
            return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];
        },
        comparePositions: function(p1, p2) {
            var r1, r2;
            r1 = p1[0] < p2[0] ? p1 : p2;
            r2 = p1[0] < p2[0] ? p2 : p1;
            return r1[1] > r2[0] || r1[0] === r2[0];
        },
        getDefined: function(f) {
            return (f === undefined || f === null) ? function() {} : f;
        }
    };

    $.fn.droppabilly = function( method ) {
        //error handle empty event arguments
        arguments[0].drop = methods.getDefined(arguments[0].drop);
        arguments[0].out = methods.getDefined(arguments[0].out);
        arguments[0].over = methods.getDefined(arguments[0].over);

        if(methods[method]) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        }
        else if(typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.droppabilly' );
        }
    };

})(jQuery);
