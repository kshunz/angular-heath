angular.module('ngHeath', ['firebase', 'mgcrea.ngStrap'])

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

  this.$get = function($window) {

    return function() {

      var _this = this;

      this.ref = $this.ref;
      this._scope = {};

      this.name = '$auth';
      this._scopeUserKey = 'user';
      this._scopeAuthKey = 'auth';
      this.strategy = 'password';

      this.authObjectActive = false;
      this.userObjectActive = false;

      this.strategies = {
        'password': true,
        'twitter': true,
        'google': true
      };

      _this.loginRedirectUrl = '/';
      _this.logoutRedirectUrl = '/';

      _this.loginRedirect = function(url) {
        _this.loginRedirectUrl = url;
        console.log('Login redirect to', url);
      };

      _this.logoutRedirect = function(url) {
        _this.logoutRedirectUrl = url;
        console.log('Logout redirect to', url);
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
          authObj.logout = this.logout;
          authObj.isLoggedIn = this.isLoggedIn;

          if(keyExistsInScope && typeof this._authScope[this._authKey] === 'object') {
            //extend object if present
            Object.keys(authObj).forEach(function(name) {
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

      this.getRef = function() {
        return _this.ref;
      };

      this.user = function() {
        return _this.ref.getAuth();
      };

      this.userObject = function(scope, scopeKey) {
        if(scope && scopeKey) {
          var userData = this.user();

          this._userScope = scope;
          this._userKey = scopeKey;
          this.userObjectActive = true
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

      this.isLoggedIn = function() {
        return _this.ref.getAuth() ? true : false;
      };

      this.logout = function() {
        _this.ref.unauth();
        $window.location = _this.logoutRedirectUrl;
      };

      this.login = function(strategy, password) {

        var scopeAuthObj = _this._authScope[ _this._authKey ];
        var scopeUserObj = _this._userKey ? _this._userScope[ _this._userKey ] : {};
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
                  $window.location = _this.loginRedirectUrl;
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
