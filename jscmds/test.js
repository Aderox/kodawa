const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")

module.exports.run = async(bot, message, args) => {
    return sendMessage.main("Une commande de test");
}

module.exports.help =  {
    name:"test",
    aliases:[]
}