const chalk = require('chalk')
    , path = require('path')
    , fs = require('fs')
    , sleep = require('sleep-promise')
    , createPath = require('./create-path')
    , bytesToSize = require('./bytes-to-size')
    , processingLog = require('./processing-log')

const processingPage = async ({
  browser,
  link,
  links,
  config
}) => {
  const {
    entry,
    expectation,
    isScreenshots,
    isHash,
    isQuery,
    ignore,
    build,
    port
  } = config

  const {
    origin,
    href
  } = new URL(link)

  const pathname = href
                    .replace(origin, '')
                    .replace(/#/gi, '/hash/')
                    .replace(/\?/, '/query/')
                    .replace(/&/gi, '/and/')
                    .replace(/=/gi, '/equally/')

  const pLog = (...args) =>
    processingLog(
      pathname,
      port,
      links,
      ...args
    )

  const pathDir = createPath(build, pathname)

  try {
    if (entry !== pathname) {
      if (!fs.existsSync(pathDir) || !fs.statSync(pathDir).isDirectory()) {
        fs.mkdirSync(pathDir, { recursive: true })
      }
    }
  } catch (e) {
    return {}
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 630 })
  await page.setDefaultNavigationTimeout(0)
  await page.setRequestInterception(true)

  pLog(chalk.yellow(`load page:`), `${link}`)

  page.goto(link)

  let isLoading = true

  page.on('request', request => {
    pLog(chalk.yellow(`loading resource:`), `${request.resourceType()}`)

    const fileType = request.url().match(/\.\w+$/)
    const isIgnored = !!ignore.find(_fileType => `.${_fileType}` === (fileType ? fileType[0] : ''))

    if (isIgnored) {
      request.abort()
    } else {
      request.continue()
    }
  })

  await new Promise(resolve => {
    let timeid = null

    page.on('response', async response => {
      const status = response.status()
      try {
        let buffer = []

        try {
          buffer = await response.buffer()
        } catch (e) {}

        pLog(chalk[isLoading ? 'green' : 'red'](`load resource:`), `${response.request().resourceType()} ${buffer.length > 0 ? `[${bytesToSize(buffer.length)}]` : `[${chalk.magenta(`redirect`)}]`}`)
        timeid && clearTimeout(timeid)
        timeid = setTimeout(() => {
          isLoading = false
          pLog(chalk.green(`load page done:`), `${link}`)
          resolve()
        }, expectation)
      } catch (e) {
        pLog(chalk.bgRed(`critical loading error (!!!)`))
      }
    })
  })

  const pathIndex = path.join(pathDir, 'index.html')
  pLog(chalk.yellow(`save page:`), `${pathIndex}`)

  const htmlPage = await page.evaluate(
    () => {
      if (document.querySelector('.gt-script')) {
        return document.getElementsByTagName('html')[0].outerHTML
      }

      const script = document.createElement('script')
      script.setAttribute('type', 'text/javascript')
      script.className = 'gt-script'
      script.textContent = `
        const href = window.location.href
        if (
          href.match('/hash/') ||
          href.match('/query/') ||
          href.match('/equally/') ||
          href.match('/and/')
        ) {
          window.location.href = href
                                  .replace(/\\/hash\\//gi, '#')
                                  .replace(/\\/query\\//gi, '?')
                                  .replace(/\\/equally\\//gi, '=')
                                  .replace(/\\/and\\//gi, '&')
        }
      `
      document.head.appendChild(script)

      return document.getElementsByTagName('html')[0].outerHTML
    }
  )

  fs.writeFileSync(pathIndex, htmlPage)
  pLog(chalk.green(`save page done:`), `${pathIndex}`)

  if (isScreenshots) {
    pLog(chalk.yellow(`screenshot page:`), `${link}`)
    const fullPath = path.join(pathDir, 'screenshot.png')
    await page.screenshot({ path: fullPath })
    pLog(chalk.green(`screenshot page done:`), `${fullPath}`)
  }

  const pageLinks = await page.evaluate(({ isHash, isQuery }) =>
    [...document.querySelectorAll('a')]
        .map(a => a.href)
        .filter(
          href =>
               href
            && href.match(window.location.origin)
            && (!!href.match('#') ? isHash : true)
            && (!!href.match(/\?/) ? isQuery : true)
        )
  , { isHash, isQuery })

  await page.close()

  return pageLinks.reduce((links, link) => {
    links[link] = false
    return links
  }, {})
}

module.exports = processingPage
