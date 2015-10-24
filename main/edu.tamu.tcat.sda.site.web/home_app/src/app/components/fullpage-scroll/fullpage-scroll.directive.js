(function () {
   'use strict';

   angular
      .module('sda.site')
      .directive('fullpageScroll', fullpageScroll);

   /** @ngInject */
   function fullpageScroll() {
      var directive = {
         restrict: 'AC',
         link: linkFunc,
         controller: FullpageScrollController,
         controllerAs: 'fullpageScroll'
      };

      return directive;

      function linkFunc(scope, el) {
         scope.fullpageScroll.el = el;
         scope.fullpageScroll.options = {
            scrollOverflow: true,
            sectionSelector: '.fullpage-scroll-section',
            slideSelector: '.fullpage-scroll-slide',
            paddingTop: '4rem' // HACK
         };
         scope.fullpageScroll.init();
      }

      /** @ngInject */
      function FullpageScrollController($window, debounce) {
         var fullpageScroll = this;

         fullpageScroll.init = init;
         fullpageScroll.rebuild = debounce(100, rebuild);
         fullpageScroll.nextSection = nextSection;
         fullpageScroll.destroy = destroy;

         function init() {
            if (fullpageScroll.initialized) {
               return;
            }

            fullpageScroll.el.fullpage(fullpageScroll.options);
            fullpageScroll.initialized = true;
         }

         function rebuild() {
            if (!fullpageScroll.initialized) {
               return;
            }

            fullpageScroll.destroy();
            fullpageScroll.init();
         }

         function nextSection() {
            $window.jQuery.fn.fullpage.moveSectionDown();
         }

         function destroy() {
            if (!fullpageScroll.initialized) {
               return;
            }

            $window.jQuery.fn.fullpage.destroy('all');
            fullpageScroll.initialized = false;
         }
      }
   }

})();
