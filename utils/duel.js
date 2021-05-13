const mongoose = require('mongoose');
const { mongoPass } = require('../config.json');
const Discord = require('discord.js');

const ROUND_TIME = 120; //seconds

//CONNECT TO DATABASE
mongoose.connect(mongoPass, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//MODELS
const Data = require("../models/data.js");

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

const duelPhase = (attacker, attacked, interaction, client, spell) => {

  if(!attacker.duel.duelExists) {
    return respond(client, interaction, "sorry!", "You are not in a duel right now!");
  }

  else if(!attacker.duel.duelTurn) {
    return respond(client, interaction, "sorry!", "It is not your turn to duel right now!");
  }

  else if(attacker.duel.duelAttack) {
    return respond(client, interaction, "sorry!", "You are in a defensive phase right now. You must use a defensive spell!");
  }

  else if(attacker.duel.duelWith !== attacked.userID) {
    return respond(client, interaction, "sorry!", "You are not dueling that user.");
  }

  else if(attacker.mana - spell.mana < 0) {
    return respond(client, interaction, "sorry!", "You do not have enough mana for that spell!");
  }

  const success = Math.random() < spell.chance;

  let damage = 0;

  if(!success) {
    damage = 0;
  }

  //all variables should be addressed
  attacked.duel.duelExists = true;
  attacked.duel.duelTurn = true;
  attacked.duel.duelRound = attacked.duel.duelRound;
  attacked.duel.duelAttack = true;
  attacked.duel.duelDamage = spell.damage;
  attacked.duel.duelDefense = false;

  attacker.duel.duelExists = true;
  attacker.duel.duelTurn = false;
  attacker.duel.duelRound = attacker.duel.duelRound;
  attacker.duel.duelAttack = true;
  attacker.duel.duelDamage = attacked.duel.duelRound;
  attacker.duel.duelDefense = false;
  attacker.mana = attacker.mana - spell.mana;

  attacker.save().catch(err => console.log(err));
  attacked.save().catch(err => console.log(err));

  setTimeout(roundExpired, 60000, attacker.userID, attacked.userID, attacker.duel.duelRound, interaction, client);
  const description = `<@${attacker.userID}> ${success ? "successfully":"unsuccessfully"} used ${spell.name} on <@${attacked.userID}>. It is now <@${attacked.userID}>'s turn to defend. They have ${ROUND_TIME} seconds to take their turn.`;
  return respond(client, interaction, "Spells", description);
}

const duelDefensePhase = (defender, attacker, interaction, client, spell) => {
  if(!defender.duel.duelExists) {
    return respond(client, interaction, "sorry!", "you are not in a duel right now");
  }

  else if(!defender.duel.duelTurn) {
    return respond(client, interaction, "sorry!", "it is not your turn to defend right now");
  }

  else if(!defender.duel.duelAttack) {
    return respond(client, interaction, "sorry!", "you are in the attack phase. You must use an attack spell!");
  }

  else if(defender.duel.duelWith !== attacker.userID) {
    return respond(client, interaction, "sorry!", "you are not dueling that user!");
  }

  else if(defender.mana - spell.mana < 0) {
    return respond(client, interaction, "sorry!", "you do not have enough mana to use that spell!");
  }

  const success = Math.random() < spell.chance;

  let damage = 0;

  if(success) {
    damage = defender.duel.duelDamage - spell.protection;
  } else {
    damage = defender.duel.duelDamage;
  }

  if(defender.health - damage <= 0) {
    return roundExpired(attacker.userID, defender.userID, defender.duel.duelRound, interaction, client);
  }

  defender.duel.duelExists = true;
  defender.duel.duelTurn = true;
  defender.duel.duelRound += 1;
  defender.duel.duelAttack = false;
  defender.duel.duelDamage = 0;
  defender.duel.duelDefense = false;
  defender.health -= damage;

  attacker.duel.duelExists = true;
  attacker.duel.duelTurn = false;
  attacker.duel.duelRound += 1;
  attacker.duel.duelAttack = false;
  attacker.duel.duelDamage = 0;
  attacker.duel.duelDefense = false;
  defender.save().catch(err => console.log(err));
  attacker.save().catch(err => console.log(err));

  // setTimeout(roundExpired, ROUND_TIME * 1000, attacker.userID, defender.userID, defender.duel.duelRound, message);
  const description = `<@${defender.userID}> used ${spell.name} against <@${attacker.userID}>'s attack which
      ${success ? "protected them from the attack" : "did not protect them from the attack"} and resulted in ${damage != 0 ? damage : "no"} damage. \n
      Current stats: \n
      <@${attacker.userID}> health: ${attacker.health} mana: ${attacker.mana}  \n
      <@${defender.userID}> health: ${defender.health} mana: ${defender.mana}  \n
      It is now <@${defender.userID}>'s turn to attack.`;

      return respond(client, interaction, "Spell", description);
}

function roundExpired(sender, receiver, n, interaction, client) {
  Data.find({
    userID: { $in: [
      sender,
      receiver
    ]}
  }, (err, data) => {
    if(err) console.log(err);

    let attacker = data.find(o => o.userID === sender);
    let attacked = data.find(o => o.userID === receiver);

    //check if is still attacked's turn and if round is still n
    if(attacked.duel.duelTurn && attacked.duel.duelRound === n) {
      attacked.duel.duelExists = false;
      attacked.duel.duelTurn = false;
      attacked.duel.duelInvite = false;
      attacked.duel.duelWith = null;
      attacked.duel.duelRound = 0;
      attacked.duel.duelAttack = false;
      attacked.duel.duelDamage = 0;
      attacked.duel.duelDefense = false;

      attacker.duel.duelExists = false;
      attacker.duel.duelTurn = false;
      attacker.duel.duelInvite = false;
      attacker.duel.duelWith = null;
      attacker.duel.duelRound = 0;
      attacker.duel.duelAttack = false;
      attacker.duel.duelDamage = 0;
      attacker.duel.duelDefense = false;

      attacked.save().catch(err => console.log(err));
      attacker.save().catch(err => console.log(err));
      const description = `<@${attacker.userID}> has defeated <@${attacked.userID}>`;
      return respond(client, interaction, `${attacked.userID} ran out of time`, description);
    }
  });
}

module.exports = { duelPhase, duelDefensePhase };
