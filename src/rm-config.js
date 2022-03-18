const fs = require('fs-extra')
    , createPath = require('./create-path')

const rmConfig = async () => {
  const pathfile = createPath('.generataminerc')

  if (await fs.exists(pathfile)) {
    await fs.rm(pathfile)
    console.log('')
    console.log('Your config remove. 👌')
    console.log('')
  }
}
module.exports = rmConfig
