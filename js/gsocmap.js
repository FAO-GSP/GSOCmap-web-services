// Map layers
//
// Tile layer
var tiles = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: 'https://ahocevar.com/geoserver/wms',
    params: {
      'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
      'format': 'image/png8'
    }
  })
})

// GSOC data layer
var gsocData = new ol.layer.Image({
  opacity: 0.8,
  source: new ol.source.ImageWMS({
    url: '/geoserver/GSOC/wms',
    attributions : '<img src="img/logos/GSP.png"/> <img src="img/logos/ITPS.png"/>',
    params: {
      'LAYERS': 'GSOC:GSOCmapV1.2.0',
      tiled: true,
      'format': 'image/png8'
    }
  })
})

$(function() {
  // Popup overlay
  //
  // Create an overlay to anchor the popup to the map.
  var popupOverlay = new ol.Overlay({
    element: $('#popup')[0],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  })

  // The map with every component.
  var map = new ol.Map({
    layers: [tiles, gsocData],
    overlays: [popupOverlay],
    target: 'map',
    view: new ol.View({
      projection: 'EPSG:4326',
      center: [0, 0],
      zoom: 2
    })
  })

  // Click handler to render the popup.
  map.on('singleclick', function(e) {
    var coordinate = e.coordinate;

    $('#popup-content').html('<code>' + coordinate +'</code>')

    popupOverlay.setPosition(coordinate)
  })

  // Click handler for the Button that closes the popup.
  $('#popup-closer').on('click', function() {
    // Remove overlay from map
    popupOverlay.setPosition(undefined)

    // Remove focus on button
    this.blur()

    // Don't follow the href on tag.
    return false
  })
})
