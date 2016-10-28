(function () {
  'use strict';

  var EVT_ANIMATION_END = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend ' +
    'webkitTransitionEnd mozTransitionEnd MSTransitionEnd oTransitionEnd transitionend';

  $.fn.extend({
    animateCss: function (animationName, cb) {
        this.addClass('animated ' + animationName).one(EVT_ANIMATION_END, function() {
            $(this).removeClass('animated ' + animationName);
            if (cb) {
              cb.call(this);
            }
        });
    }
  });

  // navigation toggle
  $('.nav-toggle').on('click', function (evt) {
    evt.preventDefault();
    $('#site-navigation').toggleClass('collapsed');
    $(this).toggleClass('active');
  });

  // footer toggle
  $('.footer-toggle').on('click', function (evt) {
    evt.preventDefault();
    $('#footer-content').slideToggle(200);
    $(this).find('i.fa').toggleClass('fa-angle-double-up').toggleClass('fa-angle-double-down')
  });

})();
