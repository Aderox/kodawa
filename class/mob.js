const Discord = require("discord.js");
const fs = require("fs");

function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};

module.exports =  {
    Mob: class{
        constructor(name,bot,interaction,options,author,channel){
            console.log("Constructor appelé !: " + name);
            this.bot = bot;
            this.interaction = interaction;
            this.options = options;
            this.author = author
            this.channel = channel;
            this.name = name;
            this.PATH = './game/' + name.toLowerCase() + 's/'


            this.health = 8000;
        }
    
    async setId(id){
        this.id = id;
    }

    /**
     * ME PERMET DE CREER UNE FICHE DE MOB !
     */

    async writeJSON(){
        return new Promise(async (resolve,reject) => {
            let options = this.options;

            let id = options[0].value;
            let nom = options[1].value;
            let taille = options[2].value;
            let pv = options[3].value;
            let type = options[4].value;
            let description = options[5].value;

            //let special = otherData[4];

            let JSONDATA = {
                "id":id,
                "nom":nom,
                "taille":taille,
                "pv":pv,
                "type":type,
                "description":description,
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

    async askBossImage(info){
        return new Promise(async (resolve,reject) => {
            console.log("askbot image caleld")
            console.log(this.author)
            let DMchan = await this.author.createDM();
            await DMchan.send(info)

            const filter = (msg, user) => {
                if(msg.author.bot) return false;
                if(msg.author.id != this.author.id){return false}
                return true;
            };

            let msgCollector = DMchan.createMessageCollector(filter);
            msgCollector.on('collect', async (msgCollected) => {
                if(isValidURL(msgCollected.content)){
                    console.log("C'est une URL")
                    msgCollector.stop();
                    this.boss_image = msgCollected.content;
                    resolve(msgCollected.content)
                }
                else if(msgCollected.attachments.size != 0 && msgCollected.attachments.first().size > 0){
                    console.log("c'est une image upload")
                    msgCollector.stop();
                    this.boss_image = msgCollected.attachments.first().url;
                    resolve(msgCollected.attachments.first().url)
                }else{
                    await DMchan.send("Ce n'est ni un lien ni une image !")
                }
            });

        })
    }

    async writeNewAttaque(){
        return new Promise(async (resolve,reject) => {
        let isOk = await this.verifyBossID();
        console.log("ISOK: " + isOk)
        if(!isOk){
            this.channel.send("L'id ne correspond à aucun " + this.name);
            resolve('WRONG_ID');
            return;
        }

        fs.readFile(this.PATH+this.id+'.json',async (err,dataBrut) => {
            let data = JSON.parse(dataBrut.toString());


            let JSONPower = {
                "nom": this.options[1].value,
                "degats": this.options[2].value,
                "cooldown_tours": this.options[3].value,
                "type": this.options[4].value,
                "descriptions": this.options[5].value,
                "penalite_degat_pourcent": this.options[6].value,
                "penalite_precision_pourcent": this.options[7].value,
                "nombre_de_tour_actif": this.options[8].value,
            }

            data.pouvoirs.push(JSONPower);

            fs.writeFile(this.PATH+this.id+".json", JSON.stringify(data, null, 4), function(err) {
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

    async readJSON(){
        return new Promise(async (resolve,reject) => {
            fs.readFile(this.PATH+this.id+'.json',async (err,dataBrut) => {
                    let data = JSON.parse(dataBrut.toString());
                    if(err) console.error(err)
                    //A FINIR + POUVOIR
                    if(data){
                    this.nom = data.nom;
                    this.taille = data.taille;
                    this.pv = data.pv;
                    this.type = data.type;
                    this.description = data.description;
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

    async verifyBossID(){
        return new Promise(async (resolve,reject) => {
            let isOk = false;
            fs.readdir(this.PATH, async(err,files)=>{

                for(let i in files){
                    if(files[i] === this.id+'.json'){
                        console.log("yay !")
                        isOk = true;
                    }
                }
                resolve(isOk);
            })

        });
    }

    async listAllBoss(){
        return new Promise(async (resolve,reject) => {
            fs.readdir(this.PATH, async(err,files)=>{
                console.log("FINI DE LIRE !");
                console.log(this.PATH);
                let str = '';
                for(let i in files){
                    if(!this.options[0].value){
                        console.log("pas détaillé");
                        str += `${this.name} ${parseInt(i)+1}: ${files[i].split('.')[0]}\n`
                        
                    }else{
                    console.log("détaillé");
                    fs.readFile('PATH'+files[i],async (err,dataBrut) => {
                        if(err) console.error(err);
                        let data = await JSON.parse(dataBrut.toString());
                        console.log(data);
                    })
                }
                }
                if(!this.options[0].value){
                await this.channel.send(str)
                resolve();
                return;
                }
            })
        })
    }

    /**************************************************************************** */
    /*
     * On rentre dans la partie combat !
     */
    
    async takeDamage(damage){
        return new Promise(async (resolve,reject) => {
            this.health -= damage;
            resolve()
        });
    }

    async getHealth(){
        return new Promise(async (resolve,reject) => {
            console.log(this.name + " life");
        });
    }

    async attack(){
        return new Promise(async (resolve,reject) => {
            let random = Math.random() * this.nbpouvoirs;
            console.log("on attaque. Pour ça on va prendre un pouvoir random: " + random + " / " + this.nbpouvoirs + ". Ce pouvoir correspond à: ");
            console.log(this.pouvoirs[random])
        });
    }
    },


    main: async function(bot,interaction,options){
        console.log("On appel la main ?")
    },


    creerBoss: async function(bot,interaction,options){
        console.log("On va créer un mob !");

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

        let boss = new this.Mob("Mob",bot,interaction,options,author,channel);
        await boss.setId(options[0].value);
        await boss.askBossImage("Image du mob");
        await boss.writeJSON();
        await author.send("Mob crée !");
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

        let boss = new this.Mob("Mob",bot,interaction,options,author,channel);
        await boss.setId(options[0].value);
        await boss.writeNewAttaque();
        await author.send("Attaque ajoutée !")

    },

    listeBoss: async function(bot, interaction, options){
        console.log("On va lister les mobs")
        console.log(options);
        const authorID = interaction.member.user.id;
        const author = await bot.users.fetch(authorID);
        const guildID = interaction.guild_id;
        const guild = await bot.guilds.fetch(guildID);
        const channelID = interaction.channel_id;
        const channel = await bot.channels.fetch(channelID);

        let boss = new this.Mob("Mob",bot,interaction,options,author,channel);
        await boss.setId(options[0].value);
        await boss.listAllBoss();
    },

    attirerBoss: async function(bot,interaction,options){
        console.log("On attire un mobs !");
    },


    fight: async function(bot,interaction,options){

    }
}