// Request a gs:CropCoverage process
var crop = function(bbox) {
  var points = `${bbox[0]} ${bbox[3]}, ${bbox[2]} ${bbox[3]}, ${bbox[2]} ${bbox[1]}, ${bbox[0]} ${bbox[1]}, ${bbox[0]} ${bbox[3]}`

  var template = $('#crop-template').html()

  Mustache.parse(template)

  var rendered = Mustache.render(template, {
    points: points
  })

  $.ajax({
    url: '/geoserver/GSOC/wms',
    type: 'POST',
    contentType: 'text/plain',
    data: rendered,
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
  })
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
