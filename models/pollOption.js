//Grab the required packages
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

// Defining the Schema
var PollOptionSchema = new Schema({
        questionId : String,
        options : [String],
        active : Boolean
});


//Return the model
module.exports =  mongoose.model('PollOption',PollOptionSchema);
 