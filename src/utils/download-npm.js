const algoliasearch = require(`algoliasearch`)
const fs = require(`fs-extra`)
const path = require(`path`)
const JSONStream = require(`JSONStream`)

const client = algoliasearch(`OFCNCOG2CU`, `6fbcaeafced8913bf0e4d39f0b541957`)
var index = client.initIndex(`npm-search`)

function runNpm({ keywords }) {
  fs.ensureDirSync(path.resolve(`data`))
  const stream = JSONStream.stringify()
  stream.pipe(fs.createWriteStream(path.resolve(`data/npm-search-results.json`)))

  const buildFilter = keywords.map(keyword => `keywords:${keyword}`)
  const filters = `(${buildFilter.join(` OR `)})`
  const params = { filters, hitsPerPage: 1000 }
  const browser = index.browseAll(params)

  browser.on(`result`, result => result.hits.forEach(stream.write))
  browser.on(`end`, () => stream.end())
}

runNpm({ keywords: [`gatsby-plugin`, `gatsby-component`] })
    
