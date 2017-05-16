//Grab the required packages
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

// Defining the Schema
var PollSchema = new Schema({
        
        name : {type: String, required:true, index : {unique:true}},
        description : String,
        eventID : String,
        pollEndTime : Date,
        createdOn : Date,
        minParticipants : Number,
        isSinglePage : Boolean,
        active : Boolean
});

//Return the model
module.exports =  mongoose.model('Poll',PollSchema);