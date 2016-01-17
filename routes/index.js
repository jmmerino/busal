(function() {
    "use strict";

    var express = require("express"),
        busal = require("../busal"),
        router = express.Router();

    router.get("/", function(req, res) {
        res.render("index");
    });
    router.get("/lines", function(req, res) {
        res.render("index");
    });
    router.get("/lines/:lineRef", function(req, res) {
        var lineRef = req.params.lineRef;

        res.render("index", {
            lineRef: lineRef
        });
    });

    router.get("/stop/:stopRef", function(req, res) {
        var stopRef = req.params.stopRef;
        res.render("index");
    });

    router.get("/fav", function(req, res) {
        res.render("index");
    });
    router.get("/about", function(req, res) {
        res.render("index");
    });

    module.exports = router;

})();
