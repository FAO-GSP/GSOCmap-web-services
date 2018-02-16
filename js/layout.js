$(function() {
  // Fade in the welcome modal
  // TODO on 'show.bs.modal' calculate current year
  $('#welcome.modal').modal({
    fadeDuration: 250
  })

  // Only show when there are results
  $('#statistics .results').hide()
  $('#crop-and-download').prop('disabled', true)

  // Clicking a sidebar control opens the sidebar with that button's target tab
  // active.
  $('[data-toggle="offcanvas"]').on('click', function (e, context) {
    let tab = $($(this).data('target'))
    let sidebar = $('#sidebar')
    let forced = context && context.forced

    if(!sidebar.hasClass('open')) {
      // If the sidebar is closed, open it and open the tab.
      tab.add(sidebar).addClass('open')
      tab.trigger('opened')
    } else if(tab.hasClass('open') && !forced) {
      // If the sidebar is open and the tab active, hide everything.
      $('#sidebar, #sidebar .tab').removeClass('open')
    } else if(!forced) {
      // If the sidebar is open and the tab is not active, open it and close the
      // rest.
      $('#sidebar .tab').removeClass('open')
      tab.addClass('open')
      tab.trigger('opened')
    }

    // Remove focus on control
    this.blur()
  })
})
