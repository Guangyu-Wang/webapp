const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();


var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

//app.use(express.json());
app.use(bodyParser.json());


app.use(bodyParser.urlencoded({ extended: true }));

// simple route
require("./app/routes/tutorial.routes")(app);
app.get("/", (req, res) => {
  res.json({ message: "Welcome to our application." });
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const db = require("./app/models");
db.sequelize.sync();

module.exports =app;