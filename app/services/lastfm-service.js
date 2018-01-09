const _ = require('lodash')
const Lastfm = require('../../lib/lastfm.js')

const UUID_REGEX = /[a-f0-9]{8}-?[a-f0-9]{4}-?[1-5][a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/

function LastfmService (apiKey) {
  this.client = new Lastfm(apiKey)
}

LastfmService.prototype.retrieveImage = function (object, size = 'large') {
  const image = object.image.find((image) => image['size'] === size)
  if (image) return image['#text']
}

LastfmService.prototype.getAlbum = function (mbid) {
  return this.client.request('album.getinfo', { mbid }).then((data) => {
    const album = _.get(data, 'album', {})
    const result = _.pick(album, ['name', 'artist', 'mbid', 'url'])
    result.image = this.retrieveImage(album)
    result.type = 'album'
    result.summary = _.get(album, 'wiki.summary', '')
    return result
  })
}

LastfmService.prototype.getArtist = function (mbidOrArtist) {
  const key = UUID_REGEX.exec(mbidOrArtist) ? 'mbid' : 'artist'
  return this.client.request('artist.getinfo', { [key]: mbidOrArtist }).then((data) => {
    const artist = _.get(data, 'artist', {})
    const result = _.pick(artist, ['name', 'artist', 'mbid', 'url'])
    result.image = this.retrieveImage(artist)
    result.type = 'artist'
    result.summary = _.get(artist, 'bio.summary', '')
    return result
  })
}

LastfmService.prototype.getArtistAlbums = function (mbidOrArtist) {
  const key = UUID_REGEX.exec(mbidOrArtist) ? 'mbid' : 'artist'
  return this.client.request('artist.gettopalbums', { [key]: mbidOrArtist, limit: 999 }).then((data) => {
    const albums = _.get(data, 'topalbums.album', {})
    return albums.reduce((results, album) => {
      const result = _.pick(album, ['name', 'mbid', 'url'])
      result['artist'] = _.get(album, 'artist.name')
      result['image'] = this.retrieveImage(album)
      if (!_.isEmpty(result.mbid)) results.push(result)
      return results
    }, [])
  })
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
