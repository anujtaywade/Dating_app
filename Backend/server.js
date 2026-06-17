require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors')
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/socket/socket');
const app = express();
const port = process.env.PORT ||3000;
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8081")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);




app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.use('/auth', require("./src/routes/authRoute"));
app.use('/profile', require("./src/routes/profileRoute"));
app.use('/like', require("./src/routes/likeRoute"));
app.use('/matches', require("./src/routes/matchRoute"));
app.use('/chat', require('./src/routes/chatRoute'));
app.use('/discover',require('./src/routes/discoverRoute'))
app.use('/skip',require('./src/routes/skipUserRoute'))
app.use('/block',require('./src/routes/blockRoute'))
app.use('/report',require('./src/routes/reportRoute'))
app.use("/auth", require("./src/routes/firebaseAuthRoute"));

app.get("/", (req, res) => {
  res.send("Dating app backend running!");
});


const server = http.createServer(app);


initSocket(server);


connectDB().then(() => {
  server.listen(port, () => {
    console.log(`Dating app running on http://localhost:${port}/`);
  });
});
