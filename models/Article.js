// Require mongoose
var mongoose = require("mongoose");
// Create Schema class
var Schema = mongoose.Schema;

// Create article schema
var ArticleSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    trim: true,
    required: "Title is required"
  },
  // link is a required string
  link: {
    type: String,
    trim: true,
    required: "Link is required"
  },
  // This only saves one note's ObjectId, ref refers to the Note model
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

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the model
module.exports = Article;
