(function() {
    "use strict";


    var moment = require("moment"),
        firebase = require("firebase"),
        _ = require("underscore");

    var db = new firebase("https://resplendent-inferno-2934.firebaseio.com/");

    moment.locale("es");

    exports.getLines = function(callback) {
        db.child("lines").orderByKey().on("value", callback);
    };

    exports.getDirections = function(lineRef, callback) {
        db.child("directions/" + lineRef).on("value", callback);
    };

    exports.getStops = function(lineRef, directionRef, callback) {
        db.child("stops/" + lineRef + "/" + directionRef).orderByChild("order").on("value", callback);
    };

    exports.parseLinesSOAP = function(soapResponse) {

        var rawSoapLines = soapResponse.data.LinesDiscoveryResponse.LinesDiscoveryResult[1].Answer,
            dbLinesCollection = db.child("lines"),
            dbDirectionsCollection = db.child("directions");
        rawSoapLines.shift();

        db.remove();

        rawSoapLines.forEach(function(rawSoapLine) {
            var lineRef = rawSoapLine.AnnotatedLineRef[0].LineRef,
                rawSoapDirections = rawSoapLine.AnnotatedLineRef[3].Directions;

            // Store lines
            dbLinesCollection.push().set({
                ref: lineRef,
                name: rawSoapLine.AnnotatedLineRef[1].LineName
            });

            // Store directions
            if (_.isArray(rawSoapDirections)) {
                console.log("array");
                rawSoapDirections.forEach(function(rawSoapDirection) {
                    dbDirectionsCollection
                        .child(lineRef)
                        .push().set({
                            ref: rawSoapDirection.Direction[0].DirectionRef,
                            name: rawSoapDirection.Direction[1].DirectionName
                    });

                    saveStops(lineRef, rawSoapDirection);
                });
            } else {
                dbDirectionsCollection
                    .child(lineRef)
                    .push().set({
                        ref: rawSoapDirections.Direction[0].DirectionRef,
                        name: rawSoapDirections.Direction[1].DirectionName
                });

                saveStops(lineRef, rawSoapDirections);
            }

        });

        return { status: "ok" };

    };

    exports.parseStopSOAP = function(stopSOAPResponse) {
        var data = stopSOAPResponse.data.GetStopMonitoringResponse.GetStopMonitoringResult[1].Answer.StopMonitoringDelivery;

        var linesInThisStop = [];

        for (var i = 4; i < data.length; i++) {
            var stopInfo = data[i].MonitoredStopVisit[2].MonitoredVehicleJourney;
            var line = {
                lineRef       : stopInfo[0].lineRef,
                directionRef  : stopInfo[1].DirectionRef,
                lineName      : stopInfo[3].PublishedLineName,
                directionName : stopInfo[4].DirectionName,
                arrivalTime   : stopInfo[19].MonitoredCall[3].ExpectedArrivalTime,
                distance      : stopInfo[19].MonitoredCall[6].DistanceFromStop
            }

            linesInThisStop.push(line);
        };

        return linesInThisStop;
    };

    function saveStops(lineRef, rawSoapDirection) {
        var dbStopsCollection = db.child("stops");

        rawSoapDirection.Direction[2].Stops.forEach(function(rawSoapStop) {

            dbStopsCollection.child(lineRef)
                .child(rawSoapDirection.Direction[0].DirectionRef)
                .push()
                .set({
                    ref: rawSoapStop.StopPointInPattern[0].StopPointRef,
                    name: rawSoapStop.StopPointInPattern[1].StopName,
                    lat: rawSoapStop.StopPointInPattern[2].Location[0].Latitude,
                    lng: rawSoapStop.StopPointInPattern[2].Location[1].Longitude,
                    order: rawSoapStop.StopPointInPattern[3].Order
            });

        });
    };

})();
