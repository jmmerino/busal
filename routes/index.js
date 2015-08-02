var express = require('express');
var router = express.Router();
var request = require('request');
var salenbus = require('../salenbus');


/* GET lines page. */
router.get('/', function(req, res, next) {
	url = 'http://salamanca.twa.es/code/getlineas.php';
	request(url, function(error, response, html) {
		if(!error){
			res.render('pages/index', { 
		    	lines: salenbus.parseBusLine(html)
		    });
		}
	});
});

router.get('/linea', function(req, res, next) {
	var busStopsDir1 = [],
		busStopsDir2 = [];	

	var opt = {
	    url: 'http://salamanca.twa.es/code/getparadas.php?idl=' + req.query.idl,
	    headers: { 'Referer': 'http://salamanca.twa.es/'}
	};

	request(opt, function(error, response, html) {
		if (!error){
			var busStops = salenbus.parseBusStops(html);

			var contParsedBusStops = 0;
			busStops.forEach(function(busStop, index) {				

				busStop.idl = req.query.idl;
				
				var opt = {
				    url: 'http://salamanca.twa.es/code/getparadas.php?idl=' + busStop.idl + '&idp=' + busStop.idp + '&ido='+ busStop.ido,
				    headers: { 'Referer': 'http://salamanca.twa.es/'}
				};
				
		    	request(opt, function(error, response, html) {
		    		contParsedBusStops ++;
		    		busStop = salenbus.parseBusStop(html, busStop);

		    		console.log(busStop);

		    		if (parseInt(busStop.direction) === 0){
		    			busStopsDir1.push(busStop);
		    		} else {
		    			busStopsDir2.push(busStop);
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
						});

						busStopsDir2.sort(function(a, b) {
							if ( parseInt(a.id) > parseInt(b.id)){
								return 1;
							}
							if ( parseInt(a.id) < parseInt(b.id)){
								return -1;
							}
							return 0;
						}).reverse();

						res.render('pages/stops', {
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
