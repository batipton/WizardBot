const mongoose = require('mongoose');
const { mongoPass } = require('../../config.json');
const { heal } = require('../../spells.json');
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
	name: 'heal',
	cooldown: 3600,  //an hour
	description: 'Basic healing spell that will give user a base of 3 health',
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
          if(data.health + heal.healing >= data.maxHealth) data.health = data.maxHealth;
          else data.health += heal.healing;
          data.save().catch(err => console.log(err));
          const embed = new Discord.MessageEmbed()
            .setTitle('Healed')
            .setDescription(`<@${user}> used ${heal.name} and now has ${data.health}/${data.maxHealth} health`);
            return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
              type: 4,
              data: {
                embeds: [embed.toJSON()],
              },
            } });
				});
		}
};
