const mongoose = require('mongoose');
const { mongoPass } = require('../../config.json');
const { flinch } = require('../../spells.json');
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
	name: 'flinch',
	cooldown: 3,
	description: 'Simplest form of defense that will often times do nothing against an attack',
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

    const defend = interaction.member.user.id;
    const attack = interaction.data.options[0].value;

			Data.find({
				userID: { $in: [
          defend,
          attack
        ]}
			}, (err, data) => {
        if(err) console.log(err);
          let defender = data.find(o => o.userID === defend);
          let attacker = data.find(o => o.userID === attack);

          return duel.duelDefensePhase(defender, attacker, interaction, client, flinch);
				});
		}
	};
