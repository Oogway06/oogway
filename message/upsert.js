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
		
		const isMedia = (v.type === 'imageMessage' || v.type === 'videoMessage')
		const isQuotedMsg = v.quoted ? (v.quoted.type === 'conversation') : false
		const isQuotedViewOnce = v.quoted ? (v.quoted.type === 'viewOnceMessage') : false
		const isQuotedImage = v.quoted ? ((v.quoted.type === 'imageMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'imageMessage') : false)) : false
		const isQuotedVideo = v.quoted ? ((v.quoted.type === 'videoMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'videoMessage') : false)) : false
		const isQuotedSticker = v.quoted ? (v.quoted.type === 'stickerMessage') : false
		const isQuotedAudio = v.quoted ? (v.quoted.type === 'audioMessage') : false
		
		const isAntiViewOnce = v.isGroup ? antiviewonce.includes(v.chat) : false
		
		const replyTempLoc = (teks, footer, buttons = [], img) => {
			inky.sendMessage(v.chat, { location: { jpegThumbnail: img }, caption: teks, footer: footer, templateButtons: buttons })
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
		
		switch (command) {

/*
	Grupo
*/

case 'promote':
v.react('✨')
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
v.react('✨')
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
v.react('✨')
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
v.react('✨')
if (!v.isGroup) return v.reply(mess.only.group)
if (!isGroupAdmins) return v.reply(mess.only.admins)
var code = await inky.groupInviteCode(v.chat)
v.reply('\t\t\tLink del grupo *' + groupMetadata.subject + '*\n│ ➼ https://chat.whatsapp.com/' + code)
break

/*
	Convertidor
*/

case 's':
case 'stik':
case 'stiker':
case 'sticker':
v.react('✨')
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

/*
	Descarga
*/

case 'play':
v.react('✨')
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
replyTempLoc(teks, fake, buttons, buffer)
break

case 'tiktok':
v.react('✨')
if (!q || !isUrl(q) && !q.includes('tiktok.com')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.ttdownloader(q)
	.then(x => {
	v.replyVid({url: v.nowm}, fake)
})
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'ytmp3':
v.react('✨')
if (!q || !isUrl(q) && !q.includes('youtu')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(x => {
	v.replyAud({url: x.mp3}, true)
})
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'ytmp4':
v.react('✨')
if (!q || !isUrl(q) && !q.includes('youtu')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(x => {
	v.replyVid({url: x.link}, fake)
})
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'ytmp3doc':
v.react('✨')
if (!q || !isUrl(q) && !q.includes('youtu')) return v.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(async(x) => {
	var buffer = await getBuffer(x.mp3)
	inky.sendMessage(v.chat, { document: buffer, mimetype: 'audio/mp4', fileName: x.title + '.mp3' }, { quoted: v })
})
	.catch(e => v.reply(e))
break

/*
	Staff
*/

case 'bc':
if (!isOwner) return v.react('❌')
v.react('✨')
var getGroups = await inky.groupFetchAllParticipating()
var groupsID = Object.entries(getGroups).slice(0).map(x => x[1]).map(x => x.id)
for (let id of groupsID) {
	var jids = []
	var groupMdata = await inky.groupMetadata(id)
	var groupMem = groupMdata.participants
	groupMem.map(x => jids.push(x.id))
	v.reply(q, id, jids)
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
