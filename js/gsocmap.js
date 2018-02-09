// Initial map view
var extent = [-180, -70.91725171499999, 180.008331893, 83.616081]

// Map layers
//
// Tile layer
var tiles = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: '/geoserver/GSOC/wms',
    params: {
      'LAYERS': 'GSOC:NE2',
      'format': 'image/png8'
    }
  })
})

// GSOC data layer
var gsocData = new ol.layer.Image({
  opacity: 0.8,
  source: new ol.source.ImageWMS({
    url: '/geoserver/GSOC/wms',
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
  minZoom: 2
})

$(function() {
  // Popup overlay
  //
  // Create an overlay to anchor the popup to the map
  var popupOverlay = new ol.Overlay({
    element: $('#popup')[0],
    autoPan: true,
    autoPanAnimation: {
      duration: 250
    }
  })

  // The map with every component
  var map = new ol.Map({
    layers: [tiles, gsocData],
    overlays: [popupOverlay],
    controls: [
      new ol.control.Zoom,
      new ol.control.FullScreen
    ],
    target: 'map',
    view: view
  })

  // Click handler to render the popup
  map.on('singleclick', function(e) {
    var coordinate = e.coordinate;

    // Current view params for querying features
    var viewProjection = view.getProjection()
    var viewResolution = view.getResolution()

    // Get the url for querying `GetFeatureInfo` on the data layer
    var url = gsocData.getSource().getGetFeatureInfoUrl(
      coordinate, viewResolution, viewProjection, {
        'INFO_FORMAT': 'application/json'
      }
    )

    $.getJSON(url).done(function(response) {
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

  map.on('moveend', function(e){
    // Get bounding box for current view
    // FIXME It's giving wrong or moved metadata
    var bbox = e.map.getView().calculateExtent()

    // Construct an XML feature request by WFS standards
    var featureRequest = new ol.format.WFS().writeGetFeature({
      // FIXME Use correct geoserver url
      featureNS: 'http://54.229.242.119/',
      featurePrefix: 'gsoc',
      // Layer name without workspace
      featureTypes: ['metadata'],
      outputFormat: 'application/json',
      geometryName: 'geom',
      bbox: bbox,
      srsName: 'EPSG:4326',
      propertyNames: ['iso']
    })

    // Send the request and parse it
    fetch('/geoserver/GSOC/wms', {
      method: 'POST',
      body: new XMLSerializer().serializeToString(featureRequest)
    }).then(function(response) {
      return response.json()
    }).then(function(geojson) {
      var features = new ol.format.GeoJSON().readFeatures(geojson)
      var attribution = ''

      // If there are between 10 and 1 contributors, list them.
      if (geojson.totalFeatures > 10) {
        attribution = 'There are ' + geojson.totalFeatures + ' contributors for the current view.'
      } else if (geojson.totalFeatures > 0) {
        var contributors = features.map(feature => feature.get('iso'))

        attribution = 'With contributions from ' + contributors.join(', ') + '.'
      }

      $('.gsoc-attribution').html(attribution)
    })
  })

  // Fit view to full map size
  view.fit(extent, { constrainResolution: false })

  // Click handler for the Button that closes the popup
  $('#popup-closer').on('click', function() {
    // Remove overlay from map
    popupOverlay.setPosition(undefined)

    // Remove focus on button
    this.blur()

    // Don't follow the href on tag
    return false
  })
})
