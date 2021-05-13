const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")
const Fiche = require("../class/fiche.js")


module.exports.run = async(bot, interaction, options) => {
    Fiche.afficherFiche(bot,interaction,options)
    return sendMessage.main("Affichage de votre fiche...");
}


module.exports.help =  {
    name:"afficherfiche",
    aliases:[]
}