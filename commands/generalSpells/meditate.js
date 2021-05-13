const mongoose = require('mongoose');
const { mongoPass } = require('../../config.json');
const { meditate } = require('../../spells.json');
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
	name: 'meditate',
	cooldown: 3600,  //an hour
	description: 'Basic mana absoprtion spell that will give user a base of 3 mana',
  aliases: [],
  guildOnly: false,
  permissions: '',
  cooldown: 3600,
  options: [],
	execute(interaction, client) {
    const user = interaction.member.user.id;

			Data.findOne({
				userID: user
			}, (err, data) => {
        if(err) console.log(err);
        if(data.mana + meditate.absorption >= data.maxMana) data.mana = data.maxMana;
        else data.mana += meditate.absorption;
        data.save().catch(err => console.log(err));
        const embed = new Discord.MessageEmbed()
          .setTitle('Healed')
          .setDescription(`<@${user}> used ${meditate.name} and now has ${data.mana}/${data.maxMana} health`);
          return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
            type: 4,
            data: {
              embeds: [embed.toJSON()],
            },
          } });
				});
		}
};
