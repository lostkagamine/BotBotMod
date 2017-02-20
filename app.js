// BotBotMod alpha 0.1
// (C) ry00001 2017
// Setup
const Discord = require('discord.js');
const fs = require("fs")
const client = new Discord.Client();
var warns = { }
var logchannels = { }
var version = "alpha 0.1"
const prefix = "bbm>"
const helpEmbed = {
  title: "BotBotMod",
  color: 0x00FC43,
  description: "BotBotMod version " + version + "\nList of commands:\n`kick | ban | setup-logs | deregister-logs | tempban | softban | purge`\n## Work In Progress ##\nInvite with https://discordapp.com/oauth2/authorize?permissions=8&scope=bot&client_id=282890288958013440",
  footer: {
    text: "BotBotMod " + version + ", by ry00001"
  }
}

function nop() { }

function parseTime(timeStr) {
  let timeInt = parseInt(timeStr)
  if (timeStr.includes("h")) {
    timeInt = timeInt * 3600
  }
  if (timeStr.includes("m")) {
    timeInt = timeInt * 60
  }
  if (timeStr.includes("s")) {
    nop()
  }
  return timeInt;
}

function saveWarns() {
  console.log("Now saving. Do not shut down the bot.")
  fs.writeFile("warns.json", JSON.stringify(warns), function(err) {
    if (err) {
      return console.log(err)
    }
  });
  console.log("Saving completed.")
}
function loadWarns() {
  console.log("Now loading. Do not shut down the bot.")
  fs.readFile('warns.json','utf8', function (err, data) {
    if (err) console.log(err)
    warns = JSON.parse(data)
  })
  console.log("Loading completed.")
}
function saveLogConfig() {
  console.log("Now saving. Do not shut down the bot.")
  fs.writeFile("logchannels.json", JSON.stringify(logchannels), function(err) {
    if (err) {
      return console.log(err)
    }
  });
  console.log("Saving completed.")
}
function loadLogConfig() {
  console.log("Now loading. Do not shut down the bot.")
  fs.readFile('logchannels.json','utf8', function (err, data) {
    if (err) console.log(err)
    logchannels = JSON.parse(data)
  })
  console.log("Loading completed.")
}

client.on("ready", () => {
  console.log("BotBotMod is loading files... Please wait.")
  loadWarns()
  loadLogConfig()
  console.log("Fully loaded.")
  console.log("Discord connection already established. Client username is " + client.user.username)
  client.user.setGame("bbm>help | Version " + version)
})

