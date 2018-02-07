// Welcome info popup box
$(function() {
  // Check if the user does not want to see the box again
  if (Cookies.get('dont_show_again')) {
    return
  }

  // Fade in the modal
  $('#welcome.modal').modal({
    fadeDuration: 250
  })

})

// Saves user preference on modal appearances and closes the existing one
$(document).on('click', '.dont_show_again', function() {
  Cookies.set('dont_show_again', true, { expires: 30 })

  $.modal.close()

  return false
})
