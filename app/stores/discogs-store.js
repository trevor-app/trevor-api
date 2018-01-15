const BaseStore = require('./base-store')
const _ = require('lodash')
const discogs = require('../../lib/discogs.js')
const normalize = require('../services/normalize-service').normalize

const storeName = 'Discogs'
const country = 'Worldwide'

const formats = ['Vinyl', 'CD']

function extractItem (offer, format) {
  return Object.assign(offer, {
    store: storeName,
    isUsed: true,
    format: extractFormat(format)
  })
}

function extractFormat (format) {
  switch (format) {
    case 'Vinyl':
      return ['Vinyl']
    case 'CD':
      return ['CD']
  }
}

function search (artist, album) {
  const normalizedArtistName = normalize(artist)
  const normalizedAlbumName = normalize(album)
  return discogs.searchMasters(album)
    .then(masters => {
      return masters.find((master) => {
        return normalize(master.artist) === normalizedArtistName &&
               normalize(master.title) === normalizedAlbumName
      })
    })
    .then((master) => {
      if (_.isEmpty(master)) return []
      return Promise.all(
        formats.map(format => {
          return discogs.getMasterOffers(master.id, format)
            .then(offers => offers.map(offer => extractItem(offer, format)))
        })
      ).then(_.flatten)
    })
}

module.exports = new BaseStore(storeName, country, search)
