var fdwp;
(function() {
    "use strict";

    var express = require("express"),
        router = express.Router();

    router.get("/home", function(req, res) {
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
