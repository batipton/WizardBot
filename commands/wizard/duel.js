const mongoose = require('mongoose');
const { mongoPass } = require('../../config.json');
const Discord = require('discord.js');

//CONNECT TO DATABASE
mongoose.connect(mongoPass, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//MODELS
const Data = require("../../models/data.js");

const dbInit = require('../../inits/userInit.js');

function respond(client, interaction, title, description) {
  const embed = new Discord.MessageEmbed()
    .setTitle(title)
    .setDescription(description);

    return client.api.interactions(interaction.id, interaction.token).callback.post({ data: {
      type: 4,
      data: {
        embeds: [embed.toJSON()],
      },
    }});
}

module.exports = {
	name: 'duel',
	description: 'Allows to users to duel against each other.',
  aliases: [],
  guildOnly: false,
  permissions: '',
  cooldown: 3,
  options: [
    {
      name: "start",
      description: "send a duel invite to a player",
      type: 1,
      options: [
        {
          name: "user",
          description: "user to duel",
          type: 6,
          required: true
        }
      ]
    },
    {
      name: "accept",
      description: "accept a duel invite",
      type: 1
    },
    {
      name: "decline",
      description: "decline a duel invite",
      type: 1
    },
    {
      name: "cancel",
      description: "cancel a pending invite",
      type: 1
    }
  ],
	execute(interaction, client) {
    const author = interaction.member.user.id;
    const subcommand = interaction.data.options[0].name;

    if(subcommand === "accept") {
        Data.findOne({
          userID: interaction.member.user.id
        }, (err, user) => {
          if(err) console.log(err);

          if(!user.duel.duelInvite) {
            respond(client, interaction, "DUEL!", "You do not have a pending duel invite!");
          }

          if(!user.duel.duelTurn) {
            respond(client, interaction, "DUEL!", "You have a pending duel invite \n" +
                                "to cancel: !duel cancel");
          }

          const turn = Math.random() < 0.5;


            Data.findOne({
              userID: user.duel.duelWith
            }, (error, sender) => {
              if(error) console.log(error);

              user.duel.duelExists = true;
              user.duel.duelTurn = turn;
              user.duel.duelInvite = false;
              user.duel.duelRound = 1;
              user.duel.duelAttack = false;
              user.duel.duelDamage = 0;
              user.duel.duelDefense = false;

              sender.duel.duelExists = true;
              sender.duel.duelTurn = !turn;
              sender.duel.duelInvite = false;
              sender.duel.duelRound = 1;
              sender.duel.duelAttack = false;
              sender.duel.duelDamage = 0;
              sender.duel.duelDefense = false;


              sender.save().catch(err => console.log(err));
              user.save().catch(err => console.log(err));

              const message = `<@${author}> has accepted the duel, <@${sender.userID}>. It is now <@${turn ? author : sender.userID}>'s turn.`;
              respond(client, interaction, "DUEL!", message);
            });
        });
      } else if(subcommand === "decline") {
        Data.findOne({
          userID: interaction.member.user.id
        }, (err, user) => {
          if(err) console.log(err);

          if(!user.duel.duelInvite) {
            respond(client, interaction, "DUEL!", "You do not have a pending duel invite!");
          }

          if(!user.duel.duelTurn) {
            respond(client, interaction, "DUEL!", "You have a pending duel invite \n" +
                                                    "to cancel: !duel cancel");
          }

          Data.findOne({
            userID: user.duel.duelWith
          }, (error, sender) => {
            if(error) console.log(error);

            user.duel.duelInvite = false;
            user.duel.duelTurn = false;
            user.duel.duelExists = false;
            user.duel.duelWith = null;
            sender.duel.duelInvite = false;
            sender.duel.duelTurn = false;
            sender.duel.duelExists = false;
            sender.duel.duelWith = null;
            sender.save().catch(err => console.log(err));
            user.save().catch(err => console.log(err));

            return message.channel.send(`<@${author}> has declined the duel, <@${sender.userID}>!`);
          });
        });
      } else if(subcommand === "cancel") {
        Data.findOne({
          userID: interaction.member.user.id
        }, (err, user) => {
          if(err) console.log(err);

          if(!user.duel.duelInvite) {
            respond(client, interaction, "DUEL!", "You do not have a pending duel invite!");
          }

          if(user.duel.duelTurn) {
            respond(client, interaction, "DUEL!", "You do not have a pending duel invite!");
          }

          Data.findOne({
            userID: user.duel.duelWith
          }, (error, receiver) => {
            if(error) console.log(error);

            user.duel.duelInvite = false;
            user.duel.duelTurn = false;
            user.duel.duelExists = false;
            user.duel.duelWith = null;
            receiver.duel.duelInvite = false;
            receiver.duel.duelTurn = false;
            receiver.duel.duelExists = false;
            receiver.duel.duelWith = null;
            user.save().catch(err => console.log(err));
            receiver.save().catch(err => console.log(err));

            const message = `<@${receiver.duelWith.id}> has cancelled the duel challenge, <@${user}>!`;
            respond(client, interaction, "DUEL!", message);
          });
        });
      }
    else if(subcommand === "start") {

    const user = interaction.data.options[0].options[0].value;

    Data.find({
      userID: { $in: [
        interaction.member.user.id,
        user
      ]}
    }, (err, data) => {
      if(err) console.log(err);

      let sender = data.find(o => o.userID === interaction.member.user.id);
      let receiver = data.find(o => o.userID === user);

      console.log(receiver);

      if(!receiver) {
        respond(client, interaction, "DUEL!", "that user is not a wizard and therefore you cannot duel them!");
      }

      if(receiver.duel.duelInvite || receiver.duel.duelExists) {
        respond(client, interaction, "DUEL!", "That user is already in a duel or has an invite pending!");
      }

      if(receiver.health === 0) {
        respond(client, interaction, "DUEL!", "That user is unable to duel at this time!");
      }

      if(sender.duel.duelInvite || sender.duel.duelExists) {
        respond(client, interaction, "DUEL!", "You can not send an invite if you are already dueling or have a duel pending");
      }

      if(receiver.health === 0) {
        respond(client, interaction, "DUEL!", "You must have at least 1 health in order to duel!");
      }

      sender.duel.duelInvite = true;
      sender.duel.duelWith = receiver.userID;
      receiver.duel.duelInvite = true;
      receiver.duel.duelTurn = true;
      receiver.duel.duelWith = sender.userID;
      sender.save().catch(err => console.log(err));
      receiver.save().catch(err => console.log(err));

      const message = `<@${user}>, you have been challenged to a duel against <@${interaction.member.user.id}>. \n
                                  to accept: /duel accept \n
                                  to reject: /duel decline`;
      respond(client, interaction, "DUEL!", message);
      });
	  }
   }
};
