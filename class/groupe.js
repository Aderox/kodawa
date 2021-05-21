const Discord = require("discord.js");
const fs = require("fs");
const sendMessage = require("../modules/sendMessage.js");
const uuid = require("uuid");
const Player = require('./player.js');
const modifyInteraction = require('../modules/modifyInteractionMessage.js')


module.exports =  {
    Groupe: class{
        constructor(bot,interaction,options){
            console.log("Nouveau groupe !" );
            this.bot = bot;
            this.interaction = interaction;
            this.options = options;
            this.id = interaction.member.user.id;
            
            this.player = new Player.Player(this.bot,this.interaction,this.options)

        }

        async addInfo(){
            return new Promise(async (resolve,reject) => {
                await this.player.addInfo();
                this.author = await this.bot.users.fetch(this.id);
                this.guildID = this.interaction.guild_id;
                this.channelID = this.interaction.channel_id;
                this.channel = await this.bot.channels.fetch(this.channelID);
                resolve('FINE')
            })
        }

        async createGroup(){
            console.log("On va créer un joueur, et écrire l'uuid du groupe + créer me groupe")
            this.uuid = uuid.v4();
            console.log(this.uuid);

            this.DATA = {
                "nom":this.options[0].value,
                "chef":this.id,
                "members":[]
            }

            await this.player.readInfo();
            let isInGroup = await this.checkInGroup();
            console.log("is in group : " + isInGroup);
            if(!isInGroup){
                console.log("pas dans un groupe on update !");
                await this.player.setGroup(this.uuid)
                await this.writeGroup();
            }
            else{
                this.author.send("Vous êtes déjà dans un groupe")
            }
        }
        async checkInGroup(){
            return new Promise(async (resolve,reject) => {
                fs.readFile('./game/players/'+this.id+'.json',async (err,dataBrut) => {
                    if(err) console.error(err);
                    if(!dataBrut) return resolve('NO_DATA');
                    let data = JSON.parse(dataBrut.toString());
                    if(data.group_id){
                        console.log("checkingroup: déjà dans un groupe");
                        resolve(true);
                    }else{
                        console.log("checkingroup: pas dans un groupe");
                        resolve(false);
                    }

                });
            })
        }

        async checkIfGroupOwner(){
            return new Promise(async (resolve,reject) => {
                fs.readFile('./game/players/'+this.id+'.json',async (err,dataBrut) => {
                    if(err) console.error(err);
                    if(!dataBrut) return resolve('NO_DATA');
                    let data = JSON.parse(dataBrut.toString());
                    if(data.group_id){
                        let groupID = data.group_id;
                        fs.readFile('./game/group/'+groupID+'.json',async (err,dataBrut2) => {
                            let data2 = JSON.parse(dataBrut2.toString());
                            if(this.author.id == data2.chef){
                                resolve(true);
                            }else{
                                resolve(false)
                            }
                        })
                        resolve(true);
                    }else{
                        reject('NO_DATA');
                    }

                });
            })
        }
        async checkGroupPerm(){

        }
        
        async writeGroup(){
            return new Promise(async (resolve,reject) => {
                    fs.writeFile('./game/group/'+this.uuid+'.json', JSON.stringify(this.DATA, null, 4), function(err){
                        if(err) reject(err);
                        else{ resolve(); }
                    })
            });
        }

        async leaveGroup(){
                if(await this.checkIfGroupOwner()){
                    await modifyInteraction.main(this.bot, this.interaction, this.options, 'Vous ne pouvez pas quitter le groupe car vous en êtes le créateur.');
                    return;
                }else{
                    this.player.setGroup(false)
                }
        }

        async readGroup(){

        }

        async deleteGroup(){
        }
        
        getAuthor(){
            return this.author;
        }
    },

    creerGroupe: async function(bot, interaction, options){
        let groupe = new this.Groupe(bot, interaction, options);
        await groupe.addInfo();
        let inGroup = await groupe.checkInGroup();
        if(inGroup){
            await groupe.getAuthor().send('Vous êtes déjà dans un groupe !');
            return;
        }
        let newGroupeID = await groupe.createGroup();


    },
    GroupeAdd: async function(bot, interaction, options){
        let groupe = new this.Groupe(bot, interaction, options);
        await groupe.addInfo();
    },
    GroupeList: async function(bot, interaction, options){

    },
    GroupeRemove: async function(bot, interaction, options){

    },
    GroupeLeave: async function(bot, interaction, options){
        let groupe = new this.Groupe(bot, interaction, options);
        await groupe.addInfo();
        let inGroup = await groupe.checkInGroup();
        console.log("on check qu'il est dans un groupe: " + inGroup);
        if(!inGroup){
            console.log("pas in group");
            await modifyInteraction.main(bot, interaction, options, 'Vous n\'êtes pas dans un groupe !');
            return;
        }
        await groupe.leaveGroup();
    },
    GroupeDelete: async function(bot, interaction, options){

    }
}