const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema =new mongoose.Schema({
   phone : {
    type : String ,
    unique : true,
    index : true,
    match : [/^[6-9]\d{9}$/,"please enter a valid phone number"]
   },

   email : {
    type : String,
    unique : true,
    sparse : true
   },

   googleId :{
    type : String,
    sparse :true,

   },

   authProvider : {
    type : String,
    enum : ["phone","google"],
    required : true
   },

   isVerified : {
    type : Boolean,
    default : false
   },

   profileCompleted : {
    type : Boolean,
    default : false
   },

   name : String ,

   dob : Date,

   gender : {
      type : String,
      enum : ["male","female"]
   },

   intrestedIn : {
      type : String,
      enum : ["male","female"]
   },

   bio : String,

   photo : [String],

   location : {
      city : String,
      lat : Number,
      lng : Number
   },

    
} ,{timestamps : true})


module.exports = mongoose.model("User",userSchema)