const express = require('express')
const app = express()

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => res.send('Trevor API'))

app.listen(PORT, () => console.log(`Trevor API listening on port ${PORT}`))
