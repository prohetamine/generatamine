const fs = require('fs')
    , createPath = require('./create-path')
    , chalk = require('chalk')

const createSitemap = (config, links) => {
  const { build, site } = config
  const pathfile = createPath(build, 'sitemap.txt')

  if (fs.existsSync(pathfile)) {
    fs.rmSync(pathfile)
  }

  const sitemap = links.map(link => {
    const { origin } = new URL(link)
    return link.replace(origin, site)
  }).join('\n')

  fs.writeFileSync(pathfile, sitemap)

  console.log('')
  console.log(chalk.cyan(sitemap))
  console.log('')
  console.log('Created sitemap.txt 📍')
  console.log('')
}
module.exports = createSitemap
