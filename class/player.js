const Discord = require("discord.js");
const fs = require("fs");
const Fiche = require('./fiche.js');
const Groupe = require('./groupe.js');

module.exports =  {
    Player: class{

        /**
         * 
         * @param {Number} health 
         * @param {Array<JSON>} pouvoirs 
         * @param {JSON} capacite_special
         * @param {String} effet 
         */


        constructor(bot,interaction,options){
            this.bot = bot;
            this.interaction = interaction;
            this.options = options;
            this.path = "./game/players/";

            if(interaction){
            this.id = interaction.member.user.id;
            //console.log("Nouveau joueur: " + this.id);
            }else{//console.log("nouveau joueur anonyme !");
            }

            this.cooldown_power1 = 0;
            this.cooldown_power2 = 0;

        }

        /**
         * A utiliser si interaction et options sont définit
         * @returns 
         */
        async addInfo(){
            return new Promise(async (resolve,reject) => {
                //console.log("info player added");
                this.author = await this.bot.users.fetch(this.id);
                this.guildID = this.interaction.guild_id;
                this.channelID = this.interaction.channel_id;
                this.channel = await this.bot.channels.fetch(this.channelID);
                let infoFiche = await this.readInfoFiche();

                
                //let write = await this.writePlayer();
                //this.sendLog("wrtie reponsone: ")
                //console.log(write);

                await this.readPlayer();
                resolve()
            })
        }

        /**
         * A utiliser si interaction et options ne sont pas définit
         */
        async setInfo(authorID, guildID, channelID){
            return new Promise(async (resolve,reject) => {
                this.id = authorID;
                this.author = await this.bot.users.fetch(this.id);
                this.guildID = guildID;
                this.channelID = channelID;
                this.channel = await this.bot.channels.fetch(this.channelID);
                let infoFiche = await this.readInfoFiche();
                let write = await this.writePlayer();
                await this.readPlayer();
                resolve()

            });
        }


        async sayHello(msg){
            console.log("Bonjour je suis: " + this.author.username + " et " + msg)
        }

        
         ////////////////////////////////
         // Partie Lecture de la fiche //
         ////////////////////////////////

        async readInfoFiche(){
            return new Promise(async (resolve, reject) => {
                //Verifie si la fiche existe déjà:

                
                fs.readdir(this.path, async (err,files) => {
                    if(err) reject(err);

                    for(let i in files){
                        if(files[i].split('.')[0] == this.id){
                            console.log("existe déjà, on pass");
                            //EXISTE DEJA DONC ON VA READ PLAYER
                            await this.readPlayer();
                            resolve('ALREADY');
                            return;
                        }
                    }

                console.log("n'existe pas on va readFile");
                fs.readFile('./game/fiches/'+this.id+'.json',async (err,dataBrut) => {
                    if(dataBrut){
                        let data = JSON.parse(dataBrut.toString());
                        console.log("on créer this.DATA");
                        this.DATA = {
                        "group_id" : data.group_id,
                        "nom": data.nom,
                        "prenom":data.prenom,
                        "pseudo":data.pseudo,
                        "race":data.race,
                        "classe":data.classe,
                        "faction":data.faction,
                        "imagesIRL":data.imageIRL,
                        "ig_images" :data.ig_images,
                        "attaque_basique" : data.attaque_basique,
                        "capacite_special" :data.capacite_special,
                        "pouvoirs" : data.pouvoirs,
                        }
                        resolve(data);
                    }else{
                        console.log("pas de data dans le readFiche");
                        reject(err)
                    }
                })
            })
            });
        }


         ////////////////////////////////////////
         // Partie Ecriture de la fiche player //
         ////////////////////////////////////////

        async writePlayer(){
            return new Promise(async (resolve,reject) => {
                fs.writeFile(this.path+this.id+".json", JSON.stringify(this.DATA, null, 4), function(err) {
                    if (err) {
                      console.error(err);
                      reject(err)
                    }
                    else {
                      resolve("OK")
                    }
                  }); 
            });
        }


         ///////////////////////////////////////
         // Partie Lecture de la fiche player //
         ///////////////////////////////////////

         async readPlayer(){
             return new Promise(async (resolve,reject) => {
                fs.readFile('./game/players/'+this.id+'.json',async (err,dataBrut) => {
                    if(dataBrut){
                        let data = JSON.parse(dataBrut.toString());
                        this.DATA = {
                        "pv":data.pv,
                        "incombat":data.incombat,
                        "buff":data.buff,
                        "debuff":data.debuff,
                        "group_id" : data.group_id,
                        "nom": data.nom,
                        "prenom":data.prenom,
                        "pseudo":data.pseudo,
                        "race":data.race,
                        "classe":data.classe,
                        "faction":data.faction,
                        "imagesIRL":data.imageIRL,
                        "ig_images" :data.ig_images,
                        "attaque_basique" : data.attaque_basique,
                        "capacite_special" :data.capacite_special,
                        "pouvoirs" : data.pouvoirs,
                        }
                    
                        if(!this.DATA.pv) this.DATA.pv = 8000;
                        if(!this.DATA.incombat) {this.DATA.incombat = false; console.log("IN COMBAT UNDEF");}

                    resolve(data);
                    }else{
                        reject(err)
                    }
                })
             });
         }


         ////////////////////////////////
         //Partie utile pour les combat//
         ////////////////////////////////

         async getInCombat(){
             await this.readPlayer();
             return this.DATA.incombat;

         }

         async setInCombat(){
            await this.readPlayer();
            this.DATA.incombat = true;
            await this.writePlayer();
         }

         async stopCombat(){
            await this.readPlayer();
            this.DATA.incombat = false;
            await this.writePlayer();
         }


        async attack(attaqueCode){
            return new Promise(async (resolve,reject) => {

                if(attaqueCode == 'BASIC'){
                    //console.log("HURILA");
                    resolve(['OK',this.DATA.attaque_basique]);
                }else if(attaqueCode == 'POUVOIR_1'){
                    if(this.cooldown_power1 % 12 == 0){
                        resolve(['OK',this.DATA.pouvoirs[0]])
                    }else{
                        resolve(['COOLDOWN',undefined])
                    }

                }else if(attaqueCode == 'POUVOIR_2'){
                    if(this.cooldown_power2 % 12 == 0){
                        resolve(['OK',this.DATA.pouvoirs[1]])
                    }else{
                        resolve(['COOLDOWN',undefined])
                    }
                    
                }else if(attaqueCode == 'SPECIAL'){
                    
                    
                }else if(attaqueCode == 'FUIR'){
                    
                }
            });
        }

        async canAttack(attackCode){
            return new Promise(async (resolve,reject) => {
                this.DATA.pouvoirs.cooldown_tours
            });
        }

        addTour(){
            this.cooldown_power1+=1;
            this.cooldown_power2+=1;
        }
         


        setPV(pv){
            this.DATA.pv = pv;
        }

        takeDamage(damage){
            console.log("aieuh. damage: " + damage);
            this.DATA.pv -= parseInt(damage);
        }

        getPV(){
            return this.DATA.pv;
        }
         /////////////////////////////////
         //Partie utile pour les groupes//
         /////////////////////////////////
         
         async setGroupe(){

         }

         async getGroupe(){

         }

         async verifyGroupAdmin(){
             
         }

         ////////
         //Misc//
         ////////

         getUser(){
            return this.author;
         }
         
         setID(id){
            this.id = id;
         }
         
         getID(){
            return this.id;
         }

         async setAuthor(id){
            this.id = id;
            this.author = await this.bot.users.fetch(id);
         }

         sendLog(msg){
             let date = new Date();
             console.log(`[Kodama Logs: ${date.toLocaleDateString('fr-FR')} ${date.toLocaleDateString()}] ${msg}`);
         }

         

    },
    main: async function(bot,interaction,options){
        //TODO VERIFIER SI IL A UNE FICHE
        // ON PEUT METTRE CA DANS UN /LOGIN POUR PERMETTRE AUX JOUEURS DE SE CONNECTER
        let player = new this.Player(bot, interaction, options);
        await player.addInfo(); // terrible way to do it
        await player.verifyGameFile();
    },

    setup: async function(bot,interaction,options){

    },

    setGroup: async function(bot,interaction,options){

    }
}