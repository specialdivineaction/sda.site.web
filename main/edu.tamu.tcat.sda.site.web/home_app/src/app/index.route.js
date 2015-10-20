(function () {
   'use strict';

   angular
      .module('sda.site')
      .config(routeConfig);

   /** @ngInject */
   function routeConfig($stateProvider, $urlRouterProvider) {
      $stateProvider
         .state('home', {
            url: '/',
            templateUrl: 'app/main/main.html',
            controller: 'MainController',
            controllerAs: 'vm'
         });

      $urlRouterProvider.otherwise('/');
   }

})();
