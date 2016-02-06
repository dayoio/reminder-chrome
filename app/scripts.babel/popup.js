'use strict';

const APP_NAME = 'Reminder';

angular
  .module('app', ['ngMaterial'])
    .config(function ($mdThemingProvider, $mdIconProvider) {
      $mdThemingProvider.theme('default')
        .primaryPalette('teal')
        .accentPalette('deep-orange');

      $mdIconProvider
        .icon('alarm', '../icons/ic_alarm_white_18px.svg', 18)
        .icon('alarm_add', '../icons/ic_add_alarm_white_18px.svg', 18)
        .icon('delete', '../icons/ic_delete_black_18px.svg', 18)
        .icon('help', '../icons/ic_help_black_18px.svg', 18);
    })
  // Dialog controller
  .controller('putController', function($scope, $mdDialog, current){
    $scope.current = current;
    $scope.hide = function () {
      $mdDialog.hide();
    };
    $scope.cancel = function () {
      $mdDialog.cancel();
    };
    $scope.ok = function () {
      //
      $mdDialog.hide($scope.current);
    };
  })
  // Toolbar controller
  .controller('mainController', function ($scope, $rootScope, $mdDialog) {
    // add & edit form.
    $scope.title = APP_NAME;
    $scope.current = null;

    $rootScope.onClickRemind = function($event, remind = null){
      // show dialog
      $mdDialog.show({
        controller: 'putController',
        templateUrl: 'remind.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose: true,
        locals: { current: remind }
      })
      .then(function(){
        // ok
      }, function (){
        // cancel
      });

    };
  })
  // Reminds controller
  .controller('listController', function ($scope) {
    // fetch data

    // list...
    $scope.reminds = [];
    for(let i = 0; i < 10; i++) {
      $scope.reminds.push(
        {
          message: 'hello world',
          repeat: true,
          after: 30,
          next: '2016 02 05 23:44',
          enable: false
        }
      );
    }

    $scope.onSwipeRight = function () {
      console.log('swipe');
    };
  });