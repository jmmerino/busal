var express = require('express');
var router = express.Router();
var request = require('request');
var jschardet = require("jschardet");
var Iconv  = require('iconv').Iconv;
var charset = require('charset');
var busal = require('../busal');


/* GET lines page. */
router.get('/', function(req, res, next) {
	url = 'http://salamanca.twa.es/code/getlineas.php';
	request(url, function(error, response, html) {
		if(!error){
			res.render('pages/index', { 
		    	lines: busal.parseBusLine(html)
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

			var busStops = busal.parseBusStops(html);

			var contParsedBusStops = 0;
			busStops.forEach(function(busStop, index) {				

				busStop.idl = req.query.idl;

				var opt = {
				    url: 'http://salamanca.twa.es/code/getparadas.php?idl=' + busStop.idl + '&idp=' + busStop.idp + '&ido='+ busStop.ido,
				    encoding: 'binary',
				    headers: { 'Referer': 'http://salamanca.twa.es/'}
				};
				

		    	request(opt, function(error, response, html) {

		    		enc = charset(res.headers, html);
				    enc = enc || jschardet.detect(html).encoding.toLowerCase();
				    if (enc != 'utf-8'){
				    	iconv = new Iconv(enc, 'UTF-8//TRANSLIT//IGNORE');
				        html = iconv.convert(new Buffer(html, 'binary')).toString('utf-8');
				    }				      				   

		    		contParsedBusStops ++;
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

router.get('/acerca-de', function(req, res, next) {	
	res.render('pages/about');
});
module.exports = router;
