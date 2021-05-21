const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")
const fetch = require('node-fetch');
const DiscordAPI = "https://discord.com/api/v9/";

module.exports = {

main: async function (bot, interaction, options, message){  
    return new Promise(async (resolve,reject) => {


    let bodyEMT = JSON.stringify(sendMessage.main('EMT')); //useless like me

    fetch(DiscordAPI+`/webhooks/${bot.user.id}/${interaction.token}/messages/@original`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sendMessage.main('')) }).then(async res => {
        try{
        let response = await res.json();
        let chan = await bot.channels.fetch(response.channel_id);
        let msg =   await chan.messages.fetch(response.id);
        await msg.edit(message)
        
        }catch(e){
            console.error(e);
        }
    });
    });  
}
}
