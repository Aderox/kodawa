const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js");
const Combat = require("../class/combat.js");

module.exports.run = async(bot, interaction, options) => {
    if(options[0].name == "main"){
        Combat.main(bot, interaction, options[0].options);
        return sendMessage.main("W.I.P !");
    }
    else if(options[0].name == 'boss'){
        Combat.PlayerVSBoss(bot, interaction, options[0].options);
        return sendMessage.main("Combat contre un boss !");
    }
    else if(options[0].name == 'mob'){
        Combat.PlayerVSMob(bot, interaction, options[0].options);
        return sendMessage.main("Combat contre un autre mob !");
    }
    else if(options[0].name == 'joueur'){
        console.log("duel")
        Combat.PlayerVSPlayer(bot, interaction, options[0].options);
        return sendMessage.main("Combat contre un autre joueur !");
    }
}


module.exports.help =  {
    name:"combatre",
    aliases:[]
}