var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var http = require('http');

/* GET home page. */
router.get('/', function(req, res, next) {

	url = 'http://salamanca.twa.es/code/getlineas.php';

	request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request
        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            // Finally, we'll define the variables we're going to capture

            var lines = [];                        

            $('a').filter(function() {
            	var data = $(this),
            		parsedData = {};

            	parsedData.num = data.attr("href").match(/'([^']*)'/g)[0].replace(/'/g, "");
            	parsedData.name = data.text();

            	lines.push(parsedData);
            	
            });

            res.render('pages/index', { 
		    	lines: lines
		    });
        }
    });

});

router.get('/linea', function(req, res, next) {	

	var opt = {
	    url: 'http://salamanca.twa.es/code/getparadas.php?idl=' + req.query.idl,
	    headers: { 'Referer': 'http://salamanca.twa.es/'}
	};

	request(opt, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request
        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            // Finally, we'll define the variables we're going to capture

            var stopsDir1 = [],
            	stopsDir2 = [],
            	parsedStops = 0,
            	totalStops = $('map area').length; 

            $('map area').filter(function() {
            	var data = $(this),
            		parsedData = {};

            	parameters = data.attr("onmouseover").match(/'([^']*)'/g);
            	parameters = parameters[2].replace(/'/g, "").split("::");            	

            	parsedData.id = data.attr("id").split("-")[1];
            	parsedData.dir = data.attr("id").split("-")[0].replace("ar", "");

            	parsedData.idp = parameters[0].replace(/'/g, "");
            	parsedData.ido = parameters[1].replace(/'/g, "");
            	parsedData.idl = req.query.idl;            	

            	var opt = {
				    url: 'http://salamanca.twa.es/code/getparadas.php?idl=' + parsedData.idl + '&idp=' + parsedData.idp + '&ido='+ parsedData.ido,
				    headers: { 'Referer': 'http://salamanca.twa.es/'}
				};

            	request(opt, function(error, response, html){            		

            		if (!error){            			
	            		var $ = cheerio.load(html);									

	            		parsedData.name = $('#titparada').text().replace("Parada: ", "");

	            		$('#hora').find("span").remove();
	            		$('#hora').find("br").replaceWith("_");
	            		scheduleData = $('#hora').text().trim().split("_");	            		
	            		parsedData.proxima = moment(scheduleData[0], "HH:mm");
	            		parsedData.direccion = scheduleData[1];	 

	            		var diff = parsedData.proxima.diff(moment(), 'minutes');
	            		if (diff > 15){
	            			parsedData.color = "darken-3";
	            		} else if (diff <= 15 && diff > 10) {
	            			parsedData.color = "darken-2";
	            		} else if (diff <= 10 && diff > 5) {
	            			parsedData.color = "darken-1";
	            		} else if (diff <= 5 && diff > 2) {
	            			parsedData.color = "lighten-2";
	            		} else if (diff <= 2) {
	            			parsedData.color = "lighten-3";
	            		}

	            		if (parseInt(parsedData.dir) === 0){
	            			stopsDir1.push(parsedData);
	            		} else {
	            			stopsDir2.push(parsedData);
	            		}
	            			
	            		parsedStops++;

	            		if (parsedStops === totalStops){

	            			stopsDir1.sort(function(a, b) {
	            				if ( parseInt(a.id) > parseInt(b.id)){
	            					return 1;
	            				}
	            				if ( parseInt(a.id) < parseInt(b.id)){
	            					return -1;
	            				}
	            				return 0;
	            			});

	            			stopsDir2.sort(function(a, b) {
	            				if ( parseInt(a.id) > parseInt(b.id)){
	            					return 1;
	            				}
	            				if ( parseInt(a.id) < parseInt(b.id)){
	            					return -1;
	            				}
	            				return 0;
	            			});

	            			res.render('pages/stops', {
	            				direccion1: stopsDir1[0].direccion,
	            				direccion2: stopsDir2[0].direccion,
						    	stopsDir1: stopsDir1,
						    	stopsDir2: stopsDir2.reverse(),
						    	idl: parsedData.idl
						    });
	            		}
	            	}
            	});            	
            	
            });            
        }
    });

});

router.get('/test', function(req, res, next) {	

	var opt = {
	    url: 'http://salamanca.twa.es/code/getparadas.php?idl=L-13&idp=1301&ido=1.00000',
	    headers: { 'Referer': 'http://salamanca.twa.es/'}
	};

	request( opt, function(error, response, body) {
		console.log(body);

		res.render("error");
	});
});
module.exports = router;
