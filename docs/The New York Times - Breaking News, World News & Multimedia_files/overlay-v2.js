(function (window) {
    "use strict";
    var $;
    /**
     * Checking if current page depends on NYT5 foundation framework.
     * @returns {boolean}
     */
    function isPrototype() {
            // Pages with metatag prototype cannot use require
            // Jquery is defined globally on these pages and require is not...required

            return document.querySelectorAll("meta[name='prototype']").length > 0;

        }
        // -----------------------------------------
        // ------      Select NYT4/NYT5       ------

    function isNyt5() {
        var nyt5meta = document.getElementsByName('sourceApp'),
            nytApps = {
                'nyt-v5': true,
                'blogs': true
            };
        return (typeof nyt5meta[0] !== "undefined") && (nyt5meta[0].getAttribute('content') in nytApps);
    }


    if (isPrototype()) {

        $ = window.NYTD && window.NYTD.jQuery || window.jQuery;
        Overlay();

    } else {

        if (isNyt5()) {
            require(['foundation/main'], function () {
                $ = require('jquery/nyt');
                Overlay();

            });
        } else {
            // NYT4
            $ = (window.NYTD && window.NYTD.jQuery) || window.jQuery;
            Overlay();
        }
    }

    function Overlay() {
        $(".nytdGrowlUIContainer").on('click', '.nytdGrowlNotifyCross', function () {
            $(".nytdGrowlUIContainer").fadeOut('slow');
            $("#Top5").addClass("hidden");
        });
        window.setTimeout(function () {
            $("#Top5").addClass("hidden");
        }, 10000);

        window.setTimeout(function () {
            $("#Bottom9").addClass("hidden");
        }, 10000);

    }

})(window);