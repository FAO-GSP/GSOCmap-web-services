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

// Map view object
var view = new ol.View({
  projection: 'EPSG:4326',
  center: [0, 0],
  zoom: 2
})

// Current view params for querying features
var viewProjection = view.getProjection()
var viewResolution = view.getResolution()

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
    view: view
  })

  // Click handler to render the popup.
  map.on('singleclick', function(e) {
    var coordinate = e.coordinate;

    // Get the url for querying `GetFeatureInfo`
    var url = gsocData.getSource().getGetFeatureInfoUrl(
      coordinate, viewResolution, viewProjection, {
        'INFO_FORMAT': 'application/json'
      }
    )

    $.ajax({
      url: url,
      dataType: 'json'
    }).done(function(response) {
      // Parse and extract the first GeoJSON feature
      var parser = new ol.format.GeoJSON()
      var feature = parser.readFeatures(response)[0]

      if (feature) {
        // The webservice uses GRAY_INDEX as the SOC value
        var soc = feature.get('GRAY_INDEX').toFixed(1)

        var content = '<p><b>SOC</b> '
          + soc
          + ' <em>Mg ha-1</em></p>'

        // Generate the popup content
        $('#popup-content').html(content)

        // Show popup pointing at clicked coordinate
        popupOverlay.setPosition(coordinate)
      }
    })
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
