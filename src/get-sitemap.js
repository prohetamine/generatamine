const fs = require('fs-extra')
    , createPath = require('./create-path')
    , chalk = require('chalk')

const getSitemap = async config => {
  const { build, site, port, isProdDomain } = config
  const pathfile = createPath(build, 'sitemap.txt')

  const isExists = await fs.exists(pathfile)

  if (!isExists) {
    console.log('')
    console.log(chalk.red('Read sitemap.txt 📍'))
    console.log('')
    console.log(`Could not find the file sitemap.txt since it doesn't exist, you can create it using the command: `)
    console.log('')
    console.log(`yarn generatamine init`)
    console.log(`yarn generatamine build`)
    console.log('')
    process.exit()
    return
  }

  const text = await fs.readFile(pathfile, 'utf8')
      , links = text
                  .match(/.+/g)
                  .map(link => {
                    const { origin } = new URL(link)
                    return isProdDomain ? link : link.replace(origin, `http://localhost:${port}`)
                  }).join('\n')

  console.log('')
  console.log(chalk.cyan(links))
  console.log('')
  console.log('Read sitemap.txt 📍')
  console.log('')
}
module.exports = getSitemap
