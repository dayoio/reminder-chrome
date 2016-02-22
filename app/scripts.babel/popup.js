'use strict';

angular.module('appSvr', [])
  .service('reminderSvr', function($q) {
    let self = this;
    self.callBackground = function (method, ...args) {
      let d = $q['defer']();
      chrome.runtime.sendMessage({
        method: method,
        args: args
      }, function (response) {
        if(response.error !== undefined){
          d.reject(response.error);
        }else{
          d.resolve(response.result);
        }
      });
      return d.promise;
    };
  });

// reminder app
angular
  .module('app', ['ngMaterial', 'ngMessages', 'appSvr', 'angularMoment'])
  .config(function ($mdThemingProvider, $mdIconProvider) {
    // set theme
    $mdThemingProvider.theme('default')
      .primaryPalette('teal')
      .accentPalette('deep-orange');
    // icons
    $mdIconProvider
      .icon('alarm', '../images/icons/ic_alarm_white_18px.svg', 18)
      .icon('alarm_add', '../images/icons/ic_add_alarm_white_18px.svg', 18)
      .icon('repeat', '../images/icons/ic_repeat_black_18px.svg', 18)
      .icon('close', '../images/icons/ic_close_white_18px.svg', 18);
  })
  // Main controller
  .controller('mainController', ($scope, $rootScope, $mdDialog, $mdToast, $log, reminderSvr) => {
    $scope.i18n = function (key, ...args) {
      return chrome.i18n.getMessage(key, args);
    };

    function fetchData() {
      $log.info('fetching data...');
      reminderSvr.callBackground('syncAllReminds', []).then(result => {
        $scope.reminds = result.reminds || [];
      });
    }

    $scope.enableChanged = function (r) {
      reminderSvr.callBackground('saveRemind', r).then((nr) => {
        r.when = nr.when;
      });
    };

    $rootScope.editRemind = function ($event, remind = null) {
      $mdDialog.show({
        controller: 'dialogController',
        templateUrl: 'remind.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose: true,
        locals: {remind: angular.copy(remind)}
      }).then(response => {
        reminderSvr.callBackground(response.method, response.args).then(() => {
          fetchData();
        }, error => {
          showToast(error);
        });
      });
    };
    //
    fetchData();
  })
  // Dialog controller
  .controller('dialogController', ($scope, $mdDialog, reminderSvr, remind) => {
    $scope.i18n = function (key) {
      return chrome.i18n.getMessage(key);
    };

    $scope.remind = remind || {
        enable: true,
        repeat: false,
        message: '',
        after: 10
      };
    // handles
    $scope.cancel = function () {
      $mdDialog.cancel();
    };
    $scope.delete = function () {
      $mdDialog.hide({
        method: 'deleteRemind',
        args: $scope.remind
      });
    };
    $scope.ok = function () {
      $mdDialog.hide({
        method: 'saveRemind',
        args: $scope.remind
      });
    };
  });
