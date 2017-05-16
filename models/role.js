//Grab the required packages
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require("bcrypt-nodejs");


// Defining the Schema
var RoleSchema = new Schema({
        name : {type: String, required:true, index : {unique:true}},
        active : Boolean
});

//Return the model
module.exports =  mongoose.model('Role',RoleSchema);



