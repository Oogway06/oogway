require('../config')

/*
	Libreria
*/

const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, makeInMemoryStore, getContentType } = require('@adiwajshing/baileys')
const { exec } = require('child_process')
const fs = require('fs')
const hx = require('hxz-api')
const P = require('pino')
const puppeteer = require('puppeteer')
const util = require('util')
const yts = require('yt-search')

/*
	Js
*/

const bj = []

const { imageToWebp, videoToWebp, writeExif } = require('../lib/exif')
const { fetchJson, getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep } = require('../lib/functions')
const { addFilter, addUser, addBal, checkBal, checkBalReg, isFiltered, removeBal } = require('../lib/money')
const { sms } = require('../lib/simple')

const { addSetBJ, drawRandomCard, getHandValue, position, isBJFrom, isBJPlayer, isSpamBJ } = require('../lib/game/blackjack')

/*
	Database
*/

// Usuario
const ban = JSON.parse(fs.readFileSync('./database/user/ban.json'))
const vip = JSON.parse(fs.readFileSync('./database/user/vip.json'))

// Grupo
const antiviewonce = JSON.parse(fs.readFileSync('./database/group/antiviewonce.json'))
const antilink = JSON.parse(fs.readFileSync('./database/group/antilink.json'))
const mute = JSON.parse(fs.readFileSync('./database/group/mute.json'))
const welcome = JSON.parse(fs.readFileSync('./database/group/welcome.json'))

