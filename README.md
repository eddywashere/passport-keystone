# Passport-Keystone

OpenStack Keystone authentication strategy for [Passport](http://passportjs.org/) and Node.js

## Install

    $ npm install passport-keystone

## Usage

#### Configure Strategy

The keystone authentication strategy authenticates users using a username and
password.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

    passport.use(new KeystoneStrategy({
       region: your.region,
       authUrl: your.authUrl
      },
      function(user, done) {
        return done(null, user);
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'keystone'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.post('/login',
      passport.authenticate('keystone', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
      });
