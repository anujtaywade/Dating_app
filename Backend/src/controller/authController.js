const brcypt = require("bcrypt")

exports.login=async (req,es) => {
    try {
        const {email , password} = req.body ;

        if (!email , !password , !name) {
            return res.status(400).json({message : "All feilds are mandatory"})
        }
        
        const existingUser = await user.findOne({email})

        if (existingUser) {
            res.status(409).json({message : "user already exist"})
        }

        const isMatched = user.matchPassword(password) ;
        if (isMatched){
            return res.status(400).json({message : "Credentials Matched"})
        }   


    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server error"})
    }
}