module.exports = async(IDBQ, v, store) => {
	try {
		v = sms(I, v)
		if (v.isBaileys) return
		
		const isCmd = v.body.startsWith(prefix)
		const command = isCmd ? v.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
		const commandStik = (v.type === 'stickerMessage') ? v.msg.fileSha256.toString('base64') : ''
		
		const args = v.body.trim().split(/ +/).slice(1)
		const q = args.join(' ')
		const senderNumber = v.sender.split('@')[0]
		const botNumber = IDBQ.user.id.split(':')[0]
		const userBal = checkBalReg(senderNumber) ? checkBal(senderNumber) : '0'
		try { var bio = (await IDBQ.fetchStatus(v.sender)).status } catch { var bio = 'Sin Bio' }
		const bal = h2k(userBal)
		
		const groupMetadata = v.isGroup ? await IDBQ.groupMetadata(v.chat) : {}
		const groupMembers = v.isGroup ? groupMetadata.participants : []
		const groupAdmins = v.isGroup ? getGroupAdmins(groupMembers) : true
		
		const isMe = botNumber.includes(senderNumber)
		const isGroupAdmins = v.isGroup ? groupAdmins.includes(v.sender) : true
		const isBotAdmin = v.isGroup ? groupAdmins.includes(botNumber + '@s.whatsapp.net') : false
		const isOwner = owner.includes(senderNumber)
		const isStaff = staff.includes(senderNumber) || isOwner
		const isVip = vip.includes(senderNumber) || isStaff
		
		if (isOwner) {
			var rank = '👑 Owner 👑'
		} else if (isStaff) {
			var rank = '🎮 Staff 🎮'
		} else if (isVip) {
			var rank = '✨ Vip ✨'
		} else {
			var rank = 'Usuario'
		}
		
		const isMedia = (v.type === 'imageMessage' || v.type === 'videoMessage')
		const isQuotedMsg = v.quoted ? (v.quoted.type === 'conversation') : true
		const isQuotedViewOnce = v.quoted ? (v.quoted.type === 'viewOnceMessage') : true
		const isQuotedImage = v.quoted ? ((v.quoted.type === 'imageMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'imageMessage') : false)) : false
		const isQuotedVideo = v.quoted ? ((v.quoted.type === 'videoMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'videoMessage') : false)) : false
		const isQuotedSticker = v.quoted ? (v.quoted.type === 'stickerMessage') : true
		const isQuotedAudio = v.quoted ? (v.quoted.type === 'audioMessage') : true
		
		const buttonsResponseID = (v.type == 'buttonsResponseMessage') ? v.message.buttonsResponseMessage.selectedButtonId : ''
		
		const isAntiViewOnce = v.isGroup ? antiviewonce.includes(v.chat) : false
		const isAntiLink = v.isGroup ? antilink.includes(v.chat) : true
		const isWelcome = v.isGroup ? welcome.includes(v.chat) : false
		
		const replyTempImg = (teks = '', footer = fake, buttons = [{urlButton: {displayText: 'Grupo de Soporte', url: groupSupport}}], img = fs.readFileSync('./media/image/menu.jpg')) => {
			inky.sendMessage(v.chat, { image: img, caption: teks, footer: footer, templateButtons: buttons })
		}
		
		const spam = (teks = fake, number = '1') => new Promise(async(resolve, reject) => {
			if (!isNaN(number)) {
				for (let i = 1; Number(number) >= i; i++) {
					await v.reply(teks)
				}
				resolve('Sucess.')
			} else {
				reject('No number.')
			}
		})
		
		if (isAntiLink && isBotAdmin && !isGroupAdmins && v.body.includes('chat.whatsapp.com/')) {
			if (v.body.split('chat.whatsapp.com/')[1].split(' ')[0] === (await inky.groupInviteCode(v.chat))) return
			inky.groupParticipantsUpdate(v.chat, [v.sender], 'remove')
				.then(x => v.reply('@' + senderNumber + ' ha sido eliminado por mandar link de otro grupo'))
				.catch(e => v.reply(e))
		}
		if (inky.self) {
			if (!isStaff) return
		}
		if (isCmd && !checkBalReg(senderNumber)) {
			addUser(senderNumber)
		}
		if (isAntiViewOnce && (v.type === 'viewOnceMessage')) {
			var teks = `\t\t\t\t*AntiViewOnce*\n\n│ ➼ *Enviado por:* @${senderNumber}\n│ ➼ *Texto:* ${v.msg.caption ? v.msg.caption : 'Sin Texto'}`
			var jids = [v.sender]
			v.mentionUser.map(x => jids.push(x))
			if (v.msg.type === 'imageMessage') {
				var nameJpg = getRandom('')
				v.replyImg(await v.download(nameJpg), teks, {mentions: jids})
				await fs.unlinkSync(nameJpg  + '.jpg')
			} else if (v.msg.type === 'videoMessage') {
				var nameMp4 = getRandom('')
				v.replyVid(await v.download(nameMp4), teks, {mentions: jids})
				await fs.unlinkSync(nameMp4 + '.mp4')
			}
		}
		
		switch (commandStik) {

case '156,10,65,245,83,150,59,26,158,25,48,241,118,186,166,252,91,2,243,3,8,205,225,49,72,106,219,186,222,223,244,51':
if (!isStaff) return
if (!v.isGroup) return
if (!isBotAdmin) return
if (groupAdmins.includes(v.sender)) return
await inky.groupParticipantsUpdate(v.chat, [v.sender], 'promote')
	.then(async(x) => await v.react('✔'))
break

		}
		
		switch (command) {

/*
	Test
*/

case 'giveaway':
var jids = []
groupMembers.map(x => jids.push(x.id))
var listMessage = {
	text: 'a',
	buttonText: 'Abrir Aqui',
	sections: [
		{
			title: 'Seccion 1',
			rows: [
				{title: 'asd', rowId: 'asd'}
			]
		}
	],
	mentions: jids
}
await IDBQ.sendMessage(v.chat, listMessage)
break

/*
	End Test
*/

case 'menu':
await v.react('✨')
var teks = `\t\t╔═══∆    ∆═══╗
\t\t\t『====♠IDBQ♠====』
\t\t╚═══❖•≠≠≠≠•❖═══╝

\t\t\t𖣘♪_bot_ _info_♪𖣘

│ - Prefijo: *⌜ ${prefix} ⌟*
│ - Modo: *${IDBQ.self ? 'Privado' : 'Publico'}*${IDBQ.isJadi ? `
│ - Bot Original: https://wa.me/${Oogway.botNumber}` : ''}
│ - ∞≠El ayer es historia,el mañana es un misterio y el hoy es un obsequio,por eso se llama presente✨✨

\t\t\t∆user info∆

│ - Nombre: *${v.pushName}*
│ - Bio: *${bio}*
│ - Rango: *${rank}*
│ - Balance: *$${bal}*
͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏
\t\t\t∆comandos∆

\t●VIP●
- ${prefix}join <link>${!inky.isJadi ? `
- ${prefix}serbot` : ''}

\t●GRUPOS●
- ${prefix}antilink <0/1>
- ${prefix}antiviewonce <0/1>${!inky.isJadi ? `
- ${prefix}welcome <0/1>` : ''}
- ${prefix}promote / ${prefix}demote
- ${prefix}kick
- ${prefix}linkgc
- ${prefix}random

\t●ECONOMIA●
- ${prefix}balance${!IDBQ.isJadi ? `
- ${prefix}transferir <monto> <@usuario>`: ''}
- ${prefix}top
- ${prefix}shop

\t●JUEGOS●${!IDBQ.isJadi ? `
- ${prefix}blackjack <monto>` : ''}
- ${prefix}casino <monto>

\t●CONVERTIDOR●
- ${prefix}sticker
- ${prefix}robar <texto>
- ${prefix}toimg
- ${prefix}tomp3

\t●DESCARGAS●
- ${prefix}play <texto>
- ${prefix}tiktok <link>
- ${prefix}igdl <link>
${isStaff ? `
\t●STAFF●
- ${prefix}mode <public/self>${!inky.isJadi ? `
- ${prefix}addvip / ${prefix}delvip
- ${prefix}save <texto>
- ${prefix}delfile <texto>` : ''}
- ${prefix}storage
- ${prefix}send <texto>
`: ''}${isOwner ? `
\t●👑OWNER👑●
- ${prefix}bc <texto>
- ${prefix}addbal <monto> / ${prefix}delbal <monto>
` : ''}
\t\t╔════ ∞∞ ࿇ ∞∞ ════╗
\t\t\t\t\t࿇𖣐${botName}©࿇
\t\t╚════ ♪♠ ࿇ ♠♪ ════╝`
var footer = `│ ➼ ${fake}\n│ ➼ Runtime: ${runtime(process.uptime())}`
var buttons = [
	{urlButton: {displayText: 'Grupo de Soporte', url: groupSupport}},
	{quickReplyButton: {displayText: '👑 Creador 👑', id: prefix + 'creador'}}
]
replyTempImg(teks, footer, buttons)
break

case 'dueño':
case 'creador':
case 'creator':
case 'owner':
await v.react('✨')

	

v.replyContact('IDBQ', 'Creador de ' + botName, '595984664076') break


case 'del':
case 'delete':
await v.react('✨')
if (!v.quoted) return v.reply('Responda a un mensaje del bot, con el comando ' + prefix + command)
if (!v.quoted.fromMe) return v.reply('Solo puedo borrar mensajes enviados por mi')
if (v.isGroup && !isGroupAdmins) return v.reply(mess.only.admins)
await v.quoted.delete()
break

case 'viewonce':
await v.react('✨')
if (!isQuotedViewOnce) return
var teks = `\t\t\t\t*AntiViewOnce*\n\n│ - *Enviado por:* @${v.quoted.sender.split('@')[0]}\n│ ➼ *Texto:* ${v.quoted.msg.caption ? v.quoted.msg.caption : 'Sin Texto'}`
var jids = [v.quoted.sender]
v.quoted.mentionUser.map(x => jids.push(x))
if (v.quoted.msg.type === 'imageMessage') {
	var nameJpg = getRandom('')
	v.replyImg(await v.quoted.download(nameJpg), teks, {mentions: jids})
	await fs.unlinkSync(nameJpg + '.jpg')
} else if (v.quoted.msg.type === 'videoMessage') {
	var nameMp4 = getRandom('')
	v.replyVid(await v.quoted.download(nameMp4), teks, {mentions: jids})
	await fs.unlinkSync(nameMp4 + '.mp4')
}
break

/*
	Vip
*/

case 'join':
await v.react('✨')
var none = () => {
	v.reply(mess.wait)
	inky.groupAcceptInvite(q.split('chat.whatsapp.com/')[1])
		.then(x => {
		v.reply('He ingresado exitosamente al grupo')
		v.reply('He sido añadido al grupo por pedido de @' + senderNumber, x)
	})
		.catch(e => v.reply('No he podido ingresar al grupo, verifique que el enlace funcione'))
}
if (isVip) {
	if (!q) return v.reply('Ingrese el enlace del grupo')
	if (!isUrl(q) && !q.includes('whatsapp.com')) return v.reply('Link invalido')
	none()
} else {
	if (userBal < 10000) return v.reply('Necesitas *$10 K* para usar este comando')
	if (!q) return v.reply('Ingrese el enlace del grupo')
	if (!isUrl(q) && !q.includes('whatsapp.com')) return v.reply('Link invalido')
	removeBal(senderNumber, 10000)
	v.reply('Ha sido debitado de su cuenta *$10k*')
	none()
}
break

case 'serbot':
if (IDBQ.isJadi) return v.react('❌')
v.reply('Comando en mantenimiento...')
break

/*
	Grupo
*/

case 'antilink':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!q) return v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
if (Number(q) === 1) {
	if (isAntiLink) return v.reply('El antilink ya estaba activo')
	antilink.push(v.chat)
	fs.writeFileSync('./database/group/antilink.json', Json(antilink))
	v.reply('Se ha activado el antilink')
} else if (Number(q) === 0) {
	if (!isAntiLink) return v.reply('El antilink ya estaba desactivado')
	antilink.splice(v.chat)
	fs.writeFileSync('./database/group/antilink.json', Json(antilink))
	v.reply('Se ha desactivado el antilink')
} else {
	v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
}
break

case 'welcome':
if (IDBQ.isJadi) return v.react('❌')
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!q) return v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
if (Number(q) === 1) {
	if (isWelcome) return v.reply('El mensaje de bienvenida ya estaba activo')
	welcome.push(v.chat)
	fs.writeFileSync('./database/group/welcome.json', Json(welcome))
	v.reply('Se ha activado el mensaje de bienvenida')
} else if (Number(q) === 0) {
	if (!isWelcome) return v.reply('El mensaje de bienvenida ya estaba desactivado')
	welcome.splice(v.chat)
	fs.writeFileSync('./database/group/welcome.json', Json(welcome))
	v.reply('Se ha desactivado el mensaje de bienvenida')
} else {
	v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
}
break

case 'antiviewonce':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!q) return v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
if (Number(q) === 1) {
	if (isAntiViewOnce) return v.reply('El antiviewonce ya estaba activo')
	antiviewonce.push(v.chat)
	fs.writeFileSync('./database/group/antiviewonce.json', Json(antiviewonce))
	v.reply('Se ha activado el antiviewonce')
} else if (Number(q) === 0) {
	if (!isAntiViewOnce) return v.reply('El antiviewonce ya estaba desactivado')
	antiviewonce.splice(v.chat)
	fs.writeFileSync('./database/group/antiviewonce.json', Json(antiviewonce))
	v.reply('Se ha desactivado el antiviewonce')
} else {
	v.reply(`Use *${prefix + command} 1* para activarlo o *${prefix + command} 0* para desactivarlo`)
}
break

case 'promote':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!isBotAdmin) return v.reply(mess.only.badmin)
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (v.sender === v.mentionUser[0]) return v.reply('No puede promotearse usted mismo')
if (groupAdmins.includes(v.mentionUser[0])) return v.reply(`El usuario @${v.mentionUser[0].split('@')[0]} ya es administrador`, {mentions: [v.mentionUser[0], v.sender]})
inky.groupParticipantsUpdate(v.chat, [v.mentionUser[0]], 'promote')
	.then(x => v.reply(`Ha sido promovido a @${v.mentionUser[0].split('@')[0]} como administrador por @${senderNumber}`, {mentions: [v.mentionUser[0], v.sender]}))
	.catch(e => v.reply(e))
break

case 'demote':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!isBotAdmin) return v.reply(mess.only.badmin)
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (v.sender === v.mentionUser[0]) return v.reply('No puede demotearse usted mismo')
if (!groupAdmins.includes(v.mentionUser[0])) return v.reply(`El usuario @${v.mentionUser[0].split('@')[0]} no es administrador`, {mentions: [v.mentionUser[0], v.sender]})
inky.groupParticipantsUpdate(v.chat, [v.mentionUser[0]], 'demote')
	.then(x => v.reply(`Ha sido removido a @${v.mentionUser[0].split('@')[0]} como administrador por @${senderNumber}`, {mentions: [v.mentionUser[0], v.sender]}))
	.catch(e => v.reply(e))
break

case 'kick':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!isBotAdmin) return v.reply(mess.only.badmin)
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (v.sender === v.mentionUser[0]) return v.reply('No puede kickearse usted mismo')
if (owner.includes(v.mentionUser[0].split('@')[0])) return v.reply('No es posible eliminar a un owner del bot')
if (groupAdmins.includes(v.mentionUser[0])) return v.reply('No es posible eliminar a un administrador')
inky.groupParticipantsUpdate(v.chat, [v.mentionUser[0]], 'remove')
	.then(x => v.reply(`Ha sido eliminado @${v.mentionUser[0].split('@')[0]} del grupo por @${senderNumber}`, {mentions: [v.mentionUser[0], v.sender]}))
	.catch(e => v.reply(e))
break

case 'linkgc':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
var code = await inky.groupInviteCode(v.chat)
v.reply('\t\t\tLink del grupo *' + groupMetadata.subject + '*\n│ ➼ https://chat.whatsapp.com/' + code)
break

case 'random':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
var none = Math.floor(Math.random() * groupMembers.length + 0)
var user = groupMembers[none].id
v.reply('Ha sido elegido @' + user.split('@')[0], {mentions: [user]})
break

case 'hidetag':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
var jids = []
groupMembers.map(x => jids.push(x.id))
v.reply(q, {mentions: jids})
break

case 'tagall':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
var jids = []
groupMembers.map(x => jids.push(x.id))
var teks = `\t\t\t\t\t*${groupMetadata.subject}*\n\n➫ *Total de admins:* ${groupAdmins.length}\n➫ *Total de miembros:* ${groupMembers.length}\n`
for (let x of jids) {
	teks += `\n| ➼ @${x.split('@')[0]}`
}
v.reply(teks, {mentions: jids})
break

/*
	Economia
*/

case 'bal':
case 'balance':
case 'money':
case 'dinero':
case 'plata':
case 'guita':
await v.react('✨')
v.reply(`\t\t\t*${botName} Balance*

│ - Usuario: *@${senderNumber}*
│ - Balance: *$${bal}*${isNaN(bal) ? ` (${userBal})` : ''}
│ - Rango: *${rank}*`)
break

case 'transfer':
case 'transferir':
if (IDBQ.isJadi) return v.react('❌')
await v.react('✨')
if (!q) return v.reply('Ingrese el monto que desea transferir')
if (isNaN(args[0])) return v.reply('El monto ingresado debe de ser un numero')
if (v.mentionUser[0] === undefined) return v.reply('Mencione al usuario que desea transferirle')
if (args[0] < 100) return v.reply('Monto minimo para transferir es de $100')
if (args[0].includes('.')) return v.reply('No se puede jugar con numero decimales')
if (userBal < args[0]) return v.reply('No tienes suficiente dinero')
addBal(v.mentionUser[0].split('@')[0], Number(args[0]))
removeBal(senderNumber, Number(args[0]))
v.reply(`\t\t\t${botName} Transfer\n\n│ ➼ Transferido de: @${senderNumber}\n│ ➼ Transferido a: @${v.mentionUser[0].split('@')[0]}\n│ ➼ Monto: $${h2k(args[0])} (${args[0]})`, {mentions: [v.mentionUser[0], v.sender]})
break

case 'top':
case 'baltop':
case 'topbal':
await v.react('✨')
var none = JSON.parse(fs.readFileSync('./database/user/money.json'))
var teks = '\t\t\t\t\t*' + botName + ' Top Bal*'
none.sort((a, b) => (a.money < b.money) ? 1 : -1)
let jidsTop = []
var total = 10
var userRank = (user) => {
	if (owner.includes(user)) {var rankS = '👑 Owner 👑'} else if (staff.includes(user)) {var rankS = '🎮 Staff 🎮'} else if (vip.includes(user)) {var rankS = '✨ Vip ✨'} else {var rankS = 'Usuario'}
	return rankS
}
if (none.length < 10) total = none.length
for (let i = 0; i < total; i++) {
	teks += `\n\n${i + 1}.  @${none[i].id}\n\t\t│ ➼ Balance: *$${h2k(none[i].money)}*\n\t\t│ ➼ Rango: *${userRank(none[i].id)}*`
	jidsTop.push(none[i].id + '@s.whatsapp.net')
}
v.reply(teks, {mentions: jidsTop})
break

case 'shop':
case 'tienda':
await v.react('✨')
var teks = `\t\t\t${botName} Shop

\t\t\t\t\t* /Rangos\ *

╭───── *✨ Vip ✨* ─────
│ \t${isVip ? '*Ya tienes el rango ✨ Vip ✨*' : 'Usa *' + prefix + command + ' vip* para comprar el rango *✨ Vip ✨*'}
│ - *Precio:* _$750K_
│ - *Ventajas:*
│ \t\t- Acceso al comando *${prefix}join* gratis${!IDBQ.isJadi ? `
│ \t\t- Acceso al comando *${prefix}serbot*` : ''}
╰───────────────╮

│ - Usuario: *@${senderNumber}*
│ - Balance: *$${bal}*
│ - Rango: *${rank}*

Para comprar un articulo use *${prefix + command} <articulo>*`
if (q.toLowerCase().includes('vip')) {
	if (isVip) return v.reply('Usted ya tiene el rango *✨ Vip ✨*')
	if (userBal < 750000) return v.reply('No tienes suficiente dinero para comprar el rango *✨ Vip ✨*')
	removeBal(senderNumber, 750000)
	vip.push(senderNumber)
	fs.writeFileSync('./database/user/vip.json', Json(vip))
	v.reply('@' + senderNumber + ' has comprado exitosamente el rango *✨ Vip ✨*, espero que lo disfrutes :D')
} else {
	v.reply(teks)
}
break

/*
	Juego
*/

case 'bj':
case 'blackjack':
if (IDBQ.isJadi) return v.react('❌')
await v.react('✨')
if (isBJFrom(bj, v.chat) ? isBJPlayer(bj, v.sender) : false) return v.reply('Ya tienes un juego en curso')
if (!isOwner) {
	if (isSpamBJ(senderNumber)) return v.reply('Espere 25 segundos para jugar de nuevo')
}
if (!q) return v.reply(`Ingrese un monto, ejemplo: ${prefix + command} <monto>`)
if (isNaN(q)) return v.reply('El monto tiene que ser un numero')
if (q < 100) return v.reply('Monto minimo debe de ser de 100$')
if (q.includes('.')) return v.reply('No se puede jugar con numero decimales')
if (!isOwner) {
	if (isVip) {
		if (q > 100000) return v.reply('Maximo para apostar es de *$100K*')
	} else{
		if (q > 5000) return v.reply('Maximo para apostar es de *$5K*')
	}
}
if (userBal < q) return v.reply('No puedes jugar,nde sogue')
if (isOwner) {
	var obj = {id: v.sender, from: v.chat, balance: q, pHand: [10, 11], bHand: [(drawRandomCard() - 1), drawRandomCard()]}
} else {
	var obj = {id: v.sender, from: v.chat, balance: q, pHand: [(drawRandomCard() - 1), drawRandomCard()], bHand: [(drawRandomCard() - 1), drawRandomCard()]}
}
bj.push(obj)
removeBal(senderNumber, Number(q))
inky.sendMessage(v.chat, { text: `*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bj[position(bj, v.chat, v.sender)].pHand)}*\n\n🃏 Usa *Hit* o *Stand* 🃏`, footer: `Apuesta: *$${h2k(getHandValue(bj[position(bj, v.chat, v.sender)].balance).slice(1))}*\nBalance: *$${h2k(userBal-getHandValue(bj[position(bj, v.chat, v.sender)].balance))}*`, buttons: [{buttonId: 'bHit', buttonText: {displayText: 'Hit'}, type: 1}, {buttonId: 'bStand', buttonText: {displayText: 'Stand'}, type: 1}], headerType: 1, mentions: [v.sender] }, { quoted: v })
break

case 'casino':
await v.react('✨')
if (!q) return v.reply(`Ingrese un monto, ejemplo: ${prefix + command} <monto>`)
if (isNaN(q)) return v.reply('El monto tiene que ser un numero')
if (q < 50) return v.reply('Monto minimo debe de ser de 50$')
if (q.includes('.')) return v.reply('No se puede jugar con numero decimales')
if (!isOwner) {
	if (q > 5000) return v.reply('Maximo para apostar es de *$5K*')
}
if (userBal < q) return v.reply('No tienes suficiente dinero')
if (isOwner) {
	var deck = ['10']
} else {
	var deck = ['5', '5', '10', '5', '5']
}
var ran = deck[Math.floor(Math.random() * deck.length)]
var fail = ['🍊 : 🍒 : 🍐', '🍒 : 🔔 : 🍊', '🍊 : 🍋 : 🔔', '🔔 : 🍒 : 🍐', '🔔 : 🍒 : 🍊', '🍊 : 🍋 : 🔔', '🍐 : 🍒 : 🍋', '🍊 : 🍒 : 🍒', '🔔 : 🔔 : 🍇', '🍌 : 🍒 : 🔔', '🍐 : 🔔 : 🔔', '🍊 : 🍋 : 🍒', '🍋 : 🍋 : 🍌', '🔔 : 🔔 : 🍇', '🔔 : 🍐 : 🍇']
var win = ['🍇 : 🍇 : 🍇', '🍐 : 🍐 : 🍐', '🔔 : 🔔 : 🔔', '🍒 : 🍒 : 🍒', '🍊 : 🍊 : 🍊', '🍌 : 🍌 : 🍌']
var fail1 = fail[Math.floor(Math.random() * fail.length)]
var fail2 = fail[Math.floor(Math.random() * fail.length)]
var win1 = win[Math.floor(Math.random() * win.length)]     
if (ran < 10) {
	var teks = `╭─╼┥${botName}┝╾─╮\n╽ ┌──────────┐ ┃\n\t\t\t\t\t🍋 : 🍌 : 🍍\n┃ ├──────────┤ ┃\n\t\t\t\t\t${fail1}\n┃ ├──────────┤ ┃\n\t\t\t\t\t${fail2}\n╿ └──────────┘ ╿\n╰──┥${botName}┠──╯\n\nHas perdido $${h2k(q)}`
	removeBal(senderNumber, Number(q))
} else {
	var teks = `╭─╼┥${botName}┝╾─╮\n╽ ┌──────────┐ ┃\n\t\t\t\t\t🍋 : 🍌 : 🍍\n┃ ├──────────┤ ┃\n\t\t\t\t\t${win1}\n┃ ├──────────┤ ┃\n\t\t\t\t\t${fail1}\n╿ └──────────┘ ╿\n╰──┥${botName}┠──╯\n\nFelicidades has ganado $${h2k((q * 5))}`
	addBal(senderNumber, (Number(q) * 5))
}
v.reply(teks)
break

/*
	Convertidor
*/

case 's':
case 'stik':
case 'stiker':
case 'sticker':
await v.react('✨')
if ((v.type === 'imageMessage') || isQuotedImage) {
	v.reply(mess.wait)
	var nameJpg = getRandom('')
	isQuotedImage ? await v.quoted.download(nameJpg) : await v.download(nameJpg)
	var stik = await imageToWebp(nameJpg + '.jpg')
	writeExif(stik, {packname: 'ღ ' + v.pushName + ' 乂 ' + senderNumber + ' ღ', author: ''})
		.then(x => v.replyS(x))
} else if ((v.type === 'videoMessage') || isQuotedVideo) {
	v.reply(mess.wait)
	var nameMp4 = getRandom('')
	isQuotedVideo ? await v.quoted.download(nameMp4) : await v.download(nameMp4)
	var stik = await videoToWebp(nameMp4 + '.mp4')
	writeExif(stik, {packname: 'ღ ' + v.pushName + ' 乂 ' + senderNumber + ' ღ', author: ''})
		.then(x => v.replyS(x))
} else {
	v.reply('Responda a una imagen o video con el comando ' + prefix + command)
}
break

case 'robar':
await v.react('✨')
if (!isQuotedSticker) return v.reply('Responda a un sticker con el comando ' + prefix + command + ' <texto>')
var pack = q.split('|')[0]
var author = q.split('|')[1]
v.reply(mess.wait)
var nameWebp = getRandom('')
var media = await v.quoted.download(nameWebp)
await writeExif(media, {packname: pack, author: author})
	.then(x => v.replyS(x))
await fs.unlinkSync(nameWebp + '.webp')
break

case 'inkys':
await v.react('✨')
if (!isQuotedSticker) return v.reply('Responda a un sticker con el comando ' + prefix + command)
v.reply(mess.wait)
var nameWebp = getRandom('')
var media = await v.quoted.download(nameWebp)
await writeExif(media)
	.then(x => v.replyS(x))
fs.unlinkSync(nameWebp + '.webp')
break

case 'toimg':
await v.react('✨')
if (!isQuotedSticker) return v.reply('Responda a un sticker con el comando ' + prefix + command)
v.reply(mess.wait)
var nameWebp = getRandom('')
var nameJpg = getRandom('.jpg')
await v.quoted.download(nameWebp)
exec(`ffmpeg -i ${nameWebp}.webp ${nameJpg}`, async(err) => {
	fs.unlinkSync(nameWebp + '.webp')
	if (err) return v.reply(String(err))
	await v.replyImg(fs.readFileSync(nameJpg))
	fs.unlinkSync(nameJpg)
})
break

case 'tomp3':
await v.react('✨')
if (!isQuotedVideo) return v.reply('Responda a un video con el comando ' + prefix + command)
v.reply(mess.wait)
var nameMp4 = getRandom('')
var nameMp3 = getRandom('.mp3')
await v.quoted.download(nameMp4)
exec(`ffmpeg -i ${nameMp4}.mp4 ${nameMp3}`, async(err) => {
	fs.unlinkSync(nameMp4)
	if (err) return v.reply(String(err))
	await v.replyAud(fs.readFileSync(nameMp3))
	fs.unlinkSync(nameMp3)
})
break

/*
	Search
*/

case 'ssweb':
await v.react('✨')
if (!q) return v.reply('Use ' + prefix + command + ' <link>')
if (!isUrl(args[0])) return v.reply('Use ' + prefix + command + ' <link>')
v.reply(mess.wait)
var browser = await puppeteer.launch()
var page = await browser.newPage()
await page.setViewport({
	width: 1280,
	height: 720
})
await page.goto(args[0])
await page.waitForTimeout(1500)
await v.replyImg(await page.screenshot(), fake)
break

/*
	Descarga
*/

case 'play':
await v.react('✨')
if (!q) return v.reply('Use *' + prefix + command + ' <texto>*')
var play = await yts(q)
var teks = `\t\t\t► ${botName} Youtube

ღ *Titulo:* ${play.all[0].title}
ღ *Duracion:* ${play.all[0].timestamp}
ღ *Visitas:* ${h2k(play.all[0].views)}
ღ *Author:* ${play.all[0].author.name}`
var buttons = [
	{urlButton: {displayText: '🔗 Link del Video 🔗', url: play.all[0].url}},
	{quickReplyButton: {displayText: '🎵 Audio 🎵', id: prefix + 'ytmp3 ' + play.all[0].url}},
	{quickReplyButton: {displayText: '🎬 Video 🎬', id: prefix + 'ytmp4 ' + play.all[0].url}}
]
var buffer = await getBuffer(play.all[0].image)
replyTempImg(teks, fake, buttons, buffer)
break

case 'tiktok':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('tiktok.com')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.ttdownloader(q)
	.then(x => v.replyVid({url: x.nowm}, fake))
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'igdl':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('instagram.com')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.igdl(q)
	.then(x => v.replyVid({url: x.medias[0].url}, fake))
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'ytmp3':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('youtu')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(async(x) => {
	await v.replyAud({url: x.mp3}, {ptt: true})
	v.replyDoc({url: x.mp3}, {mimetype: 'audio/mpeg', filename: x.title + '.mp3'})
})
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'ytmp4':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('youtu')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(x => v.replyVid({url: x.link}, fake))
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

/*
	Staff
*/

case 'bc':
if (!isOwner) return v.react('❌')
await v.react('✨')
var getGroups = await inky.groupFetchAllParticipating()
var groupsID = Object.entries(getGroups).slice(0).map(x => x[1]).map(x => x.id)
for (let id of groupsID) {
	var jids = []
	var groupMdata = await inky.groupMetadata(id)
	var groupMem = groupMdata.participants
	groupMem.map(x => jids.push(x.id))
	v.reply(`\t\t\t\t*${botName} BroadCast*\n\n${q}`, {id: id, mentions: jids})
}
break

case 'mode':
if (!isStaff) return v.react('❌')
await v.react('✨')
if (q.toLowerCase() === 'public') {
	if (!inky.self) return v.reply('Ya estaba activo el modo publico')
	inky.self = false
	v.reply('Se ha activado el modo publico')
} else if (q.toLowerCase() === 'self') {
	if (inky.self) return v.reply('Ya estaba activo el modo privado')
	inky.self = true
	v.reply('Se ha activado el modo privado')
} else {
	v.reply('Use *' + prefix + command + ' <public/self>*')
}
break

case 'addbal':
if (!isOwner) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (isNaN(args[0])) return v.reply('El monto tiene que ser un numero')
addBal(v.mentionUser[0].split('@')[0], Number(q))
v.reply(`\t\t\tDeposito de dinero\n\n│ ➼ Monto: $${h2k(args[0])}\n│ ➼ Usuario: @${v.mentionUser[0].split('@')[0]}`, {mentions: [v.mentionUser[0]]})
break

case 'delbal':
if (!isOwner) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (isNaN(args[0])) return v.reply('El monto tiene que ser un numero')
if ((checkBal(v.mentionUser[0].split('@')[0]) ? checkBal(v.mentionUser[0].split('@')[0]) : '0') < args[0]) return v.reply('El usuario no cuenta con suficiente dinero')
removeBal(v.mentionUser[0].split('@')[0], Number(q))
v.reply(`\t\t\tDescuento de dinero\n\n│ ➼ Monto: $${h2k(args[0])}\n│ ➼ Usuario: @${v.mentionUser[0].split('@')[0]}`, {mentions: [v.mentionUser[0]]})
break

case 'addvip':
if (!isOwner) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (vip.includes(v.mentionUser[0].split('@')[0])) return v.reply('El usuario ya tiene el rango *✨ Vip ✨*')
vip.push(v.mentionUser[0].split('@')[0])
await fs.writeFileSync('./database/user/vip.json', Json(vip))
v.reply('Ha sido agregado el rango *✨ Vip ✨* a @' + v.mentionUser[0].split('@')[0], {mentions: [v.sender, v.mentionUser[0]]})
break

case 'delvip':
if (!isOwner) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (v.mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (!vip.includes(v.mentionUser[0].split('@')[0])) return v.reply('El usuario no es usuario *✨ Vip ✨*')
vip.splice(v.mentionUser[0].split('@')[0])
await fs.writeFileSync('./database/user/vip.json', Json(vip))
v.reply('Ha sido removido el rango *✨ Vip ✨* de @' + v.mentionUser[0].split('@')[0], {mentions: [v.sender, v.mentionUser[0]]})
break

case 'save':
if (!isStaff) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (!q) return v.reply('Nombre para el archivo?')
if (!v.quoted) return v.reply('Responde a un archivo para guardarlo')
var sFiles = new Array({ sticker: fs.readdirSync('./media/sticker'), audio: fs.readdirSync('./media/audio'), image: fs.readdirSync('./media/image'), video: fs.readdirSync('./media/video') })
if (isQuotedSticker) {
	if (sFiles[0].sticker.includes(q + '.webp')) return v.reply('Ya existe un sticker con ese nombre')
	var nameWebp = getRandom('')
	var media = await v.quoted.download(nameWebp)
	await fs.writeFileSync(`./media/sticker/${q}.webp`, media)
	fs.unlinkSync(nameWebp + '.webp')
	v.reply('Sticker guardado exitosamente')
} else if (isQuotedAudio) {
	if (sFiles[0].audio.includes(q + '.mp3')) return v.reply('Ya existe un audio con ese nombre')
	var nameMp3 = getRandom('')
	var media = await v.quoted.download(nameMp3)
	await fs.writeFileSync(`./media/audio/${q}.mp3`, media)
	fs.unlinkSync(nameMp3 + '.mp3')
	v.reply('Audio guardado exitosamente')
} else if (isQuotedImage) {
	if (sFiles[0].image.includes(q + '.jpg')) return v.reply('Ya existe una imagen con ese nombre')
	var nameJpg = getRandom('')
	var media = await v.quoted.download(nameJpg)
	await fs.writeFileSync(`./media/image/${q}.jpg`, media)
	fs.unlinkSync(nameJpg + '.jpg')
	v.reply('Imagen guardado exitosamente')
} else if (isQuotedVideo) {
	if (sFiles[0].video.includes(q + '.mp4')) return v.reply('Ya existe un video con ese nombre')
	var nameMp4 = getRandom('')
	var media = await v.quoted.download(nameMp4)
	await fs.writeFileSync(`./media/video/${q}.mp4`, media)
	fs.unlinkSync(nameMp4 + '.mp4')
	v.reply('Video guardado exitosamente')
} else {
	v.reply('Responde a un archivo para guardarlo')
}
break

case 'storage':
await v.react('✨')
var sFiles = new Array({ sticker: fs.readdirSync('./media/sticker'), audio: fs.readdirSync('./media/audio'), image: fs.readdirSync('./media/image'), video: fs.readdirSync('./media/video') })
teks = `\t\t\t\t${botName} Storage\n\nღ *Stickers* (${(sFiles[0].sticker.length - 1)})\n`
if (sFiles[0].sticker.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].sticker) {
	if (!(x === '@IDBQ')) {
		teks += `\n│ ➼ ${x.replace('.webp', '')}`
	}
}
teks += `\n\nღ *Audios* (${(sFiles[0].audio.length - 1)})\n`
if (sFiles[0].audio.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].audio) {
	if (!(x === '@IDBQ')) {
		teks += `\n│ ➼ ${x.replace('.mp3', '')}`
	}
}
teks += `\n\nღ *Imagenes* (${(sFiles[0].image.length - 1)})\n`
if (sFiles[0].image.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].image) {
	if (!(x === '@IDBQ')) {
		teks += `\n│ ➼ ${x.replace('.jpg', '')}`
	}
}
teks += `\n\nღ *Videos* (${(sFiles[0].video.length - 1)})\n`
if (sFiles[0].video.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].video) {
	if (!(x === '@IDBQ')) {
		teks += `\n│ ➼ ${x.replace('.mp4', '')}`
	}
}
teks += `\n\nUse *${prefix}send <nombre del archivo>* para visualizarlo${!inky.isJadi ? `\n\nUse *${prefix}delfile <nombre del archivo>* para eliminarlo` : ''}`
v.reply(teks)
break

case 'send':
await v.react('✨')
var sFiles = new Array({ sticker: fs.readdirSync('./media/sticker'), audio: fs.readdirSync('./media/audio'), image: fs.readdirSync('./media/image'), video: fs.readdirSync('./media/video') })
if ((sFiles[0].sticker.includes(q + '.webp')) || (sFiles[0].audio.includes(q + '.mp3')) || (sFiles[0].image.includes(q + '.jpg')) || (sFiles[0].video.includes(q + '.mp4'))) {
	if (sFiles[0].sticker.includes(q + '.webp')) {
		v.replyS(fs.readFileSync('./media/sticker/' + q + '.webp'))
	}
	if (sFiles[0].audio.includes(q + '.mp3')) {
		v.replyAud(fs.readFileSync('./media/audio/' + q + '.mp3'), {ptt: true})
	}
	if (sFiles[0].image.includes(q + '.jpg')) {
		v.replyImg(fs.readFileSync('./media/image/' + q + '.jpg'), fake)
	}
	if (sFiles[0].video.includes(q + '.mp4')) {
		v.replyVid(fs.readFileSync('./media/video/' + q + '.mp4'), fake)
	}
} else {
	v.reply('No existe ningun archivo con ese nombre')
}
break

case 'delfile':
if (!isStaff) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
var sFiles = new Array({ sticker: fs.readdirSync('./media/sticker'), audio: fs.readdirSync('./media/audio'), image: fs.readdirSync('./media/image'), video: fs.readdirSync('./media/video') })
if ((sFiles[0].sticker.includes(q + '.webp')) || (sFiles[0].audio.includes(q + '.mp3')) || (sFiles[0].image.includes(q + '.jpg')) || (sFiles[0].video.includes(q + '.mp4'))) {
	if (sFiles[0].sticker.includes(q + '.webp')) {
		await fs.unlinkSync('./media/sticker/' + q + '.webp')
		v.reply('Sticker eliminado exitosamente')
	}
	if (sFiles[0].audio.includes(q + '.mp3')) {
		await fs.unlinkSync('./media/audio/' + q + '.mp3')
		v.reply('Audio eliminado exitosamente')
	}
	if (sFiles[0].image.includes(q + '.jpg')) {
		await fs.unlinkSync('./media/image/' + q + '.jpg')
		v.reply('Imagen eliminado exitosamente')
	}
	if (sFiles[0].video.includes(q + '.mp4')) {
		await fs.unlinkSync('./media/video/' + q + '.mp4')
		v.reply('Video eliminado exitosamente')
	}
} else {
	v.reply('No existe ningun archivo con ese nombre')
}
break

			default:
				
				if (isOwner) {
					if (v.body.startsWith('x')) {
						try {
							v.reply(Json(eval(q)))
						} catch(e) {
							v.reply(String(e))
						}
					}
					if (v.body.startsWith('>')) {
						try {
							v.reply(util.format(await eval(`(async () => {${v.body.slice(1)}})()`)))
						} catch(e) {
							v.reply(util.format(e))
						}
					}
					if (v.body.startsWith('$')) {
						exec(v.body.slice(1), (err, stdout) => {
							if (err) return v.reply(err)
							if (stdout) return v.reply(stdout)
						})
					}
				}
				
				if (v.body.toLowerCase().includes('teta')) {
					v.replyS(fs.readFileSync('./media/sticker/Tetas♡.webp'))
				}
				if (v.body.toLowerCase().startsWith('bot')) {
					var none = await fetchJson(`https://api.simsimi.net/v2/?text=${v.body.slice(3)}&lc=es`)
					v.reply(none.success)
				}
				
				if (isCmd) {
					v.react('❌')
				}
				
				if (v.body.toLowerCase().startsWith('hit') || buttonsResponseID.includes('bHit')) {
					if (!(isBJFrom(bj, v.chat) ? isBJPlayer(bj, v.sender) : false)) return
					await v.react('✨')
					var bjPosition = bj[position(bj, v.chat, v.sender)]
					bjPosition.pHand.push(drawRandomCard())
					if (getHandValue(bjPosition.bHand) <= 10) {
						bjPosition.bHand.push(drawRandomCard())
					}
					if (getHandValue(bjPosition.pHand) > 21) {
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Has perdido $${h2k(bjPosition.balance)}* 🃏`)
						bj.splice(bj.indexOf(bjPosition), 1)
						addSetBJ(senderNumber)
					} else {
						inky.sendMessage(v.chat, { text: `*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n\n🃏 Usa *Hit* o *Stand* 🃏`, footer: `Apuesta: *$${h2k(bjPosition.balance)}*\nBalance: *$${bal}*`, buttons: [{buttonId: 'bHit', buttonText: {displayText: 'Hit'}, type: 1}, {buttonId: 'bStand', buttonText: {displayText: 'Stand'}, type: 1}], headerType: 1, mentions: [v.sender] }, { quoted: v })
					}
				}
				if (v.body.toLowerCase().startsWith('stand') || buttonsResponseID.includes('bStand')) {
					if (!(isBJFrom(bj, v.chat) ? isBJPlayer(bj, v.sender) : false)) return
					await v.react('✨')
					var bjPosition = bj[position(bj, v.chat, v.sender)]
					bj.splice(bj.indexOf(bjPosition), 1)
					addSetBJ(senderNumber)
					if (getHandValue(bjPosition.pHand) < getHandValue(bjPosition.bHand)) {
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Has perdido $${h2k(bjPosition.balance)}* 🃏`)
					} else if (getHandValue(bjPosition.pHand) === getHandValue(bjPosition.bHand)) {
						var result = Number(bjPosition.balance)
						addBal(senderNumber, result)
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Ha sido un empate* 🃏`)
					} else {
						var result = Number(bjPosition.balance)*2
						addBal(senderNumber, result)
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de @${senderNumber}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Felicidades has ganado $${h2k(result)}* 🃏`)
					}
				}
				
		}
		
	} catch (e) {
		const isError = String(e)
		
		inky.sendMessage(owner[0] + '@s.whatsapp.net', { text: isError }, { quoted: v })
		console.log(e)
	}
}
