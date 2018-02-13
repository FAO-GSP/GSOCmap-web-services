$(function() {
  $('[data-toggle="offcanvas"]').on('click', function () {
    $('#sidebar').toggleClass('open')
    this.blur()
  })
})
