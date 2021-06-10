const Discord = require("discord.js");
const fs = require("fs");
const Player = require("./player.js");
const Mob = require("./mob.js");
const Boss = require("./boss.js");
const modifyInteraction = require('../modules/modifyInteractionMessage.js')

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
         * @param {string} fightmsg - Le msg du combat
         */

        constructor(bot, interaction, options, author, channel, fightmsg){
            this.bot = bot;
            this.interaction = interaction;
            this.options = options;
            this.author = author;
            this.channel = channel;
            this.fightmsg = fightmsg;

            this.ally = [];
            this.ennemy = [];

            this.tour = 0;
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
            
            
            console.log(this.getEnnemy());
            let ennemie = "";
            for(let i in this.getEnnemy()){
                console.log("\n ENNEMIE: ");
                console.log(this.getEnnemy(i).constructor[0]);
                console.log("fin");
                //console.log(i.getUser());
                ennemie += "WIP \n"
            }

            embedFiche.addField('Ennemie: ', ennemie, false)
            await this.fightmsg.edit(embedFiche);
            //await this.writeReaction();
        }
        async writeReaction(){
            await this.fightmsg.reactions.removeAll();
            let reactions = ['⚔️','1️⃣','2️⃣','❗','🏳️'];
            for(let i in reactions){
                await this.fightmsg.react(reactions[i])
            }
        }

        /**
         * Permet d'ajouter un ennemi au combat
         * @param {string} ennemyID - l'id de l'ennemi
         */
        addEnnemy(ennemyID){
            this.ennemy.push(ennemyID);
        }



        addPlayer(player){

        }

        addAlly(allyID){
            this.ally.push(allyID)
        }
        

        getAlly(){
            return this.ally;
        }

        getEnnemy(){
            return this.ennemy;
        }

        recursivite(){
            if(this.getTour < 6){
                console.log("RECURSIVITE");
                this.tour += 1;
                return this.recursivite()
            }else{
                console.log("FIN");
            }
        }

        async awaitCible(){
            return new Promise(async (resolve,reject) => {
                const filter = (reaction, user) => user.id === this.getAttaquant().getID();
                let msgCible = await this.fightmsg.channel.send("Quel cible visez vous ?")
                this.fightmsg.channel.awaitMessages(filter, {max: 1}).then(async msg => {
                    console.log("Cible séléctioné !: " + msg.first().content);
                })
            });
        }

        async awaitReaction(){
            return new Promise(async (resolve,reject) => {
                await this.editMessage();

                this.addTour();
                let attaquant = this.getAttaquant();
                const filter = (reaction, user) => user.id === attaquant.getID() && (reaction.emoji.name === '⚔️' || reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣' || reaction.emoji.name === '❗' || reaction.emoji.name === '🏳️');
    
                console.log("on attend la réaction de: " + attaquant.getID());

                await this.awaitCible();
                this.fightmsg.awaitReactions(filter,{max:1}).then(async collected => {
                    console.log("collected ! ");
                    if(collected.first().emoji.name == '⚔️'){
                        console.log("attaque normal");
                        await this.attack(attaquant, 'BASIC');
                    }
                    else if(collected.first().emoji.name == '1️⃣'){
                        console.log("attaque 1");
                    }
                    else if(collected.first().emoji.name == '2️⃣'){
                        console.log("attaque 2");
                    }
                    else if(collected.first().emoji.name == '❗'){
                        console.log("spécial");
                    }
                    else if(collected.first().emoji.name == '🏳️'){
                        console.log("BACKUP BACKUP");
                        //TODO
                    }

                }).catch(e=>console.error(e))
            })
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

        async attack(object, attackCode, cible){
            return new Promise(async (resolve,reject) => {
                let attackCodeR = await object.attack(attackCode);
                console.log("attackCodeR: " + attackCodeR);
                resolve(attackCodeR);
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

        getTour(){
            return this.tour;
        }

        addTour(){
            if(this.tour > this.ally.length + this.ennemy.length){
                console.log("on reset l'incrémenteur");
                this.tour = 1;
            }else{
                this.tour += 1;
            }
        }

        getID(){
            if(this.tour % 2 == 0){
                console.log("attaque de ally: " + this.tour);

            }else{
                console.log("attaque ennemi: " + this.tour );
            }
        }

        getAttaquant(){
            console.log(this.ally);
            console.log(this.tour - 1);
            return this.ally[this.tour - 1];
        }

        async statut(){
            console.log("=========\nSATUT DU COMBAT: ");
            console.log("list des alliés: ");
            console.log(this.ally);
            console.log("=======\nlist des ennemy");
            console.log(this.ennemy);

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
        .setDescription(`⚔️ - Attaque basique\n1️⃣ - Pouvoir 1\n2️⃣ - Pouvoir 2\n❗ - Capacité spécial\n🏳️ - Fuir`);
        let fightmsg = await channel.send(embedFiche)
        
        let combat = new this.Combat(bot,interaction,options,author,channel,fightmsg)

        await combat.editMessage();
        let player = await combat.createPlayer(bot, interaction, options, authorID)
        let mob = await combat.createMob(bot, interaction, options, '123')

        await combat.getHealth(player)
        await combat.getHealth(mob)

    },

    /**
     * Methode appelé en cas de Combat PVP
     * @param {*} bot 
     * @param {*} interaction 
     * @param {*} options 
     * @returns 
     */
    PlayerVSPlayer: async function(bot, interaction, options){
        console.log("DUEL !");

      
        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const guild = await bot.guilds.fetch(guildID);
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

        
        const ennemy = await bot.users.fetch(options[0].value);

        //TODO GET ALLY GROUP + ENNEMY GROUP

        let embedFiche = new Discord.MessageEmbed()
        .setColor(0x9867C5)
        .setAuthor('Combat de '+author.username + ' contre ' + ennemy.username,author.displayAvatarURL())
        .setDescription(`⚔️ - Attaque basique\n1️⃣ - Pouvoir 1\n2️⃣ - Pouvoir 2\n❗ - Capacité spécial\n🏳️ - Fuir`);
        
        if(ennemy.id == authorID){
            await modifyInteraction.main(bot, interaction, options, "Vous ne pouvez pas vous combattre vous même !");
            return;
        }
        else if(ennemy.bot){
            await modifyInteraction.main(bot, interaction, options, "Vous ne pouvez pas combattre un bot !");
            return;
        }

                
        await modifyInteraction.main(bot, interaction, options, "Bonne chance !");
        const msgCombat = await modifyInteraction.main(bot, interaction, options, embedFiche)

        const player1 = new Player.Player(bot, interaction, options);
        await player1.addInfo();
        await player1.readInfo();

        const player2 = new Player.Player(bot, undefined, undefined);
        await player2.setInfo(ennemy.id, guildID, channelID);
        await player2.readInfo();


        const combat = new this.Combat(bot, interaction, options, author, channel, msgCombat);
        combat.addAlly(player1);
        combat.addEnnemy(player2);

        console.log(`on get les PV des joueurs: j1: ${await combat.getHealth(combat.getAlly()[0])}  j2: ${await combat.getHealth(combat.getEnnemy()[0])}`);        
        
        await player1.direSalut();
        
        await modifyInteraction.main(bot, interaction, options, "Bonne chance !");
        await modifyInteraction.main(bot, interaction, options, embedFiche)

        //combat.recursivite();
        if(await combat.getHealth(player1) > 0 && await combat.getHealth(player1) > 0){
            console.log("on va attendre la récation");
            combat.writeReaction();
            combat.awaitReaction();
        }else{
            console.log("APPELEZ LES SECOURS IL Y A UN MORT !!!");
        }
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