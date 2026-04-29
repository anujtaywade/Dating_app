const mongoose = require('mongoose')

const connectDB = (app, port) => {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => {
            console.log("Connected to DB Dating App ✅")

            app.listen(port, () => {
                console.log(`Dating app running on http://localhost:${port}/`)
            })
        })
        .catch((error) => {
            console.log(`Error : ${error.message}`)
            process.exit(1)
        })
}

module.exports = connectDB;