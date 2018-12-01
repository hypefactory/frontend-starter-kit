;(function($, window) {
    'use strict';

    $.plugin('hfTabs', {

        defaults: {

            /**
             * Class name to show and hide the cookiePermission element.
             *
             * @property isHiddenClass
             * @type {string}
             */
            tabHeaderClass: 'tabs-header',

            panelClass: 'tabs--panel',

            activeClass: 'is--active',

            upgradedClass: 'is--upgraded'
        },

        /**
         * Default plugin initialisation function.
         * Sets all needed properties, adds classes and registers all needed event listeners.
         *
         * @public
         * @method init
         */
        init: function() {
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

            me.$tabsHeader = $('.' + opts.tabHeaderClass);
            me.$tabsHeaderActive = me.$tabsHeader.find('.' + opts.activeClass);

            me.$border = $('.border');
            me.activeTab = $('.' + opts.tabHeaderClass + ' .' + opts.activeClass);

            // Change Position
            me.changePosition(me.activeTab);

            // Intial Tab Height
            me.tabHeight = $('.tab.active').height();

            // Animate Tab Height
            me.animateTabHeight();

            // Tab Items
            me.tabItems = $('.tabs-header ul li');

            // Tab Current Item
            me.tabCurrentItem = me.tabItems.filter('.' + opts.activeClass);
        },

        /**
         * Subscribes all required events.
         *
         * @public
         * @method registerEvents
         */
        registerEvents: function() {
            var me = this;

            me._on('.tabs-header a', 'click', $.proxy(me.onClickTabHeader, me));

            $.publish('plugin/hfTabs/onRegisterEvents', [me]);
        },

        changePosition: function (activeTab) {
            var me = this;

            // Intial Border Position
            var activePos = activeTab.position();

            // Change Position & Width
            me.$border.stop().css({
                left: activePos.left,
                width: activeTab.outerWidth()
            });
        },

        animateTabHeight: function() {
            var me = this,
                opts = me.opts;

            // Update Tab Height
            var tabHeight = $('.tab.' + opts.activeClass).height();

            // Animate Height
            $('.tabs-content').stop().css({
                height: tabHeight + 'px'
            });
        },

        changeTab: function() {
            var me = this,
                opts = me.opts;

            var getTabId = $('.tabs-header .' + opts.activeClass + ' a').attr('tab-id');

            // Remove Active State
            $('.tab').stop().fadeOut(300, function () {
                // Remove Class
                $(this).removeClass(opts.activeClass);
            }).hide();

            $('.tab[tab-id=' + getTabId + ']').stop().fadeIn(300, function () {
                // Add Class
                $(this).addClass(opts.activeClass);

                // Animate Height
                me.animateTabHeight();
            });
        },

        onClickTabHeader: function (e) {
            var me = this,
                opts = me.opts,
                $el = $(e.target);

            if ($el.parent().hasClass(opts.activeClass)) return false;

            e.preventDefault();

            // Tab Id
            var tabId = $el.attr('tab-id');

            // Remove Active State
            $('.tabs-header a').stop().parent().removeClass(opts.activeClass);

            // Add Active State
            $el.stop().parent().addClass(opts.activeClass);

            me.changePosition($el);

            // Update Current Itm
            me.tabCurrentItem = me.tabItems.filter('.' + opts.activeClass);

            // Remove Active State
            $('.tab').stop().fadeOut(300, function () {
                // Remove Class
                $(this).removeClass(opts.activeClass);
            }).hide();

            // Add Active State
            $('.tab[tab-id="' + tabId + '"]').stop().fadeIn(300, function () {
                // Add Class
                $(this).addClass(opts.activeClass);

                // Animate Height
                me.animateTabHeight();
            });
        }
    });
}(jQuery, window));