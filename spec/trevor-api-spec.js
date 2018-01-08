const request = require('request')

const PORT = process.env.PORT || 3000
const BASE_URL = `http://localhost:${PORT}/`

/* eslint-disable handle-callback-err */

describe('Trevor API', () => {
  describe('GET /', () => {
    it('returns status code 200', (done) => {
      request.get(BASE_URL, (error, response, body) => {
        expect(response.statusCode).toBe(200)
        done()
      })
    })

    it('returns body that contains Trevor API', (done) => {
      request.get(BASE_URL, (error, response, body) => {
        expect(body).toContain('Trevor API')
        done()
      })
    })
  })
})

/* eslint-enable handle-callback-err */
