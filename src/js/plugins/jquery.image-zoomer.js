;(function($) {
    'use strict';

    /**
     * Hypefactory Image Zoom Plugin.
     */
    $.plugin('hfImageZoom', {

        /**
         * Default options for the collapse panel plugin.
         *
         * @public
         * @property defaults
         * @type {Object}
         */

        defaults: {
            inDuration: 300,
            outDuration: 200,
            placeholder: '',
            placeholderClass: 'image-zoom--placeholder',
            overlayID: 'image-zoom--overlay',
            captionClass: 'image-zoom--caption',
            activeClass: 'is--active',
            caption: '',
            margin: 50
        },

        /**
         * Initializes the plugin and sets up all necessary event listeners.
         */
        init: function() {
            var me = this;

            me.applyDataAttributes();

            me.createProperties();
            me.registerEvents();
        },

        createProperties: function () {
            var me = this,
                opts = me.opts;

            me.overlayActive = false;
            me.doneAnimating = true;
            me.placeholder = $('<div></div>').addClass(opts.placeholderClass);
            me.originalWidth = 0;
            me.originalHeight = 0;
            me.originInlineStyles = me.$el.attr('style');

            // Wrap
            me.$el.before(me.placeholder);
            me.placeholder.append(me.$el);
        },

        /**
         * Registers all necessary event listener.
         */
        registerEvents: function() {
            var me = this;

            me._on(me.$el, 'click', $.proxy(me.onClickImageZoom, me));

            $.publish('plugin/hfImageZoom/onRegisterEvents', [ me ]);
        },

        _updateMethodProperties: function() {
            var me = this;

            me.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.documentElement.getElementsByTagName('body')[0].clientWidth;
            me.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.documentElement.getElementsByTagName('body')[0].clientHeight;
        },

        _makeAncestorsOverflowVisible: function () {
            var me = this;

            me.ancestorsChanged = $();

            var ancestor = me.placeholder[0].parentNode;

            while (ancestor !== null && !$(ancestor).is(document)) {
                var curr = $(ancestor);

                if (curr.css('overflow') !== 'visible') {
                    curr.css('overflow', 'visible');

                    if (me.ancestorsChanged === undefined) {
                        me.ancestorsChanged = curr;
                    } else {
                        me.ancestorsChanged = me.ancestorsChanged.add(curr);
                    }
                }

                ancestor = ancestor.parentNode;
            }
        },
        
        _getDocumentScrollTop: function() {
            return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        },

        _getDocumentScrollLeft: function() {
            return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        },

        _animateImageIn: function () {
            var me = this,
                opts = me.opts;

/*            me.$el.stop().animate({
                height: me.newHeight,
                width: me.newWidth,
                left: me._getDocumentScrollLeft() + me.windowWidth / 2 - me.placeholder.offset().left - me.newWidth / 2,
                top: me._getDocumentScrollTop() + me.windowHeight / 2 - me.placeholder.offset().top - me.newHeight / 2
            }, opts.inDuration, function() {
                me.doneAnimating = true;

                $.publish('plugin/hfImageZoom/onOpenEnd', [ me ]);
            });

            me.$el.css({
                maxWidth: me.newWidth,
                maxHeight: me.newHeight
            });*/

            var animOptions = {
                targets: me.$el[0],
                height: [me.originalHeight, me.newHeight],
                width: [me.originalWidth, me.newWidth],
                left: me._getDocumentScrollLeft() + me.windowWidth / 2 - me.placeholder.offset().left - me.newWidth / 2,
                top: me._getDocumentScrollTop() + me.windowHeight / 2 - me.placeholder.offset().top - me.newHeight / 2,
                duration: opts.inDuration,
                easing: 'easeOutQuad',
                complete: function () {
                    me.doneAnimating = true;

                    // onOpenEnd callback Subscribe
                }
            };

            // Override max-width or max-height if needed
            me.maxWidth = me.$el.css('max-width');
            me.maxHeight = me.$el.css('max-height');

            if (me.maxWidth !== 'none') {
                animOptions.maxWidth = me.newWidth;
            }

            if (me.maxHeight !== 'none') {
                animOptions.maxHeight = me.newHeight;
            }

            anime(animOptions);

        },

        _animateImageOut: function () {
            var me = this,
                opts = me.opts;

            /*me.$el.stop().animate({
                width: me.originalWidth,
                height: me.originalHeight,
                left: 0,
                top: 0,
            }, opts.outDuration, function () {
                me.placeholder.css({
                    height: '',
                    width: '',
                    position: '',
                    top: '',
                    left: ''
                });

                // Revert to width or height attribute
                if (me.attrWidth) me.$el.attr('width', me.attrWidth);

                if (me.attrHeight) me.$el.attr('height', me.attrHeight);

                me.$el.removeAttr('style');
                me.originInlineStyles && me.$el.attr('style', me.originInlineStyles);

                // Remove class
                me.$el.removeClass('active');
                me.doneAnimating = true;

                // Remove overflow overrides on ancestors
                if (me.ancestorsChanged.length) me.ancestorsChanged.css('overflow', '');

                // onCloseEnd callback Subscribe
            });*/

            var animOptions = {
                targets: me.$el[0],
                width: me.originalWidth,
                height: me.originalHeight,
                left: 0,
                top: 0,
                duration: opts.outDuration,
                easing: 'easeOutQuad',
                complete: function () {
                    me.placeholder.css({
                        height: '',
                        width: '',
                        position: '',
                        top: '',
                        left: ''
                    });

                    // Revert to width or height attribute
                    if (me.attrWidth) {
                        me.$el.attr('width', me.attrWidth);
                    }
                    if (me.attrHeight) {
                        me.$el.attr('height', me.attrHeight);
                    }

                    me.$el.removeAttr('style');
                    me.originInlineStyles && me.$el.attr('style', me.originInlineStyles);

                    // Remove class
                    me.$el.removeClass('active');
                    me.doneAnimating = true;

                    // Remove overflow overrides on ancestors
                    if (me.ancestorsChanged.length) {
                        me.ancestorsChanged.css('overflow', '');
                    }

                    // onCloseEnd callback Subscribe
                }
            };

            anime(animOptions);
        },

        open: function () {
            var me = this,
                opts = me.opts;

            me._updateMethodProperties();

            me.originalWidth = me.$el.width();
            me.originalHeight = me.$el.height();

            // Set states
            me.doneAnimating = false;
            me.$el.addClass(opts.activeClass);
            me.overlayActive = true;


            // onOpenStart callback Subscribe

            // Set positioning for placeholder
            me.placeholder.css({
                width: me.$el.width() + 'px',
                height: me.$el.height() + 'px',
                position: 'relative',
                top: 0,
                left: 0
            });

            me._makeAncestorsOverflowVisible();

            // Set css on origin
            me.$el.css({
                position: 'absolute',
                'z-index': 1000,
                'will-change': 'left, top, width, height'
            });

            // Change from width or height attribute to css
            me.attrWidth = me.$el.attr('width');
            me.attrHeight = me.$el.attr('height');

            if (me.attrWidth) {
                me.$el.css('width', me.attrWidth + 'px');
                me.$el.removeAttr('width');
            }

            if (me.attrHeight) {
                me.$el.css('width', me.attrHeight + 'px');
                me.$el.removeAttr('height');
            }

            // Add overlay
            me.$overlay = $('<div></div>').attr('id', opts.overlayID)
                .css({
                    opacity: 0
                })
                .one('click', function () {
                    if (me.doneAnimating) me.close();
                });

            // Put before in origin image to preserve z-index layering.
            me.$el.before(me.$overlay);

            // Set dimensions if needed
            var overlayOffset = me.$overlay[0].getBoundingClientRect();

            me.$overlay.css({
                width: me.windowWidth + 'px',
                height: me.windowHeight + 'px',
                left: -1 * overlayOffset.left + 'px',
                top: -1 * overlayOffset.top + 'px'
            });

            anime.remove(me.$el[0]);
            anime.remove(me.$overlay[0]);

            // Animate Overlay
            /*me.$overlay.stop().animate({
                opacity: 1
            }, opts.inDuration);*/

            anime({
                targets: me.$overlay[0],
                opacity: 1,
                duration: opts.inDuration,
                easing: 'easeOutQuad'
            });

            // Add and animate caption if it exists
            if (opts.caption !== '') {
                me.$photoCaption = $('<div></div>').addClass(opts.captionClass);
                me.$photoCaption.text(opts.caption);
                me.$el.after(me.$photoCaption);
                me.$photoCaption.css({
                    display: 'inline'
                });

                /*me.$photoCaption.stop().animate({
                    opacity: 1
                }, opts.inDuration);*/

                anime({
                    targets: me.$photoCaption[0],
                    opacity: 1,
                    duration: opts.inDuration,
                    easing: 'easeOutQuad'
                });
            }

            // Resize Image
            var ratio = 0,
                widthPercent = me.originalWidth / me.windowWidth,
                heightPercent = me.originalHeight / me.windowHeight;

            me.newWidth = 0;
            me.newHeight = 0;

            if (widthPercent > heightPercent) {
                ratio = me.originalHeight / me.originalWidth;
                me.newWidth = me.windowWidth * 0.9;
                me.newHeight = me.windowWidth * 0.9 * ratio;
            } else {
                ratio = me.originalWidth / me.originalHeight;
                me.newWidth = me.windowHeight * 0.9 * ratio;
                me.newHeight = me.windowHeight * 0.9;
            }

            me._animateImageIn();

            me._on($(window), 'scroll', $.proxy(me.onScrollWindow, me));
            me._on($(window), 'resize', $.proxy(me.onResizeWindow, me));
            me._on($(window), 'keyup', $.proxy(me.onKeyPressEsc, me));
        },

        close: function () {
            var me = this,
                opts = me.opts;

            me._updateMethodProperties();
            me.doneAnimating = false;

            // onCloseStart callback Subscibe

            anime.remove(me.$el[0]);
            anime.remove(me.$overlay[0]);

            if (opts.caption !== '') {
                anime.remove(me.$photoCaption[0]);
            }

            anime({
                targets: me.$overlay[0],
                opacity: 0,
                duration: opts.outDuration,
                easing: 'easeOutQuad',
                complete: function () {
                    me.overlayActive = false;
                    me.$overlay.remove();
                }
            });

            /*me.$overlay.stop().animate({
                opacity: 0,
            }, me.outDuration, function () {
                me.overlayActive = false;
                me.$overlay.remove();
            });*/

            // Remove Caption + reset css settings on image
            if (me.$photoCaption && opts.caption !== '') {
                /*me.$photoCaption.stop().animate({
                    opacity: 0
                }, opts.outDuration, function () {
                    me.$photoCaption.remove();
                });*/

                anime({
                    targets: me.$photoCaption[0],
                    opacity: 0,
                    duration: opts.outDuration,
                    easing: 'easeOutQuad',
                    complete: function () {
                        me.$photoCaption.remove();
                    }
                });
            }

            me.$el.removeClass(opts.activeClass);

            me._off($(window), 'scroll');
            me._off($(window), 'resize');
            me._off($(window), 'keyup');


            me._animateImageOut();
        },

        onClickImageZoom: function (e) {
            var me = this;

            if (me.doneAnimating === false || (me.overlayActive && me.doneAnimating)) {
                me.close();
            } else {
                me.open();
            }
        },

        onScrollWindow: function () {
            var me = this;

            me.closeByEventHandler();
        },

        onResizeWindow: function () {
            var me = this;

            me.closeByEventHandler();
        },

        onKeyPressEsc: function (e) {
            var me = this;

            if (e.keyCode === 27 && me.doneAnimating && me.overlayActive) {
                me.close();
            }
        },

        // Handle Close Event
        closeByEventHandler: function () {
            var me = this;

            if (me.overlayActive) me.close();
        },

        /**
         * Destroy method of the plugin.
         * Removes attached event listener.
         */
        destroy: function() {
            var me = this;

            me._destroy();
        }
    });
})(jQuery);