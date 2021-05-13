const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")
const Fiche = require("../class/fiche.js")

module.exports.run = async(bot, interaction, options) => {
    Fiche.addPower(bot,interaction,options);
    return sendMessage.main("Création de votre pouvoir");
}


module.exports.help =  {
    name:"ajouterpouvoir",
    aliases:[]
}