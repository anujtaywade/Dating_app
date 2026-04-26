require('dotenv').config();
const mongoose = require('mongoose')
const connectDB = require('./src/config/db')

const express = require('express')
const app = express()
port = 2000

app.get("/",(req,res)=>{
    res.send("Dating app backend running!")
})

app.use(express.json());
connectDB();
app.use('/auth',require("./src/routes/authRoute"))
app.use('/',require("./src/routes/profileRoute"))
app.use('/',require("./src/routes/likeRoute"))
app.use('/matches',require("./src/routes/matchRoute"))

app.listen(port,()=>{
    console.log(`Dating app running on http://localhost:${port}/` )
})