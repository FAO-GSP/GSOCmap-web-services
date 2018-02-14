$(function() {
  var template = $('#crop-template').html()

  Mustache.parse(template)

  var rendered = Mustache.render(template, {
    points: "-61.603904985323901 -50.77850068559929, -57.51913057016445 -50.876144695523422, -57.673733585877656 -52.796476890697981, -61.457438970437707 -52.780202889043963, -61.603904985323901 -50.77850068559929"
  })

  console.log(rendered)
})
