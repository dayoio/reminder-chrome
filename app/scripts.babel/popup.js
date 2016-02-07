'use strict';

// reminder app
angular
  .module('app', ['ngMaterial', 'ngStorage'])
  .config(function ($mdThemingProvider, $mdIconProvider) {
    // set theme
    $mdThemingProvider.theme('default')
      .primaryPalette('teal')
      .accentPalette('deep-orange');
    // icons
    $mdIconProvider
      .icon('alarm', '../icons/ic_alarm_white_18px.svg', 18)
      .icon('alarm_add', '../icons/ic_add_alarm_white_18px.svg', 18)
      .icon('delete', '../icons/ic_delete_black_18px.svg', 18)
      .icon('help', '../icons/ic_help_black_18px.svg', 18);
  })
  // Dialog controller
  .controller('dialogController', function ($scope, $mdDialog, current) {
    $scope.current = current == null ? {
      enable: false,
      repeat: false
    } : current;
    // handlers
    $scope.cancel = function () {
      $mdDialog.cancel();
    };
    $scope.delete = function () {
      $scope.deleteRemind($scope.current);
      $mdDialog.hide();
    };
    $scope.ok = function () {
      $mdDialog.hide($scope.current);
    };
  })
  // Main controller
  .controller('mainController', function ($scope, $rootScope, $localStorage, $mdDialog, $log) {

    $rootScope.i18n = function (key) {
      return chrome.i18n.getMessage(key);
    };

    $rootScope.$storage = $localStorage.$default({
      reminds: []
    });

    $rootScope.deleteRemind = function (remind) {
      if(remind.name === undefined){
        return;
      }
      let res = $rootScope.getRemind(remind);
      if(res.index > -1)
      {
        if(res.value.enable)
        {
          chrome.runtime.sendMessage({
            remind: res.value
          });
        }
        $rootScope.$storage.reminds.splice(res.index, 1);
      }
    };

    $rootScope.getRemind = function (remind) {
      try{
        for(let i =0;i< $rootScope.$storage.reminds.length; i++)
        {
          if($rootScope.$storage.reminds[i].name === remind.name){
            return {
              index: i,
              value: $rootScope.$storage.reminds[i]
            };
          }
        }
      }catch(err){
        $log.error(err);
      }
      return {
        index: -1
      };
    }

    $rootScope.putRemind = function ($event, remind = null) {
      // show dialog
      $mdDialog.show({
          controller: 'dialogController',
          templateUrl: 'remind.tmpl.html',
          parent: angular.element(document.body),
          targetEvent: $event,
          clickOutsideToClose: true,
          locals: {current: angular.copy(remind)}
        })
        .then(function (newRemind) {
          let res = $rootScope.getRemind(newRemind);
          if(res.index > -1){
            $rootScope.$storage.reminds.splice(res.index, 1, newRemind);
            chrome.runtime.sendMessage({
              remind: newRemind
            });
          }else{
            $rootScope.$storage.reminds.push(newRemind);
          }
        });
    };
  });