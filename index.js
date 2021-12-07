require('dotenv').config()
const axios = require('axios');
const { Telegraf } = require('telegraf')
const express = require('express');

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

var teleBotToken = process.env.TELEGRAM_BOT_TOKEN
const telegramBot = new Telegraf(teleBotToken)

telegramBot.start((ctx) => {
    ctx.reply('Hey there! I am Streamer! I am currently streaming messages from this chat.')
})

telegramBot.on('message', ctx => {
    if (!ctx.chat.title) return
    if (ctx.chat.title == 'bot testing' || ctx.chat.title == 'Accelerator Group 3') {
        var messageAuthorName = ctx.from.first_name
        if (ctx.from.last_name) {
            messageAuthorName += ' ' + ctx.from.last_name
        }
        var messageText = ctx.message.text
        var discordMessage = `From ${messageAuthorName}: ${messageText}`

        sendDiscordWebhookMessage(discordMessage)
        .then(() => {
            console.log(`Message from ${messageAuthorName} streamed.`)
        })
    }
})

telegramBot.launch()
console.log('Bot is online and ready to stream!')