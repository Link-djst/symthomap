// app/routes.js

var Patient       = require('./models/patient');
var mysql      = require('mysql');
var express  = require('express');
var app      = express();
var mysql           = require('mysql');
var dbconfig        = require('../config/databaseSQL.js');
var current_user    = {};

var pool = mysql.createPool(dbconfig);

module.exports = function(app, passport) {

    // =====================================
    // ANGULAR ROUTES  =====================
    // =====================================
    app.get('/', function(req, res) {
        console.log("GET /");
        res.sendfile('./public/views/index.html'); // cargar index html para Angular
    });
    app.get('/login', function(req, res) {
        console.log("GET LOGIN");
        res.sendfile('./public/views/index.html'); // cargar index html para Angular
    });
    app.get('/signup', function(req, res) {
        console.log("GET SIGNUP");
        res.sendfile('./public/views/index.html'); // cargar index html para Angular
    });

    app.get('/dashboard', isLoggedIn,  function(req, res) {
        console.log("GET DASHBOARD");
        current_user = req.user;
        res.sendfile('./public/views/index.html'); // cargar index html para Angular
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    /*app.get('/login', function(req, res) {
        // cargar login.ejs y pasar mensajes por flash hacia loginMessage
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });*/

    // =====================================
    // SIGNUP ==============================
    // =====================================
    app.get('/signup', function(req, res) {

        // cargar signup.ejs y pasar mensajes por flash hacia signupMessage
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // =====================================
    // dashboard SECTION =====================
    // =====================================
    // Pagina protegida.. por lo tanto deben estar logeados para visitarla
    // isLoggedIn function
    /*app.get('/dashboard', isLoggedIn, function(req, res) {
        res.render('dashboard.ejs', {
            user : req.user // obtener el user de la sesion y pasarla al template
        });
    });*/
    app.get('/dashboard/user', isLoggedIn, function(req, res) {
      res.setHeader('Content-Type', 'application/json'); //Colocamos el header de tipo JSON
      res.send(JSON.stringify({ user : current_user })); //Mandamos el json para Koch y Dieguito
    });
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // patient =============================
    // =====================================
    // Get all the patients
    app.get('/patient', isLoggedIn,  function(req, res){
      pool.getConnection(function(err, connection) { //Creamos un pool de conexiones que serán reutilizadas, es importante!
        connection.query("SELECT * FROM heroku_03080da74f6c5f8.patient ", function(err, rows) { //Hacemos los queries tipo normal
          connection.release();
          if(rows){
            if(!rows.length){
            } else {
              res.setHeader('Content-Type', 'application/json'); //Colocamos el header de tipo JSON
              res.send(JSON.stringify({ patients : rows })); //Mandamos el json para Koch y Dieguito
            }
            if (err) {
              console.log(err);
              return done(err);
            };
          } else {
            console.log("rows of get Patient are undefined");
          }
        });
      });
    });

    app.get('/consultPatient', isLoggedIn,  function(req, res){
        var idpatient = req.idpatient;
        pool.getConnection(function(err, connection) { //Creamos un pool de conexiones que serán reutilizadas, es importante!
            connection.query("SELECT * FROM heroku_03080da74f6c5f8.patient WHERE idpatient ="+idpatient, function(err, rows) { //Hacemos los queries tipo normal
                connection.release();
                if(rows){
                    if(!rows.length){
                    } else {
                        res.setHeader('Content-Type', 'application/json'); //Colocamos el header de tipo JSON
                        res.send(JSON.stringify({ patients : rows })); //Mandamos el json para Koch y Dieguito
                    }
                    if (err) {
                        console.log(err);
                        return done(err);
                    };
                } else {
                    console.log("rows of get this specific Patient are undefined");
                }
            });
        });
    });

    app.post('/insertPatient', isLoggedIn,  function(req, res ){
        pool.getConnection(function(err, connection) { //Creamos un pool de conexiones que serán reutilizadas, es importante!
            var name = req.param('name');
            var email = req.param('email');
            var dir = req.param('dir');
            var lat = req.param('lat');
            var long = req.param('long');
            var patient = {name: name, email: email, latitud: lat, longitud: long, dir: dir};
            console.log(patient);
            /*newPatient.email = email;
            newPatient.name = name;
            newPatient.dir = dir;
            newPatient.latitud = lat;
            newPatient.longitud = long;*/
            connection.query('INSERT INTO heroku_03080da74f6c5f8.patient SET ? ', patient, function(err, result) {
              connection.release();
              if (err) {
                console.log(err);
                //done(err);
                console.log(err);
              };
              console.log("It worked");
              res.redirect('/dashboard');
            });
        });
    });



    // procesar el signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/dashboard', // redirigir al dashboard
        failureRedirect : '/signup', // redirige a signup por el error
        failureFlash : true // permitir flash messages
    }));

    // procesar login form
    app.post('/login', passport.authenticate('local-login', {
     successRedirect : '/dashboard', // redirigir al dashboard
     failureRedirect : '/login', // redirige a login por el error
     failureFlash : true // permitir flash messages
   }));
};

// verificar si esta logeado
function isLoggedIn(req, res, next) {

    // si esta autentificado, que prosiga
    if (req.isAuthenticated())
        return next();

    // si no esta, entonces redirigir al home
    res.redirect('/');
}
