// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

var moment = require("moment");

module.exports = function(app, db) {

	var testObject = [{"_id":"59a78d0b332b41420e7e03d5","title":"It’s Time To Ditch The Concept Of ‘100-Year Floods’","link":"https://fivethirtyeight.com/features/its-time-to-ditch-the-concept-of-100-year-floods/"},{"_id":"59a78d0b332b41420e7e03d6","title":"\n\t\t\t\t\t\tSix Charts To Help Americans Understand The Upcoming German Election\t\t\t\t\t","link":"https://fivethirtyeight.com/features/six-charts-to-help-americans-understand-the-upcoming-german-election/"},{"_id":"59a78d0b332b41420e7e03d7","title":"\n\t\t\t\t\t\tAlbert Pujols Is The Worst Player In Baseball\t\t\t\t\t","link":"https://fivethirtyeight.com/features/albert-pujols-is-the-worst-player-in-baseball/"},{"_id":"59a78d0b332b41420e7e03d8","title":"\n\t\t\t\t\t\tThe Mayweather-McGregor Fight, As Told Through Emojis\t\t\t\t\t","link":"https://fivethirtyeight.com/features/the-mayweather-mcgregor-fight-as-told-through-emojis/"},{"_id":"59a78d0b332b41420e7e03db","title":"NFL Preseason Found A Way To Get Even Worse","link":"https://fivethirtyeight.com/features/nfl-preseason-found-a-way-to-get-even-worse/"},{"_id":"59a78d0b332b41420e7e03e0","title":"Trump Is A 19th-Century President Facing 21st-Century Problems","link":"https://fivethirtyeight.com/features/trump-is-a-19th-century-president-facing-21st-century-problems/"},{"_id":"59a78d0b332b41420e7e03dd","title":"How The Dodgers Are Using Baseball’s New DL Rules To Get An Edge","link":"https://fivethirtyeight.com/features/how-the-dodgers-are-using-baseballs-new-dl-rules-to-get-an-edge/"},{"_id":"59a78d0b332b41420e7e03d9","title":"Can A Third-Party Ticket Win In 2020?","link":"https://fivethirtyeight.com/features/can-a-third-party-ticket-win-in-2020/"},{"_id":"59a78d0b332b41420e7e03de","title":"Will The Arpaio Pardon Make Trump More Unpopular?","link":"https://fivethirtyeight.com/features/will-the-arpaio-pardon-make-trump-more-unpopular/"},{"_id":"59a78d0b332b41420e7e03dc","title":"The Arpaio Pardon Has Plenty Of Precedents … That Got Other Presidents In Trouble","link":"https://fivethirtyeight.com/features/the-arpaio-pardon-has-plenty-of-precedents-that-got-other-presidents-in-trouble/"},{"_id":"59a78d0b332b41420e7e03e1","title":"The Arpaio Pardon Encapsulates Trump’s Identity Politics","link":"https://fivethirtyeight.com/features/the-arpaio-pardon-encapsulates-trumps-identity-politics/"},{"_id":"59a78d0b332b41420e7e03da","title":"What Can We Do If A President Has A Conflict Of Interest But Doesn’t Think He Does?","link":"https://fivethirtyeight.com/features/what-can-we-do-if-a-president-has-a-conflict-of-interest-but-doesnt-think-he-does/"},{"_id":"59a78d0b332b41420e7e03df","title":"Is Trump Losing Advisers Unusually Fast?","link":"https://fivethirtyeight.com/features/is-trump-losing-advisers-unusually-fast/"}];

	app.get("/", function(req, res) {

		db.Article.find({}).sort({publishedTime: -1}).exec(function(error, doc) {
			if (error) {
				console.log(error);
			} else {
				for (i in doc) {
					doc[i].today = (moment().unix() - 24*60*60 <= doc[i].publishedTime);
				}
				var hbsObject = {
					articles: doc,
				};
				res.render("inbox", hbsObject);
			}
		});
	});

	app.get("/email/:id", function(req, res) {

		console.log(req.params.id);
		db.Article.findOne({"_id": req.params.id}).populate('notes').exec(function(error, doc) {
			if (error) {
				console.log(error);
			} else {
				var hbsObject = doc;
				console.log(hbsObject);
				res.render("email", hbsObject);
			}
		});
	});

	app.post("/submit", function(req, res) {
		//console.log(req.body);

		var newNote = new db.Note({body: req.body.body});

		newNote.save(function(error, doc) {
			if (error) {
				res.send(error);
			}
			else {
				db.Article.findOneAndUpdate({_id: req.body.articleId}, { $push: { "notes": doc._id } }, { new: true }, function(err, newdoc) {
					if (err) {
						res.send(err);
					}
					else {
						res.redirect('back');
					}
				});
			}
		});
	});

	app.delete("/delete", function(req, res) {

		//console.log(req.query.commentId);

		//Find and delete
		db.Note.find({ _id : req.query.commentId }).remove().exec(function(error,doc) {
			if(error) {
				console.log(error);
			} else {
				//Also remove it from the articles.
				db.Article.update( {notes: req.query.commentId}, { $pullAll: {notes: [req.query.commentId] } }, {multi: true}).exec(function(error2,doc2) {
					if(error2) {
						console.log(error2);
					} else {
						console.log("Removed comment: " + req.query.commentId);
						res.send({success:true});
					}
				})
			}
		});

	});


	app.get("/get538", function(req, res) {
		request("http://fivethirtyeight.com/", function(error, response, html) {

			var $ = cheerio.load(html);

			var results = [];

			$(".type-fte_features h2 a, h3 a").each(function(i, element) {

				var link = $(element).attr("href");
				var title = $(element).text().trim();

				//This exists because the time can come in multiple forms depending on where it is
				var time1 = $(element).parent().siblings("time").attr("title");
				var time2 = $(element).parent().siblings(".metadata").children(".date").text();

				//Reconstructs from partial time
				if(time1) {
					var time = moment(time1, "YYYY-MM-DDHH:mm:ss+Z");
				} else if (Number.isInteger(Number(time2.charAt(0)))) {
					var time = moment(moment().format('YYYY-MM-DD') + " " + time2 + "PDT", "YYYY-MM-DD h:mm a Z");
				} else {
					var time = moment(time2 + " " + moment().format('YYYY') + " 12:00 PDT", "MMM. DD YYYY h:mm a Z");
				}

				var authors = "";

				$(element).parent().siblings(".byline").children("a").each(function(j,bylineElement) {
					if (j > 0) {
						authors = authors + ", ";
					} 
					authors = authors + $(bylineElement).text();
				})

				//Creates fullData (aka data that is complete, so we can just update the existing document to include it)
				var fullData = {};
				//Creates another object for the basics (in case we add a new document)
				var setOnInsert = {};

				setOnInsert.link = link;

				if(authors) {
					fullData.authors = authors;
				}

				if(time1 || (Number.isInteger(Number(time2.charAt(0))))) {
					fullData.publishedTime = time.unix();
				} else {
					setOnInsert.publishedTime = time.unix();
				}

				db.Article.findOneAndUpdate({
					title: title
				},
				{
					$set: fullData,
					$setOnInsert: setOnInsert
				},
				{
					upsert: true,
					new: true
				},
				function(err, data) {
					console.log(title);
					if(err) {
						console.log(err);
					} else {
						console.log("____________________________");
						console.log(fullData);
						console.log("Wrote");
						console.log(data);
					}
				});

				results.push({
					title: title,
					link: link, 
					publishedTime: time.unix(),
					authors: authors,
				});

			});
			
			res.json({success:true});

			console.log(results);
		});

	});
}