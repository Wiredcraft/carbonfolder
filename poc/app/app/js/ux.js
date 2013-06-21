
$(function(){
  // Messages animation
  $('#messages .error').hide();
  $('#sidebar > a').click(function () {
    $('#messages > div').animate(
      {
        'height': 'toggle',
        'opacity': 'toggle'
      },
      'fast'
    );
  });
  
  // Popup
  $(function(){
    $('#prompt').hide();
    $('#pane header a').click(function () {
      $('body').addClass('modal');
      $('#prompt').fadeIn();
    });
    
    $('#prompt footer a, #prompt header .close').click(function () {
      $('#prompt').fadeOut();
      $('body').removeClass('modal');
    });
  });
});

// Popup
$('.popover').prev('a').toggle(
  function () {
    $(this).next('.popover').addClass('active');
  },
  function () {
    $(this).next('.popover').removeClass('active');
  }
);


/// Spinning wheel
var opts = {
  lines: 11,
  length: 2,
  width: 2,
  radius: 4,
  corners: 1,
  rotate: 0,
  color: '#fff'
};

$.fn.spin = function(opts) {
  this.each(function() {
    var $this = $(this),
        data = $this.data();

    if (data.spinner) {
      data.spinner.stop();
      delete data.spinner;
    }
    if (opts !== false) {
      data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
    }
  });
  return this;
};

// var target = $('#messages');
var extra = $('<span class=\'extra\'></span>');
$('#messages div').prepend(extra);
extra.spin(opts);
