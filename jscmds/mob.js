const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")
const Mob = require("../class/mob.js")

module.exports.run = async(bot, interaction, options) => {

    if(options[0].name == "afficher"){
        Mob.listeBoss(bot,interaction,options[0].options);
        return sendMessage.main("List des mobs: ");
    }
    else if(options[0].name == "creer"){
        Mob.creerBoss(bot,interaction,options[0].options);
        return sendMessage.main("Création du mob: " + options[0].options[0].value);
    }
    else if(options[0].name == "ajouterattaque"){
        Mob.ajouterAttaque(bot,interaction,options[0].options);
        return sendMessage.main("Ajout d'une attaque au mob");
    }
    
    
    //return sendMessage.main("WIP");
}


module.exports.help =  {
    name:"mob",
    aliases:[]
}