(function () {
   'use strict';

   angular
      .module('sda.library')
      .controller('LibraryPersonController', LibraryPersonController);

   /** @ngInject */
   function LibraryPersonController($stateParams, $scope, $timeout, personRepository, workRepository, toastr) {
      var vm = this;

      vm.person = null;
      vm.relatedWorks = [];
      vm.loading = true;
      vm.showThrobber = false;

      activate();

      function activate() {
         var id = $stateParams.id;

         $scope.$emit('set:query:people', null);

         vm.loadingTimeout = $timeout(function () {
            vm.showThrobber = true;
            vm.loadingTimeout = null;
         }, 250);

         if (id) {
            vm.person = personRepository.get({ id: id }, onPersonLoaded, onNetworkFailure);

            vm.relatedWorks = workRepository.query({ aid: id });
         } else {
            hideThrobber();
         }
      }

      function onPersonLoaded() {
         hideThrobber();
      }

      function hideThrobber() {
         if (vm.loadingTimeout) {
            $timeout.cancel(vm.loadingTimeout);
            vm.loadingTimeout = null;
         }
         vm.loading = false;
         vm.showThrobber = false;
      }

      function onNetworkFailure() {
         toastr.error('Unable to load content.', 'Network Error');
         hideThrobber();
      }
   }

})();