const http = require('http')
const url = require('url')
const childProcess = require('child_process')

const port = 3011
const server = http.createServer(handleRequest)

server.listen(port)

console.log(`Server up at http://localhost:${port}`)

function handleRequest (req, res) {
  try {
    if (req.method !== 'GET') {
      throw new Error('Method not supported')
    }

    const reqUrl = url.parse(req.url)
    const params = new URLSearchParams(reqUrl.query)
    const action = params.get('action')

    switch (action) {
      case 'playTrack':
        return jsonResponse(res, playTrack(params.get('track')))
      break
      default:
        throw new Error('Missing action')
    }
  } catch (error) {
    errorResponse(res, error)
  }
}

function playTrack (track) {
  if (!track) {
    throw new Error('Track missing')
  }

  const uri = `string:spotify:track:${track}`

  const command = 'dbus-send'

  const args = [
    '--print-reply',
    '--dest=org.mpris.MediaPlayer2.ncspot',
    '/org/mrpis/MediaPlayer2',
    'org.mpris.MediaPlayer2.Player.OpenUri',
    uri
  ]

  const {
    status,
    error,
    output
  } = childProcess.spawnSync(command, args)

  if (error) {
    throw error
  }

  return {
    status,
    output: output.toString()
  }
}

function jsonResponse (res, body) {
  res.setHeader('Content-Type', 'application/json')
  res.writeHead(200)
  res.end(JSON.stringify(body))
}

function errorResponse (res, error) {
  console.error(error)
  res.writeHead(400)
  res.end(JSON.stringify({
    error: {
      message: error.message
    }
  }))
}
