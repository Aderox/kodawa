const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")
const Fiche = require("../class/fiche.js")

module.exports.run = async(bot, interaction, options) => {
    Fiche.addSpecial(bot,interaction,options);
    return sendMessage.main("Création de votre capacité spécial");
}


module.exports.help =  {
    name:"ajouterspecial",
    aliases:[]
}