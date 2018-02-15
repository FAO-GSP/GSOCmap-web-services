// Initial map view
var extent = [-180, -65, 180, 55]
// Global bbox for preserving drawn value
var bboxCurrent = []
var bboxChanged = false

// Map layers
//
// Tile layer
var tiles = new ol.layer.Tile({
  preload: 15,
  source: new ol.source.TileWMS({
    url: '/geoserver/GSOC/wms',
    ratio: 2,
    params: {
      // It has to be uppercase for WFS
      'LAYERS': 'GSOC:NE2',
      format: 'image/png8'
    }
  })
})

// GSOC data layer
var gsocData = new ol.layer.Image({
  opacity: 0.8,
  preload: 15,
  source: new ol.source.ImageWMS({
    url: '/geoserver/GSOC/wms',
    ratio: 2,
    params: {
      // It has to be uppercase for WFS
      'LAYERS': 'GSOC:GSOCmapV1.2.0',
      tiled: true,
      format: 'image/png8'
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
    controls: ol.control.defaults({
      attribution: false
    }),
    target: 'map',
    view: view,
    loadTilesWhileAnimating: true,
    loadTilesWhileInteracting: true,
  })

  // Interaction used to select features by drawing boxes
  var dragBox = new ol.interaction.Extent({
    // Ctrl + Drag
    condition: ol.events.condition.platformModifierKeyOnly
  })

  dragBox.on('extentchanged', function(e) {
    bboxCurrent = dragBox.getExtent()
    bboxChanged = true
  })

  this.addEventListener('mouseup', function(e) {
    // Only trigger if we have an area of interest and it has changed recently
    if(bboxChanged && bboxCurrent) {
      statistics(bboxCurrent)
      $('[data-target="#statistics"]').click()
      $('#statistics .results').show(500)
    }
  })

  // Add interactions to the current set
  map.addInteraction(dragBox)

  // Disable it
  dragBox.setActive(false)

  // And enable it by holding Ctrl
  this.addEventListener('keydown', function(event) {
    if (event.keyCode == 17) { dragBox.setActive(true) }
  })

  this.addEventListener('keyup', function(event) {
    if (event.keyCode == 17) { dragBox.setActive(false) }
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
    var bbox = e.map.getView().calculateExtent()

    // Add CRS for query
    bbox.push('EPSG:4326')

    // TODO Remove after fixing contributors
    console.log(bbox.join(', '))

    // The metadata field used to specify a contributor
    var contributorId = 'metadata_full_institution'

    // Construct an XML feature request by WFS standards
    var featureRequest = new ol.format.WFS().writeGetFeature({
      // FIXME Use correct geoserver url
      featureNS: 'http://54.229.242.119/',
      // Workspace name
      featurePrefix: 'gsoc',
      // Layer name without workspace
      featureTypes: ['metadata'],
      outputFormat: 'application/json',
      srsName: 'EPSG:4326',
      propertyNames: [contributorId, 'iso'],
      filter: ol.format.filter.bbox('geom', bbox, 'EPSG:4326')
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

      // Accumulate ISOs by the same contributor
      reducer = (hash, feature) => {
        key = feature.get(contributorId)

        if (!(hash[key] instanceof Array)) {
          hash[key] = []
        }

        hash[key].push(feature.get('iso'))
        return hash
      }

      var contributors = features.reduce(reducer, {})
      var identifiers = Object.keys(contributors)

      // If there are between 6 and 1 contributors, list them.
      if (identifiers.length > 6) {
        attribution = 'There are ' + identifiers.length + ' contributors for the current view.'
      } else if (identifiers.length > 0) {
        // Generate formatted strings such as: contributor (ISO, ISO)
        var formattedContributors = identifiers.map(function(key) {
          return key + ' (' + contributors[key].join(', ') + ')'
        })

        attribution = 'With contributions from ' + formattedContributors.join(', ') + '.'
      }

      $('#gsoc-attribution').html(attribution)
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
