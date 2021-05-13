//Will set all mana to the DEFAULT_MANA level

const mongoose = require('mongoose');
const { mongoPass } = require('../config.json');
const DEFAULT_HEALTH = 3;

//CONNECT TO DATABASE
mongoose.connect(mongoPass, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//MODELS
const Data = require("../models/data.js");


Data.updateMany({},
  {points: 5}, (err, data) => {
  if(err) console.log(err);
})
.then(console.log("done"));
