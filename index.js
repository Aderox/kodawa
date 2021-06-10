const Discord = require("discord.js");
const fs = require("fs");
const fetch = require('node-fetch');
const botInfo = require('./botInfo.json')
const bot = new Discord.Client();
const ytdl = require('ytdl-core');

const DiscordAPI = "https://discord.com/api/v9/";

const sendMessage = require("./modules/sendMessage")



//ALL BOT COLLECTIONS
bot.commands = new Discord.Collection()

//ALL CLASS REQUIRED
const test = require('./class/test.js');
const Player = require("./class/player");

testo  = new test.Test("aaa");

const RPguildId = "836871444738211840";
const devGuildID = "743192359038091326";

function sendLog(msg){
  let date = new Date();
  console.log(`[Kodama Logs: ${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR')}] ${msg}`);
}


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


async function sleep(ms){
  return new Promise( (resolve,reject) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

async function stopAllCombat(){
  return new Promise(async (resolve,reject) => {
    fs.readdir("./game/players", async (err,files) => {
      if(err) console.error(err);
      for(let file in files){
        let player = new Player.Player(bot,undefined,undefined);
        await player.setAuthor(files[file].split('.')[0]);
        player.stopCombat();
      }
      console.log("on a stopper tout les combats !");
      resolve('OK')
    })
  });
}


bot.on("ready", async () =>  {
    sendLog("Bot ready !");
    await stopAllCombat();
    //SUPPRIME TOUTE LES COMMANDES DE LA GUILD (relative au bot of)
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
        //await sleep(500);
        /*        //bot.api.interactions(interaction.id, interaction.token).callback.patch(sendMessage.main('TROP RELOU !'));
        new Discord.WebhookClient(bot.user.id, interaction.token).send('hello world')
                  await new Discord.WebhookClient(bot.user.id, interaction.token).edit(sendMessage.main('yay !'))
        */
      }
      }); 

      bot.on('message', async msg => {
        if(msg.content === '.mood'){
          if (msg.member.voice.channel) {
            playAudio(msg,'mood');
          }
        }
        return;
        //TODO VERIFIER SI C'EST UN CHANNEL RP (TYPE) + FAIRE SPAWN MOB EN CONSEQUENCE (PROBA)
      })
})


async function playAudio(msg,audioID){
  const connection = await msg.member.voice.channel.join();
  const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=Mlq9jrXbEFo',{ filter: 'audioonly' }));
  dispatcher.on('start', () => {
    console.log('audio.mp3 is now playing!');
  });
  
  dispatcher.on('finish', () => {
    console.log('audio.mp3 has finished playing!');
    connection.disconnect();
  });
}
console.log("hello there");
bot.login(botInfo.token);