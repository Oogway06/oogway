require('../config')

/*
	Libreria
*/

const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, makeInMemoryStore, getContentType } = require('@adiwajshing/baileys')
const P = require('pino')
const { exec } = require('child_process')
const fs = require('fs')
const hx = require('hxz-api')
const util = require('util')
const yts = require('yt-search')

/*
	Js
*/

const bj = []

const { imageToWebp, videoToWebp, writeExif } = require('../lib/exif')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep } = require('../lib/functions')
const { addUser, addBal, checkBal, checkBalReg, removeBal } = require('../lib/money')
const { sms } = require('../lib/simple')

const { drawRandomCard, getHandValue, position, isBJFrom, isBJPlayer } = require('../lib/game/blackjack')

/*
	Database
*/

// Usuario
const vip = JSON.parse(fs.readFileSync('./database/user/vip.json'))
const money = JSON.parse(fs.readFileSync('./database/user/money.json'))

// Grupo
const antiviewonce = JSON.parse(fs.readFileSync('./database/group/antiviewonce.json'))
const antilink = JSON.parse(fs.readFileSync('./database/group/antilink.json'))

module.exports = async(inky, v, store) => {
	try {
		v = sms(inky, v)
		if (v.isBaileys) return
		
		const isCmd = v.body.startsWith(prefix)
		const command = isCmd ? v.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
		const commandStik = (v.type === 'stickerMessage') ? v.msg.fileSha256.toString('base64') : ''
		
		const quotedMention = v.msg.contextInfo != null ? v.msg.contextInfo.participant : ''
		const tagMention = v.msg.contextInfo != null ? v.msg.contextInfo.mentionedJid : []
		const mention = typeof(tagMention) == 'string' ? [tagMention] : tagMention
		mention != undefined ? mention.push(quotedMention) : []
		const mentionUser = mention != undefined ? mention.filter(x => x) : []
		
		const args = v.body.trim().split(/ +/).slice(1)
		const q = args.join(' ')
		const senderNumber = v.sender.split('@')[0]
		const botNumber = inky.user.id.split(':')[0]
		const userBal = checkBalReg(senderNumber) ? checkBal(senderNumber) : '0'
		try { var bio = (await inky.fetchStatus(v.sender)).status } catch { var bio = 'Sin Bio' }
		const bal = h2k(userBal)
		
		const groupMetadata = v.isGroup ? await inky.groupMetadata(v.chat) : {}
		const groupMembers = v.isGroup ? groupMetadata.participants : []
		const groupAdmins = v.isGroup ? getGroupAdmins(groupMembers) : false
		
		const isMe = botNumber.includes(senderNumber)
		const isGroupAdmins = v.isGroup ? groupAdmins.includes(v.sender) : false
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
		const isQuotedMsg = v.quoted ? (v.quoted.type === 'conversation') : false
		const isQuotedViewOnce = v.quoted ? (v.quoted.type === 'viewOnceMessage') : false
		const isQuotedImage = v.quoted ? ((v.quoted.type === 'imageMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'imageMessage') : false)) : false
		const isQuotedVideo = v.quoted ? ((v.quoted.type === 'videoMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'videoMessage') : false)) : false
		const isQuotedSticker = v.quoted ? (v.quoted.type === 'stickerMessage') : false
		const isQuotedAudio = v.quoted ? (v.quoted.type === 'audioMessage') : false
		
		const buttonsResponseID = (v.type == 'buttonsResponseMessage') ? v.message.buttonsResponseMessage.selectedButtonId : ''
		
		const isAntiViewOnce = v.isGroup ? antiviewonce.includes(v.chat) : false
		const isAntiLink = v.isGroup ? antilink.includes(v.chat) : false
		
		const replyTempImg = (teks, footer, buttons = [], img) => {
			inky.sendMessage(v.chat, { image: img, caption: teks, footer: footer, templateButtons: buttons })
		}
		
		if (isCmd) {
			if (!checkBalReg(senderNumber)) {
				addUser(senderNumber)
			}
		} else if (v.msg && checkBalReg(senderNumber) && !inky.isJadi) {
			addBal(senderNumber, 5)
		}
		if (isAntiViewOnce && (v.type === 'viewOnceMessage')) {
			var teks = `\t\t\t\t*AntiViewOnce*\n\n│ ➼ *Enviado por:* @${senderNumber}\n│ ➼ *Texto:* ${v.msg.caption ? v.msg.caption : 'Sin Texto'}`
			if (v.msg.type === 'imageMessage') {
				var nameJpg = getRandom('.jpg')
				v.replyImg(await v.download(nameJpg), teks)
				await fs.unlinkSync(nameJpg)
			} else if (v.msg.type === 'videoMessage') {
				var nameMp4 = getRandom('.mp4')
				v.replyVid(await v.download(nameMp4), teks)
				await fs.unlinkSync(nameMp4)
			}
		}
		if (isAntiLink && isBotAdmin && !isGroupAdmins && v.body.includes('chat.whatsapp.com/')) {
			if (v.body.split('chat.whatsapp.com/')[1].split(' ')[0] === (await inky.groupInviteCode(v.chat))) return
			inky.groupParticipantsUpdate(v.chat, [v.sender], 'remove')
				.then(x => v.reply('@' + senderNumber + ' ha sido eliminado por mandar link de otro grupo'))
				.catch(e => v.reply(e))
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

case 'menu':
await v.react('✨')
var teks = `\t\t╔═══❖•ೋ° °ೋ•❖═══╗
\t\t\t『༺࿕༒🖤Iɴᴋʏ🖤༒࿖༻』
\t\t╚═══❖•ೋ° °ೋ•❖═══╝

\t\t\t𖣘✿Ⓑⓞⓣ Ⓘⓝⓕⓞ✿𖣘

│ ➼ Prefijo: *⌜ ${prefix} ⌟*
│ ➼ Modo: *${inky.self ? 'Privado' : 'Publico'}*${inky.isJadi ? `
│ ➼ Bot Original: https://wa.me/${inky.botNumber}` : ''}
│ ➼ Libreria: *@adiwajshing/baileys@4.1.0*

\t\t\t𖣘✿Ⓤⓢⓔⓡ Ⓘⓝⓕⓞ✿𖣘

│ ➼ Nombre: *${v.pushName}*
│ ➼ Bio: *${bio}*
│ ➼ Rango: *${rank}*
│ ➼ Balance: *${bal}*
͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏
\t\t\t𖣘✿🄲🄾🄼🄰🄽🄳🄾🅂✿𖣘

\t●Ⓥⓘⓟ●
➼ ${prefix}join <link>
➼ ${prefix}serbot

\t●Ⓖⓡⓤⓟⓞⓢ●
➼ ${prefix}antilink <0/1>
➼ ${prefix}antiviewonce <0/1>
➼ ${prefix}promote / ${prefix}demote
➼ ${prefix}kick
➼ ${prefix}linkgc
➼ ${prefix}random

\t●Ⓔⓒⓞⓝⓞⓜⓘⓐ●
➼ ${prefix}balance
➼ ${prefix}transfer <monto> <@usuario>
➼ ${prefix}topbal
➼ ${prefix}shop

\t●Ⓙⓤⓔⓖⓞⓢ●
➼ ${prefix}blackjack <monto>

\t●Ⓒⓞⓝⓥⓔⓡⓣⓘⓓⓞⓡ●
➼ ${prefix}sticker
➼ ${prefix}robar <texto>
➼ ${prefix}toimg
➼ ${prefix}tomp3

\t●Ⓓⓔⓢⓒⓐⓡⓖⓐ●
➼ ${prefix}play <texto>
➼ ${prefix}tiktok <link>

\t●Ⓢⓣⓐⓕⓕ●
➼ ${prefix}bc <texto>
➼ ${prefix}mode <public/self>${!inky.isJadi ? `
➼ ${prefix}addvip / ${prefix}removevip
➼ ${prefix}save <texto>
➼ ${prefix}delfile <texto>` : ''}
➼ ${prefix}storage
➼ ${prefix}rfile <texto>

\t\t╔════ ▓▓ ࿇ ▓▓ ════╗
\t\t\t\t࿇𖣐${botName}𖣐࿇
\t\t╚════ ▓▓ ࿇ ▓▓ ════╝`
var footer = `│ ➼ ${fake}\n│ ➼ Runtime: ${runtime(process.uptime())}`
var buttons = [
	{urlButton: {displayText: 'Grupo de Soporte', url: groupSupport}},
	{quickReplyButton: {displayText: '👑 Creador 👑', id: prefix + 'creador'}}
]
replyTempImg(teks, footer, buttons, fs.readFileSync('./media/image/menu.jpg'))
break

case 'dueño':
case 'creador':
case 'creator':
case 'owner':
await v.react('✨')
v.replyContact('🖤ｴɳƙყᴳᵒᵈ🖤', 'Creador de ' + botName, '595995660558')
break

case 'del':
case 'delete':
await v.react('✨')
if (!v.quoted) return v.reply('Responda a un mensaje del bot, con el comando ' + prefix + command)
if (!v.quoted.fromMe) return v.reply('Solo puedo borrar mensajes enviados por mi')
if (v.isGroup && !isGroupAdmins) return v.reply(mess.only.admins)
v.quoted.delete()
break

case 'viewonce':
await v.react('✨')
if (!isQuotedViewOnce) return
var teks = `\t\t\t\t*AntiViewOnce*\n\n│ ➼ *Enviado por:* @${v.quoted.sender.split('@')[0]}\n│ ➼ *Texto:* ${v.quoted.msg.caption ? v.quoted.msg.caption : 'Sin Texto'}`
if (v.quoted.msg.type === 'imageMessage') {
	var nameJpg = getRandom('.jpg')
	v.replyImg(await v.quoted.download(nameJpg), teks, v.chat, [v.quoted.sender, v.sender])
	await fs.unlinkSync(nameJpg)
} else if (v.quoted.msg.type === 'videoMessage') {
	var nameMp4 = getRandom('.mp4')
	v.replyVid(await v.quoted.download(nameMp4), teks, v.chat, [v.quoted.sender, v.sender])
	await fs.unlinkSync(nameMp4)
}
break

/*
	Vip
*/

case 'join':
await v.react('✨')
if (!isVip) return v.reply(mess.only.vip)
if (!q) return v.reply('Ingrese el enlace del grupo')
if (!isUrl(q) && !q.includes('whatsapp.com')) return v.reply('Link invalido')
v.reply(mess.wait)
inky.groupAcceptInvite(q.split('chat.whatsapp.com/')[1])
	.then(x => {
	v.reply('He ingresado exitosamente al grupo')
	v.reply('He sido añadido al grupo por pedido de @' + senderNumber, x)
})
	.catch(e => v.reply('No he podido ingresar al grupo, verifique que el enlace funcione'))
break

case 'serbot':
await v.react('✨')
if (!isStaff) return v.reply(mess.only.vip)
if (inky.isJadi) return v.reply('Comando disponible en el bot original')
var qrcode = require('qrcode')
var { state, saveState } = useSingleFileAuthState('./lib/session/' + senderNumber + '.json')

var start = () => {
	var conn = makeWASocket({
		logger: P({ level: 'silent' }),
		printQRInTerminal: true,
		auth: state,
	})
	
	conn.ev.on('connection.update', async(anu) => {
		const { connection, lastDisconnect, qr } = anu
		if (connection === 'close') {
			if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
				start()
			}
		}
		if (qr != undefined) {
			var qrBot = await qrcode.toDataURL(qr, { scale: 8 })
			var messageBot = await v.replyImg(new Buffer.from(qrBot.replace('data:image/png;base64,', ''), 'base64'), 'Escanee el codigo qr para convertirte en un bot, el bot se apaga transcurrido las 24hs')
			await sleep(30000)
			await inky.sendMessage(v.chat, { delete: messageBot.key })
			await sleep(86400000)
			await conn.ws.close()
		}
		if (connection === 'open') {
			var userJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
			v.reply('\t\tNuevo bot activo\n\nUsuario: @' + userJid.split('@')[0], v.chat, [userJid])
		}
	})
	
	conn.ev.on('creds.update', saveState)
	
	conn.isJadi = true
	conn.self = false
	conn.botNumber = botNumber
	
	conn.ev.on('messages.upsert', anu => {
		anu = anu.messages[0]
		if (!anu.message) return
		
		anu.message = (getContentType(anu.message) === 'ephemeralMessage') ? anu.message.ephemeralMessage.message : anu.message
		if (anu.key && anu.key.remoteJid === 'status@broadcast') return
		
		require('./upsert')(conn, anu)
	})
}

start()
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
if (mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (v.sender === mentionUser[0]) return v.reply('No puede promotearse usted mismo')
if (groupAdmins.includes(mentionUser[0])) return v.reply(`El usuario @${mentionUser[0].split('@')[0]} ya es administrador`, v.chat, [mentionUser[0], v.sender])
inky.groupParticipantsUpdate(v.chat, [mentionUser[0]], 'promote')
	.then(x => v.reply(`Ha sido promovido a @${mentionUser[0].split('@')[0]} como administrador por @${senderNumber}`, v.chat, [mentionUser[0], v.sender]))
	.catch(e => v.reply(e))
break

case 'demote':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!isBotAdmin) return v.reply(mess.only.badmin)
if (mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (v.sender === mentionUser[0]) return v.reply('No puede demotearse usted mismo')
if (!groupAdmins.includes(mentionUser[0])) return v.reply(`El usuario @${mentionUser[0].split('@')[0]} no es administrador`, v.chat, [mentionUser[0], v.sender])
inky.groupParticipantsUpdate(v.chat, [mentionUser[0]], 'demote')
	.then(x => v.reply(`Ha sido removido a @${mentionUser[0].split('@')[0]} como administrador por @${senderNumber}`, v.chat, [mentionUser[0], v.sender]))
	.catch(e => v.reply(e))
break

case 'kick':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!isBotAdmin) return v.reply(mess.only.badmin)
if (mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (v.sender === mentionUser[0]) return v.reply('No puede kickearse usted mismo')
if (groupAdmins.includes(mentionUser[0])) return v.reply('No es posible eliminar a un administrador')
inky.groupParticipantsUpdate(v.chat, [mentionUser[0]], 'remove')
	.then(x => v.reply(`Ha sido eliminado @${mentionUser[0].split('@')[0]} del grupo por @${senderNumber}`, v.chat, [mentionUser[0], v.sender]))
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
v.reply('Ha sido elegido @' + user.split('@')[0], v.chat, [user])
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

│ ➼ Usuario: *@${senderNumber}*
│ ➼ Balance: *$${bal}*
│ ➼ Rango: *${rank}*`)
break

case 'transfer':
await v.react('✨')
if (!q) return v.reply('Ingrese el monto que desea transferir')
if (isNaN(args[0])) return v.reply('El monto ingresado debe de ser un numero')
if (mentionUser[0] === undefined) return v.reply('Mencione al usuario que desea transferirle')
if (args[0] < 100) return v.reply('Monto minimo para transferir es de $100')
if (userBal < args[0]) return v.reply('No tienes suficiente dinero')
addBal(mentionUser[0].split('@')[0], ((args[0] * 2) / 2))
removeBal(senderNumber, ((args[0] * 2) / 2))
v.reply(`\t\t\t${botName} Transfer\n\n│ ➼ Transferido de: @${senderNumber}\n│ ➼ Transferido a: @${mentionUser[0].split('@')[0]}\n│ ➼ Monto: $${args[0]}`, v.chat, [mentionUser[0], v.sender])
break

case 'baltop':
case 'topbal':
await v.react('✨')
var teks = '\t\t\t' + botName + ' Balance Top\n'
money.sort((a, b) => (a.money < b.money) ? 1 : -1)
let jidsTop = []
var total = 10
if (money.length < 10) total = money.length
for (let i = 0; i < total; i++) {
	teks += `\n│ ➼ @${money[i].id} > $${h2k(money[i].money)}`
	jidsTop.push(money[i].id + '@s.whatsapp.net')
}
v.reply(teks, v.chat, jidsTop)
break

case 'shop':
case 'tienda':
await v.react('✨')
var teks = `\t\t\t${botName} Shop

\t\t\t\t\t*༒ Rangos ༒*

╭───── *✨ Vip ✨* ─────
│ \t${isVip ? '*Ya tienes el rango ✨ Vip ✨*' : 'Usa *' + prefix + command + ' vip* para comprar el rango *✨ Vip ✨*'}
│ ➼ *Precio:* _$250 K_
│ ➼ *Ventajas:*
│ \t\t- Acceso al comando *${prefix}join*
│ \t\t- Acceso al comando *${prefix}serbot*
╰───────────────╮

│ ➼ Usuario: *@${senderNumber}*
│ ➼ Balance: *$${bal}*
│ ➼ Rango: *${rank}*

Para comprar un articulo use *${prefix + command} <articulo>*`
if (q.toLowerCase().includes('vip')) {
	if (isVip) return v.reply('Usted ya tiene el rango *✨ Vip ✨*')
	if (userBal < 250000) return v.reply('No tienes suficiente dinero para comprar el rango *✨ Vip ✨*')
	removeBal(senderNumber, 250000)
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
await v.react('✨')
if (isBJFrom(bj, v.chat) ? isBJPlayer(bj, v.sender) : false) return v.reply('Ya tienes un juego en curso')
if (!q) return v.reply(`Ingrese un monto, ejemplo: ${prefix + command} <monto>`)
if (isNaN(q)) return v.reply('El monto tiene que ser un numero')
if (q < 100) return v.reply('Monto minimo debe de ser de 100$')
if (userBal < q) return v.reply('No tienes suficiente dinero')
var obj = {id: v.sender, from: v.chat, balance: q, pHand: [drawRandomCard(), drawRandomCard()], bHand: [drawRandomCard(), drawRandomCard()]}
bj.push(obj)
removeBal(senderNumber, q)
inky.sendMessage(v.chat, { text: `*♣️ BlackJack ♠️*\n\n➫ Mano de ${v.pushName}: *${getHandValue(bj[position(bj, v.chat, v.sender)].pHand)}*\n\n🃏 Usa *Hit* o *Stand* 🃏`, footer: `Apuesta: *${getHandValue(bj[position(bj, v.chat, v.sender)].balance).slice(1)}$*\nBalance: *${userBal-getHandValue(bj[position(bj, v.chat, v.sender)].balance)}$*`, buttons: [{buttonId: 'bHit', buttonText: {displayText: 'Hit'}, type: 1}, {buttonId: 'bStand', buttonText: {displayText: 'Stand'}, type: 1}], headerType: 1 }, { quoted: v })
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
	var nameJpg = getRandom('.jpg')
	isQuotedImage ? await v.quoted.download(nameJpg) : await v.download(nameJpg)
	var stik = await imageToWebp(nameJpg)
	writeExif(stik, {packname: 'ღ ' + v.pushName + ' 乂 ' + senderNumber + ' ღ', author: ''})
		.then(x => v.replyS(x))
} else if ((v.type === 'videoMessage') || isQuotedVideo) {
	v.reply(mess.wait)
	var nameMp4 = getRandom('.mp4')
	isQuotedVideo ? await v.quoted.download(nameMp4) : await v.download(nameMp4)
	var stik = await videoToWebp(nameMp4)
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
var nameWebp = getRandom('.webp')
var media = await v.quoted.download(nameWebp)
await writeExif(media, {packname: pack, author: author})
	.then(x => v.replyS(x))
await fs.unlinkSync(nameWebp)
break

case 'inkys':
await await v.react('✨')
if (!isQuotedSticker) return v.reply('Responda a un sticker con el comando ' + prefix + command)
v.reply(mess.wait)
var nameWebp = getRandom('.webp')
var media = await v.quoted.download(nameWebp)
await writeExif(media)
	.then(x => v.replyS(x))
await fs.unlinkSync(nameWebp)
break

case 'toimg':
await v.react('✨')
if (!isQuotedSticker) return v.reply('Responda a un sticker con el comando ' + prefix + command)
v.reply(mess.wait)
var nameWebp = getRandom('.webp')
var nameJpg = getRandom('.jpg')
await v.quoted.download(nameWebp)
exec(`ffmpeg -i ${nameWebp} ${nameJpg}`, async(err) => {
	fs.unlinkSync(nameWebp)
	if (err) return v.reply(String(err))
	await v.replyImg(fs.readFileSync(nameJpg))
	fs.unlinkSync(nameJpg)
})
break

case 'tomp3':
await v.react('✨')
if (!isQuotedVideo) return v.reply('Responda a un video con el comando ' + prefix + command)
v.reply(mess.wait)
var nameMp4 = getRandom('.mp4')
var nameMp3 = getRandom('.mp3')
await v.quoted.download(nameMp4)
exec(`ffmpeg -i ${nameMp4} ${nameMp3}`, async(err) => {
	fs.unlinkSync(nameMp4)
	if (err) return v.reply(String(err))
	await v.replyAud(fs.readFileSync(nameMp3))
	fs.unlinkSync(nameMp3)
})
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
	{quickReplyButton: {displayText: '🎬 Video 🎬', id: prefix + 'ytmp4 ' + play.all[0].url}},
	{quickReplyButton: {displayText: '📦 Audio Documento 📦', id: prefix + 'ytmp3doc ' + play.all[0].url}}
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

case 'ytmp3':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('youtu')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(x => v.replyAud({url: x.mp3}, true))
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

case 'ytmp3doc':
await v.react('✨')
if (!q || !isUrl(q) && !q.includes('youtu')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(async(x) => inky.sendMessage(v.chat, { document: await getBuffer(x.mp3), mimetype: 'audio/mp4', fileName: x.title + '.m4a' }, { quoted: v }))
	.catch(e => v.reply(e))
break

/*
	Staff
*/

case 'bc':
if (!isStaff) return v.react('❌')
await v.react('✨')
var getGroups = await inky.groupFetchAllParticipating()
var groupsID = Object.entries(getGroups).slice(0).map(x => x[1]).map(x => x.id)
for (let id of groupsID) {
	var jids = []
	var groupMdata = await inky.groupMetadata(id)
	var groupMem = groupMdata.participants
	groupMem.map(x => jids.push(x.id))
	v.reply(`\t\t\t\t*${botName} BroadCast*\n\n${q}`, id, jids)
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

case 'addvip':
if (!isStaff) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (vip.includes(mentionUser[0].split('@')[0])) return v.reply('El usuario ya tiene el rango *✨ Vip ✨*')
vip.push(mentionUser[0].split('@')[0])
fs.writeFileSync('./database/user/vip.json', Json(vip))
v.reply('Ha sido agregado el rango *✨ Vip ✨* a @' + mentionUser[0].split('@')[0], v.chat, [v.sender, mentionUser[0]])
break

case 'removevip':
if (!isStaff) return v.react('❌')
if (inky.isJadi) return v.react('❌')
await v.react('✨')
if (mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
if (!vip.includes(mentionUser[0].split('@')[0])) return v.reply('El usuario no es usuario *✨ Vip ✨*')
vip.splice(mentionUser[0].split('@')[0])
fs.writeFileSync('./database/user/vip.json', Json(vip))
v.reply('Ha sido removido el rango *✨ Vip ✨* de @' + mentionUser[0].split('@')[0], v.chat, [v.sender, mentionUser[0]])
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
	var nameWebp = getRandom('.webp')
	var media = await v.quoted.download(nameWebp)
	await fs.writeFileSync(`./media/sticker/${q}.webp`, media)
	fs.unlinkSync(nameWebp)
	v.reply('Sticker guardado exitosamente')
} else if (isQuotedAudio) {
	if (sFiles[0].audio.includes(q + '.mp3')) return v.reply('Ya existe un audio con ese nombre')
	var nameMp3 = getRandom('.mp3')
	var media = await v.quoted.download(nameMp3)
	await fs.writeFileSync(`./media/audio/${q}.mp3`, media)
	fs.unlinkSync(nameMp3)
	v.reply('Audio guardado exitosamente')
} else if (isQuotedImage) {
	if (sFiles[0].image.includes(q + '.jpg')) return v.reply('Ya existe una imagen con ese nombre')
	var nameJpg = getRandom('.jpg')
	var media = await v.quoted.download(nameJpg)
	await fs.writeFileSync(`./media/image/${q}.jpg`, media)
	fs.unlinkSync(nameJpg)
	v.reply('Imagen guardado exitosamente')
} else if (isQuotedVideo) {
	if (sFiles[0].video.includes(q + '.mp4')) return v.reply('Ya existe un video con ese nombre')
	var nameMp4 = getRandom('.mp4')
	var media = await v.quoted.download(nameMp4)
	await fs.writeFileSync(`./media/video/${q}.mp4`, media)
	fs.unlinkSync(nameMp4)
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
	if (!(x === '@InkyGod03')) {
		teks += `\n│ ➼ ${x.replace('.webp', '')}`
	}
}
teks += `\n\nღ *Audios* (${(sFiles[0].audio.length - 1)})\n`
if (sFiles[0].audio.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].audio) {
	if (!(x === '@InkyGod03')) {
		teks += `\n│ ➼ ${x.replace('.mp3', '')}`
	}
}
teks += `\n\nღ *Imagenes* (${(sFiles[0].image.length - 1)})\n`
if (sFiles[0].image.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].image) {
	if (!(x === '@InkyGod03')) {
		teks += `\n│ ➼ ${x.replace('.jpg', '')}`
	}
}
teks += `\n\nღ *Videos* (${(sFiles[0].video.length - 1)})\n`
if (sFiles[0].video.length === 1) teks += '\n│ ➼ '
for (var x of sFiles[0].video) {
	if (!(x === '@InkyGod03')) {
		teks += `\n│ ➼ ${x.replace('.mp4', '')}`
	}
}
teks += `\n\nUse *${prefix}rfile <nombre del archivo>* para visualizarlo${!inky.isJadi ? `\n\nUse *${prefix}delfile <nombre del archivo>* para eliminarlo` : ''}`
v.reply(teks)
break

case 'rfile':
await v.react('✨')
var sFiles = new Array({ sticker: fs.readdirSync('./media/sticker'), audio: fs.readdirSync('./media/audio'), image: fs.readdirSync('./media/image'), video: fs.readdirSync('./media/video') })
if ((sFiles[0].sticker.includes(q + '.webp')) || (sFiles[0].audio.includes(q + '.mp3')) || (sFiles[0].image.includes(q + '.jpg')) || (sFiles[0].video.includes(q + '.mp4'))) {
	if (sFiles[0].sticker.includes(q + '.webp')) {
		v.replyS(fs.readFileSync('./media/sticker/' + q + '.webp'))
	}
	if (sFiles[0].audio.includes(q + '.mp3')) {
		v.replyAud(fs.readFileSync('./media/audio/' + q + '.mp3'), true)
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
				
				if (isStaff) {
					if (v.body.startsWith('x')) {
						try {
							v.reply(Json(eval(q)))
						} catch(e) {
							v.reply(String(e))
						}
					}
					if (v.body.startsWith('>')) {
						try {
							var value = await eval(`(async () => {${v.body.slice(1)}})()`)
							v.reply(util.format(value))
						} catch(e){
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
				
				if (isCmd) {
					v.react('❌')
				}
				
				if (v.body.toLowerCase().startsWith('hit') || buttonsResponseID.includes('bHit')) {
					if (!(isBJFrom(bj, v.chat) ? isBJPlayer(bj, v.sender) : false)) return
					await v.react('✨')
					var bjPosition = bj[position(bj, v.chat, v.sender)]
					bjPosition.pHand.push(drawRandomCard())
					if (getHandValue(bjPosition.bHand) <= 9) {
						bjPosition.bHand.push(drawRandomCard())
					}
					if (getHandValue(bjPosition.pHand) > 21) {
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de ${v.pushName}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Has perdido ${bjPosition.balance}$* 🃏`)
						bj.splice(bj.indexOf(bjPosition), 1)
					} else {
						inky.sendMessage(v.chat, { text: `*♣️ BlackJack ♠️*\n\n➫ Mano de ${v.pushName}: *${getHandValue(bjPosition.pHand)}*\n\n🃏 Usa *Hit* o *Stand* 🃏`, footer: `Apuesta: *${bjPosition.balance}$*\nBalance: *${userBal}$*`, buttons: [{buttonId: 'bHit', buttonText: {displayText: 'Hit'}, type: 1}, {buttonId: 'bStand', buttonText: {displayText: 'Stand'}, type: 1}], headerType: 1 }, { quoted: v })
					}
				}
				if (v.body.toLowerCase().startsWith('stand') || buttonsResponseID.includes('bStand')) {
					if (!(isBJFrom(bj, v.chat) ? isBJPlayer(bj, v.sender) : false)) return
					await v.react('✨')
					var bjPosition = bj[position(bj, v.chat, v.sender)]
					bj.splice(bj.indexOf(bjPosition), 1)
					if (getHandValue(bjPosition.pHand) < getHandValue(bjPosition.bHand)) {
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de ${v.pushName}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Has perdido ${bjPosition.balance}$* 🃏`)
					} else if (getHandValue(bjPosition.pHand) == getHandValue(bjPosition.bHand)) {
						var result = ((bjPosition.balance*2)/2)
						addBal(senderNumber, result)
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de ${v.pushName}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Ha sido un empate* 🃏`)
					} else {
						var result = bjPosition.balance*2
						addBal(senderNumber, result)
						v.reply(`*♣️ BlackJack ♠️*\n\n➫ Mano de ${v.pushName}: *${getHandValue(bjPosition.pHand)}*\n➫ Mano del bot: *${getHandValue(bjPosition.bHand)}*\n\n🃏 *Felicidades has ganado ${result}$* 🃏`)
					}
				}
				
		}
		
	} catch (e) {
		const isError = String(e)
		
		inky.sendMessage(v.key.remoteJid, { text: isError }, { quoted: v })
		console.log(e)
	}
}
