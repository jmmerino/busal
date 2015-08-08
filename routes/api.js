(function() {
    "use strict";

    var express = require("express"),
        router = express.Router(),
        request = require("request"),
        busal = require("../busal");

    router.get("/api/v0.1/lines", function(req, res) {
        var url = "http://salamanca.twa.es/code/getlineas.php";

        request(url, function(error, response, html) {
            if (!error) {
                res.json(busal.parseBusLine(html));
            }
        });
    });

    module.exports = router;
})();
