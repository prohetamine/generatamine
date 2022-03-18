const fs = require('fs')
    , createPath = require('./create-path')
    , initConfig = require('./init-config')

const getConfig = async () => {
  const pathfile = createPath('.generataminerc')
  let config = null

  try {
    const configJSON = fs.readFileSync(pathfile, 'utf8')
    config = JSON.parse(configJSON)
  } catch (e) {
    await initConfig()
    const configJSON = fs.readFileSync(pathfile, 'utf8')
    config = JSON.parse(configJSON)
  }

  return {
    ...config,
    ignore: config.ignore.split(','),
    isHash: config.hash === 'yes',
    isQuery: config.query === 'yes',
    isScreenshots: config.screenshots === 'yes'
  }
}

module.exports = getConfig
