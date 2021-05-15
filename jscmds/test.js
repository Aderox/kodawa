const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")

module.exports.run = async(bot, interaction, options) => {
    return sendMessage.main("hellow !");
}


module.exports.help =  {
    name:"test",
    aliases:[]
}