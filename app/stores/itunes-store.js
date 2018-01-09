const BaseStore = require('./base-store')
const _ = require('lodash')
const itunes = require('../../lib/itunes.js')
const normalize = require('../services/normalize-service').normalize

const storeName = 'iTunes CA'
const country = 'CA'

function generateItem (result) {
  return {
    artist: result.artistName,
    title: result.collectionName,
    store: storeName,
    priceInCents: Math.ceil(result.collectionPrice * 100),
    currencyCode: result.currency,
    url: result.collectionViewUrl,
    imageUrl: result.artworkUrl100,
    isUsed: false,
    format: [ 'Digital' ]
  }
}

function search (artist, album, callback) {
  artist = normalize(artist)
  album = normalize(album)
  const params = {
    term: album,
    media: 'music',
    entity: 'album',
    attribute: 'albumTerm',
    country: country,
    limit: 15
  }
  return itunes.search(params).then((data) => {
    return data.results.reduce((items, result) => {
      if (result.wrapperType === 'collection' &&
          _.get(result, 'collectionPrice', 0) > 0 &&
          normalize(result.artistName) === artist &&
          normalize(result.collectionName) === album) {
        items.push(generateItem(result))
      }
      return items
    }, [])
  })
}

module.exports = new BaseStore(storeName, country, search)
