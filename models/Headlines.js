// Requiring Mongoose Node Package
var mongoose = require("mongoose");

// Reference To Mongoose Schema Constructor
var Schema = mongoose.Schema;

// Using Mongoose Schema Constructor To Create New Schema Object
var HeadlinesSchema = new Schema({
    // Mongo DB Document Fields For Headlines Collection
    title: {
        type: String,
        require: true
    },
    summary: {
        type: String,
        required: true
    },
    photoLink: {
        type: String,
        required: true
    },
    storyLink: {
        type: String,
        required: true
    },
    // Linking Headlines Model to Comments Model Via 'Ref' Property
    comments: {
        type: Schema.Types.ObjectId,
        ref: "Comments"
    }
});

// Using Mongoose .model() To Create 'Headlines' Model Using 'HeadlinesSchema'
var Headlines = mongoose.model("Headlines", HeadlinesSchema);

// Exporting 'Headlines' Model
module.exports = Headlines;