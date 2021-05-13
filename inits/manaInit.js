//Will set all mana to the DEFAULT_MANA level

const mongoose = require('mongoose');
const { mongoPass } = require('../config.json');
const DEFAULT_MANA = 10;

//CONNECT TO DATABASE
mongoose.connect(mongoPass, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//MODELS
const Data = require("../models/data.js");

Data.find({}, (err, data) => {
  if(err) console.log(err);
  for(let i = 0; i < data.length; i++) {
    data[i].mana = DEFAULT_MANA;
    data[i].save().catch(err => console.log(err));
  }
});
