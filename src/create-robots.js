const fs = require('fs')
    , createPath = require('./create-path')
    , chalk = require('chalk')

const createRobots = config => {
  const { build, site } = config
  const pathfile = createPath(build, 'robots.txt')

  if (fs.existsSync(pathfile)) {
    fs.rmSync(pathfile)
  }

  const robots = `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.txt`

  fs.writeFileSync(pathfile, robots)

  console.log('')
  console.log(chalk.cyan(robots))
  console.log('')
  console.log('Created robots.txt 🤖')
  console.log('')
}
module.exports = createRobots
