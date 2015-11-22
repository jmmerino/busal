(function() {
    "use strict";

    var express = require("express"),
        router = express.Router(),
        request = require("request"),
        jschardet = require("jschardet"),
        Iconv  = require("iconv").Iconv,
        charset = require("charset"),
        busal = require("../busal");

    router.get("/lines", function(req, res) {
        var opt = {
            url: "http://salamanca.twa.es/code/getlineas.php",
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
        };

        request(opt, function(error, response, html) {
            if (!error) {
                res.json(busal.parseBusLine(html));
            }
        });
    });

    router.get("/stops", function(req, res) {
        var busStopsDir1 = [],
            busStopsDir2 = [],
            opt;

        opt = {
            url: "http://salamanca.twa.es/code/getparadas.php?idl=" + req.query.idl,
            headers: {
                Referer: "http://salamanca.twa.es/",
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
            }
        };

        request(opt, function(error, response, html) {

            var busStops = busal.parseBusStops(html),
                contParsedBusStops = 0;

            busStops.forEach(function(busStop) {

                busStop.idl = req.query.idl;

                var opt = {
                    url: "http://salamanca.twa.es/code/getparadas.php?idl=" + busStop.idl + "&idp=" + busStop.idp + "&ido=" + busStop.ido,
                    encoding: "binary",
                    headers: {
                        Referer: "http://salamanca.twa.es/",
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
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
                    busStop.proxima = busStop.proxima.fromNow();

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

                        res.json({
                            direction1: busStopsDir1,
                            direction2: busStopsDir2
                        });
                    }
                });

            });

        });

    });

    module.exports = router;
})();
