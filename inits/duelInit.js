//Will set all duel status to false in database

const mongoose = require('mongoose');
const { mongoPass } = require('../config.json');
const DEFAULT_HEALTH = 10;

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
    console.log("updating ", data.userID, "...");
    data[i].duel = {duelExists: false, duelTurn: false, duelInvite: false, duelWith: null, duelRound: 0, duelAttack: false, duelDamage: 0, duelDefense: false}
    data[i].save().catch(err => console.log(err));
  }
})
.then(console.log("done"));
