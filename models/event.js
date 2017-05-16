//Grab the required packages
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");

// Defining the Schema
var EventSchema = new Schema({
        name : {type: String, required:true, index : {unique:true}},
        description : String,
        createdBy : {type: String, required:true},
        publishedOn : Date
});

//Return the model
module.exports =  mongoose.model('Event',EventSchema);
