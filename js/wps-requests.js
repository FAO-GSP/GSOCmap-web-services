$(function() {
  var service = new WpsService({
    url: "/geoserver/GSOC/wms",
    version: "2.0.0"
  })

  wps.getCapabilities_GET(function(response) {
    console.log(response)
  })
})
