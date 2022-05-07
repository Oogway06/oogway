/*
	Librerias
*/

const { proto, downloadContentFromMessage, getContentType } = require('@adiwajshing/baileys')
const fs = require('fs')

/*
	Js
*/

const downloadMediaMessage = async(m, filename) => {
	if (m.type === 'viewOnceMessage') {
		m.type = m.msg.type
	}
	if (m.type === 'imageMessage') {
		var nameJpg = filename ? filename : 'undefined.jpg'
		const stream = await downloadContentFromMessage(m.msg, 'image')
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(nameJpg, buffer)
		return fs.readFileSync(nameJpg)
	} else if (m.type === 'videoMessage') {
		var nameMp4 = filename ? filename : 'undefined.mp4'
		const stream = await downloadContentFromMessage(m.msg, 'video')
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(nameMp4, buffer)
		return fs.readFileSync(nameMp4)
	} else if (m.type === 'audioMessage') {
		var nameMp3 = filename ? filename : 'undefined.mp3'
		const stream = await downloadContentFromMessage(m.msg, 'audio')
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(nameMp3, buffer)
		return fs.readFileSync(nameMp3)
	} else if (m.type === 'stickerMessage') {
		var nameWebp = filename ? filename : 'undefined.webp'
		const stream = await downloadContentFromMessage(m.msg, 'sticker')
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		fs.writeFileSync(nameWebp, buffer)
		return fs.readFileSync(nameWebp)
	}
}

const sms = (conn, m, store) => {
	if (m.key) {
		m.id = m.key.id
		m.isBaileys = (m.id.startsWith('3EB0') && m.id.length === 12) || (m.id.startsWith('BAE5') && m.id.length === 16)
		m.chat = m.key.remoteJid
		m.fromMe = m.key.fromMe
		m.isGroup = m.chat.endsWith('@g.us')
		m.sender = m.fromMe ? conn.user.id.split(':')[0]+'@s.whatsapp.net' : m.isGroup ? m.key.participant : m.key.remoteJid
	}
	if (m.message) {
		m.type = getContentType(m.message)
		m.msg = (m.type === 'viewOnceMessage') ? m.message[m.type].message[getContentType(m.message[m.type].message)] : m.message[m.type]
		if (m.type === 'viewOnceMessage') {
			m.msg.type = getContentType(m.message[m.type].message)
		}
		m.body = (m.type === 'conversation') ? m.msg : (m.type === 'extendedTextMessage') ? m.msg.text : (m.type == 'imageMessage') && m.msg.caption ? m.msg.caption : (m.type == 'videoMessage') && m.msg.caption ? m.msg.caption : (m.type == 'templateButtonReplyMessage') && m.message.templateButtonReplyMessage.selectedId ? m.message.templateButtonReplyMessage.selectedId : ''
		m.quoted = ((m.msg.contextInfo != null) || (m.msg.contextInfo != undefined)) ? m.msg.contextInfo.quotedMessage : null
		if (m.quoted) {
			m.quoted.type = getContentType(m.quoted)
			m.quoted.id = m.msg.contextInfo.stanzaId
			m.quoted.isBaileys = (m.quoted.id.startsWith('3EB0') && m.quoted.id.length === 12) || (m.quoted.id.startsWith('BAE5') && m.quoted.id.length === 16)
			m.quoted.sender = m.msg.contextInfo.participant
			m.quoted.fromMe = m.quoted.sender.split('@')[0].includes(conn.user.id.split(':')[0])
			m.quoted.msg = (m.quoted.type === 'viewOnceMessage') ? m.quoted[m.quoted.type].message[getContentType(m.quoted[m.quoted.type].message)] : m.quoted[m.quoted.type]
			if (m.quoted.type === 'viewOnceMessage') {
				m.quoted.msg.type = getContentType(m.quoted[m.quoted.type].message)
			}
			m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
				key: {
					remoteJid: m.chat,
					fromMe: m.quoted.fromMe,
					id: m.quoted.id,
					participant: m.quoted.sender
				},
				message: m.quoted
			})
			m.quoted.download = (filename) => downloadMediaMessage(m.quoted, filename)
			m.quoted.delete = () => conn.sendMessage(m.chat, { delete: m.quoted.fakeObj.key })
		}
		m.download = (filename) => downloadMediaMessage(m, filename)
	}
	
	m.reply = (teks, id, mention) => conn.sendMessage(id ? id : m.chat, { text: teks, contextInfo: { mentionedJid: mention ? mention : [m.sender] } }, { quoted: m })
	m.replyS = (stik, id, mention) => conn.sendMessage(id ? id : m.chat, { sticker: stik, contextInfo: { mentionedJid: mention ? mention : [m.sender] } }, { quoted: m })
	m.replyImg = (img, teks, id, mention) => conn.sendMessage(id ? id : m.chat, { image: img, caption: teks, contextInfo: { mentionedJid: mention ? mention : [m.sender] } }, { quoted: m })
	m.replyVid = (vid, teks, id, mention) => conn.sendMessage(id ? id : m.chat, { video: vid, caption: teks, contextInfo: { mentionedJid: mention ? mention : [m.sender] } }, { quoted: m })
	m.replyAud = (aud, ptt, id, mention) => conn.sendMessage(id ? id : m.chat, { audio: aud, ptt: ptt ? ptt : false, mimetype: 'audio/mp4', contextInfo: { mentionedJid: mention ? mention : [m.sender] } }, { quoted: m })
	m.replyContact = (name, info, number) => {
		var vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 'FN:' + name + '\n' + 'ORG:' + info + ';\n' + 'TEL;type=CELL;type=VOICE;waid=' + number + ':+' + number + '\n' + 'END:VCARD'
		conn.sendMessage(m.chat, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: m })
	}
	m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
	
	return m
}

module.exports = { sms }
