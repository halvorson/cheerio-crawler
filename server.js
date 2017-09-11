/* Students: Using the tools and techniques you learned so far,
 * you will scrape a website of your choice, then place the data
 * in a MongoDB database. Be sure to make the database and collection
 * before running this exercise.

 * Consult the assignment files from earlier in class
 * if you need a refresher on Cheerio. */

// Dependencies
var express = require("express");
var mongojs = require("mongojs");

var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var moment = require("moment");

var mongoose = require("mongoose");
mongoose.Promise = Promise;

var app = express();
var port = process.env.PORT || 5000;

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// Set Handlebars.
var exphbs = require("express-handlebars");

// Customize handlebars with helpers
var MomentHandler = require("handlebars.moment");

var hbs =  exphbs.create({
	defaultLayout: 'main',
	helpers: {
		formatDate: function (date, format) {
			return moment(date).format(format);
		}, 
		formatDateFromUnix: function (date, format) {
			return moment(date, 'X').format(format);
		},
		timeFromUnix: function(date) {
			return moment(date, 'X').format("hh:mm a")
		}
	}
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// // Database configuration
// var databaseUrl = "scraper";
// var collections = ["scrapedData"];

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/scraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message


// Now this has to violate a few laws, but I'll let it slide
db.Article = require("./models/Article.js");
db.Note = require("./models/Note.js");

// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
// 	console.log("Database Error:", error);
// });

// Import routes and give the server access to them.
require("./controllers/ioController.js")(app, db);


db.once("open", function() {
	console.log("Mongoose connection successful.");
	app.listen(port, function() {
		console.log("App listening on PORT " + port);
	});
});
// db.scrapedData.createIndex({ "title": 1 }, { unique: true }, function () {

// });


