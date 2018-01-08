const LastfmService = require('./services/lastfm-service')
const express = require('express')
const app = express()

const lastfm = new LastfmService(process.env.LAST_FM_KEY)

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => res.send('Trevor API'))

app.get('/search', (req, res) => {
  lastfm.search(req.query.query)
    .then((results) => res.status(200).json(results))
    .catch((error) => res(400).json({ error }))
})

app.listen(PORT, () => console.log(`Trevor API listening on port ${PORT}`))
