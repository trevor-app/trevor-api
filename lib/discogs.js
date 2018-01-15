const _ = require('lodash')
const cheerio = require('cheerio')
const request = require('request')
const urlHelper = require('url')
const currencySymbolMap = require('currency-symbol-mapper')

// const baseUrl = 'https://www.discogs.com/search/?q=absolution&type=master'

function searchMasters (albumName, limit = 10) {
  return new Promise((resolve, reject) => {
    const options = {
      url: `https://www.discogs.com/search/?q=${albumName}&type=master&limit=${limit}`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
      }
    }
    request(options, (error, response, body) => {
      if (error) return reject(error)
      const $ = cheerio.load(body)
      const items = $('.card').toArray().map((result) => {
        const $result = $(result)
        return {
          id: $result.attr('data-object-id'),
          title: $result.find('.search_result_title').text(),
          artist: $result.find('h5').text()
        }
      })
      return resolve(items)
    })
  })
}

function extractMasterOffer ($, tr, format) {
  const offer = {}
  // Artist & Title
  const description = $($(tr).find('.item_description_title'))
  if (!_.isEmpty(description)) {
    const split = ' - '
    const info = description.text().split(split)
    offer.artist = info[0]
    offer.title = info.slice(1).join(split)
  }
  // Image
  const img = $($(tr).find('.marketplace_image'))
  if (!_.isEmpty(img)) {
    offer.imageUrl = img.attr('data-src')
  }
  // Price
  const price = $($(tr).find('.price'))
  if (!_.isEmpty(price)) {
    const matches = price.text().match(/([^0-9]+)(\d+)\.(\d+)/)
    if (matches) {
      if (matches[1] === '$') {
        offer.currencyCode = 'USD'
      } else {
        offer.currencyCode = currencySymbolMap.getCurrencyFromSymbol(matches[1]) || matches[1]
      }
      offer.priceInCents = parseInt(matches[2]) * 100 + parseInt(matches[3])
    }
  }
  // Url
  const link = $($(tr).find('a'))
  if (!_.isEmpty(link)) {
    offer.url = urlHelper.resolve('https://www.discogs.com/', link.attr('href'))
  }
  // Format
  offer.format = [ format ]
  return offer
}

function getMasterOffers (masterId, format, limit = 25, sort = 'price%2Casc') {
  return new Promise((resolve, reject) => {
    const options = {
      url: `https://www.discogs.com/sell/list?master_id=${masterId}&format=${format}&limit=${limit}&sort=${sort}`,
    }
    request(options, (error, response, body) => {
      if (error) return reject(error)
      const $ = cheerio.load(body)
      const items = $('.mpitems tbody tr').toArray().map(tr => extractMasterOffer($, tr, format))
      return resolve(items)
    })
  })
}

module.exports = {
  searchMasters,
  getMasterOffers
}
