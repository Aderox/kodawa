const Discord = require("discord.js");
const fs = require("fs");
const Player = require("./player.js");
const Mob = require("./mob.js");
const Boss = require("./boss.js");
const modifyInteraction = require('../modules/modifyInteractionMessage.js')

module.exports = {
    Combat: class{
        constructor(bot, interaction, options, author, channel, fighttype){
            this.bot = bot;
            this.interaction = interaction;
            this.options = options;
            this.author = author;
            this.channel = channel;
            this.fighttype = fighttype;

            this.ally = [];
            this.ennemy = [];

            this.turn = 0;

            this.canReact = true;
        }

        async sendMessage(){
            let embedFiche = new Discord.MessageEmbed()
            .setColor(0x9867C5)
            .setAuthor('Tour de '+this.author.username,this.author.displayAvatarURL())
            .setDescription(`⚔️ - Attaque basique\n1️⃣ - Pouvoir 1\n2️⃣ - Pouvoir 2\n❗ - Capacité spécial\n🏳️ - Fuir`);
            this.fightmsg = await this.channel.send(embedFiche)
        }

        async updateMessage(){
            return new Promise(async (resolve,reject) => {
                //modifyInteraction.main(this.bot, this.interaction, this.options, "Tour de " + this.getPlayerTurn().getUser().username);

                this.embedFiche = new Discord.MessageEmbed()
                .setColor(0x9867C5)
                .setAuthor('Tour de '+ this.getPlayerTurn().getUser().username, this.getPlayerTurn().getUser().displayAvatarURL())
                .setDescription(`⚔️ - Attaque basique\n1️⃣ - Pouvoir 1\n2️⃣ - Pouvoir 2\n❗ - Capacité spécial\n🏳️ - Fuir`);

                let pv;

                let cible = "";
                for(let i in this.getOppositeTeam()){
                    console.log("pv ennemie: " + this.getOppositeTeam()[i].getPV());
                    pv = this.getOppositeTeam()[i].getPV();
                    if(pv<0){pv=0}
                    cible += parseInt(i+1) + ": " + this.getOppositeTeam()[i].getUser().username + `\t PV: ${pv}` + "\n";
                }

                let frien = "";
                for(let i in this.getAllyTeam()){
                    console.log("pv allié: " + this.getAllyTeam()[i].getPV());
                    pv = this.getAllyTeam()[i].getPV()
                    if(pv<0){pv=0}
                    frien += '-' + this.getAllyTeam()[i].getUser().username + `\t PV: ${pv}` + "\n";
                }

                if(cible != ""){
                    this.embedFiche.addField('Cibles: ', cible, false);
                }else{ this.embedFiche.addField('Cibles: ', "Aucunes", false);}

                if(frien !=""){
                    this.embedFiche.addField('Allié: ', frien, false);
                }else{ this.embedFiche.addField('Allié: ', "Aucun", false);}
                
                this.fightmsg.edit(this.embedFiche)
                resolve();
            });
        }

        async postCombat(){
            await this.channel.send('Fin du combat !');




            await this.fightmsg.edit(this.embedFiche);
        }


        async setReactions(){
            let reactions = ['⚔️','1️⃣','2️⃣','❗','🏳️'];
            for(let i in reactions){
                if(this.canReact){
                    await this.fightmsg.react(reactions[i])
                }
            }
        }

        async deleteReactions(){
            this.fightmsg.reactions.removeAll();
        }

        async awaitReaction(){
            return new Promise(async (resolve,reject) => {
                this.React();
                this.setReactions();

                let attaquant = this.getPlayerTurn();

                console.log("on attend la réaction de: " + attaquant.getUser().username);
                const filter = (reaction, user) => user.id === attaquant.getID() && (reaction.emoji.name === '⚔️' || reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣' || reaction.emoji.name === '❗' || reaction.emoji.name === '🏳️');
    
                this.fightmsg.awaitReactions(filter,{max:1}).then(async collected => {
                    console.log("collected ! ");
                    if(collected.first().emoji.name == '⚔️'){
                        console.log("attaque normal");
                        resolve('BASIC');
                    }
                    else if(collected.first().emoji.name == '1️⃣'){
                        console.log("attaque 1");
                        resolve('POUVOIR_1');
                    }
                    else if(collected.first().emoji.name == '2️⃣'){
                        console.log("attaque 2");
                        resolve('POUVOIR_2');
                    }
                    else if(collected.first().emoji.name == '❗'){
                        console.log("spécial");
                        resolve('SPECIAL');
                    }
                    else if(collected.first().emoji.name == '🏳️'){
                        console.log("BACKUP BACKUP");
                        resolve('FUITE');
                        //TODO
                    }
                });

            })
        }

        async awaitCible(){
            return new Promise(async (resolve,reject) => {
                await this.updateMessage();
                let playerTurn = this.getPlayerTurn();
                let ennemyTeam = this.getOppositeTeam();
                //console.log("on attend la cible de la part de: " + playerTurn.getUser().username);
                
                let msgCible = await this.channel.send(`<@${playerTurn.getID()}> doit choisir une cible:`)

                //console.log("id collector: " + this.getPlayerTurn().getID());
                //console.log("taille: " + ennemyTeamLength);

                const filter = (message, user) => message.author.id === this.getPlayerTurn().getID();

                let msgCollector = await this.channel.createMessageCollector(filter, {});

                msgCollector.on('collect', async msg => {
                    let content = parseInt(msg.content)
                    //console.log("content : " + content + " nan: " + isNaN(content));

                    if(isNaN(content)){
                        let msgNope = await this.channel.send("Ce n'est pas un nombre !");
                        msgNope.delete({ timeout: 3000 });
                    }
                    else if(parseInt(content) > ennemyTeam.length || parseInt(content) <= 0){
                        let msgNope = await this.channel.send("Valeur incorrecte!");
                        msgNope.delete({ timeout: 3000 });
                    }else{
                        msgCible.delete();
                        msg.delete();
                        msgCollector.stop();

                        //this.channel.send("Cible choisie: " + ennemyTeam[parseInt(content)-1].getUser().username)

                        resolve(ennemyTeam[parseInt(content-1)])
                    }
                });
            })
        }


        nextTurn(){
            this.turn += 1;
        }
        getTurn(){
            return this.turn;
        }

        getPlayerTurn(){
            let turn = this.getTurn();
            let nbOfPlayer = this.ally.length + this.ennemy.length;
            if(turn % 2 == 0){
                return this.ally[turn %  this.ally.length];
            }else{
                console.log(this.ennemy);
                console.log("indice: " + turn % this.ennemy.length);
                return this.ennemy[turn % this.ennemy.length];
            }
        }

        getOppositeTeam(){
            let allyOrEnnemy;
            if(this.getTurn() % 2 == 0){
                //C'est un allié, donc on à comme cible les ennemies
                allyOrEnnemy = this.ennemy
            }else{
                allyOrEnnemy = this.ally
            }

            return allyOrEnnemy
        }

        getAllyTeam(){
            let allyOrEnnemy;
            if(this.getTurn() % 2 == 0){
                //C'est un allié, donc on à comme allie les allié
                allyOrEnnemy = this.ally
            }else{
                allyOrEnnemy = this.ennemy
            }

            return allyOrEnnemy
        }

        stopReact(){
            this.canReact = false;
        }

        React(){
            this.canReact = true;
        }

        async stopCombat(){
            for(let i in this.ally){
                await this.ally[i].stopCombat();
            }
            for(let i in this.ennemy){
                await this.ennemy[i].stopCombat();
            }
        }


        async addAlly(allyID, guildID, channelID){
            let newAlly = new Player.Player(this.bot,undefined,undefined);
            await newAlly.setInfo(allyID, guildID, channelID);

            console.log("\n--IN COMBAT: -- " + await newAlly.getInCombat());

            if(await newAlly.getInCombat()){
                console.log("OMG DEJA DANS COMBAT");
                await modifyInteraction.main(this.bot, this.interaction, this.options, "Vous êtes déjà dans un combat !");
                return 'IN_COMBAT';
            }

            await newAlly.setInCombat();
            newAlly.sayHello("Je suis un nouvel allié créer dynamiquement !");
            this.ally.push(newAlly);
        }


        async addEnnemy(ennemyID, guildID, channelID){
            let newEnnemy = new Player.Player(this.bot,undefined,undefined);
            await newEnnemy.setInfo(ennemyID, guildID, channelID);
            
            /*if(await newEnnemy.getInCombat()){
                newAlly.getUser().send(newEnnemy.getUser().author.username + ' est déjà dans un combat !')
                return 'NOPE';
            }*/

            await newEnnemy.setInCombat();
            newEnnemy.sayHello("Je suis un nouvel ennemi créer dynamiquement ! Et je suis méchant");
            this.ennemy.push(newEnnemy);
        }

        verifyAlly(){
            let allAllyDead = true;
            for(let i in this.getAllyTeam()){
                if(this.getAllyTeam()[i].getPV() > 0){
                    allAllyDead = false;
                }
            }

            return allAllyDead;
        }

        verifyEnnemy(){
            let allEnnemyDead = true;
            console.log("verify ennemie");
            for(let i in this.getAllyTeam()){
                if(this.getAllyTeam()[i].getPV() > 0){
                    allEnnemyDead = false;
                }
            }

            return allEnnemyDead;
        }
    },

    main: async function(bot, interaction, options, fighttype){
        console.log("\nnouveau combat");

        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

        const ennemy = await bot.users.fetch(options[0].value);

        if(ennemy.id == authorID){
            await modifyInteraction.main(bot, interaction, options, "Vous ne pouvez pas vous combattre vous même !");
            return;
        }
        else if(ennemy.bot){
            await modifyInteraction.main(bot, interaction, options, "Vous ne pouvez pas combattre un bot !");
            return;
        }

        

        const combat = new this.Combat(bot, interaction, options, author, channel, fighttype);
        
        let ally1 = await combat.addAlly(authorID, guildID, channelID);
        if(ally1 == 'IN_COMBAT'){
            await combat.stopCombat();
            return;
        }

        if(fighttype == 'PLAYER'){
            //console.log("C'est du PVP !");

            let ennemy1 = await combat.addEnnemy(ennemy.id, guildID, channelID);
            //TODO AJOUTER TOUT LES MEMBRES DES GROUPES
            if(ennemy1 == 'IN_COMBAT'){
                await combat.stopCombat();
                return;
            }

            await combat.sendMessage();
            modifyInteraction.main(bot, interaction, options, "Bonne chance");

            while((!combat.verifyAlly()) && (!combat.verifyEnnemy())){

                await combat.updateMessage();
                let cible = await combat.awaitCible();


                let attackCode = await combat.awaitReaction();

                
                let attackResponse = await combat.getPlayerTurn().attack(attackCode);
                while(!attackResponse[0]=='OK'){
                    attackCode = await combat.awaitReaction();
                    attackResponse = await combat.getPlayerTurn().attack(attackCode);
                }

                cible.takeDamage(attackResponse[1]);

                combat.deleteReactions();
                await combat.updateMessage();
                combat.stopReact();
                await combat.deleteReactions();

                combat.nextTurn();
        }
        console.log("FIN DU COMBAT");
        await combat.postCombat();
        await combat.stopCombat();
        return
    }   

    },
    FindBossInArea: async function(bot, interaction, options){
        return new Promise(async (resolve,reject) => {
            //TODO
        });
    }
}