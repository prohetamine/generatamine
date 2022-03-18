const puppeteer = require('puppeteer')
    , stackPage = require('./stack-page')
    , processingPage = require('./processing-page')

const processingBrowser = async config => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,
    args: [
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--window-size=1200,630',
      '--disable-web-security'
    ],
  })

  const link = `http://localhost:${config.port}${config.entry}`

  let links = await processingPage({
    browser,
    link,
    links: {},
    config
  })

  const patchedLinks = await stackPage({ ...links, [link]: true }, (link, links) =>
    processingPage({
      browser,
      link,
      links,
      config
    })
  )

  await browser.close()

  console.clear()
  console.log('The structure of the site has been finalized 👌')
  console.log('')

  return patchedLinks
}

module.exports = processingBrowser
