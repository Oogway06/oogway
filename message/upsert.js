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

const { getBuffer, h2k, isUrl, Json, runtime, sleep } = require('../lib/functions')

/*
	Database
*/

const antiviewonce = JSON.parse(fs.readFileSync('./database/group/antiviewonce.json'))

module.exports = async(inky, v, store) => {
	try {
		const isCmd = v.body.startsWith(prefix)
		const command = isCmd ? v.body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
		const commandstik = (v.type === 'stickerMessage') ? v.msg.fileSha256.toString('base64') : ''
		
		const args = v.body.trim().split(/ +/).slice(1)
		const q = args.join(' ')
		const senderNumber = v.sender.split('@')[0]
		const botNumber = inky.user.id.split(':')[0]
		
		const groupMetadata = v.isGroup ? await inky.groupMetadata(v.chat) : ''
		const groupMembers = v.isGroup ? groupMetadata.participants : ''
		
		const isMe = botNumber.includes(senderNumber)
		const isOwner = owner.includes(senderNumber)
		const isStaff = staff.includes(senderNumber) || isMe || isOwner
		
		const isMedia = (v.type === 'imageMessage' || v.type === 'videoMessage')
		const isQuotedMsg = v.quoted ? (v.quoted.type === 'conversation') : false
		const isQuotedImage = v.quoted ? (v.quoted.type === 'imageMessage') : false
		const isQuotedVideo = v.quoted ? (v.quoted.type === 'videoMessage') : false
		const isQuotedSticker = v.quoted ? (v.quoted.type === 'stickerMessage') : false
		const isQuotedAudio = v.quoted ? (v.quoted.type === 'audioMessage') : false
		
		const isAntiViewOnce = v.isGroup ? antiviewonce.includes(v.chat) : false
		
		const replyTempLoc = (teks, footer, buttons = [], img) => {
			inky.sendMessage(v.chat, { location: { jpegThumbnail: img }, caption: teks, footer: footer, templateButtons: buttons })
		}
		
		if (isAntiViewOnce && (v.type === 'viewOnceMessage')) {
			var teks = `\t\t\t*AntiViewOnce*

│ ➼ *Enviado por:* @{senderNumber}
│ ➼ *Texto:* ${v.msg.caption ? v.msg.caption : 'Sin Texto'}`
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

case 'menu':
var teks = 'Menu en mantenimiento'
var buttons = [
	{urlButton: {displayText: 'Grupo de Soporte', url: groupSupport}}
]
try {
	var ppimg = await inky.profilePictureUrl(v.sender, 'image')
} catch {
	var ppimg = 'https://wallpapercave.com/wp/wp6898322.jpg'
}
var image = await getBuffer(ppimg)
replyTempLoc(teks, `│ ➼ ${fake}\n│ ➼ Runtime: ${runtime(process.uptime())}`, buttons, image)
break

/*
	Descarga
*/

case 'play':
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

case 'ytmp3':
if (!q || !isUrl(q) && !q.includes('youtu')) return m.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(x => {
	v.replyAud({url: x.mp3}, true)
})
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'ytmp4':
if (!q || !isUrl(q) && !q.includes('youtu')) return m.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
v.reply(mess.wait)
hx.youtube(q)
	.then(x => {
	v.replyVid({url: x.link})
})
	.catch(e => v.reply('Hubo un error al descargar su archivo'))
break

case 'ytmp3doc':
if (!q || !isUrl(q) && !q.includes('youtu')) return m.reply('Comando incorrecto, use: *' + prefix + command + ' <link>*')
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
if (!isOwner) return
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
				
		}
		
	} catch (e) {
		const isError = String(e)
		
		v.reply(isError)
		console.log(e)
	}
}
