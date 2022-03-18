const path = require('path')
    , express = require('express')
    , fs = require('fs-extra')
    , createPath = require('./create-path')

const server = config => new Promise(
  async resolve => {
    const build = createPath(config.build)
    const app = express()
    app.get('*', async (req, res, next) => {
      const urlPath = req.path === '/' ? config.entry : req.path
          , filepath = path.join(build, urlPath)

      const stat = await fs.stat(filepath)
          , isExists = await fs.exists(filepath)

      if (isExists && !stat.isDirectory()) {
        res.sendFile(filepath)
      } else {
        res.sendFile(config.entry, { root: build })
      }
    })
    app.listen(config.port, () => {
      console.log('')
      console.log(`Start server: http://localhost:${config.port} ✨`)
      console.log('')
      resolve()
    })
  }
)

module.exports = server
