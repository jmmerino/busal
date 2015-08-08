(function() {
    "use strict";

    var express = require("express"),
        router = express.Router(),
        request = require("request"),
        jschardet = require("jschardet"),
        Iconv  = require("iconv").Iconv,
        charset = require("charset"),
        busal = require("../busal");

    /* GET lines page. */
    router.get("/", function(req, res) {
        var url = "http://salamanca.twa.es/code/getlineas.php";

        request(url, function(error, response, html) {
            if (!error){
                res.render("pages/index", {
                    lines: busal.parseBusLine(html)
                });
            }
        });
    });

    router.get("/linea", function(req, res) {
        var busStopsDir1 = [],
            busStopsDir2 = [],
            opt;

        opt = {
            url: "http://salamanca.twa.es/code/getparadas.php?idl=" + req.query.idl,
            headers: { Referer: "http://salamanca.twa.es/" }
        };

        request(opt, function(error, response, html) {
            if (!error){

                var busStops = busal.parseBusStops(html),
                    contParsedBusStops = 0;

                busStops.forEach(function(busStop) {

                    busStop.idl = req.query.idl;

                    var opt = {
                        url: "http://salamanca.twa.es/code/getparadas.php?idl=" + busStop.idl + "&idp=" + busStop.idp + "&ido=" + busStop.ido,
                        encoding: "binary",
                        headers: {
                            Referer: "http://salamanca.twa.es/"
                        }
                    };

                    request(opt, function(error, response, html) {

                        var enc = charset(res.headers, html),
                            iconv;

                        enc = enc || jschardet.detect(html).encoding.toLowerCase();

                        if (enc != "utf-8"){
                            iconv = new Iconv(enc, "UTF-8//TRANSLIT//IGNORE");
                            html = iconv.convert(new Buffer(html, "binary")).toString("utf-8");
                        }

                        contParsedBusStops++;
                        busStop = busal.parseBusStop(html, busStop);

                        if (parseInt(busStop.direction) === 0){
                            busStopsDir2.push(busStop);
                        } else {
                            busStopsDir1.push(busStop);
                        }

                        if (contParsedBusStops === busStops.length){

                            busStopsDir1.sort(function(a, b) {
                                if ( parseInt(a.id) > parseInt(b.id)){
                                    return 1;
                                }
                                if ( parseInt(a.id) < parseInt(b.id)){
                                    return -1;
                                }
                                return 0;
                            }).reverse();

                            busStopsDir2.sort(function(a, b) {
                                if ( parseInt(a.id) > parseInt(b.id)){
                                    return 1;
                                }
                                if ( parseInt(a.id) < parseInt(b.id)){
                                    return -1;
                                }
                                return 0;
                            });

                            res.render("pages/stops", {
                                direccion1: req.query.d1,
                                direccion2: req.query.d2,
                                stopsDir1: busStopsDir1,
                                stopsDir2: busStopsDir2,
                                idl: req.query.idl
                            });

                        }
                    });

                });
            }
        });

    });

    router.get("/acerca-de", function(req, res) {
        res.render("pages/about");
    });
    module.exports = router;

})();
