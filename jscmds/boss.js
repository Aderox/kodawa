const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")
const Boss = require("../class/boss.js")

module.exports.run = async(bot, interaction, options) => {
    console.log(interaction);
    console.log("\n\n ===OPTIONS===");
    console.log(options)
    console.log("\n\n");
    console.log(options[0].options);

    if(options[0].name == "afficher"){
        Boss.listeBoss(bot,interaction,options[0].options);
        return sendMessage.main("List des boss: ");
    }
    else if(options[0].name == "creer"){
        Boss.creerBoss(bot,interaction,options[0].options);
        return sendMessage.main("Création du boss: " + options[0].options[0].value);
    }
    else if(options[0].name == "ajouterattaque"){
        Boss.ajouterAttaque(bot,interaction,options[0].options);
        return sendMessage.main("Ajoute une attaque au boss");
    }
    
    
    //return sendMessage.main("WIP");
}


module.exports.help =  {
    name:"boss",
    aliases:[]
}