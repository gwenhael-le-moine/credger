var app = angular.module('app',
  ['ui.router',
    'nvd3',
    'angularMoment',
    'chieffancypants.loadingBar',
    'rzModule',
  ])
  .config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state('app', {
          url: '',
          component: 'dashboard'
        });
    }
  ]);
