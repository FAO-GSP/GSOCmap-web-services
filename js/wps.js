// Keep the current WPS request to abort it later if needed
var currentWpsRequest = null

var abortCurrentWpsRequest = function() {
  bboxChanged = false
  spinner.stop()
  currentWpsRequest.abort()
}

// Request a gs:CropCoverage process
var crop = function(bbox) {
  if(currentWpsRequest) { abortCurrentWpsRequest() }

  var wpsRequest = prepareWpsRequest('crop', {
    points: bboxToPoints(bbox).map(function(p) {
      return `${p[0]} ${p[1]}`
    }).join(', ')
  })

  spinner.spin($('#crop .spinner')[0])

  currentWpsRequest = $.ajax({
    url: '/geoserver/GSOC/wms',
    type: 'POST',
    contentType: 'text/plain',
    data: wpsRequest,
    // Treat response as a binary file
    xhrFields: {
      responseType: 'blob'
    }
  }).done(function(data, status, xhr) {
    var filename = getFilename(xhr.getResponseHeader('Content-Disposition'))

    var blob = new Blob([data], {
      type: 'image/tiff',
      endings: 'transparent'
    })

    triggerDownload(filename, blob)
  }).fail(function(xhr, status, error) {
    console.log(status + ': ' + error)
  }).always(function() {
    bboxChanged = false
    spinner.stop()
  })
}

// Request a ras:RasterZonalStatistics process
var statistics = function(bbox) {
  if(currentWpsRequest) { abortCurrentWpsRequest() }

  wpsRequest = prepareWpsRequest('statistics', {
    points: bboxToPoints(bbox).map(function(p) {
      return `[${p.join(', ')}]`
    }).join(', ')
  })

  spinner.spin($('#statistics .spinner')[0])

  currentWpsRequest = $.ajax({
    url: '/geoserver/GSOC/wms',
    type: 'POST',
    contentType: 'text/plain',
    data: wpsRequest,
    dataType: 'xml'
  }).done(function(data, status, xhr) {
    let extract = function(node) {
      let text = $(data).find(`feature\\:${node}`).text()

      return Number(text).toFixed(2)
    }

    $('#statistics .sum').html(extract('sum'))
    $('#statistics .min').html(extract('min'))
    $('#statistics .max').html(extract('max'))
    $('#statistics .avg').html(extract('avg'))
    $('#statistics .stddev').html(extract('stddev'))
  }).fail(function(xhr, status, error) {
    console.log(status + ': ' + error)
  }).always(function() {
    bboxChanged = false
    spinner.stop()
  })
}

// Converts a bbox to an array of points usable in templates
var bboxToPoints = function(bbox) {
  return [
    [bbox[0], bbox[3]],
    [bbox[2], bbox[3]],
    [bbox[2], bbox[1]],
    [bbox[0], bbox[1]],
    [bbox[0], bbox[3]]
  ]
}

var prepareWpsRequest = function(process, data) {
  var template = $(`#${process}-template`).html()

  // Caches the template for subsequent requests to the same WPS
  Mustache.parse(template)

  return Mustache.render(template, data)
}

// Extract the filename from Content-Disposition header
var getFilename = function(disposition) {
  if (disposition && disposition.indexOf('attachment') !== -1) {
    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    var matches = filenameRegex.exec(disposition)

    if (matches != null && matches[1]) return matches[1].replace(/['"]/g, '')
  }
}

// Trigger a file download prompt from the browser
var triggerDownload = function(filename, file) {
  URL = window.URL || window.webkitURL
  downloadUrl = URL.createObjectURL(file)

  // Use HTML5 a[download] attribute to specify filename, if supported
  a = document.createElement('a')

  if (typeof a.download === 'undefined') {
    window.location = downloadUrl
  } else {
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
  }
}