client.on("message", message => {
  if (message.author.bot) { return;}
  if (!message.content.startsWith(prefix)) {return;}
  let command = message.content.split(" ")[0]
  command = command.slice(prefix.length)
  let args = message.content.split(" ").slice(1)
  if (command === "help") {
    message.channel.sendMessage("", {
      embed: helpEmbed
    })
  }

  if (command === "setup-logs") {
    if (!message.author.hasPermission("MANAGE_SERVER")) {
      message.channel.sendMessage(":no_entry_sign: Insufficient permission.")
    }
    if (args[0] == undefined || args[0] == null) {
      message.channel.sendMessage("Welcome to BotBotMod.\nPlease run this command using the following syntax: bbm>setup-logs #log-channel")
      return;
    }
    if (logchannels[message.guild.id]) {
      message.channel.sendMessage("There already is a log channel set up. Deregister it then set up again to change it.")
      return;
    }
    let logChan = message.mentions.channels.first()
    message.channel.sendMessage("Setting up BotBotMod Logging on channel " + logChan)
    logchannels[message.guild.id] = logChan.id
    saveLogConfig()
    message.channel.sendMessage("Alright, you're all set up. Have fun!")
  }
  if (command === "deregister-logs") {
    if (!message.member.hasPermission("MANAGE_SERVER")) {
      message.channel.sendMessage(":no_entry-sign: Insufficient permission.")
    }
    if (args[0] == undefined || args[0] == null) {
      message.channel.sendMessage("Syntax: bbm>deregister-logs #channel")
      return;
    }
    if (!logchannels[message.guild.id]) {
      message.channel.sendMessage("There is no log channel set up. Set it up with bbm>setup-logs #channel.")
      return;
    }
    let logChan = message.mentions.channels.first()
    message.channel.sendMessage("Deregistering channel " + logChan + " for BotBotMod Logging")
    logchannels[message.guild.id] = null
    saveLogConfig()
    message.channel.sendMessage("Done deregistering channel.")
  }
  if (command === "ban") {
    let userToBan = message.mentions.users.first()
    let reason;
    if (!args[0]) {
      message.channel.sendMessage("Syntax: bbm>ban @user [reason]")
      return;
    }
    if (args[1]) {
      reason = args.slice(1).join(" ")
    } else {
      reason = "[No reason specified by user]"
    }
    if (!message.guild.member(client.user).hasPermission("BAN_MEMBERS")) {
      message.channel.sendMessage(":warning: I don't have permission to ban users!")
      return;
    }
    if (!message.member.hasPermission("BAN_MEMBERS")) {
      message.channel.sendMessage(":no_entry_sign: You don't have permission to ban users.")
      return;
    }
      userToBan.sendMessage("**You were banned** from " + message.guild.name + " by " + message.author.username + ".\n\nThe reason was: `" + reason + "`.\nIf you don't agree with this action, contact a moderator.").catch(console.error)
    message.guild.member(userToBan).ban()
    message.channel.sendMessage("Banned user " + userToBan + " for reason `" + reason + "`")
    if (logchannels[message.guild.id]) {
      client.channels.get(logchannels[message.guild.id]).sendMessage("", {
        embed: {
          title: "BotBotMod: User Banned",
          color: 0xFF0000,
          description: "User " + userToBan + " has been banned by " + message.author.username + " for reason: \n`" + reason + "`",
          footer: {
            text: "BotBotMod by ry00001, version " + version
          }
        }
      })
    } else {
      message.channel.sendMessage(":warning: **Logging isn't set up.** Run bbm>setup-logs to begin.")
    }

  }
  if (command === "tempban") {
    let userToTempban = message.mentions.users.first()
    let reason;
    if (!args[0]) {
      message.channel.sendMessage("Syntax: bbm>tempban @user <time> [reason]")
      return;
    }
    if (args[2]) {
      reason = args.slice(2).join(" ")
    } else {
      reason = "[No reason specified by user]"
    }
    if (!message.guild.member(client.user).hasPermission("BAN_MEMBERS")) {
      message.channel.sendMessage(":warning: I don't have permission to ban users!")
      return;
    }
    if (!message.member.hasPermission("BAN_MEMBERS")) {
      message.channel.sendMessage(":no_entry_sign: You don't have permission to tempban users.")
      return;
    }
    let varTime = parseTime(args[1])
    if (isNaN(varTime)) {
      message.channel.sendMessage(":warning: Please provide a valid length of time. Formats are <time>s/m/h for seconds, minutes and hours.")
      return;
    }
    message.channel.sendMessage("Tempbanned user " + userToTempban + " for " + varTime + " seconds.")
    userToTempban.sendMessage("**You were temporarily banned** from " + message.guild.name + " by " + message.author.username + " for " + varTime + " seconds.\n\nThe reason was: `" + reason + "`\nIf you don't agree with this action, contact a moderator.")
    message.guild.member(userToTempban).ban()
    setTimeout(function(){ message.guild.unban(userToTempban.id) }, varTime*1000)
    if (logchannels[message.guild.id]) {
      client.channels.get(logchannels[message.guild.id]).sendMessage("", {
        embed: {
          title: "BotBotMod: User Tempbanned",
          color: 0xFFA500,
          description: "User " + userToTempban + " has been tempbanned by " + message.author.username + " for " + varTime + " seconds for reason: \n`" + reason + "`",
          footer: {
            text: "BotBotMod by ry00001, version " + version
          }
        }
      })
    }
  }
  if (command === "kick") {
    let userToKick = message.mentions.users.first()
    let reason;
    if (!args[0]) {
      message.channel.sendMessage("Syntax: bbm>kick @user [reason]")
      return;
    }
    if (args[1]) {
      reason = args.slice(1).join(" ")
    } else {
      reason = "[No reason specified by user]"
    }
    if (!message.guild.member(client.user).hasPermission("KICK_MEMBERS")) {
      message.channel.sendMessage(":warning: I don't have permission to kick users!")
      return;
    }
    if (!message.member.hasPermission("KICK_MEMBERS")) {
      message.channel.sendMessage(":no_entry_sign: You don't have permission to kick users.")
      return;
    }
    userToKick.sendMessage("**You were kicked** from " + message.guild.name + " by " + message.author.username + ".\n\nThe reason was: `" + reason + "`.\nIf you don't agree with this action, contact a moderator.").catch(console.error)
    message.guild.member(userToKick).kick()
    message.channel.sendMessage("Kicked user " + userToKick + " for reason `" + reason + "`")
    if (logchannels[message.guild.id]) {
      client.channels.get(logchannels[message.guild.id]).sendMessage("", {
        embed: {
          title: "BotBotMod: User Kicked",
          color: 0xFFA500,
          description: "User " + userToKick + " has been kicked by " + message.author.username + " for reason: \n`" + reason + "`",
          footer: {
            text: "BotBotMod by ry00001, version " + version
          }
        }
      })
    } else {
      message.channel.sendMessage(":warning: **Logging isn't set up.** Run bbm>setup-logs to begin.")
    }
  }
  if (command === "softban") {
    let userToSoftban = message.mentions.users.first()
    let reason;
    if (!message.member.hasPermission("BAN_MEMBERS")) {
      message.channel.sendMessage(":no_entry_sign: Insufficient permission.")
      return;
    }
    if (!args[0]) {
      message.channel.sendMessage("Syntax: bbm>softban @user [reason]")
      return;
    }
    if (!args[1]) {
      reason = "[No reason specified by user]"
    } else {
      reason = args.slice(1).join(" ")
    }
    userToSoftban.sendMessage("**You were softbanned** from " + message.guild.name + " by " + message.author.username + ".\n\nThe reason was: `" + reason + "`.\nIf you don't agree with this action, contact a moderator.")
    message.guild.member(userToSoftban).ban(7)
    message.guild.unban(userToSoftban.id)
    message.channel.sendMessage("Softbanned user " + userToSoftban + " for reason `" + reason + "`")
    if (logchannels[message.guild.id]) {
      client.channels.get(logchannels[message.guild.id]).sendMessage("", {
        embed: {
          title: "BotBotMod: User Softbanned",
          color: 0xFFA500,
          description: "User " + userToSoftban + " has been softbanned by " + message.author.username + " for reason: \n`" + reason + "`",
          footer: {
            text: "BotBotMod by ry00001, version " + version
          }

        }
      })
    } else {
      message.channel.sendMessage(":warning: No log channel set up.")
    }
  }
  if (command === "purge") {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
      message.channel.sendMessage(":no_entry_sign: Insufficient permission.")
      return;
    }
    if (args[0] > 100) {
      message.channel.sendMessage(":no_entry_sign: I can only purge up to 100 messages.")
      return;
    }
    if (isNaN(parseInt(args[0]))) {
      message.channel.sendMessage(":warning: You entered an invalid value.")
      return;
    }
    message.delete()
    message.channel.bulkDelete(parseInt(args[0]))
    message.channel.sendMessage(message.author + ", I've purged " + args[0] + " messages.")
    if (logchannels[message.guild.id]) {
      client.channels.get(logchannels[message.guild.id]).sendMessage("",{
        embed: {
          title: "BotBotMod: Messages Purged",
          color: 0x00CC00,
          description: message.author + " has purged " + args[0] + " messages inside " + message.channel + ".",
          footer: {
            text: "BotBotMod by ry00001, version " + version
          }
        }
      })
    }
  }
})



console.log("Attempting to connect to Discord...")
client.login("oh, no you won't")
console.log("Discord connection established! Great!")
