const path = require('path')
    , express = require('express')
    , fs = require('fs')
    , createPath = require('./create-path')

const devServer = ({ build, port }) => new Promise(
  async resolve => {
    const app = express()
    app.get('*', (req, res, next) => {
      const urlPath = req.path
          , filepath = createPath(build, urlPath)

      if (fs.existsSync(filepath)) {
        if (!fs.statSync(filepath).isDirectory()) {
          res.sendFile(filepath)
        } else {
          res.sendFile('index.html', { root: filepath })
        }
      } /*else {
        //  && !fs.statSync(filepath).isDirectory()
        if (fs.existsSync(filepath)) {
          res.sendFile('index.html', { root: filepath })
        } else {

        }
      }*/
    })
    app.listen(port, () => {
      console.log('')
      console.log(`Start server: http://localhost:${port} ✨`)
      console.log('')
      resolve()
    })
  }
)

module.exports = devServer
