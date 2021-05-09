const Discord = require("discord.js");
const fs = require("fs");
const botInfo = require('./botInfo.json')
const bot = new Discord.Client();

//ALL BOT COLLECTIONS
bot.commands = new Discord.Collection()

//ALL CLASS REQUIRED
const test = require('./class/test.class.js');

testo  = new test.Test("aaa");


const devGuildID = "743192359038091326";


async function postBotSlashCommand(data){
    await bot.api.applications(bot.user.id).guilds(devGuildID).commands.post(data);
    //bot.api.applications(bot.user.id).commands.post(data);

}

async function deleteAllGuildCommands(){
    bot.guilds.cache.forEach(async (guild) => {
      let COMMANDS = await bot.api.applications(bot.user.id).guilds(guild.id).commands.get();
          for(i = 0; i<COMMANDS.length;i++){
          console.log("commande à supprimer: " + COMMANDS[i].name)
          await bot.api.applications(bot.user.id).guilds(guild.id).commands(COMMANDS[i].id).delete();
          }
    });
}

async function deleteAllGlobalCommands(){
    let GCOMMANDS = await bot.api.applications(bot.user.id).commands.get()
    for(i = 0; i<GCOMMANDS.length;i++){
      await bot.api.applications(bot.user.id).commands(GCOMMANDS[i].id).delete();
    }
}


async function readJSfiles(){
    fs.readdir("./jscmds/", (err, files) => {
        if(err) console.error(err);
            files.forEach((jsfile,i) => {
                let cmd = jsfile.split(".")[0];
                let props = require(`./jscmds/${cmd}.js`)
                console.log(`${i + 1} : ${props.help.name}`)
                bot.commands.set(props.help.name, {
                    run: props.run,
                    ...props.help});
                
        });
    });
}

async function readSlashCommands(){
    fs.readdir("./slashcmds/", (err, files) => {
        if(err) console.error(err);
        files.forEach(file => {
          fs.readFile("./slashcmds/" + file, async (err, dataBrut) => {
          if(err) console.log(err)
          let data = await JSON.parse(dataBrut.toString())
          try{
          console.log("posting " + data.data.name + "...")
          await postBotSlashCommand(data);
          }catch(e){
            console.error(e)
            console.log("Can't send " + file + "'s data...")
          }
          });
        });
      });
}

bot.on("ready", async () =>  {
    console.log("Bot ready !")

    //SUPPRIME TOUTE LES COMMANDES DE LA GUILD
    //await deleteAllGuildCommands();
    await readSlashCommands();
    await readJSfiles();
    bot.ws.on('INTERACTION_CREATE', async (interaction) =>{
        const { name, options } = interaction.data;
        console.log("INTERACTION_CREATE. Name: " + name)
        let cmd = bot.commands.get(name)
        if(cmd){
        let stuffReturn = await cmd.run(bot, interaction, options);
        bot.api.interactions(interaction.id, interaction.token).callback.post(stuffReturn);
        }
      }); 


})


console.log("hello there");
bot.login(botInfo.token);