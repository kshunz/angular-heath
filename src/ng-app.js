angular.module('ngHeath', ['firebase'])

.run(function() {
  if(!window.Firebase) {
    return console.error('Firebase is required. Please install Firebase before using this utility.', this.name);
  }
})

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
      this._scope = {};

      this.name = '$auth';
      // this._scopeUserKey = 'user';
      // this._scopeAuthKey = 'account';
      this.strategy = 'password';

      this.authObjectActive = false;
      this.userObjectActive = false;

      this.strategies = {
        'password': true,
        'twitter': true,
        'google': true
      };

      this.authObject = function(scope, scopeKey) {

        this.authObjectActive = true;

        if(scope && scopeKey) {

          this._authScope = scope;
          this._authKey = scopeKey;

          var keyExistsInScope = this._authScope.hasOwnProperty(this._authKey);
          var authObj = {};

          authObj.login = this.login;
          authObj.register = this.register;
          // authObj.logout = this.logout;
          // authObj.isLoggedIn = this.isLoggedIn;

          if(keyExistsInScope && typeof this._authScope[this._authKey] === 'object') {
            //extend object if present
            Object.keys(authObj).forEach(function(name) {
              console.warn('extend', name);
              _this._authScope[_this._authKey][name] = authObj[name];
            });
          }

          if(keyExistsInScope && typeof this._authScope[this._authKey] !== 'object') {
            console.error('The chosen key (%s) is already in use.', this._authKey);
          }

          if(!keyExistsInScope) {
            console.warn('Setting new scope key', scopeKey);
            this._authScope[this._authKey] = authObj;
          }

        }
      };

      this.use = function(strategy) {
        _this.strategy = strategy;
      };

      this.userObject = function(scope, scopeKey) {
        if(scope && scopeKey) {
          this._userScope = scope;
          this._userKey = scopeKey;
          this.userObjectActive = true
          this._userScope.$apply();
        }
      };

      this.register = function(email, password, cb) {

        if(validate(email, 'email')) {
          var errorMessage = 'Please provide a valid email address.';

          return console.error(errorMessage);
        }

        this.ref.createUser({ email: username, password: password },
          function(error, userData) {

            if (error) {
              console.log("Error creating user:", error);
              cb("Error creating user: " + error, userData);
            } else {
              console.log("Successfully created user account with uid:", userData.uid);
              cb(null, userData);
            }

        });

      };
      //
      // this.login = function(strategy, password) {
      //   // alert('logging in with ' + strategy + ' ' + password);
      //   var username = angular.copy(strategy);
      //   var strategyExists;
      //   var passwordNeeded;
      //
      //   this.strategies = _this.strategies;
      //
      //   if(_this.authObjectActive) {
      //     console.warn('authObject in use!');
      //     var scope = _this._scope[_this._scopeKey];
      //     // username = scope.username ? scope.username : username;
      //     password = scope.password || password;
      //   }
      //
      //   if(!password) {
      //     console.error('No password provided');
      //     this.strategy = strategy || this.strategy;
      //     this.strategy = String(strategy).toLowerCase();
      //   }
      //
      //   strategyExists = this.strategies[this.strategy];
      //   passwordNeeded = !strategyExists && !password;
      //
      //   if(passwordNeeded) {
      //     console.error('If you are attempting to login with email and password please provide a password.');
      //     return console.warn('You may also get this error if you entered an invalid authentication strategy.');
      //   }
      //
      //   if(this.strategy === 'password') {
      //     var authMessage = 'Login failed.';
      //
      //     this.ref.authWithPassword({ email: username, password: password },
      //       function(err, user) {
      //
      //         authMessage = (!err && user) ?
      //           'Logged in as ' + user.auth.uid : authMessage + ' ' + err;
      //
      //         if(_this.userObjectActive) {
      //           _this._scope[_this._scopeKey] = user.auth;
      //           _this._scope.$apply();
      //         }
      //
      //     });
      //   }
      //
      //
      // };
      //
      //

      this.login = function(strategy, password) {

        var scopeAuthObj = _this._authScope[ _this._authKey ];
        var scopeUserObj = _this._userScope[ _this._userKey ];
        var scopeObj = scopeAuthObj;
        var username;

        if(_this.strategy === 'password' || strategy && password) {
          username = scopeObj.username;
          password = scopeObj.password;

          //login with fb
          var authMessage = 'Login failed.';

          _this.ref.authWithPassword({ email: username, password: password },
            function(err, user) {
              if(!err && user) {

                authMessage = (!err && user) ? 'Logged in as ' + user.auth.uid : authMessage + ' ' + err;

                if(_this.userObjectActive) {
                  scopeUserObject = user.auth;
                  _this._authScope.$apply();
                  console.warn('Login successful', user.auth);
                }

              } else {
                console.error('Login failure', err, username, password);
              }

          });

        }


      };

      this.protectPage = $this.protectPage;

    };

  };

});
