const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js");
const Groupe = require("../class/groupe.js");

module.exports.run = async(bot, interaction, options) => {
    if(options[0].name == "creer"){
        Groupe.creerGroupe(bot, interaction, options[0].options);
        return sendMessage.main("W.I.P !");
    }
    else if(options[0].name == 'ajouter'){
        Groupe.GroupeAdd(bot, interaction, options[0].options);
        return sendMessage.main("Ajout d'un membre dans le groupe...");
    }
    else if(options[0].name == 'retirer'){
        Groupe.GroupeRemove(bot, interaction, options[0].options);
        return sendMessage.main("wip!");
    }
    else if(options[0].name == 'list'){
        Groupe.GroupeList(bot, interaction, options[0].options);
        return sendMessage.main("wip !");
    }
    else if(options[0].name == 'quitter'){
        Groupe.GroupeLeave(bot, interaction, options[0].options);
        return sendMessage.main("Veuillez patienter...");
    }
    else if(options[0].name == 'supprimer'){
        Groupe.GroupeDelete(bot, interaction, options[0].options);
        return sendMessage.main("wip");
    }
}


module.exports.help =  {
    name:"groupe",
    aliases:[]
}