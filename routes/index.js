var fdwp;
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
        //First, get the global fdwp parameter
        var opt = {
            url: "http://salamanca.twa.es",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
            }
        };

        request(opt, function(error, response, html) {
            if (!error){
                global.fdwp = busal.parseParamfdwp(html);
                // console.log(global.fdwp);
            }
        });

        //At the same time, get the lines (no fdwp param neccessary)
        var opt = {
            url: "http://salamanca.twa.es/code/getlineas.php",
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
            }
        };

        request(opt, function(error, response, html) {
            if (!error){
                res.render("pages/index", {
                    lines: busal.parseBusLine(html)
                });
            }
        });

    });

    router.get("/linea", function(req, res) {

        //First, get the global fdwp parameter
        var opt = {
            url: "http://salamanca.twa.es",
            headers: {
                'Cookie': 'PHPSESSID=dif6letg6kjd39u9k2njq2vvr6',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
            }
        };

        request(opt, function(error, response, html) {
            if (!error){
                global.fdwp = busal.parseParamfdwp(html);
                // console.log(global.fdwp);



                var busStopsDir1 = [],
                    busStopsDir2 = [],
                    opt;
                // console.log(global.fdwp);
                opt = {
                    url: "http://salamanca.twa.es/code/getparadas.php?idl=" + req.query.idl + "&fdwp=" + global.fdwp,
                    headers: {
                        'Cookie': 'PHPSESSID=dif6letg6kjd39u9k2njq2vvr6',
                        'Referer': "http://salamanca.twa.es/",
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
                    }
                };

                request(opt, function(error, response, html) {

                    if (!error && html){

                        var busStops = busal.parseBusStops(html),
                            contParsedBusStops = 0;

                        busStops.forEach(function(busStop) {

                            busStop.idl = req.query.idl;

                            // console.log("http://salamanca.twa.es/code/getparadas.php?idl=" + busStop.idl + "&idp=" + busStop.idp + "&ido=" + busStop.ido + "&fdwp=" + global.fdwp);

                            var opt = {
                                url: "http://salamanca.twa.es/code/getparadas.php?idl=" + busStop.idl + "&idp=" + busStop.idp + "&ido=" + busStop.ido + "&fdwp=" + global.fdwp,
                                encoding: "binary",
                                headers: {
                                    'Cookie': 'PHPSESSID=dif6letg6kjd39u9k2njq2vvr6',
                                    'Referer': "http://salamanca.twa.es/",
                                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
                                }
                            };

                            request(opt, function(error, response, html) {

                                // console.log(html);
                                if (!error && html){
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
                                } else {
                                    console.log(error);
                                    res.render("pages/error");
                                }

                            });

                        });
                    } else {
                        console.log(error);
                        res.render("pages/error");
                    }
                });

            }
        });



    });

    router.get("/acerca-de", function(req, res) {
        res.render("pages/about");
    });


    module.exports = router;

})();
