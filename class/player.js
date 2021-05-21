const Discord = require("discord.js");
const fs = require("fs");
const Fiche = require('./fiche.js');

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

            this.id = interaction.member.user.id;

            console.log("Nouveau joueur: " + this.id);

            this.health = 12
        }
        async addInfo(){
            return new Promise(async (resolve,reject) => {
                console.log("info player added");
                this.author = await this.bot.users.fetch(this.id);
                this.guildID = this.interaction.guild_id;
                this.channelID = this.interaction.channel_id;
                this.channel = await this.bot.channels.fetch(this.channelID);
                resolve()
            })
        }

        async verifyFiche(){
            return new Promise(async (resolve,reject) => {
            this.player = new Fiche.FicheC(this.bot,this.interaction,this.options,this.author);
            let infoRead = await this.player.readDir(this.author);
            this.channel.send("Info read: " + infoRead)
            if(infoRead != 'FICHE_ALREADY_EXISTING'){
                this.author.send("Vous n'avez pas encore de fiche. Faite \"/fiche creer\" pour créer une fiche.")
                resolve('FICHE_NOT_EXISTING')
            }else{
                resolve('OK')
            }
            });
        }

        async verifyGameFile(){
            return new Promise(async (resolve,reject) => {
                fs.readdir(this.path, async (err,files) => {
                    if(err) {console.error(err);reject(0)}
                    if(files.length === 0){
                        console.log("aucun players")
                        resolve('OK')
                    }
                    else{
                        for(let i in files){    
                            if(files[i].includes(this.author.id)){
                                console.log("existe déjà !!");
                                resolve('PLAYER_ALREADY_EXISTING');
                                return;
                            }
                        }
                        
                    }
                    console.log("n'existe pas ! on écrit !");
                    let verifyFiche = await this.verifyFiche();
                    if(verifyFiche === 'FICHE_NOT_EXISTING'){
                        return;
                    }
                    await this.readInfo();
                    await this.updateJSON();
                })
            })
        }
        async readInfo(){
            return new Promise(async (resolve,reject) => {
                fs.readFile('./game/fiches/'+this.author.id+'.json',async (err,dataBrut) => {
                    let data = JSON.parse(dataBrut.toString());
                    if(data){
                        
                        this.group_id = data.group_id;
                        this.nom=data.nom;
                        this.prenom=data.prenom;
                        this.pseudo=data.pseudo;
                        this.race=data.race;
                        this.classe=data.classe;
                        this.faction=data.faction;
                        this.imagesIRL=data.imageIRL;
                        this.ig_images=data.ig_images;
                        this.attaque_basique= data.attaque_basique;
                        this.capacite_special=data.capacite_special;
                        this.pouvoirs= data.pouvoirs;

                        await this.updateData();
                        console.log("DATA FROM PLAYER READ");
                        console.log(this.DATA);
                    resolve('OK')
                    }else{
                        reject(err)
                    }
                })
            })
        }

        async connect(){
            this.DATA.connected = true;
            await this.readInfo();
            await this.updateJSON();
        }
        async disconnect(){
            this.DATA.connected = false;
            await this.readInfo();
            await this.updateJSON();
        }

        async updateData(){
            this.DATA = {
                "group_id":this.group_id,
                "connected":0,
                "nom":this.nom,
                "prenom":this.prenom,
                "pseudo":this.pseudo,
                "race":this.race,
                "classe":this.classe,
                "faction":this.faction,
                "imagesIRL":this.imageIRL,
                "ig_images":this.ig_images,
                "attaque_basique": this.attaque_basique,
                "capacite_special":this.capacite_special,
                "pouvoirs": this.pouvoirs,
                "inventaire": []
            } 
        }

        async updateJSON(){
            await this.updateData();
            return new Promise(async (resolve,reject) => {
            fs.writeFile(this.path+this.author.id+".json", JSON.stringify(this.DATA, null, 4), function(err) {
                if (err) {
                  console.error(err);
                  reject(err)
                }
                else {
                    console.log("info updated !");
                  resolve("OK")
                }
              });
            });
        }

        async setGroup(group_id){
                await this.readInfo();
                this.group_id = group_id;
                console.log("this.group: " + this.group_id);
                await this.updateData();
                console.log("setGroup data:");
                console.log(this.DATA);
                await this.updateJSON();
                return;
        }



        async takeDamage(damage){
            return new Promise(async (resolve,reject) => {
                this.health -= damage;
                resolve()
            });
        }

        async getHealth(){
            return new Promise(async (resolve,reject) => {
                resolve(this.health)
            });
        }
    },
    main: async function(bot,interaction,options){
        // ON PEUT METTRE CA DANS UN /LOGIN POUR PERMETTRE AUX JOUEURS DE SE CONNECTER
        let player = new this.Player(bot,interaction, options);
        await player.addInfo(); // terrible way to do it
        await player.verifyGameFile();
    },

    setup: async function(bot,interaction,options){

    },

    setGroup: async function(bot,interaction,options){

    }
}