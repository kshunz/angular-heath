angular.module('ngHeath', ['firebase'])

.run(function() {
  if(!window.Firebase) {
    return console.error('Firebase is required. Please install Firebase before using this utility.', this.name);
  }
})

/*

.factory('_Auth', function($q) {

  return function(firebaseUrl) {
    var _this = this;

    this.name = '_Auth';

    if(!firebaseUrl) {
      return console.error('A Firebase app URL is required to use this utility.', this.name);
    }

    var ref = new Firebase(firebaseUrl);

    this._scope = {};
    this._scopeKey = 'user';
    this.userObjectActive = false;
    this.strategy = 'password';

    this.strategies = {
      'password': true,
      'twitter': true,
      'google': true
    };

    this.use = function(strategy) {
      this.strategy = strategy;
    };

    this.userObject = function(_scope, _scopeKey) {
      if(_scope && _scopeKey) {
        this._scope = _scope;
        this._scopeKey = _scopeKey;
        this.userObjectActive = true;
      }
    };

    this.register = function(email, password) {

      if(validate(email, 'email')) {
        var errorMessage = 'Please provide a valid email address.';

        return console.error(errorMessage);
      }

      ref.createUser({ email: username, password: password },
        function(error, userData) {

          if (error) {
            console.log("Error creating user:", error);
          } else {
            console.log("Successfully created user account with uid:", userData.uid);
          }

      });
    };

    this.login = function(strategy, password) {
      var username = angular.copy(strategy);
      var strategyExists;
      var passwordNeeded;

      if(!password) {
        this.strategy = strategy || this.strategy;
        this.strategy = String(strategy).toLowerCase();
      }

      strategyExists = this.strategies[this.strategy];
      passwordNeeded = !strategyExists && !password;

      if(passwordNeeded) {
        console.error('If you are attempting to login with email and password please provide a password.');
        return console.warn('You may also get this error if you entered an invalid authentication strategy.');
      }

      console.log('login with', strategyExists, username, this.strategy);

      if(this.strategy === 'password') {
        var authMessage = 'Login failed.';

        ref.authWithPassword({ email: username, password: password },
          function(err, user) {

            authMessage = (!err && user) ?
              'Logged in as ' + user.auth.uid : authMessage + ' ' + err;

            if(_this.userObjectActive) {
              _this._scope[_this._scopeKey] = user.auth;
              _this._scope.$apply();
            }

        });
      }


    };

    this.protectPage = function(config) {
      return config.resolve = function($q) {
        return $q(function(resolve, reject) {

          if(ref.getAuth()) {
            resolve();
          } else {
            reject();
          }

        });
      };
    };
  };

})

*/

