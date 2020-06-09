var cheerio = require("cheerio");
var axios = require("axios");
var express = require("express");
var Article = require("./models/article");
var path = require("path");
var PORT = 3000;
var app = express();

mongoose.connect("mongodb://localhost/scraper_db", { useNewUrlParser: true });

app.get("/scrape", function (req, res) {

    axios.get("http://www.echojs.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        res.send("Scrape Complete");

    })
});

app.get("/api/articles", function (req, res) {
    Article.find().then(function (dbArticles) {
        res.json(dbArticles);
    });
});

app.get("/", function (req, res){
    res.sendFile(path.join(__dirname, "./public/index.html"))
})

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  



