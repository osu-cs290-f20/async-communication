var fs = require('fs');
var path = require('path');
var express = require('express');
var exphbs = require('express-handlebars');

var peopleData = require('./peopleData');

var app = express();
var port = process.env.PORT || 3000;

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.json());

app.use(express.static('public'));

app.get('/', function (req, res, next) {
  res.status(200).render('homePage');
});

app.get('/people', function (req, res, next) {
  res.status(200).render('peoplePage', {
    people: peopleData
  });
});

app.get('/people/:person', function (req, res, next) {
  var person = req.params.person.toLowerCase();
  if (peopleData[person]) {
    res.status(200).render('photoPage', peopleData[person]);
  } else {
    next();
  }
});

app.post('/people/:person/addPhoto', function (req, res, next) {
  console.log("== req.body:", req.body);
  if (req.body && req.body.url && req.body.caption) {
    var person = req.params.person.toLowerCase();
    if (peopleData[person]) {
      // Add photo to DB...
      peopleData[person].photos.push({
        caption: req.body.caption,
        url: req.body.url
      });
      console.log("== Data for", person, ":", peopleData[person]);

      fs.writeFile(
        __dirname + '/peopleData.json',
        JSON.stringify(peopleData, null, 2),
        function (err, data) {
          if (err) {
            console.log("  -- err:", err);
            res.status(500).send("Error saving photo in DB");
          } else {
            res.status(200).send("Photo successfully added.")
          }
        }
      );
    } else {
      next();
    }
  } else {
    res.status(400).send("Request body must contain 'url' and 'caption'.")
  }
});

app.get('*', function (req, res, next) {
  res.status(404).render('404');
});

app.listen(port, function () {
  console.log("== Server listening on port", port);
})
