/// <reference path="../vendor/node_modules/@types/angular/index.d.ts" />
/// <reference path="../vendor/node_modules/@types/underscore/index.d.ts" />
/// <reference path="../vendor/node_modules/@types/sweetalert/index.d.ts" />

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
