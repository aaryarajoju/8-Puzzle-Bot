const Discord = require("discord.js");
const {token} = require('./config.json');
const client = new Discord.Client;

client.once('ready', () => {
    console.log("The bot is online! Connected as " + client.user.tag);
    client.user.setActivity("you play", {type: "WATCHING"});
   });
client.once('reconnecting', () => {
    console.log("The bot is reconnecting! Reconnecting as " + client.user.tag);
   });
client.once('disconnect', () => {
    console.log("The bot is disconnected!");
   });

client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) return;
    
})


client.login(token);
