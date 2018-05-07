// Requiring Mongoose Node Package
var mongoose = require("mongoose");

// Reference To Mongoose Schema Constructor
var Schema = mongoose.Schema;

// Using Mongoose Schema Constructor To Create New Schema Object
var CommentsSchema = new Schema({
    // Mongo DB Document Fields For Comments Collection
    message: String
});

// Using Mongoose .model() To Create 'Comments' Model Using 'CommentsSchema'
var Comments = mongoose.model("Comments", CommentsSchema);

// Exporting 'Comments' Model
module.exports = Comments;