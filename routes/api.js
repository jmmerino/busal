(function() {
    "use strict";

    var express = require("express"),
        router = express.Router(),
        busal = require("../busal"),
        easysoap = require("easysoap"),
        logger = require("../logger");

    router.get("/import", function(req, res) {

        var params, soapClient, callParams;

        // define soap params for siri webservice
        params = {
            host: "http://95.63.53.46:8015",
            path: "/SIRI/SiriWS.asmx?wsdl",
            wsdl: "/SIRI/SiriWS.asmx?wsdl",
            headers: {
                SOAPAction: "http://tempuri.org/LinesDiscovery",
                namespace: "tns"
            }
        };

        // Create the client for LinesDiscovery method
        soapClient = easysoap.createClient(params),
            callParams = {
                method: "LinesDiscovery",
                namespace: "tns",
                params: {
                    LinesDiscovery: {
                        "tns:request": {
                            Request:{
                                "s2:RequestTimestamp": "2016-01-01T12:59:12.000",
                                "s2:AccountId": "siritest",
                                "s2:AccountKey": "siritest",
                            },
                        }
                    }
                }
            };

        // TODO: Only for Debug, view the xml of the request
        // soapClient.getRequestXml(callParams)
        //     .then((callResponse) => {
        //         res.json({ status: callResponse });
        //         // logger.info(callResponse);
        //     })
        //     .catch((err) => {
        //         logger.info(err);
        //         throw new Error(err);
        //     });

        // Make the call to the LinesDiscovery method
        soapClient.call(callParams)
            .then(function(callResponse) {

                var response = busal.parseLinesSOAP(callResponse);

                res.json(response);
            })
            .catch(function(err) {
                logger.info(err);
                throw new Error(err);
            });

    });


    router.get("/lines", function(req, res) {
        busal.getLines(function(snapshot) {
            res.json(snapshot.val());
        });
    });

    router.get("/line/:lineRef", function(req, res) {
        var lineRef = req.params.lineRef;

        busal.getDirections(lineRef, function(snapshot) {
            res.json(snapshot.val());
        });
    });

    router.get("/line/:lineRef/:directionRef", function(req, res) {
        var lineRef = req.params.lineRef,
            directionRef = req.params.directionRef;

        busal.getStops(lineRef, directionRef, function(snapshot) {
            res.json(snapshot.val());
        });
    });

    router.get("/stop/:stopRef", function(req, res) {
        var stopRef = req.params.stopRef,
            params = getSoapParams("GetStopMonitoring"),
            soapClient = easysoap.createClient(params),
            callParams = {
                method: "GetStopMonitoring",
                namespace: "tns",
                params: {
                    "tns:request": {
                        ServiceRequestInfo: {
                            "s2:RequestTimestamp": "2016-01-01T12:59:12.000",
                            "s2:AccountId": "siritest",
                            "s2:AccountKey": "siritest",
                        },
                        Request:{
                            "s2:MonitoringRef": stopRef,
                        },
                    }
                }
            };

        soapClient.call(callParams)
            .then(function(callResponse) {
                res.json(callResponse);
            })
            .catch(function(err) {
                logger.info(err);
                throw new Error(err);
            });
    });

    function getSoapParams(methodName){
        return {
            host: "http://95.63.53.46:8015",
            path: "/SIRI/SiriWS.asmx?wsdl",
            wsdl: "/SIRI/SiriWS.asmx?wsdl",
            headers: {
                SOAPAction: "http://tempuri.org/" + methodName,
                namespace: "tns"
            }
        };
    }

    module.exports = router;
})();
