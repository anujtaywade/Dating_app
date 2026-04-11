import OTP from "../models/otpModel"
import jwt from "jsonwebtoken";
import User from "./models/user.js";


const generateOTP =()=>{
    return Math.floor(100000 + Math.random() * 900000).toString()
}



export const sendOTP = async (req,res) => {
    const {phone} = req.body;

    const otp = generateOTP()
    await OTP.create({
        phone,
        otp,
        expiresAt,
    })

    console.log("OTP: ",otp)
    res.json({success:true, message : "OTP sent!!"})
}



export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  const record = await OTP.findOne({ phone, otp });

  if (!record) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (record.expiresAt < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }


  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({ phone });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ success: true, token, user });
};