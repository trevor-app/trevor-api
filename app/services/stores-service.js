const _ = require('lodash')
const itunesStore = require('../stores/itunes-store.js')
const amazonStore = require('../stores/amazon-store.js')
const bandcampStore = require('../stores/bandcamp-store.js')

const stores = [
  itunesStore,
  amazonStore,
  bandcampStore
]

function getNames () {
  return stores.map(store => store.name)
}

function getStoreByName (name) {
  return stores.find(store => store.name === name)
}

function search (query) {
  return Promise.all(
    stores.map(store => store.search(query))
  ).then(_.flatten)
}

module.exports = {
  getNames,
  getStoreByName,
  search
}
