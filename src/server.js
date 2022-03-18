const path = require('path')
    , express = require('express')
    , fs = require('fs')

const server = config => new Promise(
  async resolve => {
    const app = express()
    app.get('*', (req, res, next) => {
      const urlPath = req.path === '/' ? config.entry : req.path
          , filepath = path.join(config.build, urlPath)

      if (
        fs.existsSync(filepath) &&
        !fs.statSync(filepath).isDirectory()
      ) {
        res.sendFile(filepath)
      } else {
        res.sendFile(config.entry, { root: config.build })
      }
    })
    app.listen(config.port, () => {
      console.log('')
      console.log(`Start server: http://localhost:${config.port}`)
      console.log('')
      resolve()
    })
  }
)

module.exports = server
