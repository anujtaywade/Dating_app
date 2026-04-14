const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = mongoose.connect(process.env.MONGO_URL)
        
        console.log(`Connected to DB Dating App ✅ `)
    } catch (error) {
        console.log(`Error : ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB ;