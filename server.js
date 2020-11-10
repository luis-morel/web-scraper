// Requiring Node Packages
// var bodyParser = require("body-parser"); // Body-Parsing Middleware
var cheerio = require("cheerio"); // HTML Parser\Scraper
var express = require("express"); // Web Application Framework
var handlebars = require("express-handlebars"); // JS Templating Engine
var logger = require("morgan"); // HTTP Request Logger
var mongoose = require("mongoose"); // Mongo DB Framework
var request = require("request"); // HTTP Request Client

// Requiring DB Models
var db = require("./models");

// Configuring and Connecting to Mongo DB
var MONGODB_URI = process.env.MLAB_MONGODB_URI || "mongodb://localhost/WebScraper";
mongoose.Promise = Promise; // Set Mongoose To Leverage Built-in JS ES6 Promises
mongoose.connect(MONGODB_URI);

// Initializing Express
var app = express();
app.use(express.static("public")); // Serving 'Public' Folder As Static Directory

// Middleware Config
app.use(logger("dev")); // Morgan Request Logger
// app.use(bodyParser.urlencoded({ extended: true })); // Handles Form Submissions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initializing HandleBars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// App Routes
app.get("/", function (req, res) {

    // Retrieve All Headlines From DB, Scrape Web, and Update Mongo DB If New Headlines Available
    db.Headlines.find({})
        .then(function (dbData) {
            webScrape(dbData, function (newHeadlines) {
                dbUpdate(newHeadlines, function (completed) {
                    if (completed) {
                        // Send All Headlines to Handlebars
                        db.Headlines.find({})
                            .then(function (dbDocuments) {
                                var hbsObject = { document: dbDocuments };
                                res.render("index", hbsObject);
                            })
                            .catch(function (error) {
                                console.log(error);
                            });
                    };
                });
            });
        })
        .catch(function (error) {
            console.log(error);
        });

});

app.get("/comments", function (req, res) {

    // Return Path: '/comments/id'
    res.status(200).json('/comments/' + req.query.headlineId);

});

app.get("/comments/:id", function (req, res) {

    // Retrieve Requested Headline
    db.Headlines.findOne(
        { _id: req.params.id })
        .populate({ path: "comments", select: "message" })
        .then(function (dbHeadline) {
            var hbsObject = { document: dbHeadline };
            res.render("comments", hbsObject);
        })
        .catch(function (error) {
            console.log(error);
        });

});

app.post("/comments/:id", function (req, res) {

    db.Comments.create(req.body)
        .then(function (dbComment) {
            return db.Headlines.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { comments: dbComment._id } },
                { new: true })
        })
        .then(function (dbHeadline) {
            res.status(200).json('/comments/' + req.params.id);
        })
        .catch(function (error) {
            res.json(error);
        });

});

app.delete("/comments/:id", function (req, res) {

    db.Comments.findOneAndRemove(
        { _id: req.params.id })
        .then(function (dbDocument) {
            return db.Headlines.findOneAndUpdate(
                { _id: req.body.headlineId },
                { $pull: { comments: req.params.id } })
                .then(function (dbHeadline) {
                    res.status(200).json('/comments/' + req.body.headlineId);
                })
                .catch(function (error) {
                    res.json(error);
                });
        });

});


// Initialize Server
var PORT = process.env.PORT || 3021;
app.listen(PORT, function () {
    console.log("App listening on port " + PORT + "!");
});


// Web Scraper Function
function webScrape(dbHeadlines, callback) {

    // Console Message
    console.log("\n ---- Scrapping NY Times Science/Space Headlines ----\n");

    // Object Array To Store Scraped Articles
    var newHeadlines = [];

    // Scrape Site
    request("https://www.nytimes.com/section/science/space", function (error, response, htmlBody) {

        // Load HTML Into Cheerio
        var $ = cheerio.load(htmlBody);

        // Scrape Each 'Article' element (with class 'story') within an 'li' element
        $("li article.story").each(function (i, element) {

            var title = $(element).find("h2 a").text();
            var summary = $(element).find("p.summary").text().trim();
            var photoLink = $(element).find("img").attr("src");
            var storyLink = $(element).find("h2 a").attr("href");

            // If Variables Truthy, Check For Duplicates, Then Push Non-Duplicate To Object Array
            if (photoLink && storyLink && summary && title) {
                var duplicate = false;
                for (let i = 0; i < dbHeadlines.length; i++) {
                    if (dbHeadlines[i].storyLink === storyLink) {
                        duplicate = true;
                    }
                };
                if (!duplicate) {
                    newHeadlines.push({ title, summary, photoLink, storyLink });
                };
            };

        });

        // Returning Array of Objects
        return callback(newHeadlines);

    });

};

// MongoDB Update Function
function dbUpdate(newHeadlines, callback) {

    var completed = true;
    // Insert New Headlines Into MongoDB
    if (newHeadlines.length > 0) {
        db.Headlines.insertMany(newHeadlines, function (error, dbDocuments) {
            if (error) {
                completed = false;
                throw error;
            }
            else {
                return callback(completed);
            }
        });
    }
    else {
        return callback(completed);
    }

};