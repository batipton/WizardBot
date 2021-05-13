const Discord = require('discord.js');

const { token } = require('../config.json');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

const mongoose = require('mongoose');
const { mongoPass } = require('../config.json');
const DEFAULT_HEALTH = 10;

//CONNECT TO DATABASE
mongoose.connect(mongoPass, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.login(`${token}`);

//MODELS
const Data = require("../models/data.js");

Data.find({}, async (err, data) => {
  if(err) console.log(err);
  for(let i = 0; i < data.length; i++) {
    try {
      const user = await client.users.fetch(data[i].userID);
      data[i].username = user.username;
      console.log(user.username);
      data[i].save().catch(err => console.log(err));
    } catch (err) {
      console.log(err);
    }
  }
})
.then(console.log("done"));
