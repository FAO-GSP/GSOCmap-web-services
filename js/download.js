$(document).on('opened', '#download.tab', function() {
  // Only if the files list is empty
  if($.trim($('#download.tab .files').html()) == '') {
    $.get({
      url: '/GSOCmap/downloads',
      dataType: 'json'
    }).done(function(data, status, xhr) {

      data.forEach(function(file) {
        file.size = `${Math.ceil(file.size / 1024 / 1024)} MB`
        file.mtime = new Date(Date.parse(file.mtime)).toLocaleString()
      })

      // Name the collection for templating
      files = renderTemplate('download', { files: data })

      $('#download.tab .files').append(files)
    })
  }
})
