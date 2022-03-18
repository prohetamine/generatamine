const fs = require('fs-extra')
    , cli = require('./cli')
    , createPath = require('./create-path')

const initConfig = async () => {
  const config = await cli()
      , configJSON = JSON.stringify(config)

  await fs.writeFile(
    createPath('.generataminerc'),
    configJSON
  )

  console.log('')
  console.log('Your config create! 👏')
  console.log('')

  return config
}

module.exports = initConfig
