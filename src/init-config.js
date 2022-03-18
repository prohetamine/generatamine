const fs = require('fs')
    , cli = require('./cli')
    , createPath = require('./create-path')

const initConfig = async () => {
  const config = await cli()
      , configJSON = JSON.stringify(config)

  fs.writeFileSync(
    createPath('.generataminerc'),
    configJSON
  )

  console.log('')
  console.log('Your config create! 👏')
  console.log('')

  return config
}

module.exports = initConfig
