const BaseStore = require('./base-store')
const _ = require('lodash')
const amazon = require('amazon-product-api')
// const normalize = require('../services/normalize-service').normalize

const storeName = 'Amazon CA'
const country = 'CA'

const client = amazon.createClient({
  awsId: process.env.AWS_ID,
  awsSecret: process.env.AWS_SECRET,
  awsTag: process.env.AWS_TAG
})

function isUsedConditionOffer (result) {
  return _.has(result, 'OfferSummary[0].LowestUsedPrice[0].Amount[0]')
}

function isNewConditionOffer (result) {
  return _.has(result, 'OfferSummary[0].LowestNewPrice[0].Amount[0]')
}

function extractItem (result) {
  return {
    artist: _.get(result, 'ItemAttributes[0].Artist[0]'),
    title: _.get(result, 'ItemAttributes[0].Title[0]'),
    store: storeName,
    url: _.get(result, 'DetailPageURL[0]'),
    imageUrl: _.get(result, 'MediumImage[0].URL[0]'),
    format: extractItemFormat(result)
  }
}

function extractUsedItem (result) {
  return Object.assign(extractItem(result), {
    priceInCents: parseInt(_.get(result, 'OfferSummary[0].LowestUsedPrice[0].Amount[0]')),
    currencyCode: _.get(result, 'OfferSummary[0].LowestUsedPrice[0].CurrencyCode[0]'),
    isUsed: true
  })
}

function extractNewItem (result) {
  return Object.assign(extractItem(result), {
    priceInCents: parseInt(_.get(result, 'OfferSummary[0].LowestNewPrice[0].Amount[0]')),
    currencyCode: _.get(result, 'OfferSummary[0].LowestNewPrice[0].CurrencyCode[0]'),
    isUsed: false
  })
}

function extractItemFormat (result) {
  const format = _.get(result, 'ItemAttributes[0].Binding[0]')
  switch (format) {
    case 'Audio CD':
      return ['CD']
    case 'LP Record':
    case 'Vinyl':
      return ['Vinyl']
    case 'DVD':
      return ['DVD']
    case 'Blu-ray':
      return ['Blu-ray']
    case 'Audio Cassette':
    default:
      return ['Other']
  }
}

function search (artist, album) {
  const params = {
    Artist: artist,
    Title: album,
    SearchIndex: 'Music',
    Sort: 'salesrank',
    ItemPage: 1,
    Condition: 'All',
    Availability: 'Available',
    ResponseGroup: 'OfferFull,Large',
    domain: 'webservices.amazon.ca'
  }
  return client.itemSearch(params)
    .then(results => {
      return results.reduce((items, result) => {
        if (isUsedConditionOffer(result)) items.push(extractUsedItem(result))
        if (isNewConditionOffer(result)) items.push(extractNewItem(result))
        return items
      }, [])
    })
}

module.exports = new BaseStore(storeName, country, search)
