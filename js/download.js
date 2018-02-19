$(document).on('opened', '#download.tab', function() {
  // Only if the files list is empty
  if($.trim($('#download.tab .files').html()) == '') {
    $.get({
      url: '/GSOCmap/downloads',
      dataType: 'html'
    }).done(function(data, status, xhr) {
      // Get all the rows except the first, because it's Parent directory, and
      // every hidden file
      let files = $(data).find('tr').slice(1).filter(function() {
        return $(this).find('a').html().substring(0, 1) !== '.'
      })

      // Transform bytes to MBs
      files.find('td:contains("bytes")').each(function() {
        $(this).html(
          `${Math.ceil(Number($(this).html().split(' ')[0]) / 1024 / 1024)} MB`
        )
      })

      $('#download.tab .files').append(files)
    })
  }
})
