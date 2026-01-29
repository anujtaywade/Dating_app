const express = require('express')
const app = express()
port = 2000

app.get("/",(req,res)=>{
    res.send("Dating app backend running!")
})

app.use('/auth',require("./src/routes/authRoute"))

app.listen(port,()=>{
    console.log(`Dating app running on http://localhost:${port}/` )
})