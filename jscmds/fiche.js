const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js")
const Fiche = require("../class/fiche.js")

module.exports.run = async(bot, interaction, options) => {
    console.log(interaction);
    console.log("\n\n ===OPTIONS===");
    console.log(options)
    console.log("\n\n");
    console.log(options[0].options);

    if(options[0].name == "afficher"){
        Fiche.afficherFiche(bot,interaction,options[0].options)
        return sendMessage.main("Affichage de votre fiche...");
    }
    else if(options[0].name == "creer"){
        Fiche.main(bot,interaction,options[0].options);
        return sendMessage.main("Création de votre fiche...");
    }
    else if(options[0].name == "ajouterpouvoir"){
        Fiche.addPower(bot,interaction,options[0].options);
        return sendMessage.main("Création de votre pouvoir");
    }
    else if(options[0].name  == "ajouterspecial"){
        Fiche.addSpecial(bot,interaction,options[0].options);
        return sendMessage.main("Création de votre capacité spécial");
    }
    
    //return sendMessage.main("WIP");
}


module.exports.help =  {
    name:"fiche",
    aliases:[]
}