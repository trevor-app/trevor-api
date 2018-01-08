const _ = require('lodash')
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

function LastfmService (apiKey) {
  this.client = new Lastfm(apiKey)
}

LastfmService.prototype.retrieveImage = function (object, size = 'large') {
  const image = object.image.find((image) => image['size'] === size)
  if (image) return image['#text']
}

LastfmService.prototype.searchAlbum = function (query) {
  return this.client.request('album.search', {
    album: query,
    limit: 10
  }).then((data) => {
    const albums = _.get(data, 'results.albummatches.album', [])
    return albums.map((album) => {
      const result = _.pick(album, ['name', 'artist', 'mbid', 'url'])
      result.image = this.retrieveImage(album)
      result.type = 'album'
      return result
    })
  })
}

LastfmService.prototype.searchArtists = function (query) {
  return this.client.request('artist.search', {
    artist: query,
    limit: 10
  }).then((data) => {
    const albums = _.get(data, 'results.artistmatches.artist', [])
    return albums.map((album) => {
      const result = _.pick(album, ['name', 'mbid'])
      result.image = this.retrieveImage(album)
      result.type = 'artist'
      return result
    })
  })
}

LastfmService.prototype.search = function (query) {
  return Promise.all([
    this.searchAlbum(query),
    this.searchArtists(query)
  ]).then(_.flatten)
}

module.exports = LastfmService
