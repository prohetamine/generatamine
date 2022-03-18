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
  const { expectation, screenshots, build, hash, query, entry } = config

  const { origin, href } = new URL(link)

  const pathname = href
                    .replace(origin, '')
                    .replace(/#/gi, '_-hash-_')
                    .replace(/\?/, '_-quest-_')
                    .replace(/=/gi, '_-equally-_')
                    .replace(/&/gi, '_-and-_')

  const dirPath = createPath(pathname)

  try {
    if (fs.existsSync(dirPath) && !fs.statSync(dirPath).isDirectory()) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  } catch (e) {
    console.log(e)
    return {}
  }

  console.log(dirPath)


  /*

  try {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  } catch (e) {
    console.log(e)
    return {}
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 630 });
  await page.setDefaultNavigationTimeout(0)
  await page.setRequestInterception(true)

  const pageLog = href.replace(origin, '')
  const _processLog = (...args) => {
    processLog(pageLog, links, ...args)
  }

  _processLog(chalk.yellow(`load page:`), `${link}`)

  page.goto(link)

  let isLoading = true

  page.on('request', request => {
    _processLog(chalk.yellow(`loading resource:`), `${request.resourceType()}`)
    request.continue()
  })

  await new Promise(resolve => {
    let timeid = null

    page.on('response', async response => {
      try {
        const buffer = await response.buffer()
        _processLog(chalk[isLoading ? 'green' : 'red'](`load resource:`), `${response.request().resourceType()} [${bytesToSize(buffer.length)}]`)
        timeid && clearTimeout(timeid)
        timeid = setTimeout(() => {
          isLoading = false
          _processLog(chalk.green(`load page done:`), `${link}`)
          resolve()
        }, expectation)
      } catch (e) {
        _processLog(chalk.bgRed(`critical loading error (!!!)`))
      }
    })
  })

  const pathIndex = path.join(dirPath, 'index.html')
  _processLog(chalk.yellow(`save page:`), `${pathIndex}`)

  const htmlpage = await page.evaluate(
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
          href.match('_-hash-_') ||
          href.match('_-quest-_') ||
          href.match('_-equally-_') ||
          href.match('_-and-_')
        ) {
          window.location.href = href
                                  .replace(/_-hash-_/gi, '#')
                                  .replace(/_-quest-_/gi, '?')
                                  .replace(/_-equally-_/gi, '=')
                                  .replace(/_-and-_/gi, '&')
        }
      `
      document.head.appendChild(script)

      return document.getElementsByTagName('html')[0].outerHTML
    }
  )

  fs.writeFileSync(pathIndex, htmlpage)
  _processLog(chalk.green(`save page done:`), `${pathIndex}`)

  screenshots && processLog(chalk.yellow(`screenshot page:`), `${link}`)
  if (screenshots) {
    const fullpath = path.join(dirPath, 'screenshot.png')
    await page.screenshot({ path: fullpath })
    _processLog(chalk.green(`screenshot page done:`), `${fullpath}`)
  }

  const _links = await page.evaluate(({ hash, query }) =>
    [...document.querySelectorAll('a')]
        .map(a => a.href)
        .filter(
          href =>
               href
            && href.match(window.location.origin)
            && (!!href.match('#') ? hash : true)
            && (!!href.match(/\?/) ? query : true)
        )
  , { hash, query })

  await page.close()*/

  await sleep(1000)

  return ['http://localhost:5555/about', 'http://localhost:5555/about#lolkek', 'http://localhost:5555/about?lol=kek&g=124'].reduce((links, link) => {
    links[link] = false
    return links
  }, links)
}



module.exports = processingPage
