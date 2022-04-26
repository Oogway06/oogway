const { default: makeWASocket, useSingleFileAuthState,  DisconnectReason } = require('@adiwajshing/baileys')
const { state, saveState } = useSingleFileAuthState('./lib/session/session.json')
const fs = require('fs')
const P = require('pino')

const { sms } = require('./lib/simple')

function nocache(module, cb = () => { }) {
	fs.watchFile(require.resolve(module), async () => {
		await uncache(require.resolve(module))
		cb(module)
	})
}
function uncache(module = '.') {
	return new Promise((resolve, reject) => {
		try {
			delete require.cache[require.resolve(module)]
			resolve()
		} catch (e) {
			reject(e)
		}
	})
}

require('./config.js')
nocache('./config.js', module => console.log('El archivo config.js ha sido actualizado'))
require('./lib/functions.js')
nocache('./lib/functions.js', module => console.log('El archivo functions.js ha sido actualizado'))
require('./message/upsert.js')
nocache('./message/upsert.js', module => console.log('El archivo upsert.js ha sido actualizado'))

const start = () => {
    const inky = makeWASocket({
		logger: P({ level: 'silent' }),
		printQRInTerminal: true,
		auth: state,
	})

    inky.ev.on('connection.update', v => {
		const { connection, lastDisconnect } = v
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) {
                start()
            }
        } else if (connection === 'open') {
			console.log('Bot conectado')
		}
	})

    inky.ev.on('creds.update', saveState)

    inky.ev.on('messages.upsert', v => {
        v = v.messages[0]
        if (!v.message) return

        v.message = (Object.keys(v.message)[0] === 'ephemeralMessage') ? v.message.ephemeralMessage.message : v.message
        if (v.key && v.key.remoteJid === 'status@broadcast') return

        v = sms(inky, v)
        require('./message/upsert')(inky, v)
    })
}

start()
