const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema =new mongoose.Schema({
    name : {
        type : String ,
        require : true ,
        trim : true  
    },
    email : {
        type : String,
        require : true,
        trim : true,
        unique : true,
        lowercase : true
    },

    password : {
        type : String ,
        require : true ,
        minlength : 6,
    },
    
} ,{timestamps : true})

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next;
    this.password = await bcrypt.hash(this.password,10) 
    next()
})

userSchema.method.matchpassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
}

module.exports = mongoose.model("user",userSchema)