;(function($) {
    'use strict';

    $.plugin('hfToggleBackup', {

        defaults: {
            value: '',
            name: '',
            checked: ''
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

        /**
         * Update method which will be automatically called when the user switches the defined breakpoints. The method
         * recalculates the height and updates the `padding-bottom` value of the "body" element
         *
         * @return {void}
         */
        update: function() {
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

            me.$hidden = $("<input>", {
                type: "hidden",
                "class": "ui-checkable",
                name: opts.name,
                value: 0
            });

            me.$hidden.appendTo(me.$el);

            me.$input = $("<input>", {
                type: "checkbox",
                "class": "ui-checkable",
                value: 1,
                name: opts.name,
                checked: opts.checked
            });

            me.$input.css({
                position: "absolute",
                visibility: "hidden",
                top: "-9999px"
            });

            me.$input.appendTo(me.$el);
        },

        /**
         * Registers all necessary event listener.
         */
        registerEvents: function() {
            var me = this;

            me._on(me.$el, "click", $.proxy(me.onClick, me));

            me._on(me.$el, "mouseenter mouseleave ", $.proxy(me.onMouseEnterAndLeave, me));

            me._on(me.$el, "mousedown", $.proxy(me.onMouseDown, me));

            $.publish('plugin/hfFormPolyfill/onRegisterEvents', [ me ]);
        },

        value: function(checked) {
            var me = this,
                opts = me.opts;

            if (!checked) {
                return me.$el.find("input[type=checkbox].ui-checkable").prop("checked");
            } else {
                return this.each(function() {
                    me.$el.toggleClass("ui-checked", opts.checked);

                    return me.$el.find("input[type=checkbox].ui-checkable").prop("checked", opts.checked);
                });
            }
        },

        onClick: function(event) {
            var me = this;

            me.$el.toggleClass("ui-checked");

            return me.$input.prop("checked", me.$el.hasClass("ui-checked"));
        },

        onMouseEnterAndLeave: function() {
            var me = this;

            return me.$el.toggleClass("ui-hover");
        },

        onMouseDown: function() {
            var me = this;

            me.$el.addClass("ui-pressed");

            return $(document).one("mouseup", function() {
                return me.$el.removeClass("ui-pressed");
            });
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