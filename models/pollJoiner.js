//Grab the required packages
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

// Defining the Schema
var pollJoinersSchema = new Schema({
        pollId : String,
        joinedBy : String,
        eventId : String,
        pollId : String,
        joinedTime : Date
});


//Return the model
module.exports =  mongoose.model('PollJoiner',pollJoinersSchema);