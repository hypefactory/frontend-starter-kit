;(function ($) {
    'use strict';

    /**
     * Hypefactory Scroll Plugin.
     *
     * This plugin scrolls the page or given element to a certain point when the
     * plugin element was clicked.
     */
    $.plugin('hfDropdown', {

        alias: 'dropdown',

        objects: {

            // Menu
            menu: {
                id: null,
                uid: null,
                parent: false,
                items: null

            },

            // Item
            item: {
                id: null,
                uid: null,

                text: '',
                value: null,
                url: null,
                html: null,

                menu: false,
                parent: false,

                label: '',
                divider: null,

                children: {
                    menu: false,
                    title: '',
                    items: false
                },

                selected: false,
                selectable: true

            },

            // Resize
            resize: {
                // Viewport
                viewport: {
                    width: 0,
                    height: 0
                },

                // Wrapper
                wrapper: {
                    width: 0,
                    height: 0,

                    // Difference
                    diff: {
                        width: 0,
                        height: 0
                    }
                },

                // Menu
                menu: {
                    width: 0,
                    height: 0
                },

                // List
                list: {
                    width: 0,
                    height: 0
                }

            },

            // Resize collision values
            collision: {

                width: 0,
                height: 0,

                // Scroll amount
                scrolled: {
                    x: 0,
                    y: 0
                },

                // Position
                position: {
                    x: 0,
                    y: 0
                },

                // Offset
                offset: {
                    x: 0,
                    y: 0
                },

                // Available space
                space: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }
            }
        },


        classes: {

            // Dropdown
            dropdown: 'dropdown',
            overlay: 'dropdown-overlay',

            // Menu
            menuMain: 'dropdown-menu-main',
            menuOpen: 'dropdown-menu-open',

            menuWrapper: 'dropdown-menu-wrapper',
            menuContainer: 'dropdown-menu-container',
            menuObject: 'dropdown-menu',
            menuMask: 'dropdown-mask',

            menuHeader: 'dropdown-header',
            menuTitle: 'dropdown-title',

            menuList: 'dropdown-list',
            menuItem: 'dropdown-item',
            menuLink: 'dropdown-link',
            menuText: 'dropdown-text',
            menuParent: 'dropdown-parent',

            menuDivider: 'dropdown-divider',
            menuLabel: 'dropdown-label',

            // Toggle
            toggleButton: 'dropdown-toggle',
            toggleText: 'dropdown-text',
            toggleIcon: 'dropdown-icon',

            // Close
            closeButton: 'dropdown-close',
            closeText: 'dropdown-text',
            closeIcon: 'dropdown-icon',

            // Back
            backButton: 'dropdown-back',
            backText: 'dropdown-text',
            backIcon: 'dropdown-icon',

            // States
            open: 'dropdown-open',
            opening: 'dropdown-opening',
            closing: 'dropdown-closing',
            focused: 'dropdown-focused',
            animating: 'dropdown-animating',
            resizing: 'dropdown-resizing',
            selected: 'dropdown-selected',
            selectedParent: 'dropdown-parent-selected',

            // Position
            above: 'dropdown-above',
            below: 'dropdown-below'

        },

        templates: {

            // Dropdown
            dropdown: '<div />',
            overlay: '<div />',

            // Menu
            menuWrapper: '<nav />',
            menuContainer: '<div />',
            menuObject: '<div />',
            menuMask: '<div />',

            menuHeader: '<header />',
            menuTitle: '<h5 />',

            menuList: '<ul role="menu" />',
            menuItem: '<li />',
            menuLink: '<a href="#" role="menuitem" />',
            menuText: '<span />',

            menuDivider: '<li role="presentation" />',
            menuLabel: '<li role="presentation" />',

            // Toggle
            toggleButton: '<a href="#" />',
            toggleText: '<div />',
            toggleIcon: '<i />',

            // Close
            closeButton: '<a href="#" />',
            closeText: '<span />',
            closeIcon: '<i />',

            // Back
            backButton: '<a href="#" />',
            backText: '<span />',
            backIcon: '<i />'

        },

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
            pluginElementClass: 'pluginClass',

            // Animation
            speed: 200,
            easing: 'easeInOutCirc',

            // Positioning
            margin: 20,
            collision: true,
            autoResize: 200,
            scrollSelected: true,

            // Keyboard navigation
            keyboard: true,

            // Nesting
            nested: true,
            selectParents: false,

            // Multiple
            multi: false,
            maxSelect: false,
            minSelect: false,

            // Links
            selectLinks: false,
            followLinks: true,

            // Close
            closeText: 'Close',
            autoClose: true,
            autoCloseMax: true,
            autoCloseLink: true,
            closeReset: true,

            // Back
            backText: 'Back',

            // Toggle
            toggleText: 'Please select',
            autoToggle: true,
            autoToggleLink: false,
            autoToggleHTML: false,

            // Title
            titleText: 'Please select',
            autoTitle: true,

            // Custom classes
            classes: {},

            // Custom templates
            templates: {}
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

            me.property = me.$el.find(opts.pluginElementSelector);

            me.uid = me.id();
            me.menus = {
                menu: null,
                menuMain: null,
                menus: {}
            };
            me.items = {
                items: {},
                value: null,
                selected: null,
                focused: null
            };
            me.states = {
                open:      false,
                opening:   false,
                closing:   false,
                animating: false,
                resizing:  false,
                resetting: false
            };

            me.resizeTimeout = null;

            me.position.above = null;

            // Check for transition support
            if (!me._supportsTransitions())
                opts.speed = 0;

            // Build the dropdown
            me._build();

            // Populate
            me._populate();

            // Bind events
            me._bind();

            // Bind keybard events
            if (opts.keyboard)
                me._bindKeyboard();

            // Multi
            if (opts.multi) {

                me.inst.selected = [];
                me.inst.value = [];

            }

            // Select initial
            if (!$.isEmptyObject(me.inst.items)) {

                $.each(me.inst.items, function (item) {

                    item = me.getItem(item);

                    if (item.selected && !item.children.items)
                        me.select(item);

                });

            }

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

            // Trigger keydown handler
            this.el.addEventListener('keydown', this._handleTriggerKeydownBound);

            // Item click handler
            this.dropdownEl.addEventListener('click', this._handleDropdownClickBound);

            // Hover event handlers
            if (this.options.hover) {
                this._handleMouseEnterBound = this._handleMouseEnter.bind(this);
                this.el.addEventListener('mouseenter', this._handleMouseEnterBound);
                this._handleMouseLeaveBound = this._handleMouseLeave.bind(this);
                this.el.addEventListener('mouseleave', this._handleMouseLeaveBound);
                this.dropdownEl.addEventListener('mouseleave', this._handleMouseLeaveBound);

                // Click event handlers
            } else {
                this._handleClickBound = this._handleClick.bind(this);
                this.el.addEventListener('click', this._handleClickBound);
            }

            $(document).on('scroll', $.proxy(me.onBodyScroll, me));

            $.publish('plugin/hfPluginName/onRegisterEvents', [me]);
        },

        select: function (item) {
            var me = this,
                opts  = me.opts;

            // Get item
            item = me.getItem(item);

            if (!item) return false;

            // Open menu
            if (opts.nested && item.children.menu) return me.openMenu(item.children.menu);

            // Deselect
            if (opts.multi && item.selected ) return me.deselect(item);

            // Get current item
            var cur = false;

            if (me.items.selected) {
                if (!opts.multi ) cur = me.getItem(me.items.selected );

                if ( cur.uid === item.uid ) cur = false;
            }

            // Callback
            me._beforeSelect(item, cur);

            // Select item
            if (!item.url || opts.selectLinks) {

                // Deselect current
                if (cur && !opts.multi) me.deselect(cur);

                // Update item
                item.selected = true;
                item.elem.addClass( me.classes.selected );

                // Update plugin
                if (opts.multi) {
                    if ( -1 === me.items.selected.indexOf( item.uid ) ) me.items.selected.push( item.uid );

                    if ( -1 === me.items.value.indexOf( item.value ) ) me.items.value.push( item.value );

                } else {
                    me.items.selected = item.uid;
                    me.items.value    = item.value;

                }
                // Select/deselect parent
                me.selectParent( item );
            }

            // Update toggle text
            if (opts.autoToggle && ( !item.url || opts.autoToggleLink || null === opts.autoToggleLink ) ) {
                // Reset
                if (!me.items.selected || !me.items.selected.length) {
                    if (opts.multi) {
                        me.toggleTextMulti();
                    } else {
                        me.toggleText();
                    }
                } else {
                    var toggleText = item.text;

                    if (opts.autoToggleHTML && item.html ) toggleText = item.html;

                    if (opts.multi ) {
                        me.toggleTextMulti( toggleText );
                    } else {
                        me.toggleText( toggleText );
                    }
                }
            }

            // Close dropdown
            if ( opts.autoClose || ( !opts.multi && opts.autoCloseLink ) ) {
                if (opts.multi) {
                    if (opts.autoCloseMax && opts.maxSelect && me.items.selected.length === opts.maxSelect) me.close();
                } else {
                    if (!item.url || opts.autoCloseLink || (opts.autoClose && null === opts.autoCloseLink)) me.close();
                }
            }

            // Callback
            me._afterSelect(item, cur);

            // Follow link
            if (item.url && opts.followLinks ) {
                window.location.href = item.url;
                return true;
            }

            return true;
        },

        selectValue: function( values, clear ) {
            var me = this;

            // Get array of values
            if (!values) values = [];

            if (!Array.isArray(values)) values = [ values ];

            // Deselect all
            if (clear) me.deselect();

            // Select
            for (var uid in me.items.items) {
                $.each( values, function( i, value ) {
                    if (me.value(uid) === value ) me.select(uid);
                });
            }

            return true;
        },

        deselect: function( item ) {
            var me = this,
                opts = me.opts;

            // Deselect all
            if (!item) {
                if (!me.items.selected || !me.items.selected.length) return false;

                if (opts.multi) {
                    for ( var uid in me.items.selected) me.deselect( uid );
                } else {
                    me.deselect(me.items.selected);
                }

                return true;
            }

            // Get item
            item = me.getItem(item);

            if (!item) return false;

            // Event Before Deselect

            // Update item
            item.selected = false;
            item.elem.removeClass(me.classes.selected);

            // Update plugin
            if (me.items.selected) {

                if (opts.multi) {

                    var selected = me.items.selected.indexOf(item.uid);

                    if (-1 !== selected) me.items.selected.splice( selected, 1 );

                    me.items.value = jQuery.grep(me.items.value, function( value ) {
                        return value !== item.value;
                    });
                } else {
                    me.items.selected = null;

                    if (me.items.value === item.value) me.items.value = null;
                }
            }

            // Update toggle
            if (opts.autoToggle) {
                if (opts.multi) {
                    me.toggleTextMulti(item.text);
                } else {
                    me.toggleText();
                }
            }

            // Select/deselect parent
            self.selectParent( item );

            // Callback
            self._afterDeselect( item );

            return true;

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

            e.preventDefault();
            me.open();

            $.publish('plugin/hfPluginName/onClickElement', [me, event]);
        },

        /**
         * This method will be called when the Document is scrolled by the user.
         *
         * @public
         * @method onBodyScroll
         */
        onBodyClick: function () {
            var me = this;

            // Some globally DOM relevant Logic here

            let $target = $(e.target);
            if (
                this.options.closeOnClick &&
                $target.closest('.dropdown-content').length &&
                !this.isTouchMoving
            ) {
                // isTouchMoving to check if scrolling on mobile.
                setTimeout(() => {
                    this.close();
                }, 0);
            } else if (
                $target.closest('.dropdown-trigger').length ||
                !$target.closest('.dropdown-content').length
            ) {
                setTimeout(() => {
                    this.close();
                }, 0);
            }
            this.isTouchMoving = false;
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