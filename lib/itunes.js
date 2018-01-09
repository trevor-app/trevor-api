const request = require('request')

function generateQueryString (params) {
  let stringParams = Object.keys(params).map((item) => {
    return item + '=' + encodeURIComponent(params[item])
  }).join('&')
  // iTunes uses application/x-www-form-urlencoded
  // so we replace space '%20' with '+'
  return stringParams.replace(/%20/g, '+')
}

function itunesRequest (method, params) {
  return new Promise((resolve, reject) => {
    const url = `http://itunes.apple.com/${method}/?${generateQueryString(params)}`
    return request(url, (error, response, body) => {
      if (error) return reject(error)
      try {
        resolve(JSON.parse(body))
      } catch (e) {
        reject(e)
      }
    })
  })
}

/**
http://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html#searching
Params example:
{
  term: "field of dreams",
  media: "movie", // params are: podcast, music, musicVideo, audiobook, shortFilm, tvShow, software, ebook, all
  entity: "movie",
  attribute: "movieTerm",
  limit: 50,
  explicit: "No", // explicit material
  country: "CA" // default US
}
*/
exports.search = (params) => itunesRequest('search', params)

/**
http://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html#lookup
Params example:
{
  id: 481473944,
  entity: "album",
  limit: 25,
  sort: "recent",
  country: "CA" // default US
};
*/
exports.lookup = (params) => itunesRequest('lookup', params)
