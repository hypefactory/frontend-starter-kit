;(function ($) {
    'use strict';

    /**
     * Hypefactory Collapse Panel Plugin.
     */
    $.plugin('hfAccordion', {

        alias: 'accordion',

        /**
         * Default options for the collapse panel plugin.
         *
         * @public
         * @property defaults
         * @type {Object}
         */
        defaults: {

            listSelector: '.accordions--list',

            /**
             * Selector for the items.
             *
             * @type {String}
             */
            itemSelector: '.accordion--item',

            /**
             * Selector for the item trigger.
             *
             * @type {String}
             */
            itemTriggerSelector: '.accordion--button',

            /**
             * Selector for the trigger.
             *
             * @type {String}
             */
            collapseTrigger: '.accordion--header',

            /**
             * The selector of the target element which should be collapsed.
             *
             * @type {String|HTMLElement}
             */
            collapseTarget: false,

            /**
             * Selector for the content sibling when no collapseTargetCls was passed.
             *
             * @type {String}
             */
            contentSiblingSelector: '.accordion--content',

            /**
             * Additional class which will be added to the collapse target.
             *
             * @type {String}
             */
            collapseTargetCls: 'is--target',

            /**
             * The class which triggers the collapsed state.
             *
             * @type {String}
             */
            collapsedStateCls: 'is--collapsed',

            /**
             * The class for the active state of the trigger element.
             *
             * @type {String}
             */
            activeTriggerCls: 'is--active',

            hiddenClass: 'is--hidden',

            showedClass: 'is--shown',

            /**
             * Decide if sibling collapse panels should be closed when the target is collapsed.
             *
             * @type {Boolean}
             */
            closeSiblings: false,

            /**
             * The speed of the collapse animation in ms.
             *
             * @type {Number}
             */
            animationSpeed: 250,

            /**
             * Prefix for the URL hash to prevent it from being interpreted as an anchor
             * jumpmark
             */
            hashPrefix: 'show-',

            /**
             * Action which will be executed if the element is clicked
             */
            action: 'toggle',

            openSingle: true,

            stayOpen: null,

            selfClose: false,

            selfBlock: false
        },

        /**
         * Default plugin initialisation function.
         * Sets all needed properties, adds classes
         * and registers all needed event listeners.
         *
         * @public
         * @method init
         */
        init: function () {
            var me = this,
                opts = me.opts;

            me.applyDataAttributes();

            me.createProperties();

            me.registerEvents();
        },

        createProperties: function () {
            var me = this,
                opts = me.opts;

            /**
             * The accordion list that should be applied to.
             * Wrapped by jQuery.
             *
             * @private
             * @property _$list
             * @type {jQuery}
             */
            me._$list = $(me.opts.listSelector);

            if (!me._$list.length) return false;

            /**
             * Contains all list items of the accordion.
             * Wrapped by jQuery.
             *
             * @private
             * @property _$listItems
             * @type {jQuery}
             */
            me._$listItems = me._$list.find(opts.itemSelector);

            /**
             * Contains all list items trigger of the accordion.
             * Wrapped by jQuery.
             *
             * @private
             * @property _$listItemsTriggers
             * @type {jQuery}
             */
            me._$listItemsTriggers = me._$list.find(opts.itemTriggerSelector);

            /**
             * The index of the last touched accordion element.
             * Is used to support pointer events.
             *
             * @private
             * @property _targetIndex
             * @type {Number}
             */
            me._targetIndex = -1;

            me.$collapseTrigger = me.$el.find(opts.collapseTrigger);

            // Hide all targeted content elements
            me._$listItemsTriggers.each(function (i, el) {
                var $el = $(el),
                    $targetElm = me._targetElement($el),
                    $triggerEl = $(me._$listItemsTriggers[i]);

                // Add target Class
                $targetElm.addClass(opts.collapseTargetCls);

                // If Element must be to stay open, else add hidden class
                if($el.data('stay-open') === true && $el.data('stay-open') !== undefined) {
                    me.stayOpen($triggerEl);
                } else {
                    // Give target and hidden class
                    $targetElm.addClass(opts.hiddenClass);
                }
            });

            me.handleHashParameter();
        },

        /**
         * Registers all necessary event handlers.
         *
         * @public
         * @method registerEvents
         */
        registerEvents: function () {
            var me = this,
                $el;

            me._$listItemsTriggers.each(function (i, el) {
                $el = $(el);

                var $triggerEl = $(me._$listItemsTriggers[i]);

                me._on($el, 'click', function (e) {
                    e.preventDefault();

                    switch (me.opts.action) {
                        case 'open':
                            me.openPanel($triggerEl);
                            break;
                        case 'close':
                            me.closePanel($triggerEl);
                            break;
                        default:
                            me.toggleCollapse($triggerEl);
                    }
                });

                // If Trigger has self-close on click on the document
                if ($triggerEl.data('self-close') === true && $triggerEl.data('self-close') !== undefined) {
                    $('body').on('click', $.proxy(me.onClickDocument, me, $triggerEl));
                }
            });

            $.publish('plugin/swCollapsePanel/onRegisterEvents', [ me ]);
        },

        _targetElement: function ($el) {
            var me = this,
                opts = me.opts,
                $targetEl;

            if (typeof $el.data('target') !== undefined && $el.data('target') && $($el.data('target')).length && !opts.collapseTarget) {
                $targetEl = $($el.data('target'));
            } else {
                // If Custom Target Selector is passed through the init of this Plugin
                if (opts.collapseTarget) {
                    $targetEl = $(opts.collapseTarget);
                } else {
                    // If Data and no custom target selector is available
                    $targetEl = me._$listItems.map(function (i) {
                        var $this = $(this);

                        if ($this.has($el).length) $targetEl = $this.find(opts.contentSiblingSelector);
                    });
                }
            }

            return $targetEl;
        },

        /**
         * Opens the collapse state of the element.
         *
         * @public
         * @method toggleCollapse
         */
        stayOpen: function ($el) {
            var me = this;

            me.openPanel($el);
        },

        /**
         * Toggles the collapse state of the element.
         *
         * @public
         * @method toggleCollapse
         */
        toggleCollapse: function ($el) {
            var me = this,
                opts = me.opts,
                $targetEl = me._targetElement($el);

            if ($targetEl.hasClass(me.opts.collapsedStateCls)) {
                me.closePanel($el);
            } else {
                if (opts.openSingle) {
                    me.openSingle($el);
                } else {
                    me.openPanel($el);
                }
            }

            $.publish('plugin/swCollapsePanel/onToggleCollapse', [ me, $el ]);
        },

        openSingle: function ($el) {
            var me = this,
                opts = me.opts;

            // Hide all targeted content elements
            me._$listItemsTriggers.each(function (i, element) {
                var $element = $(element);

                if ($element.is($el)) {
                    me.openPanel($el);
                } else {
                    me.closePanel($element);
                }
            });
        },

        /**
         * Opens the panel by sliding it down.
         *
         * @public
         * @method openPanel
         */
        openPanel: function ($el) {            
            var me = this,
                opts = me.opts,
                $targetEl = me._targetElement($el),
                $siblings = $('.' + opts.collapseTargetCls).not($targetEl),
                tabId = $targetEl.parent().attr('data-tab-id');

            $el.addClass(opts.activeTriggerCls);

            if ($targetEl.hasClass(opts.collapsedStateCls)) return;

            $targetEl.finish().slideDown(opts.animationSpeed, function () {
                $.publish('plugin/swCollapsePanel/onOpen', [ me ]);

                $targetEl.removeClass(opts.hiddenClass);
                $targetEl.addClass(opts.showedClass);
            }).addClass(opts.collapsedStateCls);

            if (opts.closeSiblings) {
                $siblings.finish().slideUp(opts.animationSpeed, function () {
                    $siblings.removeClass(opts.collapsedStateCls);
                    $siblings.prev().removeClass(opts.activeTriggerCls);
                });
            }

            if (tabId !== undefined) $.publish('onShowContent-' + tabId, [ me ]);

            $.publish('plugin/swCollapsePanel/onOpenPanel', [ me ]);
        },

        /**
         * Closes the panel by sliding it up.
         *
         * @public
         * @method openPanel
         */
        closePanel: function ($el) {
            var me = this,
                opts = me.opts,
                $targetEl = me._targetElement($el);

            $el.removeClass(opts.activeTriggerCls);

            if (!$targetEl.hasClass(opts.collapsedStateCls)) return;

            $targetEl.finish().slideUp(opts.animationSpeed, function() {
                $targetEl.removeClass(opts.collapsedStateCls);

                $.publish('plugin/swCollapsePanel/onClose', [ me ]);
            });

            $targetEl.removeClass(opts.showedClass).addClass(opts.hiddenClass);

            $.publish('plugin/swCollapsePanel/onClosePanel', [ me ]);
        },

        handleHashParameter: function () {
            var me = this,
                hash = window.location.hash,
                prefixLength = me.opts.hashPrefix.length;

            if (hash.indexOf(me.opts.hashPrefix) !== 1) return;

            if (!me._$targetEl.is('#' + hash.substr(prefixLength + 1))) return;

            me.openPanel();
        },

        onClickDocument: function ($el, e) {
            var me = this;
            var target = e.target;

            if ($el === target || $.contains($el, target) ||  me._$listItemsTriggers.has(target).length) return;

            me.closePanel($el);
        },

        /**
         * Destroys the initialized plugin completely, so all event listeners will
         * be removed and the plugin data, which is stored in-memory referenced to
         * the DOM node.
         *
         * @public
         * @method destroy
         */
        destroy: function () {
            var me = this,
                opts = me.opts;

            me.$el.removeClass(opts.activeTriggerCls);
            me._$targetEl.removeClass(opts.collapsedStateCls)
                .removeClass(opts.collapseTargetCls)
                .prop('style', '');

            me._destroy();
        }
    });
})(jQuery);