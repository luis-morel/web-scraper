// Requiring Node Packages
var bodyParser = require("body-parser"); // Body-Parsing Middleware
var cheerio = require("cheerio"); // HTML Parser\Scraper
var express = require("express"); // Web Application Framework
var handlebars = require("express-handlebars"); // JS Templating Engine
var logger = require("morgan"); // HTTP Request Logger
var mongoose = require("mongoose"); // Mongo DB Framework
var request = require("request"); // HTTP Request Client

// Requiring DB Models
var db = require("./models");

// Configuring and Connecting to Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/Headlines";
mongoose.Promise = Promise; // Set Mongoose To Leverage Built-in JS ES6 Promises
mongoose.connect(MONGODB_URI);

// Initializing Express
var app = express();
app.use(express.static("public")); // Serving 'Public' Folder As Static Directory

// Middleware Config
app.use(logger("dev")); // Morgan Request Logger
app.use(bodyParser.urlencoded({ extended: true })); // Handles Form Submissions

// Initializing HandleBars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// App Routes
app.get("/", function (req, res) {

    // Retrieve All Headlines From Mongo DB and Store In Array
    var headlines = [];

    db.Headlines.find({})
        .then(function (dbData) {
            headlines = dbData;
        })
        .catch(function (error) {
            console.log(error);
            res.send("We're sorry, there appears to be a problem with the site. " +
                "Please try refreshing the page in a few minutes.");
        });

    // Console Message
    console.log("\n<><><> Scrapping NY Times Science/Space Headlines <><><>\n");

    // Scrape Site
    request("https://www.nytimes.com/section/science/space", function (error, response, html) {

        // Load HTML Into Cheerio
        var $ = cheerio.load(html);

        // Scrape Each 'Article' element (with class 'story') within an 'li' element
        $("li article.story").each(function (i, element) {

            var title = $(element).find("h2 a").text();
            var summary = $(element).find("p.summary").text().trim();
            var photoLink = $(element).find("img").attr("src");
            var storyLink = $(element).find("h2 a").attr("href");

            // If Variables Truthy, Check For Duplicates, Then Store Non-Duplicate in Mongo DB
            if (photoLink && storyLink && summary && title) {

                var duplicate = false;

                for (let i = 0; i < headlines.length; i++) {
                    if (headlines[i].storyLink === storyLink) {
                        duplicate = true;
                    }
                };
                if (!duplicate) {
                    // Insert Data\Object Into MongoDB
                    db.Headlines.create(
                        { title, summary, photoLink, storyLink },
                        function (error, dbDocument) {
                            if (error) throw error;
                            else console.log("\nAdded: ", dbDocument);
                        });
                };

            };

        });

        // Log 'Success' and Send All Headlines to Handlebars
        console.log("Scrape Complete");
        db.Headlines.find({})
            .then(function (dbDocuments) {
                var hbsObject = { document: dbDocuments };
                res.render("index", hbsObject);
            })
            .catch(function (error) {
                console.log(error);
                res.send("We're sorry, there appears to be a problem with the site. " +
                    "Please try refreshing the page in a few minutes.");
            });

    });

});

app.get("/comments/:id", function (req, res) {

    // Retrieve Requested Headline
    db.Headlines.findOne(
        { _id: req.params.id })
        .populate("Comments")
        .then(function (dbHeadline) {
            console.log("[Comments Route] dbHeadline:\n", dbHeadline);
            var hbsObject = { document: dbHeadline };
            res.render("comments", hbsObject);
        })
        .catch(function (error) {
            console.log(error);
            res.send("We're sorry, there appears to be a problem with the site. " +
            "Please try refreshing the page in a few minutes.");
        });
    
});

// Initialize Server
var PORT = 3000;
app.listen(PORT, function () {
    console.log("App listening on port " + PORT + "!");
});