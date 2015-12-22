angular.module('ng-heath', [])
.service('_authService', function(_scope) {
  //powered by firebase
  this.login = function() {
    console.log('authSvc Method', 'login');
  };
  this.logout = function() {
    console.log('authSvc Method', 'logout');
  };
  this.isLoggedIn = function() {
    console.log('authSvc Method', 'isLoggedIn');
  };
  this.protectPage = function() {
    console.log('authSvc Method', 'protectPage');
  };
});
