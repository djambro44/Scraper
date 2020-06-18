var cheerio = require("cheerio");
var axios = require("axios");
var express = require("express");
var db = require("./models/index.js");
var path = require("path");
var PORT = process.env.PORT || 3000;
var app = express();
var mongoose = require("mongoose");
var mongooseURL = process.env.MONGODB_URI || "mongodb://localhost/scraper_db";
mongoose.connect(mongooseURL, { useNewUrlParser: true });

//middle ware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/scrape", function (req, res) {
  axios.get("https://www.cbssports.com/fantasy/football/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // console.log($);
    console.log("scrape route")

    //grab every a tag under a h5 tag
    $("h5 > a").each(function (i, element) {
      // Save an empty result object
      var result = {};
      // console.log("this is what we need! " + $(this).text());
      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        // .children("a")
        .text()
      result.link = $(this)
        // .children("a")
        .attr("href");
      console.log("this is the result" + JSON.stringify(result));
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {

          console.log(err);
        });
    });


    res.send("Scrape Complete");


  })
});



app.get("/", function (req, res) {
  res.render("index", objectFromDB);
});


// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});



// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  console.log(req.body);
  console.log(req.params.id);
  db.Note.create(req.body)
    .then(function (dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});






