(function() {
    "use strict";


    var cheerio = require("cheerio"),
        moment = require("moment");

    moment.locale("es");

    exports.parseParamfdwp = function(html) {
        var $ = cheerio.load(html),
            text = $("script").last().text();

        return text.substring(text.indexOf('\'')+1, text.lastIndexOf('\''));
    };

    exports.parseBusLine = function(html) {
        var $ = cheerio.load(html),
            lines = [];

        $("a").filter(function() {
            var data = $(this),
                parsedData = {};

            parsedData.num = data.attr("href").match(/'([^']*)'/g)[0].replace(/'/g, "");
            // parsedData.name = data.text();
            parsedData.name = data.text().replace("(" + parsedData.num + ")", "").trim();

            var directions = parsedData.name.replace("(" + parsedData.num + ")", "").split("-");
            parsedData.direccion1 = directions[0].trim();
            parsedData.direccion2 = (directions[1] ? directions[1].trim() : "SALAMANCA");

            lines.push(parsedData);

        });

        return lines;
    };

    exports.parseBusStops = function(html) {

        var $ = cheerio.load(html),
            stops = [];

        $("map area").filter(function() {
            var data = $(this),
                parsedData = {},
                parameters;

            parameters = data.attr("onmouseover").match(/'([^']*)'/g);
            parameters = parameters[2].replace(/'/g, "").split("::");

            parsedData.id = data.attr("id").split("-")[1];
            parsedData.direction = data.attr("id").split("-")[0].replace("ar", "");

            parsedData.idp = parameters[0].replace(/'/g, "");
            parsedData.ido = parameters[1].replace(/'/g, "");

            stops.push(parsedData);
        });

        return stops;
    };

    exports.parseBusStop = function(html, busStop) {
        var $ = cheerio.load(html),
            scheduleData;

        busStop.name = $("#titparada").text().replace("Parada: ", "");

        $("#hora").find("span").remove();
        $("#hora").find("br").replaceWith("_");
        scheduleData = $("#hora").text().trim().split("_");
        busStop.proxima = moment(scheduleData[0], "HH:mm");
        busStop.direccion = scheduleData[1];

        var diff = busStop.proxima.diff(moment(), "minutes");
        if (diff > 15){
            busStop.color = "darken-3";
        } else if (diff <= 15 && diff > 10) {
            busStop.color = "darken-2";
        } else if (diff <= 10 && diff > 5) {
            busStop.color = "darken-1";
        } else if (diff <= 5 && diff > 2) {
            busStop.color = "lighten-2";
        } else if (diff <= 2) {
            busStop.color = "lighten-3";
        }

        return busStop;
    };

})();
