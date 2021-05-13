const mongoose = require('mongoose');
const { mongoPass } = require('../../config.json');
const { sparks } = require('../../spells.json');
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
	name: 'sparks',
	cooldown: 3,
	description: 'Basic attack spell that deals damage from red hot sparks projected from wand.',
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

      const defend = interaction.data.options[0].value;
      const attack = interaction.member.user.id;

			Data.find({
				userID: { $in: [
          defend,
          attack
        ]}
			}, (err, data) => {
        if(err) console.log(err);
          let attacker = data.find(o => o.userID === attack);
          let attacked = data.find(o => o.userID === defend);

          return duel.duelPhase(attacker, attacked, interaction, client, sparks);
				});
		}
	};
