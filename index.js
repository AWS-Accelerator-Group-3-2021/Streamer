require('dotenv').config()
const axios = require('axios');
const { Telegraf } = require('telegraf')
const express = require('express');
const Discord = require('discord.js')
const discordBot = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });

const app = express();
app.get('/', (request, response) => {
    response.send('Hello World!')
});
app.listen(3000, console.log('App Listening to port 3000'));

async function sendDiscordWebhookMessage(messageText) {
    var dataToSend = {
        'username': 'Streamer',
        'content': messageText
    }

    await axios({
        method: 'post',
        url: process.env.WEBHOOK_LINK,
        data: dataToSend,
        headers: {}
    })
    .catch(err => {
        console.log(err)
    })
}

// Telegram
var teleBotToken = process.env.TELEGRAM_BOT_TOKEN
const telegramBot = new Telegraf(teleBotToken)

telegramBot.start((ctx) => {
    console.log(ctx.chat.id)
    ctx.reply('Hey there! I am Streamer! I am currently streaming messages from this chat.')
})

telegramBot.on('message', ctx => {
    if (!ctx.chat.title) return
    if (ctx.chat.title == 'bot testing') {
        var messageAuthorName = ctx.from.first_name
        if (ctx.from.last_name) {
            messageAuthorName += ' ' + ctx.from.last_name
        }
        var messageText = ctx.message.text
        var discordMessage = `From ${messageAuthorName}: ${messageText}`

        sendDiscordWebhookMessage(discordMessage)
        .then(() => {
            console.log(`Message from ${messageAuthorName} streamed. <T/D>`)
        })
    }
})

// Discord
discordBot.on('ready', () => {
    console.log('Discord bot is online and ready!')
    console.log('')
})

discordBot.on('messageCreate', (msg) => {
    if (msg.channel.id != '917660123198029875') return
    if (msg.author.bot) return
    var messageText = msg.content
    var authorName = msg.guild.members.cache.get(msg.author.id).nickname
    telegramBot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, `From ${authorName}: ${messageText}`)
    .then(message => {
        if (msg.attachments.size > 0) {
            telegramBot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, 'Attachments:')
            try {
                msg.attachments.forEach(attachment => {
                    if (attachment.contentType.startsWith('video')) {
                        telegramBot.telegram.sendVideo(process.env.TELEGRAM_CHAT_ID, attachment.attachment)
                    } else if (attachment.contentType.startsWith('image')) {
                        telegramBot.telegram.sendPhoto(process.env.TELEGRAM_CHAT_ID, attachment.attachment)
                    } else if (attachment.contentType.startsWith('audio')) {
                        telegramBot.telegram.sendAudio(process.env.TELEGRAM_CHAT_ID, attachment.attachment)
                    } else {
                        telegramBot.telegram.sendMessage(process.env.TELEGRAM_CHAT_ID, attachment.url)
                    }
                })
            } catch(err) {
                console.log('Error in sending Discord attachments: ' + err)
            }
        }

        console.log(`Message from ${authorName} streamed. <D/T>`)
    })
})

telegramBot.launch()
console.log('Bot is online and ready to stream!')
console.log('Connecting to Discord servers...')

discordBot.login(process.env.DISCORD_BOT_TOKEN)