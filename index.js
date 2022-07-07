const config = require('./config.json');

const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
client.commands = new Discord.Collection();

const cooldowns = new Discord.Collection();

//testing

const mongoose = require('mongoose');
const { mongoPass } = require('./config.json');
const DEFAULT_HEALTH = 10;

//CONNECT TO DATABASE
mongoose.connect(mongoPass, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//MODELS
const Data = require("./models/data.js");

const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);

		client.commands.set(command.name, command);
	}
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.ws.on('INTERACTION_CREATE', async interaction => {
  interaction.timestamp = Date.now();
  const guild = ((interaction.guild_id) ? client.guilds.cache.get(interaction.guild_id) : null);
  const channel = client.channels.cache.get(interaction.channel_id);
  const user = await ((interaction.member.user.id) ? client.users.fetch(interaction.member.user.id) : client.users.fetch(interaction.user.id));

  const command = client.commands.get(interaction.data.name) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(interaction.data.name));

  if(command.guildOnly && !guild) {
    const embed = new Discord.MessageEmbed()
    .setDescription(':x: I can\'t execute that command inside DMs!');

    return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
      type: 4,
      data: {
        embeds: [embed.toJSON()],
      },
    } });
  }

  if(!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if(timestamps.has(user.id)) {
    const expirationTime = timestamps.get(user.id) + cooldownAmount;

    if(now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      const embed = new Discord.MessageEmbed()
        .setDescription(`:x: Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`/${command.name}\` command.`);
        return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
  				type: 4,
  				data: {
  					     embeds: [embed.toJSON()],
  				    },
  			} });
  		}
    } else {
        timestamps.set(user.id, now);
        setTimeout(() => timestamps.delete(user.id), cooldownAmount);
      }



      try {
				Data.findOne({
					userID: user.id
				}, async (err, data) => {
					if(!data && !(interaction.data.options[0].name === "start")) {
						const embed = new Discord.MessageEmbed()
							.setDescription('You must use /wizard start before using any commands');
						return client.api.interactions(interaction.id, interaction.token).callback.post({data: {
							type: 4,
							data: {
								embeds: [embed.toJSON()],
							},
						} });
					} else {
						command.execute(interaction, client);
					}
				});
      } catch (error) {
        console.log(error);
        const embed = new Discord.MessageEmbed()
          .setDescription('There was an error trying to execute that command!');
        return client.api.interactions(interaction.id, interaction.token).callback.post({data: {
          type: 4,
          data: {
            embeds: [embed.toJSON()],
          },
        } });
      }
});

client.login(`${config.token}`);
