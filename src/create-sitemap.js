const fs = require('fs-extra')
    , createPath = require('./create-path')
    , chalk = require('chalk')

const createSitemap = async (config, links) => {
  const { build, site } = config
  const pathfile = createPath(build, 'sitemap.txt')

  const isExists = fs.exists(pathfile)

  if (isExists) {
    await fs.rm(pathfile)
  }

  const sitemap = links.map(link => {
    const { origin } = new URL(link)
    return link.replace(origin, site)
  }).join('\n')

  await fs.writeFile(pathfile, sitemap)

  console.log('')
  console.log(chalk.cyan(sitemap))
  console.log('')
  console.log('Created sitemap.txt 📍')
  console.log('')
}
module.exports = createSitemap
