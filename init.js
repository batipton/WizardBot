const { clientID, token, guildID } = require('./config.json');

const fs = require('fs');
const axios = require('axios');

const commandFolders = fs.readdirSync('./commands');
const commands = [];

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		if(command.options) {
			commands.push({
				'name': command.name,
				'description': command.description,
				'options': command.options,
			});
			for (const alias of command.aliases) {
				commands.push({
					'name': alias,
					'description': command.description,
					'options': command.options,
				});
			}
		}
	}
}

function addCommand(command, index) {
	if(command.options) {
		axios.post(`https://discord.com/api/v8/applications/${clientID}/guilds/${guildID}/commands`, command, {
			headers: { Authorization: `Bot ${token}` },
		}).then(function(response) {
			if(response.status === 201) {
				console.log(`Added command ${command.name}.`);
			} else if (response.status === 200) {
				console.log(`Command ${command.name} already exists. Updating command...`);
				editCommand(command, response.data.id);
			} else {
				console.log(`Couldn't add command ${command.name}. Response code ${response.status}.`);
			}
			setTimeout(function() {
				if(index + 1 < commands.length) {
					addCommand(commands[index + 1], index + 1);
				}
			}, 5000);
		}).catch(function() {
			console.log(`Couldn't add command ${command.name}. Error.`);
		});
	} else if(index + 1 < commands.length) {
		addCommand(commands[index + 1], index + 1);
	}
}

function editCommand(command, commandID) {
	axios.patch(`https://discord.com/api/v8/applications/${clientID}/guilds/${guildID}/commands/${commandID}`, command, {
		headers: { Authorization: `Bot ${token}` },
	}).then(function(response) {
		if(response.status === 200) {
			console.log(`Updated command ${command.name}.`);
		} else {
			console.log(`Couldn't update command ${command.name}. Response code ${response.status}.`);
		}
	}).catch(function() {
		console.log(`Couldn't update command ${command.name}. Error.`);
	});
}

addCommand(commands[0], 0);
