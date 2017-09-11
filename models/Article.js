var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
  title: {
    type: String,
    trim: true,
    required: "Title is required"
  },
  link: {
    type: String,
    trim: true,
    required: "Link is required"
  },
  authors: {
    type: String,
    trim: true,
    required: false
  },
  publishedTime: {
    type: Number,
  },
  notes: [{
    // Store ObjectIds in the array
    type: Schema.Types.ObjectId,
    // The ObjectIds will refer to the ids in the Note model
    ref: "Note"
  }]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
