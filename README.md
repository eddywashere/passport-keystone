# Passport-Keystone

OpenStack Keystone authentication strategy for [Passport](http://passportjs.org/) and Node.js

## Install

    $ npm install passport-keystone

## Example Usage

#### Authentication

The keystone authentication strategy authenticates users using a username and
password.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user that is attached to `req.user`.

```js
passport.use(new KeystoneStrategy({
   region: your.region,
   authUrl: your.authUrl
  },
  function(user, done) {
    var user = {
      id: identity.user.id,
      token: identity.token.id,
      username: identity.user.name,
      serviceCatalog: identity.raw.access.serviceCatalog
    };
    return done(null, user);
  }
));
```

#### Need to set session expiration to token expiration?

The following example uses `passReqToCallback` to send the `req` object to next callback, where session expiration can be configured.

```js
passport.use(new KeystoneStrategy({
    authUrl: 'https://identity.api.rackspacecloud.com',
    region: 'ord',
    passReqToCallback : true // allows us to interact with req object
}, function(req, identity, done) {
  if (!req.user) {
    var user = {
        id: identity.user.id,
        token: identity.token.id,
        username: identity.user.name,
        serviceCatalog: identity.raw.access.serviceCatalog
    };

    // Set session expiration to token expiration
    req.session.cookie.expires = Date.parse(identity.token.expires) - Date.now();

    done(null, user);
  } else {
      // user already exists
      var user = req.user; // pull the user out of the session
      return done(null, user);
  }
}));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'keystone'` strategy, to
authenticate requests.

```js
app.post('/login',
  passport.authenticate('keystone', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);
```

Checkout [Passportjs.org](http://passportjs.org/guide/authenticate/) for more authentication examples.
