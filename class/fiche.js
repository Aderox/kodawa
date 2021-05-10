const Discord = require("discord.js");
const fs = require("fs");

function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
  };

module.exports =  {
    FicheC: class{
        constructor(bot,interaction,options,author){
            console.log("Création de la ficheRP de: " + author.id)
            this.bot = bot
            this.interaction = interaction
            this.id = author.id
        }

        async writeJSON(bot,author,options,otherData,imagesPATH){
            return new Promise (async (resolve,reject) => {

            let nom = options[0].value;
            let prenom = options[1].value;
            let age = options[2].value;
            let taille = options[3].value;
            let poids = options[4].value;
            let autre = options[5].value;
            let pseudo = options[6].value;
            let tailleIG = options[7].value;
            let poidsIG = options[8].value;
            let autreIG = options[9].value;
            let race = options[10].value;
            let classe = options[11].value;
            let faction = options[12].value;

            let caraIRL = otherData[0];
            let caraIG = otherData[1];
            let story = otherData[2];
            let armes = otherData[3];
            let special = otherData[4];

            let imageIRL = imagesPATH[0];
            let imageIG = imagesPATH[1];

            let JSONDATA = {
                "id":author.id,
                "locked":false,
                "nom":nom,
                "prenom":prenom,
                "age":age,
                "taille":taille,
                "poids":poids,
                "autre":autre,
                "caractere":caraIRL.join(','),
                "caractereIG":caraIG.join(','),
                "histoire":story.join(','),
                "pseudo":pseudo,
                "tailleIG":tailleIG,
                "poidsIG":poidsIG,
                "autreIG":autreIG,
                "race":race,
                "classe":classe,
                "faction":faction,
                "armes":armes.join(','),
                "capacite_special":special.join(','),
                "imagesIRL":imageIRL,
                "imagesIG":imageIG,
                "pouvoirs": [{},{}],
                "inventaire": []
            
            } 


            fs.writeFile("./game/fiches/"+author.id+".json", JSON.stringify(JSONDATA, null, 4), function(err) {
                if (err) {
                  console.error(err);
                  reject(err)
                }
                else {
                  resolve("OK")
                }
              });
        })
        }
        async readDir(author){
            /*
            *   1-Verifier si le fichier existe, sinon return None
            *   2-Lire le fichier et convertir les données en JSON
            *   3-Mettre les donées dans la classe
            */
            
            
            /*
            name,firstname,age,height,weight,other,username,ig_height,ig_weight,ig_other,ig_race,ig_class,ig_faction

            this.name = name
            this.firstname = firstname
            this.age = age
            this.height = height
            this.weight = weight
            this.other = other
            this.username = username
            this.ig_height = ig_height
            this.ig_weight = ig_weight
            this.ig_other = ig_other
            this.ig_race = ig_race
            this.ig_class = ig_class
            this.ig_faction = ig_faction
            */


            /**
             * 0 Error
             * 1 Ok !
             * 2 Already existing
             */

            //1
            return new Promise(async (resolve,reject) => {
                fs.readdir("./game/fiches", async (err,files) => {
                    if(err) {console.error(err);reject(0)}
                    if(files.length === 0){
                        console.log("aucune fiches")
                        resolve('OK')
                    }
                    else{
                        files.forEach( async file => {
                            if(file.includes(author.id)){
                                console.log("fichier trouver !")
                                resolve('FILE_ALREADY_EXISTING')
                                }
                        });
                    }
                    resolve(2)
                })
            })
        }

        async askInfo(bot,author,info){
            return new Promise(async (resolve,reject) => {

            let INFO = []
            let DMchan = await author.createDM()
            await DMchan.send(info)

            const filter = (msg, user) => {
                if(msg.author.bot) return false;
                if(msg.author.id != author.id){return false}
                return true;
            };

            let msgCollector = DMchan.createMessageCollector(filter);
            msgCollector.on('collect', async (msgCollected) => {
                if(msgCollected.content === 'fin'){
                    if(INFO.length === 0){
                        await DMchan.send("Veuillez remplir ce champ.")
                    }else{
                        await DMchan.send("Informations reçut.")
                        msgCollector.stop();
                        resolve(INFO)
                    }
                }else{
                    INFO.push(msgCollected.content);
                }
            });
        })
        }

        async askConfimation(author){
            return new Promise(async (resolve,reject) => {
            console.log("truc appelé !");
            /**
             * 0 Error
             * 1 File already existing. Asking confirmation
             * 2 Ok !
             */
            let DMchan = await author.createDM()
            await DMchan.send("Vous avez déjà une fiche. Si vous continuez elle sera supprimée !. Pour continuer écrivez \"oui\".")

            const filter = (msg, user) => {
                if(msg.author.bot) return false;
                if(msg.author.id != author.id){return false}
                return true;
            };

            let msgCollector = DMchan.createMessageCollector(filter,);
            msgCollector.on('collect', async (msgCollected) => {
                if(msgCollected.content === 'oui'){
                    msgCollector.stop();
                    DMchan.send("Supression...")
                    resolve('CONFIRMED')
                }else{
                    DMchan.send("Annulation...")
                    msgCollector.stop();
                    resolve('NOPE')
                }
            });

            })
        }

        async askImage(bot,author,info){
            return new Promise(async (resolve,reject) => {
            let DMchan = await author.createDM()
            await DMchan.send(info)

            const filter = (msg, user) => {
                if(msg.author.bot) return false;
                if(msg.author.id != author.id){return false}
                return true;
            };

            //TODO MULTIPLE IMAGES
            let msgCollector = DMchan.createMessageCollector(filter);
            msgCollector.on('collect', async (msgCollected) => {
                if(isValidURL(msgCollected.content)){
                    console.log("C'est une URL")
                    msgCollector.stop();
                    resolve(msgCollected.content)
                }
                else if(msgCollected.attachments.size != 0 && msgCollected.attachments.first().size > 0){
                    console.log("c'est une image upload")
                    msgCollector.stop()
                    resolve(msgCollected.attachments.first().url)
                }else{
                    console.log("NADA  !")
                    await DMchan.send("Ce n'est ni un lien ni une image !")
                }
            });
        })
        }

        async readJSON(author){
            return new Promise(async (resolve,reject) => {
                fs.readFile('./game/fiches/'+author.id+'.json',async (err,dataBrut) => {
                    let data = JSON.parse(dataBrut.toString());
                    //A FINIR + POUVOIR
                })
            })
        }
        
    },

    main: async function (bot,interaction,option){

        let authorID = interaction.member.user.id;
        let author = await bot.users.fetch(authorID);

        let fiche = new this.FicheC(bot,interaction,option,author);
        
        let readed = await fiche.readDir(author);
        if(readed === 'FILE_ALREADY_EXISTING'){
            console.log("on demande la confirmation: ")
            let confirmation = await fiche.askConfimation(author);
            console.log("confirmation: " + confirmation);
            if(confirmation === 'NOPE'){
                console.log("ON ANNULE ! c'est la fin")
                return;
            }
        }

        let caraIRL = await fiche.askInfo(bot, author, "Caractère du personnage IRL (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        let caraIG = await fiche.askInfo(bot, author, "Caractère du personnage IG (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        let histoire = await fiche.askInfo(bot, author, "Histoire du personnage (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        let armes = await fiche.askInfo(bot, author, "Armes du personnage (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        let special = await fiche.askInfo(bot, author, "Capacité spécial du personnage (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        
        //TODO CREATE SPECIAL WITH "/" CMD


        let imageIRL = await fiche.askImage(bot,author, "Lien ou image du personnage IRL")
        let imageIG = await fiche.askImage(bot,author, "Lien ou image du personnage IG")

        let otherData = [caraIRL,caraIG,histoire,armes,special]
        let images = [imageIRL,imageIG]

        await fiche.writeJSON(bot,author,option,otherData,images)
        
    }
}
