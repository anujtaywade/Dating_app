const { default: mongoose } = require("mongoose");

const otpSchema = new mongoose.Schema({
    phone : String,
    otp : Number,
    expiresAt : Date
})

export default mongoose.model("OTP", otpSchema)