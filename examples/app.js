var express = require('express'),
passport = require('passport'),
flash = require('connect-flash'),
KeystoneStrategy = require('passport-keystone').Strategy,
ProxyKeystone = require('proxy-keystone'),
proxyKeystone = new ProxyKeystone({
  userAgent: 'Custom Openstack Dashboard'
});


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the KeystoneStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
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

var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.engine('ejs', require('ejs-locals'));
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'chachachangeme' }));
  app.use(flash());
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/rackspace', function(req, res){
  res.render('rackspace', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.flash('error') });
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
app.post('/login',
  passport.authenticate('keystone', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.all('/proxy/*', proxyKeystone.middleware);

var port = Number(process.env.PORT || 3000);

app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
