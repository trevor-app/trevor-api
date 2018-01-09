const request = require('request')

function Lastfm (apiKey) {
  this.apiKey = apiKey
}

Lastfm.prototype.request = function (method, params = {}) {
  const options = {
    url: 'http://ws.audioscrobbler.com/2.0/',
    qs: Object.assign(params, { api_key: this.apiKey, method, format: 'json' })
  }
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) return reject(error)
      resolve(JSON.parse(body))
    })
  })
}

module.exports = Lastfm
