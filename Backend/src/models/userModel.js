const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema =new mongoose.Schema({
   phone : {
    type : String ,
    require : true,
    unique : true,
    index : true,
    match : [/^[6-9\d{9}$]/]
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
    require : true
   },

   isVerified : {
    type : Boolean,
    default : false
   },

   profileCompleted : {
    type : Boolean,
    default : false
   }
    
} ,{timestamps : true})


module.exports = mongoose.model("user",userSchema)