const Discord = require("discord.js");
const fs = require("fs");

module.exports =  {
    main: msg => {
            let data = {
                data: {
                type: 4,
                data: {
                  content: msg,
                },
            }}
            return data
    }

}