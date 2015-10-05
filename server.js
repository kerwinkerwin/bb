var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Barber = require('./app/models/barber');
var config = require('./config');
var jwt  = require('jsonwebtoken');
var crypto = require('crypto');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port
mongoose.connect(config.database);
app.set('superSecret', config.secret);


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


router.post("/authenticate", function(req,res){
  console.log("1");
  Barber.findOne({
    name: req.body.name
  }, function(err,user){

      if(err) throw err;

      if(!user){
        res.json({success: false, message: 'Authentication Failed, User not found'});
      }else if (user) {
        if(user.password!= req.body.password){
          res.json({success:false, message: 'Authentication Failed, wrong password'});
        }else{
          //if user found and pasword is right
          //create token

          var encrypted = {token: encryptAesSha256('shh',JSON.stringify(user))};
          var token  = jwt.sign(encrypted, app.get('superSecret'),{
            expiresInMinutes: 1440
          });

          res.json({
            success: true,
            message: 'yay',
            token: token
          });
        }
      }
  });
});

function encryptAesSha256 (password,textToEncrypt){
  var cipher = crypto.createCipher('aes-256-cbc',password);
  var crypted = cipher.update(textToEncrypt, 'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}

router.use(function(req,res,next){
  console.log('something is happening.');
  next();
})

router.use(function(req,res,next){
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });
  }
});
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

router.route('/barbers')

//create a barber
  .post(function(req,res){
    console.log(req.body.phone);
    console.log(req.body);
    var barber = new Barber();
    barber.name = req.body.name;
    barber.address = req.body.address;
    barber.city = req.body.city;
    barber.phone = parseInt(req.body.phone);
    barber.save(function(err){
      if(err)
        res.send(err);

        res.json({message: 'Barber created!'});
    });
  })

  .get(function(req,res){
    Barber.find(function(err,barber){
      if(err)
        res.send(err);

        res.json(barber);
    });
  });

  router.route('/barbers/:id')

    .get(function(req,res){
      console.log(req.params.id);
      Barber.findById(req.params.id, function(err,barber){
        if(err)
          res.send({"error":err});

        res.json(barber);
      });
    })

    .put(function(req,res){
      Barber.findById(req.params.id, function(err,barber){
        if(err)
          res.send(err);

        barber.name = req.body.name;

        barber.save(function(err){
          if(err)
            res.send(err);

          res.json({message: 'Barber updated'});
        });
      });
    })
    .delete(function(req,res){
      Barber.remove({
        _id: req.params.id
      }, function(err,barber){
          if(err)
            res.send(err);

          res.json({message: 'Deleted'});
      });
    });

app.get('/setup', function(req, res) {
  // create a sample user
  var barber = new Barber({
    name: 'Nick Cerminara',
    password: 'password',
    admin: true
  });

  // save the sample user
  barber.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});



// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api

// var apiRoutes = express.Router();


// START THE SERVER
// =============================================================================
app.listen(port);
app.use('/api', router);
console.log('Magic happens on port ' + port);


// BASE setup
//=================================================================================
