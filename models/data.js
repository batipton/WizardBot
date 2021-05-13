const mongoose = require('mongoose');

const dataSchema = mongoose.Schema({
  userID: String,
  username: String,
  health: Number,
  maxHealth: Number,
  mana: Number,
  maxMana: Number,
  points: Number,
  duel: {
    duelExists: Boolean,
    duelTurn: Boolean,
    duelInvite: Boolean,
    duelWith: String,
    duelRound: Number,
    duelAttack: Boolean,
    duelDamage: Number,
    duelDefense: Boolean
  }
});

module.exports = mongoose.model("Data", dataSchema);
