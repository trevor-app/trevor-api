const BaseStore = require('./base-store')
const _ = require('lodash')
const bandcamp = require('bandcamp-scraper')
const normalize = require('../services/normalize-service').normalize

const storeName = 'Bandcamp'
const country = 'Worldwide'

function searchArtist (query) {
  const normalizedArtistName = normalize(query)
  return new Promise((resolve, reject) => {
    bandcamp.search({ query }, (error, results) => {
      if (error) return reject(error)
      const artist = results.find((result) => {
        return result.type === 'artist' && normalizedArtistName === normalize(result.name)
      })
      return resolve(artist)
    })
  })
}

function getAlbumProducts (albumName, albumUrl) {
  const normalizedAlbumName = normalize(albumName)
  return new Promise((resolve, reject) => {
    bandcamp.getAlbumProducts(albumUrl, (error, results) => {
      if (error) return reject(error)
      const items = results.reduce((items, result) => {
        if (!result.soldOut && normalize(result.name) === normalizedAlbumName) {
          items.push(extractItem(result))
        }
        return items
      }, [])
      return resolve(items)
    })
  })
}

function extractItem (result) {
  return {
    artist: result.artist,
    title: result.name,
    store: storeName,
    priceInCents: result.priceInCents,
    currencyCode: result.currency,
    url: result.url,
    imageUrl: result.imageUrls[0],
    isUsed: false,
    format: extractItemFormat(result)
  }
}

function extractItemFormat (result) {
  const format = result.format
  if (/digital/i.exec(format)) {
    return ['Digital']
  } else if (/(cd|compact disc)/i.exec(format)) {
    return ['CD']
  } else if (/vinyl/i.exec(format)) {
    return ['Vinyl']
  }
}

function search (artistName, albumName) {
  return searchArtist(artistName)
    .then(artist => {
      return new Promise((resolve, reject) => {
        bandcamp.getAlbumUrls(artist.url, (error, albumUrls) => {
          if (error) return reject(error)
          resolve(albumUrls)
        })
      })
    })
    .then((albumUrls) => {
      return Promise.all(
        albumUrls.map(albumUrl => getAlbumProducts(albumName, albumUrl))
      ).then(_.flatten)
    })
    .catch(error => {
      console.error(error)
      return []
    })
}

module.exports = new BaseStore(storeName, country, search)
