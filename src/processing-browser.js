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
      '--window-size=1200,630'
    ],
  })

  const link = `http://localhost:${config.port}/${config.entry}`

  let links = await processingPage({
    browser,
    link,
    links: { [link]: false },
    config
  })

  await stackPage(links, (link, links) =>
    processingPage({
      browser,
      link,
      links,
      config
    })
  )

  await browser.close()
}

module.exports = processingBrowser
