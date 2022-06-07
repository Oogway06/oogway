require('../config')

const { getBuffer } = require('../lib/functions')

module.exports = async(IDBQ, v) => {
	try {
		const groupMetadata = await IDBQ.groupMetadata(v.id)
		const participants = v.participants
		for (let num of participants) {
			if (v.action == 'add') {
				var teks = `\t\t\t\t*Bienvenido @${num.split('@')[0]}*\n\n➼ *Grupo:* ${groupMetadata.subject}\n\n➼ *Descripcion:*\n${groupMetadata.desc}`
				try {
					ppimg = await inky.profilePictureUrl(num, 'image')
				} catch {
					ppimg = 'https://images4.alphacoders.com/921/921653.png'
				}
				var buffer = await getBuffer(ppimg)
				var buttonMessage = {
					location: {
						jpegThumbnail: buffer
					},
					caption: teks,
					footerText: fake,
					buttons: [
						{ buttonId: prefix + 'menu', buttonText: { displayText: '📜 Menu 📜' }, type: 1 },
						{ buttonId: prefix + 'creador', buttonText: { displayText: '👑 Creador 👑' }, type: 1 }
					],
					headerType: 6,
					mentions: [num]
				}
				inky.sendMessage(v.id, buttonMessage)
			}
		}
	} catch(e) {
		console.log(e)
	}
}
