const Discord = require("discord.js");
const fs = require("fs");
const Player = require("./player.js");
const Mob = require("./mob.js");
const Boss = require("./boss.js");

module.exports = {
    Combat: class{
        /**
         * La class combat permet de gérer tout les combats entre deux équipes. Elle nécessite une fiche joueur, et instancie un objet de la class joueur (avec un json dans ../game/players/).
         * Elle nécessite aussi une fiche de boss 
         * @param {DiscordClient} bot - Le client du bot 
         * @param {DiscordInteraction} interaction -L'interaction
         * @param {DiscordOptions} options - Les options de l'interaction
         * @param {DiscordAuthor} author - Le combatant qui à fait la commande
         * @param {DiscordChannel} channel  - Le channel du combat
         */

        constructor(bot, interaction, options, author, channel, fightmsg){
            this.bot = bot;
            this.interaction = interaction;
            this.options = options;
            this.author = author;
            this.channel = channel;
            this.fightmsg = fightmsg;

            this.ally = [this.author.id];
            this.ennemy = [];
        }

        /**
         * Permet d'instancier la class Player (basé sur la fiche + info de base)
         * Cette class va être fortement modifiée (effet/dêgat/etc)
         * TODO: listener sur la vie du joueur (ez dans takeDamage)
         * @param {DiscordClient} bot -Le client du bot 
         * @param {DiscordInteraction} interaction -L'interaction
         * @param {DiscordOptions} options -Les options de l'interaction
         * @param {String} id -L'id du joueur
         */

        async createPlayer(id){
            return new Promise(async (resolve,reject) => {
                let player = new Player.Player(this.bot, this.interaction, this.options, id);
                resolve(player);
            });
        } 

        /**
         * Permet d'instancier un objet de la class boss
         * @param {DiscordClient} bot -Le client du bot 
         * @param {DiscordInteraction} interaction -L'interaction
         * @param {DiscordOptions} options -Les options de l'interaction
         * @param {String} bossID - L'id du boss 
         */
        async createBoss(bot, interaction, options, bossID){
            return new Promise(async (resolve,reject) => {
                let boss = new Boss.Boss(bot, interaction, options);
                boss.setId(bossID)
                resolve(boss);
            });
        }

        /**
         * Instancie un objet de la class mob
         * @param {DiscordClient} bot -Le client du bot 
         * @param {DiscordInteraction} interaction -L'interaction
         * @param {DiscordOptions} options -Les options de l'interaction
         * @param {*} mobId - L'id du mob
         * @returns 
         */
        async createMob(bot, interaction, options, mobId){
            return new Promise(async (resolve,reject) => {
                let mob = new Mob.Mob('Mob',bot, interaction, options);
                mob.setId(mobId)
                resolve(mob);
            });
        }

        /***********************************************************/
        /**
         * Sert à récupérer les mobs du channel (en fonction de leur type)
         */
        async fetchChannelMob(){
        }

        /*******************************************************/
        async editMessage(){
            let embedFiche = new Discord.MessageEmbed()
            .setColor(0x9867C5)
            .setAuthor('Combat de '+this.author.username,this.author.displayAvatarURL())
            .setTitle(`Tour de ${undefined}`)
            .setDescription(`Vous vous battez contre ${undefined}\n⚔️ - Attaque basique\n1️⃣ - Pouvoir 1\n2️⃣ - Pouvoir 2\n❗ - Capacité spécial\n🏳️ - Fuir`)
            await this.fightmsg.edit(embedFiche);
            await this.writeReaction();
        }
        async writeReaction(){
            await this.fightmsg.reactions.removeAll();
            let reactions = ['⚔️','1️⃣','2️⃣','❗','🏳️'];
            for(let i in reactions){
                await this.fightmsg.react(reactions[i])
            }
        }

        async addAlly(){
            //TODO PUSH ALL GROUP MEMBER
            //this.ally.push()
        }

        async awaitReaction(){
            const filter = (reaction, user) => {
                if(msg.author.bot) return false;
                if(msg.author.id){return false}
                return true;
            };

            for(let i in this.ally){
                console.log("on attend la reaction de " + this.ally[i])
            }
        }
        /*******************************************************/

        /**
         * 
         * @param {Player || Boss || Mob} object 
         * @returns 
         */
        async getHealth(object){
            return new Promise(async (resolve,reject) => {
                try{
                    let health = await object.getHealth();
                    resolve(health)
                }catch(e){
                    console.error(e)
                    reject(e)
                }
            });
        }


        /**
         * Fait prendre au joueurs des dégats
         * @param {String} id - L'id du joueur 
         * @param {Number} damage - Les dégats qu'il prend
         * @returns {Promise}
         */

        async takeDamage(object,damage){
            return new Promise(async (resolve,reject) => {
                try{
                    object.takeDamage(damage);
                    resolve('ok')
                }catch(e){
                    console.error(e)
                    reject(e)
                }
            });
        }

        async attaque(object){
            return new Promise(async (resolve,reject) => {
                await object.attack()
            });
        }

        async readInfo(id){
            return new Promise(async (resolve,reject) => {
            });
        }

        async writeInfo(id){
            return new Promise(async (resolve,reject) => {
            });
        }
    },

    main: async function(bot, interaction, options){
        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const guild = await bot.guilds.fetch(guildID);
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

        console.log("men");
        console.log(options);





        let embedFiche = new Discord.MessageEmbed()
        .setColor(0x9867C5)
        .setAuthor('Combat de '+author.username,author.displayAvatarURL())
        .setDescription(`⚔️ - Attaque basique\n1️⃣ - Pouvoir 1\n2️⃣ - Pouvoir 2\n❗ - Capacité spécial\n🏳️ - Fuir`)
        let fightmsg = await channel.send(embedFiche)
        
        let combat = new this.Combat(bot,interaction,options,author,channel,fightmsg)

        await combat.editMessage();
        let player = await combat.createPlayer(bot, interaction, options, authorID)
        let mob = await combat.createMob(bot, interaction, options, '123')

        await combat.getHealth(player)
        await combat.getHealth(mob)
    },

    PlayerVSPlayer: async function(bot, interaction, options){
        console.log("DUEL !");

        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const guild = await bot.guilds.fetch(guildID);
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

        const ennemy = await bot.users.fetch(options[0].value);
                
        console.log(ennemy)

        return;


    },
    PlayerVSMob: async function(bot, interaction, options){
        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const guild = await bot.guilds.fetch(guildID);
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

    },
    PlayerVSBoss: async function(bot, interaction, options){
        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const guild = await bot.guilds.fetch(guildID);
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

    },

    FindBossInArea: async function(bot, interaction, options){
        return new Promise(async (resolve,reject) => {
            //TODO
        });
    }
}