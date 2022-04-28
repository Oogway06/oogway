require('../config')

/*
	Libreria
*/

const { exec } = require('child_process')
const fs = require('fs')
const hx = require('hxz-api')
const util = require('util')
const yts = require('yt-search')

/*
	Js
*/

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep } = require('../lib/functions')
const { imageToWebp, videoToWebp, writeExif } = require('../lib/exif')

/*
	Database
*/

const antiviewonce = JSON.parse(fs.readFileSync('./database/group/antiviewonce.json'))
const antilink = JSON.parse(fs.readFileSync('./database/group/antilink.json'))

module.exports = async(inky, v, store) => {
	try {
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
		try { var bio = (await inky.fetchStatus(v.sender)).status } catch { var bio = 'Sin Bio' }
		
		const groupMetadata = v.isGroup ? await inky.groupMetadata(v.chat) : {}
		const groupMembers = v.isGroup ? groupMetadata.participants : []
		const groupAdmins = v.isGroup ? getGroupAdmins(groupMembers) : false
		
		const isMe = botNumber.includes(senderNumber)
		const isGroupAdmins = v.isGroup ? groupAdmins.includes(v.sender) : false
		const isBotAdmin = v.isGroup ? groupAdmins.includes(botNumber + '@s.whatsapp.net') : false
		const isOwner = owner.includes(senderNumber)
		const isStaff = staff.includes(senderNumber) || isMe || isOwner
		
		if (isOwner) {
			var rank = '👑 Owner 👑'
		} else if (isStaff) {
			var rank = '🎮 Staff 🎮'
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
		
		const isAntiViewOnce = v.isGroup ? antiviewonce.includes(v.chat) : false
		const isAntiLink = v.isGroup ? antilink.includes(v.chat) : false
		
		const replyTempImg = (teks, footer, buttons = [], img) => {
			inky.sendMessage(v.chat, { image: img, caption: teks, footer: footer, templateButtons: buttons })
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
		
		if (!isAntiLink && isBotAdmin && !isGroupAdmins && v.body.includes('chat.whatsapp.com/')) {
			if (v.body.split('chat.whatsapp.com/')[1].split(' ')[0] === (await inky.groupInviteCode(v.chat))) return
			inky.groupParticipantsUpdate(v.chat [v.sender], 'remove')
				.then(x => v.reply('@' + senderNumber + ' ha sido eliminado por mandar link de otro grupo'))
				.catch(e => v.reply(e))
		}
		
		switch (command) {

case 'menu':
await v.react('✨')
var teks = `\t\t╔═══❖•ೋ° °ೋ•❖═══╗
\t\t\t『༺࿕༒🖤Iɴᴋʏ🖤༒࿖༻』
\t\t╚═══❖•ೋ° °ೋ•❖═══╝

\t\t\t𖣘✿Ⓑⓞⓣ Ⓘⓝⓕⓞ✿𖣘

│ ➼ Prefijo: *⌜ ${prefix} ⌟*
│ ➼ Modo: *${inky.self ? 'Privado' : 'Publico'}*
│ ➼ Libreria: *@adiwajshing/baileys@4.1.0*

\t\t\t𖣘✿Ⓤⓢⓔⓡ Ⓘⓝⓕⓞ✿𖣘

│ ➼ Nombre: *${v.pushName}*
│ ➼ Bio: *${bio}*
│ ➼ Rango: *${rank}*
͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏͏
\t\t\t𖣘✿🄲🄾🄼🄰🄽🄳🄾🅂✿𖣘

\t●Ⓖⓡⓤⓟⓞⓢ●
➼ ${prefix}promote / ${prefix}demote
➼ ${prefix}kick
➼ ${prefix}linkgc

\t●Ⓒⓞⓝⓥⓔⓡⓣⓘⓓⓞⓡ●
➼ ${prefix}sticker
➼ ${prefix}robar <texto>
➼ ${prefix}toimg

\t●Ⓓⓔⓢⓒⓐⓡⓖⓐ●
➼ ${prefix}play <texto>
➼ ${prefix}tiktok <link>

\t●Ⓢⓣⓐⓕⓕ●
➼ ${prefix}bc

\t\t╔════ ▓▓ ࿇ ▓▓ ════╗
\t\t\t\t࿇𖣐${botName}𖣐࿇
\t\t╚════ ▓▓ ࿇ ▓▓ ════╝`
var footer = `│ ➼ ${fake}\n│ ➼ Runtime: ${runtime(process.uptime())}`
var buttons = [
	{urlButton: {displayText: 'Grupo de Soporte', url: groupSupport}},
	{quickReplyButton: {displayText: '👑 Creador 👑', id: prefix + 'creador'}}
]
var img = await getBuffer('https://fondosmil.com/fondo/6275.jpg')
replyTempImg(teks, footer, buttons, img)
break

case 'creador':
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
if (!v.quoted) return
if (!isQuotedViewOnce) return
var teks = `\t\t\t\t*AntiViewOnce*\n\n│ ➼ *Enviado por:* @${senderNumber}\n│ ➼ *Texto:* ${v.quoted.msg.caption ? v.quoted.msg.caption : 'Sin Texto'}`
if (v.quoted.msg.type === 'imageMessage') {
	var nameJpg = getRandom('.jpg')
	v.replyImg(await v.quoted.download(nameJpg), teks)
	await fs.unlinkSync(nameJpg)
} else if (v.quoted.msg.type === 'videoMessage') {
	var nameMp4 = getRandom('.mp4')
	v.replyVid(await v.quoted.download(nameMp4), teks)
	await fs.unlinkSync(nameMp4)
}
break

/*
	Grupo
*/

case 'promote':
await v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
if (!isBotAdmin) return v.reply(mess.only.badmin)
if (mentionUser[0] === undefined) return v.reply('Mencione a un usuario')
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
	.then(async(x) => inky.sendMessage(v.chat, { document: await getBuffer(x.mp3), mimetype: 'audio/mp4', fileName: x.title + '.mp3' }, { quoted: v }))
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

case 'save':
if (!isStaff) return v.react('❌')
await v.react('✨')
if (!q) return v.reply('Nombre para el archivo?')
if (!v.quoted) return v.reply('Responde a un archivo para guardarlo')
if (!isQuotedSticker) {
	var nameWebp = getRandom('.webp')
	var media = await v.quoted.download(nameWebp)
	await fs.writeFileSync(`./media/sticker/${q}.webp`, media)
	fs.unlinkSync(nameWebp)
	v.reply('Sticker guardado exitosamente')
} else if (isQuotedAudio) {
	var nameMp3 = getRandom('.mp3')
	var media = await v.quoted.download(nameMp3)
	await fs.writeFileSync(`./media/audio/${q}.mp3`, media)
	fs.unlinkSync(nameMp3)
	v.reply('Audio guardado exitosamente')
} else if (isQuotedImage) {
	var nameJpg = getRandom('.jpg')
	var media = await v.quoted.download(nameJpg)
	await fs.writeFileSync(`./media/image/${q}.jpg`, media)
	fs.unlinkSync(nameJpg)
	v.reply('Imagen guardado exitosamente')
} else if (isQuotedVideo) {
	var nameMp4 = getRandom('.mp4')
	var media = await v.quoted.download(nameMp4)
	await fs.writeFileSync(`./media/video/${q}.mp4`, media)
	fs.unlinkSync(nameMp4)
	v.reply('Video guardado exitosamente')
} else {
	v.reply('Responde a un archivo para guardarlo')
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
				
				if (isCmd) {
					v.react('❌')
				}
				
		}
		
	} catch (e) {
		const isError = String(e)
		
		v.reply(isError)
		console.log(e)
	}
}
