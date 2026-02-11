exports.completeProfile= async (req,res) => {
    try {
        const userId = req.user.id

        const {
            name ,
            dob,
            gender,
            intrestedIn,
            bio,
            photos
        } = req.body

        const user = await User.findById(userId)

        if(!user) {
            res.status(404).json({message : "User not found"})
        }

        user.name = name || user.name,
        user.dob = dob || user.dob ,
        user.gender = gender || user.gender
        user.intrestedIn = intrestedIn || user.intrestedIn,
        user.bio = bio || user.bio ,
        user.photos = photos || user.photos 
        
        if (
            user.name &&
            user.dob &&
            user.gender && 
            user.intrestedIn &&
            user.bio && 
            user.photos && 
            user.photos.length > 0 
        ) {
            user.profileCompleted = true ;
        }

        await user.save();

        res.status(200).json({message : "profile updated ",
            profileCompleted : user.profileCompleted,
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({message : "Internal Server Error "})
    }
}