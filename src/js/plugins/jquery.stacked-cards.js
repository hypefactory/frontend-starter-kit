;(function ($) {
    'use strict';

    /**
     * Hypefactory Scroll Plugin.
     *
     * This plugin scrolls the page or given element to a certain point when the
     * plugin element was clicked.
     */
    $.plugin('hfStackedCards', {

        /**
         * TODO@Component/StackedCards/Tasks:
         *  - Make Methods
         *  - - Seperate Logic to  Methods
         *  - Integrate Resize and Breakpoints
         *  - Make variable Factors for scrolling
         */

        defaults: {

            /**
             * The selector of the element which should be selected.
             *  Note: With the Dot.
             *
             * @property scrollContainerSelector
             * @type {String}
             */
            pluginElementSelector: '.pluginSelector',

            /**
             * The Class of some element which can be attached though them.
             * Note: Without the Dot.
             *
             * @property scrollContainerSelector
             * @type {String}
             */
            pluginElementClass: 'pluginClass'
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

        /**
         * Creates the required plugin properties
         *
         * @public
         * @method createProperties
         */
        createProperties: function () {
            var me = this,
                opts = me.opts;


            me.pageMetrics = new function () {
                this.scrollX = 0;
                this.scrollY = 0;
                this.windowWidth = 0;
                this.windowHeight = 0;
                this.documentOffsetX = 0;
                this.documentOffsetY = 0;
                this.cardyHeight = 0;
                this.cardsWidth = 0;
            };

            me.$cards = me.$el.find('li');

            me.cardsHeight = {
                L: 530,
                M: 420,
                S: 456
            };

            me.itemHeight = {
                L: 800,
                M: 600,
                S: 620
            };
            me.topOffset = {
                L: 270,
                M: 170,
                S: 170
            };

            me.$headline = me.$el.parents().eq(1).find('.headline');

            me.$cardsWrapper = me.$el.parent('.cards-wrapper');

            // Find Last Element and add Class
            me.$cards.last().addClass('last-card');

            me._elementPositions();

            me.offsets = {};
            me.firstOffset = 25;

            // Maybe delete, because it is unneseccary
            me.$cards.each(function (i) {
                var $el = $(this),
                    originOffset = Number(parseFloat($el.offset().top).toFixed(2));

                if (me.$cards.last().is($el)) return;

                if (me.$cards.first().is($el)) originOffset = originOffset + me.firstOffset;

                $el.css({
                    'transform': 'translate(0px, 0px) scale(1)',
                    'opacity': 1
                });

                me.offsets[i] = originOffset;
            });

            me.card = {};

            // Make spaces
            me.$cards.each(function (key) {
                var currentCard = $(this);

                me.card[key] = {};
                me.card[key]['space'] = currentCard.height() - currentCard.find('.card').height();
                me.card[key]['height'] = currentCard.find('.card').height();

                if (me.$cards.first().is(currentCard)) me.card[key]['offset'] = me.firstOffset;
            });

            me.checkPoints = {};

            me.$cards.each(function (key) {
                var currentCard = $(this);

                me.checkPoints[key] = {};
                me.checkPoints[key]['start'] = me.card[key].space;

                if (me.card[key].offset) me.checkPoints[key]['start'] = me.checkPoints[key]['start'] + me.card[key].offset;

                me.checkPoints[key]['end'] = me.checkPoints[key]['start'] + me.card[key].height;

                if (!me.$cards.first().is(currentCard) && !me.$cards.last().is(currentCard)) {
                    var previousKey = key - 1;

                    me.checkPoints[key]['start'] = me.checkPoints[previousKey].end + me.checkPoints[key]['start'];
                    me.checkPoints[key]['end'] = me.checkPoints[key]['start'] + me.card[key].height;
                } else if (me.$cards.last().is(currentCard)) {
                    var previousKeyLast = key - 1;

                    me.checkPoints[previousKeyLast]['end'] = me.checkPoints[previousKeyLast]['end'] + 5;
                }

                if (key === ((Object.keys(me.card).length) - 1)) {
                    delete me.checkPoints[key];
                }
            });

            // Element Position in Document
            me.$elPosition = parseInt(me.$cardsWrapper.offset().top - parseInt(me.$cardsWrapper.position().top) - (parseInt(me.$cards.first().css('top')) - parseInt(me.$cardsWrapper.position().top))) - me.firstOffset;

            console.log('checkpoint', me.checkPoints);
        },

        _elementPositions: function () {
            var me = this,
                documentRect = document.documentElement.getBoundingClientRect();

            me.pageMetrics.windowHeight = window.innerHeight;
            me.pageMetrics.windowWidth = window.innerWidth;
            me.pageMetrics.scrollY = window.scrollY || window.pageYOffset;
            me.pageMetrics.scrollX = window.scrollX || window.pageXOffset;

            me.pageMetrics.documentOffsetX = documentRect.left + me.pageMetrics.scrollX;
            me.pageMetrics.documentOffsetY = documentRect.top + me.pageMetrics.scrollY;

            var $card = me.$cards.first();

            me.pageMetrics.cardsHeight = $card.height();
            me.pageMetrics.cardsWidth = $card.width();
        },

        update: function () {
            var me = this;

            me._elementPositions();

            // If BreakPoint === s add to card and headline flow else remove
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

            $(window).on('scroll', $.proxy(me.onWindowScroll, me));
            $(window).on('resize', $.proxy(me.onWindowResize, me));

            $.publish('plugin/hfPStackedCards/onRegisterEvents', [me]);
        },

        onWindowResize: function () {
            var me = this,
                documentRect = document.documentElement.getBoundingClientRect();

            me.pageMetrics.windowHeight = window.innerHeight;
            me.pageMetrics.windowWidth = window.innerWidth;
            me.pageMetrics.scrollY = window.scrollY || window.pageYOffset;
            me.pageMetrics.scrollX = window.scrollX || window.pageXOffset;

            me.pageMetrics.documentOffsetX = documentRect.left + me.pageMetrics.scrollX;
            me.pageMetrics.documentOffsetY = documentRect.top + me.pageMetrics.scrollY;
        },

        /**
         * This method will be called when the Document is scrolled by the user.
         *
         * @public
         * @method onBodyScroll
         */
        onWindowScroll: function () {
            var me = this;

            me.pageMetrics.scrollY = window.scrollY || window.pageYOffset;
            me.pageMetrics.scrollX = window.scrollX || window.pageXOffset;

            me.updatePositions();
        },

        updatePositions: function () {
            var me = this;

            var windowScroll = $(window).scrollTop() - me.$elPosition;

            Object.keys(me.checkPoints).forEach(function (key) {
                var currentElement = me.$cards.eq(key);

                if (windowScroll <= me.checkPoints[key].start) {

                    currentElement.css({
                        'transform': 'translate(0px, 0px) scale(1)',
                        opacity: 1
                    });

                    currentElement.removeClass('active');

                    if (!me.$cards.first().is(currentElement) && (windowScroll >= me.checkPoints[key - 1].end && windowScroll <= me.checkPoints[key].start) && me.$cards.eq(key - 1).hasClass('passed')) {
                        var index = key - 1;

                        var element = me.$cards.eq(index),
                            nextOffset = me.firstOffset * 4;

                        var passedOpacity = 0.5 - ((windowScroll - me.checkPoints[key - 1].end + (nextOffset)) / (me.card[key].space) * 0.5);

                        if (passedOpacity > 0) {
                            element.css({
                                opacity: passedOpacity
                            });
                        }
                    }
                }

                if (windowScroll >= me.checkPoints[key].start && windowScroll <= me.checkPoints[key].end) {
                    var newTransition = ((windowScroll - me.checkPoints[key].start) / me.card[key].height * 40),
                        newScale = 1 - ((windowScroll - me.checkPoints[key].start) / me.card[key].height * 0.05),
                        newOpacity = 1 - ((windowScroll - me.checkPoints[key].start) / me.card[key].height * 0.5);

                    currentElement.css({
                        'transform': 'translate(0px, ' + (-newTransition) + 'px) scale(' + newScale + ')',
                        opacity: newOpacity
                    });

                    if (currentElement.hasClass('passed')) currentElement.removeClass('passed');
                    currentElement.addClass('active');
                }

                if (windowScroll >= me.checkPoints[key].end) {
                    if (!currentElement.hasClass('passed')) {
                        currentElement.css({
                            'transform': 'translate(0px, -40px) scale(0.95)',
                            opacity: 0.5
                        });

                        currentElement.removeClass('active');
                        currentElement.addClass('passed');
                    }

                    if (currentElement.hasClass('passed')) {
                        currentElement.css({
                            opacity: 0
                        });
                    }
                }

                // If it is last Checkpoint animate typography
                if (windowScroll >= me.checkPoints[4].end && parseInt(key) === 4) {

                    // Breakpoint small factor = 100
                    // Breakpoint from medium = 125
                    var headlineTransition = ((windowScroll - me.checkPoints[key].end) / me.$headline.height() * 125);

                    // console.log('header Transition: ' + headlineTransition, 'Window Scroll: ' + windowScroll);

                    // If headline Transition is limited to -500px
                    if (headlineTransition <= 500) {
                        me.$headline.css({
                            'transform': 'translate(0px, ' + (-headlineTransition) + 'px)'
                        });
                    } else if (headlineTransition >= 500) {
                        me.$headline.css({
                            'transform': 'translate(0px, -500px)'
                        });
                    }
                } else {
                    me.$headline.css({
                        'transform': 'translate(0px, 0px)'
                    });
                }
            });
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