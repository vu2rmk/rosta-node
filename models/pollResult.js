//Grab the required packages
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

// Defining the Schema
var PollResultsSchema = new Schema({
        questionId : String,
        optionId : String,
        votedBy : String,
        eventId : String,
        pollId : String,
        votedTime : Date
});


//Return the model
module.exports =  mongoose.model('PollResult',PollResultsSchema);
 