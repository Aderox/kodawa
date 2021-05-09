const Discord = require("discord.js");
const fs = require("fs");

module.exports =  {
    main: async(bot, interaction, content) => {
        console.log("----------- createAPI MESSAGE CALLED ------------")
        const {data,files} = await Discord.APIMessage.create(
            bot.channels.resolve(interaction.channel_id),content)
            .resolveData()
            .resolveFiles()
            return { ...data, files}
    }

}