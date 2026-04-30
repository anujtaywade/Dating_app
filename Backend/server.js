require('dotenv').config();
const express = require('express');
const http = require('http');

const connectDB = require('./src/config/db');
const { initSocket } = require('./src/socket/socket');

const app = express();
const port = 2000;


app.use(express.json());


app.use('/auth', require("./src/routes/authRoute"));
app.use('/', require("./src/routes/profileRoute"));
app.use('/', require("./src/routes/likeRoute"));
app.use('/matches', require("./src/routes/matchRoute"));
app.use('/', require('./src/routes/chatRoute'));

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