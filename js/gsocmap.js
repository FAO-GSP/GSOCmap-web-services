$(function() {
	/**
	* Elements that make up the popup.
	*/
	var container = document.getElementById('popup');
	var content = document.getElementById('popup-content');
	var closer = document.getElementById('popup-closer');


	/**
	* Create an overlay to anchor the popup to the map.
	*/
	var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
	element: container,
	autoPan: true,
	autoPanAnimation: {
	  duration: 250
	}
	}));


	      /**
	       * Add a click handler to hide the popup.
	       * @return {boolean} Don't follow the href.
	       */
	      closer.onclick = function() {
		overlay.setPosition(undefined);
		closer.blur();
		return false;
	      };


	      /**
	       * Create the map.
	       */
	      var layers = [
		new ol.layer.Tile({
		  source: new ol.source.TileWMS({
		    url: 'https://ahocevar.com/geoserver/wms',
		    params: {
		      'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
		      'format': 'image/png8'
		    }
		  })
		}),



		new ol.layer.Image({
		  opacity: 0.8,
	       source: new ol.source.ImageWMS({
		url: 'http://54.229.242.119/geoserver/GSOC/wms',
		attributions : '<img src="img/logos/GSP.png"/> <img src="img/logos/ITPS.png"/>',
		params: {
		  'LAYERS': 'GSOC:GSOCmapV1.1',
		  tiled: true,
		  'format': 'image/png8'
		}
	      })
	    })
	      ]
	;



	      var map = new ol.Map({
		layers: layers,
		overlays: [overlay],
		target: 'map',
		view: new ol.View({
		  projection: 'EPSG:4326',
		  center: [0, 0],
		  zoom: 2 
		})
	      });

	      var wmsSource = new ol.source.ImageWMS({
		url: 'http://54.229.242.119/geoserver/GSOC/wms',
		params: {'LAYERS': 'GSOC:V1.1_Pyramids', 'TILED': true},
		serverType: 'geoserver',
		crossOrigin: 'anonymous'
	      });
});
