;(function ($) {
    'use strict';

    /**
     * Hypefactory Scroll Plugin.
     *
     * This plugin scrolls the page or given element to a certain point when the
     * plugin element was clicked.
     */
    $.plugin('hfTooltip', {

        defaults: {

            exitDelay: 200,
            enterDelay: 0,
            html: null,
            margin: 5,
            inDuration: 250,
            outDuration: 200,
            position: 'bottom',
            transitionMovement: 10,
            content: ''
        },

        /**
         * Initializes the plugin and register its events
         *
         * @public
         * @method init
         */
        init: function () {
            var me = this;

            me.applyDataAttributes();

            me.createProperties();

            me.registerEvents();
        },

        createProperties: function () {
            var me = this,
                opts = me.opts;

            me.keys = {
                TAB: 9,
                ENTER: 13,
                ESC: 27,
                ARROW_UP: 38,
                ARROW_DOWN: 40
            };

            /**
             * TabPress Keydown handler
             */
            me.tabPressed = false;
            me.keyDown = false;

            // Set default states for the plugin
            me.isOpen = false;
            me.isHovered = false;
            me.isFocused = false;

            // Create Elements
            me.$tooltip = $('<div></div>', {class: 'tooltip'});

            // Todo: Add HTML Input Option data-html="a*href=www.domain.com/...."
            me.$tooltipContent = $('<div></div>', {class: 'tooltip-content'}).html(opts.content);

            // Add Tooltip with Content to the Document
            me.$tooltip.append(me.$tooltipContent);
            $('body').append(me.$tooltip);
        },

        update: function () {
            var me = this;

            me._updateTooltipContent();
        },

        /**
         * This method registers the event listeners when when clicking
         * or tapping the plugin element.
         *
         * @public
         * @method registerEvents
         */
        registerEvents: function () {
            var me = this;

            me._on(me.$el, 'mouseenter', $.proxy(me.onTooltipMouseEnter, me));
            me._on(me.$el, 'mouseleave', $.proxy(me.onTooltipMouseLeave, me));
            me._on(me.$el, 'focus', $.proxy(me.onTooltipFocus, me));
            me._on(me.$el, 'blur', $.proxy(me.onTooltipBlur, me));

            // Document Events
            $(document).on('keydown', $.proxy(me._onKeyDownDocument, me));
            $(document).on('keyup', me._onKeyUpDocument, me);
            $(document).on('keyup', me._onFocusDocument, me);
            $(document).on('keyup', me._onBlurDocument, me);

            $.publish('plugin/hfTooltip/onRegisterEvents', [ me ]);
        },

        _updateTooltipContent: function() {
            var me = this,
                opts = me.opts;

            me.$tooltipContent.html(opts.content);
        },

        open: function(isManual) {
            var me = this;

            if (me.isOpen) return;

            isManual = isManual === undefined ? true : undefined; // Default value true
            me.isOpen = true;

            me._updateTooltipContent();
            me._setEnterDelayTimeout(isManual);
        },

        close: function() {
            var me = this;

            if (!me.isOpen) return;

            me.isHovered = false;
            me.isFocused = false;
            me.isOpen = false;
            me._setExitDelayTimeout();
        },

        /**
         * Create timeout which delays when the tooltip closes
         */
        _setExitDelayTimeout: function() {
            var me = this,
                opts = me.opts;

            clearTimeout(me._exitDelayTimeout);

            me._exitDelayTimeout = setTimeout(function() {
                if (me.isHovered || me.isFocused) return;

                me._animateOut();
            }, opts.exitDelay);
        },

        /**
         * Create timeout which delays when the toast closes
         */
        _setEnterDelayTimeout: function(isManual) {
            var me = this,
                opts = me.opts;

            clearTimeout(me._enterDelayTimeout);

            me._enterDelayTimeout = setTimeout(function () {
                if (!me.isHovered && !me.isFocused && !isManual) return;

                me._animateIn();
            }, opts.enterDelay);
        },

        /**
         * Multi browser support for document scroll top
         * @returns {Number}
         */
        _getDocumentScrollTop: function() {
            return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        },

        /**
         * Multi browser support for document scroll left
         * @returns {Number}
         */
        _getDocumentScrollLeft: function() {
            return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        },

        /**
         * Escapes hash from special characters
         * @param {Element} container  Container element that acts as the boundary
         * @param {Bounding} bounding  element bounding that is being checked
         * @param {Number} offset  offset from edge that counts as exceeding
         * @returns {Edges}
         */
        _checkWithinContainer: function(container, bounding, offset) {
            var edges = {
                    top: false,
                    right: false,
                    bottom: false,
                    left: false
                },
                containerRect = container.getBoundingClientRect();

            // If body element is smaller than viewport, use viewport height instead.
            var containerBottom =
                container === document.body
                    ? Math.max(containerRect.bottom, window.innerHeight)
                    : containerRect.bottom,
                scrollLeft = container.scrollLeft,
                scrollTop = container.scrollTop;

            var scrolledX = bounding.left - scrollLeft,
                scrolledY = bounding.top - scrollTop;

            // Check for container and viewport for each edge
            if (scrolledX < containerRect.left + offset || scrolledX < offset) edges.left = true;

            if (
                scrolledX + bounding.width > containerRect.right - offset ||
                scrolledX + bounding.width > window.innerWidth - offset
            ) edges.right = true;

            if (scrolledY < containerRect.top + offset || scrolledY < offset) edges.top = true;

            if (
                scrolledY + bounding.height > containerBottom - offset ||
                scrolledY + bounding.height > window.innerHeight - offset
            ) edges.bottom = true;

            return edges;
        },

        _positionTooltip: function() {
            var me = this,
                opts = me.opts;

            let origin = me.$el[0],
                tooltip = me.$tooltip[0],
                originHeight = origin.offsetHeight,
                originWidth = origin.offsetWidth,
                tooltipHeight = tooltip.offsetHeight,
                tooltipWidth = tooltip.offsetWidth,
                newCoordinates,
                margin = opts.margin,
                targetTop,
                targetLeft;

            me.movementX = 0;
            me.movementY = 0;

            targetTop = origin.getBoundingClientRect().top + me._getDocumentScrollTop();
            targetLeft = origin.getBoundingClientRect().left + me._getDocumentScrollLeft();

            if (opts.position === 'top') {
                targetTop += -tooltipHeight - margin;
                targetLeft += originWidth / 2 - tooltipWidth / 2;
                me.movementY = -opts.transitionMovement;
            } else if (opts.position === 'right') {
                targetTop += originHeight / 2 - tooltipHeight / 2;
                targetLeft += originWidth + margin;
                me.movementX = opts.transitionMovement;
            } else if (opts.position === 'left') {
                targetTop += originHeight / 2 - tooltipHeight / 2;
                targetLeft += -tooltipWidth - margin;
                me.movementX = -opts.transitionMovement;
            } else {
                targetTop += originHeight + margin;
                targetLeft += originWidth / 2 - tooltipWidth / 2;
                me.movementY = opts.transitionMovement;
            }

            newCoordinates = me._repositionWithinScreen(
                targetLeft,
                targetTop,
                tooltipWidth,
                tooltipHeight
            );

            me.$tooltip.css({
                top: newCoordinates.y + 'px',
                left: newCoordinates.x + 'px'
            });
        },

        _repositionWithinScreen: function(x, y, width, height) {
            var me = this,
                opts = me.opts;

            var scrollLeft = me._getDocumentScrollLeft(),
                scrollTop = me._getDocumentScrollTop(),
                newX = x - scrollLeft,
                newY = y - scrollTop;

            var bounding = {
                left: newX,
                top: newY,
                width: width,
                height: height
            };

            var offset = opts.margin + opts.transitionMovement,
                edges = me._checkWithinContainer(document.body, bounding, offset);

            if (edges.left) {
                newX = offset;
            } else if (edges.right) {
                newX -= newX + width - window.innerWidth;
            }

            if (edges.top) {
                newY = offset;
            } else if (edges.bottom) {
                newY -= newY + height - window.innerHeight;
            }

            return {
                x: newX + scrollLeft,
                y: newY + scrollTop
            };
        },

        _animateIn: function() {
            var me = this,
                opts = me.opts;

            me._positionTooltip();

            me.$tooltip.css({
                visibility: 'visible'
            });

            anime.remove(me.$tooltip[0]);
            anime({
                targets: me.$tooltip[0],
                opacity: 1,
                translateX: me.movementX,
                translateY: me.movementY,
                duration: opts.inDuration,
                easing: 'easeOutCubic'
            });
        },

        _animateOut: function() {
            var me = this,
                opts = me.opts;

            anime.remove(me.$tooltip[0]);
            anime({
                targets: me.$tooltip[0],
                opacity: 0,
                translateX: 0,
                translateY: 0,
                duration: opts.outDuration,
                easing: 'easeOutCubic'
            });
        },

        onTooltipMouseEnter: function() {
            var me = this;

            me.isHovered = true;
            me.isFocused = false; // Allows close of tooltip when opened by focus.
            me.open(false);
        },

        onTooltipMouseLeave: function() {
            var me = this;

            me.isHovered = false;
            me.isFocused = false; // Allows close of tooltip when opened by focus.
            me.close();
        },

        onTooltipFocus: function() {
            var me = this;

            if (me.tabPressed) {
                me.isFocused = true;

                me.open(false);
            }
        },

        onTooltipBlur: function() {
            var me = this;

            me.isFocused = false;
            me.close();
        },

        _onKeyDownDocument: function (e) {
          var me = this;

            me.keyDown = true;

            if (e.which === me.keys.TAB || e.which === me.keys.ARROW_DOWN || e.which === me.keys.ARROW_UP) me.tabPressed = true;
        },

        _onKeyUpDocument: function (e) {
          var me = this;

            me.keyDown = false;

            if (e.which === me.keys.TAB || e.which === me.keys.ARROW_DOWN || e.which === me.keys.ARROW_UP) me.tabPressed = false;
        },

        _onFocusDocument: function (e) {
            var me = this;

            if (me.keyDown) $('body').addClass('keyboard-focused');
        },

        _onBlurDocument: function () {
            $('body').removeClass('keyboard-focused');
        },

        /**
         * This method destroys the plugin and its registered events
         *
         * @public
         * @method destroy
         */
        destroy: function () {
            this._destroy();
        }
    });
})(jQuery);