.provider('$auth', function() {

  var $this = this;

  this.options = {};

  this.init = function(options) {

    this.options = options;

    if(!options.url) {
      return console.error('A Firebase app URL is required to use this utility.', this.name);
    }

    if(options.url) {
      this.ref = new Firebase(options.url);
    }

  };

  this.protectPage = function(config) {

    config.resolve = {
      protectPage: function($q, $window) {
        return $q(function(resolve, reject) {
          var userData = $this.ref.getAuth();
          var options = $this.options;
          var redirectTo;

          var localRedirect = config.failureRedirect;
          var globalRedirect = options.failureRedirect;

          if(localRedirect) {
            console.log(localRedirect.split('#'));
          }

          if(globalRedirect) {
            console.log(globalRedirect.split('#'));
          }

          console.log('localRedirect', localRedirect);
          console.log('globalRedirect', globalRedirect);

          if(userData) {
            console.log('User is logged in:', userData);
            resolve();
          }
          else {

            if(options.failureRedirect && config.failureRedirect) {
              console.warn('Local override', options.failureRedirect);

              redirectTo = config.failureRedirect;
            }

            if(options.failureRedirect && !config.failureRedirect ) {
              console.warn('Global redirect', config.failureRedirect);
              redirectTo = options.failureRedirect;
            }

            if(!options.failureRedirect && !config.failureRedirect ) {
              console.error('Access denied:','User "failureRedirect" to handle access issues.');
            }

            if(redirectTo) {
              console.warn('Redirecting to:', redirectTo);
              reject();
              $window.location = redirectTo;
            }
          }
        });
      }
    };

    return config;
  };

  this.$get = function() {

    return function() {

      var _this = this;

      this.ref = $this.ref;
      this.name = '$auth';
      this._scope = {};
      this._scopeKey = 'user';
      this.authObjectActive = false;
      this.userObjectActive = false;
      this.strategy = 'password';

      this.strategies = {
        'password': true,
        'twitter': true,
        'google': true
      };

      this.authObject = function(_scope, _scopeKey) {
        this.authObjectActive = true;
        if(_scope && _scopeKey) {
          this._scope = _scope;
          this._scopeKey = _scopeKey;

          var keyExistsInScope = this._scope.hasOwnProperty(this._scopeKey);
          var authObj = {};

          authObj.login = this.login;
          authObj.register = this.register;
          // authObj.logout = this.logout;
          // authObj.isLoggedIn = this.isLoggedIn;

          if(keyExistsInScope && typeof this._scope[this._scopeKey] === 'object') {
            //extend object if present
            Object.keys(authObj).forEach(function(name) {
              console.warn('extend', name);
              _this._scope[_this._scopeKey][name] = authObj[name];
            });
          }

          if(keyExistsInScope && typeof this._scope[this._scopeKey] !== 'object') {
            console.error('The chosen key (%s) is already in use.', this._scopeKey);
          }

          if(!keyExistsInScope) {
            console.warn('Setting new scope key', _scopeKey);
            this._scope[this._scopeKey] = authObj;
          }
          // this._scope[this._scopeKey] = authObj;
          // this._scope.$apply();

        }
      };

      this.use = function(strategy) {
        this.strategy = strategy;
      };

      this.userObject = function(_scope, _scopeKey) {
        if(_scope && _scopeKey) {
          this._scope = _scope;
          this._scopeKey = _scopeKey;
          this.userObjectActive = true;
        }
      };

      this.register = function(email, password) {

        if(validate(email, 'email')) {
          var errorMessage = 'Please provide a valid email address.';

          return console.error(errorMessage);
        }

        this.ref.createUser({ email: username, password: password },
          function(error, userData) {

            if (error) {
              console.log("Error creating user:", error);
            } else {
              console.log("Successfully created user account with uid:", userData.uid);
            }

        });

      };

      this.login = function(strategy, password) {
        // alert('logging in with ' + strategy + ' ' + password);


        var username = angular.copy(strategy);
        var strategyExists;
        var passwordNeeded;

        if(_this.authObjectActive) {
          var scope = _this._scope[_this._scopeKey];
          scope.username = '';
          scope.password = '';


          // console.warn(scope.username, scope.password);
          console.warn(_this._scope[_this._scopeKey]);
        }

        if(!password) {
          this.strategy = strategy || this.strategy;
          this.strategy = String(strategy).toLowerCase();
        }

        strategyExists = this.strategies[this.strategy];
        passwordNeeded = !strategyExists && !password;

        if(passwordNeeded) {
          console.error('If you are attempting to login with email and password please provide a password.');
          return console.warn('You may also get this error if you entered an invalid authentication strategy.');
        }

        console.log('login with', strategyExists, username, this.strategy);

        if(this.strategy === 'password') {
          var authMessage = 'Login failed.';

          this.ref.authWithPassword({ email: username, password: password },
            function(err, user) {

              authMessage = (!err && user) ?
                'Logged in as ' + user.auth.uid : authMessage + ' ' + err;

              if(_this.userObjectActive) {
                _this._scope[_this._scopeKey] = user.auth;
                _this._scope.$apply();
              }

          });
        }


      };

      this.protectPage = $this.protectPage;


    };

  };

})

.service('_authService', function() {

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

})
