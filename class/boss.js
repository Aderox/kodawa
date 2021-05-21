const Discord = require("discord.js");
const fs = require("fs");
const Mob = require('./mob.js');

module.exports =  {
    Boss: class extends Mob.Mob{
        constructor(...args){
            //this.name = name
            super(...args);
            this.PATH = './game/' + this.name.toLowerCase() + '/'
            console.log("Boss créer name: " + this.name);
        }

    async writeJSON(){
        return new Promise(async (resolve,reject) => {
            let options = this.options;

            let id = options[0].value;
            let nom = options[1].value;
            let taille = options[2].value;
            let pv = options[3].value;
            let type = options[4].value;
            let description = options[5].value;
            let salon = options[6].value;
            let lvl = options[7].value;

            //let special = otherData[4];

            let JSONDATA = {
                "id":id,
                "nom":nom,
                "taille":taille,
                "pv":pv,
                "type":type,
                "salon":salon,
                "description":description,
                "lvl":lvl,
                "imageURL":this.boss_image,
                "pouvoirs": []
            } 


            fs.writeFile(this.PATH+id+".json", JSON.stringify(JSONDATA, null, 4), function(err) {
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

    
    async readJSON(){
        return new Promise(async (resolve,reject) => {
            fs.readFile('./game/boss/'+this.id+'.json',async (err,dataBrut) => {
                    let data = JSON.parse(dataBrut.toString());
                    if(err) console.error(err)
                    //A FINIR + POUVOIR
                    if(data){
                    this.nom = data.nom;
                    this.taille = data.taille;
                    this.pv = data.pv;
                    this.type = data.type;
                    this.salon = data.salon;
                    this.description = data.description;
                    this.lvl = data.lvl;
                    this.imageURL = data.imageURL;
                    this.pouvoirs = data.pouvoirs;

                    this.nbpouvoirs = data.pouvoirs.length;
                    resolve('OK')
                    }else{
                    resolve('NOTHING')
                        }
                    })
                })
    }


    },


    main: async function(bot,interaction,options){
        console.log("On appel la main ?")
    },


    creerBoss: async function(bot,interaction,options){
        console.log("On va créer un boss !");

        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const guild = await bot.guilds.fetch(guildID);
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

        const guildUser = await guild.members.fetch(authorID);
        if(!guildUser.hasPermission('MANAGE_GUILD') || !guildUser.hasPermission('MANAGE_CHANNELS')){
            await channel.send("Vous n'avez pas les permissions requises !");
            return;
        }

        let boss = new this.Boss('Boss', bot,interaction,options,author,channel);
        await boss.setId(options[0].value);

        await boss.askBossImage("Image du boss");
        await boss.writeJSON();
        await author.send("Boss crée !");
    },

    ajouterAttaque: async function(bot,interaction,options){
        console.log("HELLO !");
        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const guild = await bot.guilds.fetch(guildID);
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

        const guildUser = await guild.members.fetch(authorID);
        if(!guildUser.hasPermission('MANAGE_GUILD') || !guildUser.hasPermission('MANAGE_CHANNELS')){
            await channel.send("Vous n'avez pas les permissions requises !");
            return;
        }

        let boss = new this.Boss('Boss',bot,interaction,options,author,channel);
        await boss.setId(options[0].value);

        await boss.writeNewAttaque();
        await author.send("Attaque ajoutée !")

    },

    listeBoss: async function(bot, interaction, options){
        console.log("On va lister les boss")
        console.log(options);
        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const guild = await bot.guilds.fetch(guildID);
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

        let boss = new this.Boss('Boss', bot,interaction,options,author,channel);
        await boss.setId(options[0].value);
        
        await boss.listAllBoss();
    },

    attirerBoss: async function(bot,interaction,options){
        console.log("On attire un boss !");
    },


    fight: async function(bot,interaction,options){

    }
}