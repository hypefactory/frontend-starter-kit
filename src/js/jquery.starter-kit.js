(function($, window) {
    window.StateManager.init([
        {
            state: 'xs',
            enter: 0,
            exit: 29.9375   // 479px
        },
        {
            state: 's',
            enter: 30,      // 480px
            exit: 47.9375   // 767px
        },
        {
            state: 'm',
            enter: 48,      // 768px
            exit: 63.9375   // 1023px
        },
        {
            state: 'l',
            enter: 64,      // 1024px
            exit: 78.6875   // 1259px
        },
        {
            state: 'xl',
            enter: 78.75,   // 1260px
            exit: 322.5     // 5160px
        }
    ]);

    window.StateManager
        .addPlugin('*[data-scroll="true"]', 'hfScrollAnimate')

        .addPlugin('input[type="submit"][form], button[form]', 'hfFormPolyfill')

        // Deferred loading of the captcha
        //.addPlugin('*[data-modalbox="true"]', 'hfModalbox')

        // Initialize the registration plugin
        .addPlugin('*[data-cookie-permission="true"]', 'hfCookiePermission')

        .addPlugin('*[data-tabs="true"]', 'hfTabs')

        // Collapse Plugin
        .addPlugin('*[data-accordion="true"]', 'hfAccordion')

        .addPlugin('*[data-image-zoom="true"]', 'hfImageZoom')

        .addPlugin('*[data-tooltip="true"]', 'hfTooltip')

        .addPlugin('*[data-toggle="true"]', 'hfToggle')
    ;

    /*$(function($) {
        // Check if cookies are disabled and show notification
        if (!StorageManager.hasCookiesSupport) {
            createNoCookiesNoticeBox(window.snippets.noCookiesNotice);
        }

        // Create the no cookies notification message
        function createNoCookiesNoticeBox(message) {
            $('<div/>', { 'class': 'alert is--warning no--cookies' }).append(
                $('<div/>', {'class': 'alert--icon'}).append(
                    $('<i/>', {'class': 'icon--element icon--warning'})
                )
            ).append(
                $('<div/>', {
                    'class': 'alert--content',
                    'html': message
                }).append(
                    $('<a/>', {
                        'class': 'close--alert',
                        'html': '✕'
                    })
                        .on('click', function () {
                            $(this).closest('.no--cookies').hide();
                        })
                )
            ).appendTo('.page-wrap');
        }
    });*/
})(jQuery, window);