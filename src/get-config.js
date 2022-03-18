const fs = require('fs-extra')
    , createPath = require('./create-path')
    , initConfig = require('./init-config')

const getConfig = async () => {
  const pathfile = createPath('.generataminerc')
  let config = null

  try {
    const configJSON = await fs.readFile(pathfile, 'utf8')
    config = JSON.parse(configJSON)
  } catch (e) {
    await initConfig()
    const configJSON = await fs.readFile(pathfile, 'utf8')
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
