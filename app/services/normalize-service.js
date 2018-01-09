const diacritics = require('diacritics')

function normalize (name) {
  // remove accents and wierd caracters
  return diacritics.remove(name)
    .trim()
    .replace(/(^the\s|(,\s?)the$|\sthe$)/i, '') // remove the 'the'
    .replace(/(\s\(.+\)$)/i, '') // remove text in parentheses
    .replace(/\s(-|—|–)?\s?(EP|single)$/i, '') // remove 'EP', 'single' (prefixed or not by a '-')
    .replace(/\s(and|&)\s$/i, ' And ') // replace ' and ', ' & ' by ' And '
    .toLowerCase()
}

module.exports = {
  normalize
}
