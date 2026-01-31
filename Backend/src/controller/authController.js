const brcypt = require("bcrypt")

exports.login=async (req,es) => {
    try {
        const {email , password} = req.body ;

        if (!email , !password , !name) {
            return res.send(400).json({message : "All feilds are mandatory"})
        }
        
        const existingUser = await user.findOne({email})

        if (existingUser) {
            res.send(409).json({message : "user already exist"})
        }

        const hashedPassword = await brcypt.hash(password,10)

        const

    } catch (error) {
        
    }
}