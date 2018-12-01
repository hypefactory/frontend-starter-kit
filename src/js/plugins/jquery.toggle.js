;(function ($) {
    'use strict';

    /**
     * Hypefactory Scroll Plugin.
     *
     * This plugin scrolls the page or given element to a certain point when the
     * plugin element was clicked.
     */
    $.plugin('hfToggle', {

        defaults: {
            toggableTypes: [
                'checkbox', 'radio'
            ],

            toggleElementRadioClass: 'lcs_radio_switch',

            toggleWrapperClass: 'lcs_wrap',

            toggleElementClass: 'lcs_switch',

            toggleElementHandlerClass: 'lcs_cursor',

            toggleElementLabelClass: 'lcs_label',

            toggleElementLabelStatesClasses: {
                on: 'lcs_label_on',
                off: 'lcs_label_off'
            },

            toggleStateDisabledSelector: ':disabled',

            toggleStateActiveSelector: ':checked',

            toggleTypeSelector: ':input',

            activeStateClass: 'lcs_on',

            disabledStateClass: 'lcs_off',

            toggleElementDisabledClass: 'lcs_disabled',

            textOn: 'On',
            textOff: 'Off',
            labels: false
        },

        /**
         * Initializes the plugin and register its events
         *
         * @public
         * @method init
         */
        init: function () {
            var me = this,
                opts = me.opts;

            me.applyDataAttributes(false);

            me.createProperties();

            me.registerEvents();
        },

        createProperties: function () {
            var me = this,
                opts = me.opts;

            if(me.$el.is(':input') && opts.toggableTypes.includes(me.$el.attr('type'))) {
                // labels structure
                me.labels = {
                    on: (opts.labels) ? $('<div></div>', {class: opts.toggleElementLabelClass}).addClass(opts.toggleElementLabelStatesClasses.on).html(opts.textOn) : null,
                    off: (opts.labels) ? $('<div></div>', {class: opts.toggleElementLabelClass}).addClass(opts.toggleElementLabelStatesClasses.off).html(opts.textOff) : null
                };

                // Default Element States
                me.disabled = !!(me.$el.is(opts.toggleStateDisabledSelector));
                me.active = !!(me.$el.is(opts.toggleStateActiveSelector));

                me.statusClasses = (me.active) ? opts.activeStateClass : opts.disabledStateClass;

                if(me.disabled) me.statusClasses += ' ' + opts.toggleElementDisabledClass;
            } else {
                throw new Error('Attached Element is not a toggable Element.');
            }

            me.$wrapper = $('<div></div>', {class: opts.toggleWrapperClass});
            me.$el.wrap(me.$wrapper);
            me.$wrapper = me.$el.parent().filter('.' + opts.toggleWrapperClass);

            me.$switch = $('<div></div>', {class: opts.toggleElementClass + ' ' + me.statusClasses});
            me.$switchHandler = $('<div></div>', {class: opts.toggleElementHandlerClass});

            me.$wrapper.append(me.$switch);
            me.$switch.append(me.$switchHandler);

            if (opts.labels) me.$switch.append([me.labels.on, me.labels.off]);

            me.$switch.addClass('lcs_'+ me.$el.attr('type') + '_switch');
        },

        /**
         * This method registers the event listeners when when clicking
         * or tapping the plugin element.
         *
         * @public
         * @method registerEvents
         */
        registerEvents: function () {
            var me = this,
                opts = me.opts;

            // $('.lcs_switch:not(.lcs_disabled)')
            me._on(me.$switch.not('.' + opts.toggleElementDisabledClass), 'touchstart click', $.proxy(me.onClickToggle, me));
            me._on(me.$el, 'change', $.proxy(me.onChangeToggle, me));

            $.publish('plugin/hfScrollAnimate/onRegisterEvents', [ me ]);
        },

        on: function () {
            var me = this,
                opts = me.opts;

            if (me.$switch.hasClass(opts.disabledStateClass)) {
                me.$el.prop('checked', true);
                me.$el.attr('checked', true);

                me.$switch.removeClass(opts.disabledStateClass).addClass(opts.activeStateClass);

                me.$el.change();
            }

            // if radio - disable other ones
            if( me.$switch.hasClass(opts.toggleElementRadioClass)) {
                var form = me.$wrapper.parents('form'),
                    radioGroup = me.$el.attr('name'),
                    radioButtons;

                if(form.length > 0) {
                    radioButtons = form.find('input[name='+ radioGroup +']:enabled');
                } else {
                    radioButtons = $('input[name="' + radioGroup + '"]:enabled');
                }

                radioButtons.not(me.$el).each(function (i, el) {
                    var $el = $(el);

                    // Call others off
                    $el.data('plugin_hfToggle').off();
                });
            }
        },

        off: function () {
            var me = this,
                opts = me.opts;

            me.$el.prop('checked', false);
            me.$el.removeAttr('checked');

            me.$switch.removeClass(opts.activeStateClass).addClass(opts.disabledStateClass);
        },

        onClickToggle: function (e) {
            var me = this,
                opts = me.opts;

            // not for radio
            if(me.$switch.hasClass(opts.activeStateClass) && !me.$switch.hasClass(opts.toggleElementRadioClass)) {
                me.off();
            } else {
                me.on();
            }
        },

        onChangeToggle: function (e) {
            var me = this,
                opts = me.opts;

            if(me.$el.is(opts.toggleStateActiveSelector) ) {
                me.on();
            } else {
                me.off();
            }
        },

        /**
         * This method destroys the plugin and its registered events
         *
         * @public
         * @method destroy
         */
        destroy: function () {
            var me = this;

            me._destroy();
        }
    });
})(jQuery);