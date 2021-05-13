const mongoose = require('mongoose');
const { mongoPass } = require('../../config.json');
const { punch } = require('../../spells.json');
const duel = require('../../utils/duel.js');
const Discord = require('discord.js');

//CONNECT TO DATABASE
mongoose.connect(mongoPass, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//MODELS
const Data = require("../../models/data.js");

module.exports = {
  name: 'punch',
  description: 'simplest attack form that is rarely successful against another wizard',
  aliases: [],
  guildOnly: false,
  permissions: '',
  cooldown: 3,
  options: [
    {
      name: 'user',
      description: 'your oponent',
      type: 6,
      required: true
    }
  ],
  execute(interaction, client) {

    const punched = interaction.data.options[0].value;
    const puncher = interaction.member.user.id;

    console.log(punched, puncher);

    Data.find({
      userID: { $in: [
        puncher,
        punched
      ]}
    }, (err, data) => {
      if(err) console.log(err);

      let attacker = data.find(o => o.userID === puncher);
      let attacked = data.find(o => o.userID === punched);

      duel.duelPhase(attacker, attacked, interaction, client, punch);
    });
  }
}
