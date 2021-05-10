const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")

module.exports.run = async(bot, interaction, options) => {
    let authorID = interaction.member.user.id;
    let author = await bot.users.fetch(authorID)


    console.log("INTERACTION AUTOR");
    console.log(interaction);
    console.log("FETCH AUTOR");
    console.log(author)
    
    let chan = await bot.channels.fetch(interaction.channel_id)
    console.log(chan.messages)

    sayMSGAfterDellay(author,options[0].value,options[1].value)
    return sendMessage.main("Une commande de test");
}
async function sayMSGAfterDellay(author,msg,delay){
    setTimeout( () => {
        console.log(msg);
        //author.send(msg)
    },delay)
}

module.exports.help =  {
    name:"test",
    aliases:[]
}