const fs = require('fs-extra')
    , createPath = require('./create-path')
    , chalk = require('chalk')
    , moment = require('moment')

const createSitemap = async (config, links) => {
  const { build, site } = config
  const pathfile = createPath(build, 'sitemap.xml')

  const isExists = await fs.exists(pathfile)

  if (isExists) {
    await fs.rm(pathfile)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
  http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${links
    .map(link => {
      const { origin } = new URL(link)
      const isHighPriority = link.replace(origin, site) === site + '/'
      return `  <url>
    <loc>${link.replace(origin, site)}</loc>
    <lastmod>${moment().format().toString()}</lastmod>
    <priority>${isHighPriority ? '1.00' : '0.80'}</priority>
  </url>`
    })
    .join('\n')
}
</urlset>`

  await fs.writeFile(pathfile, sitemap)

  console.log('')
  console.log(chalk.cyan(sitemap))
  console.log('')
  console.log('Created sitemap.xml 📍')
  console.log('')
}
module.exports = createSitemap
