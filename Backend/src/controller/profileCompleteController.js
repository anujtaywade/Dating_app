const User = require("../models/userModel") 


exports.completeProfile= async (req,res) => {
    try {
        const userId = req.user.id

        const {
            name ,
            dob,
            gender,
            intrestedIn,
            bio,
            photos,
            location
        } = req.body

        const user = await User.findById(userId)

        if(!user) {
            return res.status(404).json({message : "User not found"})
        }

         if (location) {
        if (
          !Array.isArray(location.coordinates) ||
          location.coordinates.length !== 2
        ) {
          return res.status(400).json({
            message: "Location coordinates must be [longitude, latitude]"
          });
        }

        user.location = {
          type: "Point",
          coordinates: location.coordinates,
          city: location.city || user.location?.city
        };
      }


      if (name !== undefined) user.name = name;
      if (dob !== undefined) user.dob = dob;
      if (gender !== undefined) user.gender = gender;
      if (intrestedIn !== undefined) user.intrestedIn = intrestedIn;
      if (bio !== undefined) user.bio = bio;
      if (photos !== undefined) user.photos = photos;
        
       user.profileCompleted = Boolean(
        user.name &&
        user.dob &&
        user.gender &&
        user.intrestedIn &&
        user.bio &&
        Array.isArray(user.photos) &&
        user.photos.length > 0 &&
        user.location &&
        Array.isArray(user.location.coordinates) &&
        user.location.coordinates.length === 2
      );

        await user.save();

        return res.status(200).json({message : "profile updated ",
            profileCompleted : user.profileCompleted,
            user
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({message : "Internal Server Error "})
    }
}