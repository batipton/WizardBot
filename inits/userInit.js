const Discord = require('discord.js');

const { token } = require('../config.json');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

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


const initUser = (user) => {

  try {
    const newData = new Data({
    userID: user.id,
    health: 3,
    maxHealth: 3,
    mana: 10,
    maxMana: 10,
    points: 5,
    duel: {
      duelExists: false,
      duelTurn: false,
      duelInvite: false,
      duelWith: null,
      duelRound: 0,
      duelAttack: false,
      duelDamage: 0,
      duelDefense: false
    }
  })
    console.log("New user created!");
    return newData;
  } catch(err) {
    console.log(err);
  }
}


module.exports = { initUser };
