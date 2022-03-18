const path = require('path')
    , express = require('express')
    , fs = require('fs-extra')
    , chalk = require('chalk')
    , createPath = require('./create-path')
    , bytesToSize = require('./bytes-to-size')

const devServer = ({ build, port, site, isProdDomain }) => new Promise(
  async resolve => {
    const app = express()
    app.get('*', async (req, res, next) => {
      const urlPath = req.path
          , filepath = createPath(build, urlPath)

      console.log(chalk.yellow(`load:`), `${urlPath}`)

      if (await fs.exists(filepath)) {
        const fileStat = await fs.stat(filepath)
        if (!fileStat.isDirectory()) {
          res.sendFile(filepath)
          console.log(chalk.green(`load resource:`), `${filepath}`, `[${bytesToSize(fileStat.size)}]`)
        } else {
          res.sendFile('index.html', { root: filepath })
          console.log(chalk.green(`load page:`), `${filepath}`, `[${bytesToSize(fileStat.size)}]`)
        }
      } else {
        res.status(404)
        res.send('not found')
        console.log(chalk.red(`load resource:`), `${filepath}`)
      }
    })
    app.listen(port, () => {
      console.log('')
      console.log(`Start server: ${isProdDomain ? site : `http://localhost:${port}`} ✨`)
      console.log('')
      resolve()
    })
  }
)

module.exports = devServer
