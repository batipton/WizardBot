# WizardBot

Welcome to the WizardBot. The WizardBot is a Discord bot that allows users to have wizard duels! 
As the WizardBot becomes more and more complex, this guide will become an indensipensible part of 
a wizard's journey. If you ever need to find this guide you can always do /wizard help. 

# Getting Started 

You're a wizard! Or are you? In order to officially become part of the WizardBot there are a couple of
requirements. First your Discord server must have the WizardBot. If you are a discord admin this 
[link](https://discord.com/api/oauth2/authorize?client_id=838149193897082967&permissions=0&redirect_uri=http%3A%2F%2Flocalhost%3A53134&scope=bot%20applications.commands) 
will allow you to connect the WizardBot to your Discord server. Second you must use the command 
/wizard start. Without using this command you will not be able to use the WizardBot! \n

So now you're actually a wizard! Now what? First you need to learn a few spells and you need to understand your limitations and enhancements. 
Every wizard has a max health and mana amount (lvl 1 starts off with 3 hp and 10 mana max). There are 3 types of spells at the moment. 
Attack spells, defensive spells, and general spells. Attack and defensive spells are used in duels only. 
General spells can be used outside of combat but tend to have longer cooldowns.
To start a duel a wizard must initiate it with an invitation command /duel start [username]. A wizard can only duel with one person at a time. 
Each duel phase has an attack phase and a defensive phase. If wizard A starts the duel they get the inital attack. After they choose an attack spell
to use Wizard B must use a defensive spell then Wizard B gets to choose an attack spell against Wizard A. At which point Wizard A must use a defensive spell 
then can use another attack spell on Wizard A. Every spell has a mana usuage, has a damage count, and a has an accuracy percentage. If a spell is 75% accurate
it will fail to hit it's target 25% of the time. 
