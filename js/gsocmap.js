$(function() {
  // Layers
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
  ];

  // Popup overlay

  // Create an overlay to anchor the popup to the map.
  var popupOverlay = new ol.Overlay({
    element: $('#popup')[0],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  });

  // Button that closes the popup
  var popupCloser = $('#popup-closer');

  popupCloser.on('click', function() {
    popupOverlay.setPosition(undefined);
    popupCloser.blur();

    // Don't follow the href on tag.
    return false;
  });

  // The map with every component
  var map = new ol.Map({
    layers: layers,
    overlays: [popupOverlay],
    target: 'map',
    view: new ol.View({
      projection: 'EPSG:4326',
      center: [0, 0],
      zoom: 2
    })
  });
});
