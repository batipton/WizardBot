const mongoose = require('mongoose');
const { mongoPass } = require('../../config.json');
const { punch } = require('../../spells.json');
const duel = require('../../utils/duel.js');
const Discord = require('discord.js');
const dbUtil = require('../../inits/userInit.js');

//CONNECT TO DATABASE
mongoose.connect(mongoPass, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//MODELS
const Data = require("../../models/data.js");

function respond(client, interaction, title, description) {
  const embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setDescription(description);

    return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
      type: 4,
      data: {
        embeds: [embed.toJSON()],
      },
    } });
}

module.exports = {
  name: 'wizard',
  description: 'simplest attack form that is rarely successful against another wizard',
  aliases: [],
  guildOnly: false,
  permissions: '',
  cooldown: 3,
  options: [
    {
      name: 'start',
      description: 'starts a wizard on their journey',
      type: 1,
    },
    {
      name: 'stats',
      description: 'shows a wizard\'s stats',
      type: 1,
      options: [
        {
          name: "user",
          description: 'user\'s stats to get',
          type: 6
        }
      ]
    }
  ],
  execute(interaction, client) {
    const subcommand = interaction.data.options[0];
    const user = interaction.member.user.id;

    if(subcommand.name === 'start') {
      Data.findOne({
        userID: user
      }, async (err, data) => {
        if(err) console.log(err);

        if(data) {
          respond(client, interaction, "Sorry", "You are already a wizard!");
        } else {
          try {
            const disUser = await ((interaction.member.user.id) ? client.users.fetch(interaction.member.user.id) : client.users.fetch(interaction.user.id));
            const newUser = await dbUtil.initUser(disUser);
            newUser.save().catch(err => console.log(err));
            respond(client, interaction, "Congratulations!", "You're a wizard now!");
          } catch(err) {
            console.log(err);
          }
        }
      });
    } else if(subcommand.name === 'stats') {
      Data.findOne({
        userID: user
      }, (err, data) => {
        if(err) console.log(err);
        const message = `<@${user}> stats: \n` +
          `mana: ${data.mana} \n` +
          `health: ${data.health}/${data.maxHealth} \n` +
          `points: ${data.points}`;

        respond(client, interaction, "Stats", message);
      });
    }
  }
}
