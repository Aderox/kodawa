const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")
const creeFiche = require("../class/fiche.js")

module.exports.run = async(bot, interaction, options) => {

    creeFiche.main(bot,interaction,options);
    
    return sendMessage.main("Création de la fiche de " + options[0].value + " " + options[1].value);
}



module.exports.help =  {
    name:"creerfiche",
    aliases:[]
}