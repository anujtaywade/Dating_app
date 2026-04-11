import twilio from "twilio" ;

const client = twilio(process.env.USER_SID,process.env.TWILIO_AUTH_TOKEN)

await client.message.create({
    body : `your OTP is ${otp}`,
    from : "dating app",
    to : phone
})

