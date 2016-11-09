(function () {
  'use strict';

  angular
    .module('sdaReader')
    .controller('ReaderController', ReaderController);

  /** @ngInject */
  function ReaderController($http, $mdSidenav, $mdToast, articlesRepo) {
    var vm = this;

    vm.navigation = [];

    vm.queryResult = null;

    vm.toggleSidenav = toggleSidenav;
    vm.search = search;
    vm.displayFirstPage = displayFirstPage;
    vm.displayPrevPage = displayPrevPage;
    vm.displayNextPage = displayNextPage;
    vm.displayLastPage = displayLastPage;

    activate();

    function activate() {
      $http.get('/assets/data/navigation.json').then(function (res) {
        vm.navigation = res.data;
      });
    }

    function toggleSidenav(id) {
      $mdSidenav(id).toggle();
    }

    function search(query) {
      // HACK: articlesRepo.search() not yet implemented
      return false;

      vm.loading = true;
      vm.queryResult = articlesRepo.search(query);
      vm.queryResult.$promise.then(function () {
        vm.loading = false;
      }, function () {
        vm.loading = false;
        $mdToast.showSimple('unable to load search results');
      })
    }

    function displayLastPage() {
       if (vm.queryResult.last) {
          $http.get(vm.queryResult.query.last.uri)
             .then(function (resp) {
                vm.queryResult = resp.data;
             });
       }
    }

    function displayNextPage() {
       if (vm.queryResult.next) {
          $http.get(vm.queryResult.query.next.uri)
             .then(function (resp) {
                vm.queryResult = resp.data;
             });
       }
    }

    function displayPrevPage() {
       if (vm.queryResult.previous) {
          $http.get(vm.queryResult.query.previous.uri)
             .then(function (resp) {
                vm.queryResult = resp.data;
             });
       }
    }

    function displayFirstPage() {
       if (vm.queryResult.first) {
          $http.get(vm.queryResult.query.first.uri)
             .then(function (resp) {
                vm.queryResult = resp.data;
             });
       }
    }

  }
})();