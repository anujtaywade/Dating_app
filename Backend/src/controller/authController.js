
exports.login=async (req,res) => {
    try {
        const {phone , googleId} = req.body ;

        if (!phone && !googleId ) {
            return res.status(400).json({message : "Phone or google login required"})
        }
        
        let authUser ;

        if (phone) {
            authUser = await user.findOne({phone})

            if(!user){
                authUser =await user.create({
                    phone,
                    authProvider : "phone",
                    isVerified : true
                })
            }
        }

        if (googleId){
            authUser = await user.findOne({googleId})

            if (!googleId){
                authUser =await user.create({
                    googleId,
                    authProvider : "google",
                    isVerified : true
                })
            }
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server error"})
    }
}

exports.logout = async (req,res) => {
    try {
         res.status(200).json({message : "Logout successful"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internl Server Error"})
    }
}