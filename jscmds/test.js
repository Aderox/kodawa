const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")
const fetch = require('node-fetch');
const DiscordAPI = "https://discord.com/api/v9/";
const modifyInteraction = require('../modules/modifyInteractionMessage.js')

module.exports.run = async(bot, interaction, options) => {
    console.log(interaction);
    tropRelou(bot, interaction, options, "E.M.T.");
    return sendMessage.main("hello !");
}

async function tropRelou(bot, interaction, options, message){
    modifyInteraction.main(bot, interaction, options, message);
}

module.exports.help =  {
    name:"test",
    aliases:[]
}