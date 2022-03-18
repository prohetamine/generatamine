const fs = require('fs')
    , createPath = require('./create-path')
    , chalk = require('chalk')

const getSitemap = (config) => {
  const { build, site, port } = config
  const pathfile = createPath(build, 'sitemap.txt')

  if (!fs.existsSync(pathfile)) {
    console.log('')
    console.log(chalk.red('Read sitemap.txt 📍'))
    console.log('')
    return
  }

  const text = fs.readFileSync(pathfile, 'utf8')
      , links = text
                  .match(/.+/g)
                  .map(link => {
                    const { origin } = new URL(link)
                    return link.replace(origin, `http://localhost:${port}`)
                  }).join('\n')

  console.log('')
  console.log(chalk.cyan(links))
  console.log('')
  console.log('Read sitemap.txt 📍')
  console.log('')
}
module.exports = getSitemap
