const Discord = require("discord.js");
const fs = require("fs");
const fetch = require("node-fetch");
const { cpuUsage } = require("process");

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
            //let special = otherData[4];

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
                "ig_taille":tailleIG,
                "ig_poids":poidsIG,
                "ig_autre":autreIG,
                "race":race,
                "classe":classe,
                "faction":faction,
                "armes":armes.join(','),
                "imagesIRL":imageIRL,
                "ig_images":imageIG,
                "capacite_special":{},
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
            
            //name,firstname,age,height,weight,other,username,ig_height,ig_weight,ig_other,ig_race,ig_class,ig_faction
            

            /**
             * 0 Error
             * 1 Ok !
             * 2 Already existing
             */

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

        async askConfimation(author,confirmationMessage){
            return new Promise(async (resolve,reject) => {
            let DMchan = await author.createDM()
            await DMchan.send(confirmationMessage)

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
                    console.log("NADA !")
                    await DMchan.send("Ce n'est ni un lien ni une image !")
                }
            });
        })
        }

        async readJSON(bot,author){
            return new Promise(async (resolve,reject) => {
                fs.readFile('./game/fiches/'+author.id+'.json',async (err,dataBrut) => {
                    let data = JSON.parse(dataBrut.toString());
                    //A FINIR + POUVOIR
                    if(data){
                    this.name = data.nom;
                    this.firstname = data.prenom;
                    this.age = data.age;
                    this.taille = data.taille;
                    this.poids = data.poids;
                    this.autre = data.autre;
                    this.pseudo = data.pseudo;
                    this.ig_taille = data.ig_taille;
                    this.ig_poids = data.ig_poids;
                    this.ig_autre = data.ig_autre;
                    this.race = data.race;
                    this.class = data.class;
                    this.faction = data.faction;
                    this.capacite_special = data.capacite_special;
                    this.imagesIRL = data.imagesIRL;
                    this.ig_images = data.ig_images;
                    this.histoire = data.histoire;
                    this.caractere = data.caractere;
                    this.caractereIG = data.caractereIG;
                    this.armes = data.armes;
                    this.pouvoir1 = data.pouvoirs[0]
                    this.pouvoir2 = data.pouvoirs[1]
                    resolve('OK')
                    }else{
                        resolve('NOTHING')
                    }
                })
            })
        }

        async verifyPower(bot,author){
            return new Promise(async (resolve,reject) => {
                await this.readJSON(bot,author)
                /*
                * ERROR Erreur
                * OK Fine
                * FIRST_TAKEN 1er occupé
                * SECOND_TAKEN 2eme occupé
                * BOTH 1 ET 2 occupé
                 */
                if(this.pouvoir1.nom === undefined && this.pouvoir2.nom === undefined){
                    resolve(0)

                }
                else if(this.pouvoir1.nom === undefined){
                    resolve(0)
                }
                else if(this.pouvoir2.nom === undefined ){
                    //SECOND TAKEN ON RETURN 0
                    resolve(1)
                }
                else{
                    //RAS ON RETURN 0
                    let confirmation = await this.askConfimation(author,"Vous avez déjà deux pouvoirs. Si vous continuez vos pouvoirs seront supprimés !. Pour continuer écrivez \"oui\".")
                    if(confirmation === 'CONFIRMED'){
                        resolve('BOTH')
                    }
                }
            })
        }

        async writeJSONpower(bot,author,indicePouvoir,pouvoirData){
            return new Promise(async (resolve,reject) => {
                fs.readFile('./game/fiches/'+author.id+'.json',async (err,dataBrut) => {
                    let data = JSON.parse(dataBrut.toString());

                    if(indicePouvoir === 'BOTH'){
                        data.pouvoirs[1] = {}
                        indicePouvoir = 0
                    }

                    data.pouvoirs[indicePouvoir] = {
                        "nom": pouvoirData[0].value,
                        "degats": pouvoirData[1].value,
                        "cooldown_tours": pouvoirData[2].value,
                        "type": pouvoirData[3].value,
                        "descriptions": pouvoirData[4].value,
                        "penalite_degat_pourcent": pouvoirData[5].value,
                        "penalite_precision_pourcent": pouvoirData[6].value,
                        "nombre_de_tour_actif": pouvoirData[7].value,
                    }

                    fs.writeFile("./game/fiches/"+author.id+".json", JSON.stringify(data, null, 4), function(err) {
                        if (err) {
                        console.error(err);
                        reject(err)
                        }
                        else {
                        resolve("OK")
                        }
                    });
                })

            })
        }

        async verifySpecial(bot,author){
            return new Promise(async (resolve,reject) => {
                await this.readJSON(bot,author)
                /*
                * ERROR Erreur
                * OK Fine
                * FIRST_TAKEN 1er occupé
                * SECOND_TAKEN 2eme occupé
                * BOTH 1 ET 2 occupé
                 */
                if(this.capacite_special.nom === undefined){
                    resolve('OK')
                }
                else{
                    let confirmation = await this.askConfimation(author,"Vous avez déjà une capacité special. Si vous continuez votre capactié sera remplacé ! Pour continuer écrivez \"oui\".")
                    if(confirmation === 'CONFIRMED'){
                        resolve('OK')
                    }else{
                        resolve('NOPE')
                    }
                }
            })
        }

        async writeJSONspecial(bot,author,specialC,specialData){
            return new Promise(async (resolve,reject) => {
                fs.readFile('./game/fiches/'+author.id+'.json',async (err,dataBrut) => {
                    let data = JSON.parse(dataBrut.toString());

                    data.capacite_special = {
                        "nom": specialData[0].value,
                        "degats": specialData[1].value,
                        "type": specialData[2].value,
                        "descriptions": specialData[3].value,
                        "effet_secondaire": specialData[4].value,
                        "penalite_degat_pourcent": specialData[5].value,
                        "penalite_precision_pourcent": specialData[6].value,
                        "nombre_de_tour_actif": specialData[7].value,
                    }

                    fs.writeFile("./game/fiches/"+author.id+".json", JSON.stringify(data, null, 4), function(err) {
                        if (err) {
                        console.error(err);
                        reject(err)
                        }
                        else {
                        resolve("OK")
                        }
                    });
                })

            })
        }

        async getLVL(author,guildID){
                return new Promise(async (resolve, reject) => {
                    const MEE6API = "https://mee6.xyz/api/plugins/levels/leaderboard/"
                    let lvl = -1
                    let userID = author.id;
                    try{
                        let jsonReponse = await fetch(MEE6API+guildID , {method: "GET"})
                        jsonReponse = await jsonReponse.json();
                        let players = await jsonReponse.players
                        players.forEach(player => {
                            if(player.id == userID){
                                lvl = player.level
                            }
                        });
                        this.lvl = lvl;
                        resolve(lvl);
                }catch(e){
                    reject(e)
                }
                })
        }

        async afficherFiche(bot,author,guildID,channel){
            return new Promise (async (resolve,reject) => {
                await this.readJSON(bot, author);
                await this.getLVL(author,guildID);

                console.log("LVL: " + this.lvl)

                if(this.pouvoir1.nom === undefined ){
                    author.send("Vous n'avez pas de pouvoir ! faite \"/ajouterpouvoir\" pour ajouter vos pouvoirs avant de faire cette commande !")
                    resolve('NO_POWER')
                    return;
                }
                else if(this.pouvoir2.nom === undefined){
                    author.send("Vous n'avez qu'un pouvoir ! faite \"/ajouterpouvoir\" pour ajouter vos pouvoirs avant de faire cette commande !")
                    resolve('NO_POWER')
                    return;
                }
                else if(this.capacite_special.nom === undefined){
                    author.send("Vous n'avez pas de capacité spécial ! faite \"/ajouterspecial\" pour ajouter votre capactié spécial avant de faire cette commande !")
                    resolve('NO_SPECIAL')
                    return;
                }

                    let embedFiche = new Discord.MessageEmbed()
                    .setColor(0x9867C5)
                    .setAuthor(author.username + '     **Image IRL: **',author.displayAvatarURL())
                    .setTitle(`Fiche RP de ${this.firstname} ${this.name}`)
                    .setDescription(`Pseudo in-game: ${this.pseudo}. Niveau in-game: ${this.lvl}.`)
                    .addFields(
                        {name: `Informations physique IRL:`,value: `Âge: ${this.age} ans\nTaille: ${this.taille} cm\nPoids: ${this.poids} kg\nAutre Info: ${this.autre}.`},
                        {name:'\u200B',value:`\u200B`,inline:false},
                        {name: `Informations physique InGame:   `, value: `Taille: ${this.ig_taille} cm\nPoids: ${this.ig_poids} kg\nAutre Info: ${this.ig_autre}`, inline: true},
                        {name: 'Info du joueur:', value: `Race: ${this.race}\nClasse: ${this.class}\nFaction: ${this.faction.charAt(0).toUpperCase() + this.faction.slice(1)}`, inline: true }
            
                    )
            
                    embedFiche.addField('\u200B',`\u200B`,false)
                    embedFiche.addField("Armes: ", this.armes.substring(0,1024))

                    embedFiche.addField('Premier pouvoir',`Nom du pouvoir: ${this.pouvoir1.nom}\nDescriptions: ${this.pouvoir1.descriptions}\nDégats: ${this.pouvoir1.degats}\nCooldown: ${this.pouvoir1.cooldown_tours} tours\nType: ${this.pouvoir1.type}\nPénalité de dégat: ${this.pouvoir1.penalite_degat_pourcent}%\nPénalité de précision: ${this.pouvoir1.penalite_precision_pourcent}%\nNombre de tours actif: ${this.pouvoir1.nombre_de_tour_actif} tours`,true)

                    embedFiche.addField('Deuxième pouvoir',`Nom du pouvoir: ${this.pouvoir2.nom}\nDescriptions: ${this.pouvoir2.descriptions}\nDégats: ${this.pouvoir2.degats}\nCooldown: ${this.pouvoir2.cooldown_tours} tours\nType: ${this.pouvoir2.type}\nPénalité de dégat: ${this.pouvoir2.penalite_degat_pourcent}%\nPénalité de précision: ${this.pouvoir2.penalite_precision_pourcent}%\nNombre de tours actif: ${this.pouvoir2.nombre_de_tour_actif} tours`,true)

                    embedFiche.addField('Capacité Special',`Nom de la capacité: ${this.capacite_special.nom}\nDescriptions: ${this.capacite_special.descriptions}\nDégats: ${this.capacite_special.degats}\nType: ${this.capacite_special.type}\nContre coup: ${this.capacite_special.effet_secondaire}\nPénalité de dégat: ${this.capacite_special.penalite_degat_pourcent}%\nPénalité de précision: ${this.capacite_special.penalite_precision_pourcent}%\nNombre de tours actif: ${this.capacite_special.nombre_de_tour_actif} tours`,true)

                    embedFiche.addField('\u200B',`\u200B`,false)
                    embedFiche.addField('Image IG:','\u200B',false)
            
                    embedFiche.setThumbnail(this.imagesIRL)
                    embedFiche.setImage(this.ig_images)
                    
                    console.log("CARACTERE :")
                    console.log(this.caractere)
                    console.log("HAA")

                    let ALLhistoire = this.histoire
                    let histoire = []
        
                    let ALLcaraIRL = this.caractere
                    let caraIRL = []

        
                    let ALLcaraIG = this.caractereIG
                    let caraIG = []
        
                    for(let i=0;i< Math.trunc(ALLhistoire.length/2048)+1; i++){
                        histoire.push(ALLhistoire.substring(i * 2048, (i+1) * 2048))
                    }
        
                    for(let i=0;i < Math.trunc(ALLcaraIRL.length/2048)+1; i++){
                        caraIRL.push(ALLcaraIRL.substring(i * 2048, (i+1) * 2048))
                    }
        
                    for(let i=0;i< Math.trunc(ALLcaraIG.length/2048)+1; i++){
                        caraIG.push(ALLcaraIG.substring(i * 2048, (i+1) * 2048))
                    }
        
                    
                    await channel.send(embedFiche)
                        let tempEmbed;
                        let n=0;
                        n=0
                        caraIRL.forEach(async e => {
                            n+=1
                            tempEmbed = new Discord.MessageEmbed()
                            .setColor(0x9867C5)
                            .setTitle(`**Caractère IRL, Partie ` + n + '**')
                            .setDescription(e)
                            await channel.send(tempEmbed)
                        });
            
                        n=0
                        caraIG.forEach(async e => {
                            n+=1
                            tempEmbed = new Discord.MessageEmbed()
                            .setColor(0x9867C5)
                            .setTitle(`Caractère IG, Partie ` + n)
                            .setDescription(e)
                            await channel.send(tempEmbed)
                        });
                        n=0
                        histoire.forEach(async e => {
                            n+=1
                            tempEmbed = new Discord.MessageEmbed()
                            .setColor(0x9867C5)
                            .setTitle(`Histoire, Partie ` + n)
                            .setDescription(e)
                            await channel.send(tempEmbed)
                        });

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
            let confirmation = await fiche.askConfimation(author,"Vous avez déjà une fiche. Si vous continuez elle sera supprimée !. Pour continuer écrivez \"oui\".");
            console.log("confirmation: " + confirmation);
            if(confirmation === 'NOPE'){
                console.log("ON ANNULE ! c'est la fin. On va lire les donnée !")
                //TODO FICHE GET DATA !
                return;
            }
        }

        let caraIRL = await fiche.askInfo(bot, author, "Caractère du personnage IRL (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        let caraIG = await fiche.askInfo(bot, author, "Caractère du personnage IG (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        let histoire = await fiche.askInfo(bot, author, "Histoire du personnage (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        let armes = await fiche.askInfo(bot, author, "Armes du personnage (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        //let special = await fiche.askInfo(bot, author, "Capacité spécial du personnage (envoyez \"fin\" pour terminer, vous pouvez envoyer plusieurs message):");
        
        //TODO CREATE SPECIAL WITH "/" CMD


        let imageIRL = await fiche.askImage(bot,author, "Un lien ou une image du personnage IRL")
        let imageIG = await fiche.askImage(bot,author, "Un lien ou une image du personnage IG")

        let otherData = [caraIRL,caraIG,histoire,armes] //,special]
        let images = [imageIRL,imageIG]

        await fiche.writeJSON(bot,author,option,otherData,images)
        await author.send("Vous pouvez mainteant ajouter vos pouvoirs avec \"/ajouterpouvoir\" ")
        
    },

    addPower: async function (bot, interaction, option){
        let authorID = interaction.member.user.id;
        let author = await bot.users.fetch(authorID);

        let fiche = new this.FicheC(bot,interaction,option,author);

        let power = await fiche.verifyPower(bot,author)
        if(power === 'NOPE'){
            return
        }else{
            fiche.writeJSONpower(bot, author, power, option)
        }

    },

    addSpecial: async function (bot, interaction, option){
        let authorID = interaction.member.user.id;
        let author = await bot.users.fetch(authorID);

        let fiche = new this.FicheC(bot,interaction,option,author);

        let specialC = await fiche.verifySpecial(bot,author)
        if(specialC === 'NOPE'){
            return
        }else{
            fiche.writeJSONspecial(bot, author, specialC, option)
        }

    },

    afficherFiche: async function (bot, interaction, option){
        let authorID = interaction.member.user.id;
        let author = await bot.users.fetch(authorID);
        let guildID = interaction.guild_id;
        let channelID = interaction.channel_id;
        let channel = await bot.channels.fetch(channelID);

        let fiche = new this.FicheC(bot,interaction,option,author);
        await fiche.afficherFiche(bot, author, guildID,channel);
    }
}
