const fs = require('fs-extra')
    , createPath = require('./create-path')
    , chalk = require('chalk')

const createRobots = async config => {
  const { build, site } = config
  const pathfile = createPath(build, 'robots.txt')

  const isExists = await fs.exists(pathfile)

  if (isExists) {
    await fs.rm(pathfile)
  }

  const robots = `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml`

  await fs.writeFile(pathfile, robots)

  console.log('')
  console.log(chalk.cyan(robots))
  console.log('')
  console.log('Created robots.txt 🤖')
  console.log('')
}
module.exports = createRobots
