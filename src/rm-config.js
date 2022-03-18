const fs = require('fs')
    , createPath = require('./create-path')

const rmConfig = () => {
  const pathfile = createPath('.generataminerc')

  if (fs.existsSync(pathfile)) {
    fs.rmSync(pathfile)
    console.log('')
    console.log('Your config remove. 👌')
    console.log('')
  }
}
module.exports = rmConfig
