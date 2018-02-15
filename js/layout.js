$(function() {
  // Clicking a sidebar control opens the sidebar with that button's target tab
  // active.
  $('[data-toggle="offcanvas"]').on('click', function () {
    let tab = $($(this).data('target'))
    let sidebar = $('#sidebar')

    if(!sidebar.hasClass('open')) {
      // If the sidebar is closed, open it and open the tab.
      tab.add(sidebar).addClass('open')
    } else if(tab.hasClass('open')) {
      // If the sidebar is open and the tab active, hide everything.
      $('#sidebar, #sidebar .tab').removeClass('open')
    } else {
      // If the sidebar is open and the tab is not active, just toggle every tab.
      $('#sidebar .tab').toggleClass('open')
    }

    // Remove focus on control
    this.blur()
  })
})
