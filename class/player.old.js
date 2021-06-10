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

            if(interaction){
            this.id = interaction.member.user.id;
            //console.log("Nouveau joueur: " + this.id);
            }else{//console.log("nouveau joueur anonyme !");
            }


        }

        async sayHello(msg){
            console.log("Bonjour je suis: " + this.author.username + " et " + msg)
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
                resolve()

            });
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

        async verifyInCombat(){
            return new Promise(async (resolve,reject) => {
                await this.readInfo();

            });
        }

        async verifyGameFile(){
            return new Promise(async (resolve,reject) => {
                fs.readdir(this.path, async (err,files) => {
                    if(err) {console.error(err);reject(0)}
                    if(files.length === 0){
                        //console.log("aucun players")
                        resolve('OK')
                    }
                    else{
                        for(let i in files){    
                            if(files[i].includes(this.author.id)){
                                //console.log("existe déjà !!");
                                resolve('PLAYER_ALREADY_EXISTING');
                                return;
                            }
                        }
                        
                    }
                    //console.log("n'existe pas ! on écrit !");
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
                console.log("on va lire les info de " + this.id);
                fs.readFile('./game/fiches/'+this.id+'.json',async (err,dataBrut) => {
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

                        this.pv = data.pv;
                        this.incombat = data.incombat;

                        this.iskindagay = data.iskindagay

                        if(!this.pv){
                            this.pv = 8000;
                        }
                        if(!this.incombat){
                            this.incombat = false;
                        }
                        if(!this.iskindagay){
                            this.iskindagay = "ouais, comme cesariou";
                        }

                        await this.updateData();
                    //console.log("lecture des infos");
                    resolve(data)
                    }else{
                        reject(err)
                    }
                })
            })
        }

        
        async updateData(){
            this.DATA = {
                "group_id":this.group_id,
                "pv": this.pv,
                "incombat": this.incombat,
                "iskindagay":this.iskindagay,
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

        
        async setInCombat(){
            await this.readInfo();
            this.incombat = true;
            await this.updateData();
            await this.updateJSON();
        }

        async stopCombat(){
            await this.readInfo();
            this.incombat = false;
            await this.updateData();
            await this.updateJSON();
        }

        async getData(){
            await this.readInfo();
            return this.DATA;
        }

        async getInCombat(){
            let data = await this.getData();
            console.log(data);
            console.log("getInCombat: " + data.incombat);
            return data.incombat;
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

        async updateJSON(){
            await this.updateData();
            return new Promise(async (resolve,reject) => {
            fs.writeFile(this.path+this.id+".json", JSON.stringify(this.DATA, null, 4), function(err) {
                if (err) {
                  console.error(err);
                  reject(err)
                }
                else {
                    //console.log("info updated !");
                  resolve("OK")
                }
              });
            });
        }

        async setGroup(group_id){
                await this.readInfo();
                this.group_id = group_id;
                //console.log("this.group: " + this.group_id);
                await this.updateData();
                await this.updateJSON();
                return;
        }


        async attack(attaqueCode){
            return new Promise(async (resolve,reject) => {
                //console.log("attaque via player class");
                //console.log("code: " + attaqueCode);
                if(attaqueCode == 'BASIC'){
                    //console.log("HURILA");
                    resolve('OK',this.attaque_basique);
                }else if(attaqueCode == 'POUVOIR_1'){
                    let canATtack = await canAttack(attaqueCode);

                }else if(attaqueCode == 'POUVOIR_2'){
                    
                }else if(attaqueCode == 'SPECIAL'){
                    
                    
                }else if(attaqueCode == 'FUIR'){
                    
                }
            });
        }

        async takeDamage(damage){
            return new Promise(async (resolve,reject) => {
                this.pv -= damage;
                resolve()
            });
        }

        /**
         * 
         * @param {string} pouvoir - Le pouvoir à verifier POUVOIR_1 POUVOIR_2 ou SPECIAL (pour pouvoir 1, 2 et spécial) 
         */
        async canAttack(pouvoir){
            return new Promise(async (resolve,reject) => {
                this.readInfo();
                if(pouvoir == 'POUVOIR_1'){
                    //console.log("on verifie pouvoir 1: ")
                    //console.log(this.pouvoirs[0]);
                }
                else if(pouvoir == 'POUVOIR_2'){
                    //console.log("on verifie pouvoir 2: ")
                    //console.log(this.pouvoirs[1]);
                }
                else if(pouvoir == 'SPECIAL'){
                    //console.log("on verifie pouvoir SPECIAL: ")
                    //console.log(this.capacite_special);
                }
            });
        }


        async getHealth(){
            return new Promise(async (resolve,reject) => {
                if(!this.pv){
                    //console.log("lecture des info");
                    this.readInfo();
                }
                resolve(this.pv)
            });
        }

        getID(){
            return this.id;
        }
        setID(id){
            this.id = id;
        }

        getUser(){
            return this.author;
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