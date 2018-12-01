;(function ($) {
    'use strict';

    /**
     * Hypefactory Scroll Plugin.
     *
     * This plugin scrolls the page or given element to a certain point when the
     * plugin element was clicked.
     */
    $.plugin('hfPluginName', {

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
        createProperties: function() {
            var me = this,
                opts = me.opts;

            me.property = me.$el.find(opts.pluginElementSelector);
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

            me._on(me.$el, 'touchstart click', $.proxy(me.onClickElement, me));

            $(document).on('scroll', $.proxy(me.onBodyScroll, me));

            $.publish('plugin/hfPluginName/onRegisterEvents', [ me ]);
        },

        /**
         * This method will be called when the plugin element was either clicked or tapped.
         * It scrolls the target element to the given destination.
         *
         * @public
         * @method onClickElement
         */
        onClickElement: function (event) {
            event.preventDefault();

            var me = this,
                opts = me.opts;

            $.publish('plugin/hfPluginName/onClickElement', [ me, event ]);

            // Some Logic Here If Plugin Element was clicked
        },

        /**
         * This method will be called when the Document is scrolled by the user.
         *
         * @public
         * @method onBodyScroll
         */
        onBodyScroll: function () {
            var me = this;

            // Some globally DOM relevant Logic here
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