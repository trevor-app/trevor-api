const LastfmService = require('./services/lastfm-service')
const storesService = require('./services/stores-service')
const _ = require('lodash')
const cors = require('cors')
const express = require('express')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express()
const lastfm = new LastfmService(process.env.LAST_FM_KEY)
const PORT = process.env.PORT || 3000

app.use(cors())

app.get('/', (req, res) => res.send('Trevor API'))

app.get('/search', (req, res) => {
  const query = req.query.query
  if (_.isEmpty(query)) {
    return res.status(400).json({ error: 'Required params `query`' })
  }
  lastfm.search(query)
    .then((results) => res.status(200).json(results))
    .catch((error) => res.status(400).json({ error }))
})

app.get('/albums/:mbid', (req, res) => {
  const mbid = req.params.mbid
  if (_.isEmpty(mbid)) {
    return res.status(400).json({ error: 'Required params `mbid`' })
  }
  lastfm.getAlbum(mbid)
    .then((album) => res.status(200).json(album))
    .catch((error) => {
      return res.status(400).json({ error: error.message })
    })
})

app.get('/artists/:mbid', (req, res) => {
  const mbid = req.params.mbid
  if (_.isEmpty(mbid)) {
    return res.status(400).json({ error: 'Required params `mbid`' })
  }
  lastfm.getArtist(mbid)
    .then((artist) => res.status(200).json(artist))
    .catch((error) => {
      return res.status(400).json({ error: error.message })
    })
})

app.get('/artists/:mbid/albums', (req, res) => {
  const mbid = req.params.mbid
  if (_.isEmpty(mbid)) {
    return res.status(400).json({ error: 'Required params `mbid`' })
  }
  lastfm.getArtistAlbums(mbid)
    .then((albums) => res.status(200).json(albums))
    .catch((error) => {
      return res.status(400).json({ error: error.message })
    })
})

app.get('/stores', (req, res) => {
  res.status(200).json(storesService.getNames())
})

app.get('/stores/:storeName/albums/:mbid/items', (req, res) => {
  const storeName = req.params.storeName
  const mbid = req.params.mbid
  const store = storesService.getStoreByName(storeName)
  if (_.isEmpty(mbid)) {
    return res.status(400).json({ error: 'Required params `mbid`' })
  }
  if (_.isEmpty(store)) {
    return res.status(400).json({ error: `Invalid store name '${storeName}'` })
  }
  lastfm.getAlbum(mbid)
    .then((album) => store.search(album.artist, album.name))
    .then((items) => {
      res.status(200).json(items)
    })
    .catch((error) => {
      return res.status(400).json({ error: error.message })
    })
})

app.listen(PORT, () => console.log(`Trevor API listening on port ${PORT}`))
