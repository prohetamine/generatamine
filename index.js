#!/usr/bin/env node

const inquirer = require('inquirer')
    , puppeteer = require('puppeteer')
    , path = require('path')
    , fs = require('fs')
    , express = require('express')
    , sleep = require('sleep-promise')
    , chalk = require('chalk')

const questions = [
  {
    type: 'input',
    name: 'path_build',
    message: 'Which folder should i put the static build pages in:',
    default() {
      return 'build'
    }
  },
  {
    type: 'input',
    name: 'max_time_page_load',
    message: 'How much maximum time to devote to loading resource (in ms)',
    default() {
      return '5000'
    }
  },
  {
    type: 'list',
    name: 'hash',
    message: 'You take the hash sign (#) into account in your router as page:',
    choices: [
      'yes',
      'no'
    ]
  },
  {
    type: 'list',
    name: 'question',
    message: 'You take the question sign (?) into account in your router as page:',
    choices: [
      'yes',
      'no'
    ]
  },
  {
    type: 'list',
    name: 'screenshots',
    message: 'If you want, I can take screenshots of pages for open graph:',
    choices: [
      'yes',
      'no'
    ]
  },
  {
    type: 'input',
    name: 'site',
    message: '',
    default() {
      return 'https://prohetamine.ru'
    }
  }
]

let links = {}

const config = new Promise(async resolve => {
  const answers = await inquirer.prompt(questions)

  const screenshots = answers.screenshots === 'yes'
      , question = answers.question === 'yes'
      , hash = answers.hash === 'yes'
      , path_build = path.join(path.resolve(''), answers.path_build)

  resolve(
    () => ({
      ...answers,
      url: 'http://localhost:5555',
      debugLaunch: false,
      path_build,
      screenshots,
      question,
      hash
    })
  )
})

let pageLog = ''

log = (() => {
  let i = 21
  return (...args) => {
    if (i > 20) {
      const linksValues = Object.values(links)
      const progress = `   progress: ${chalk.bold(linksValues.filter(f => f).length + 1)}/${chalk.bold(linksValues.length + 1)}   ${pageLog ? `page: ${chalk.bold(pageLog)}   ` : ''}`

      console.clear()
      console.log(chalk.bgWhiteBright(' '.repeat(progress.length - 27)))
      console.log(
        chalk.black(
          chalk.bgWhiteBright(progress)
        )
      )
      console.log(chalk.bgWhiteBright(' '.repeat(progress.length - 27)))
      console.log('')
      i = 0
    }
    i++
    console.log(...args)
  }
})()

process.on('uncaughtException', err => {
  log(chalk.bgRed(`critical loading error (!!!)`))
})

const createPage = async (browser, link) => {
  const { max_time_page_load, screenshots, path_build, hash, question } = (await config)()

  const { origin, href } = new URL(link)

  const pathname = href
                      .replace(origin, '')
                      .replace(/#/gi, '_-hash-_')
                      .replace(/\?/, '_-quest-_')
                      .replace(/=/gi, '_-equally-_')
                      .replace(/&/gi, '_-and-_')

  const dirPath = path.join(path_build, pathname)

  try {
    if (pathname !== '/') {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  } catch (e) {
    /* is file */
    return {}
  }

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 630 });
  await page.setDefaultNavigationTimeout(0)
  await page.setRequestInterception(true)

  pageLog = href.replace(origin, '')
  log(chalk.yellow(`load page:`), `${link}`)
  page.goto(link)

  let isLoading = true

  page.on('request', request => {
    log(chalk.yellow(`loading resource:`), `${request.resourceType()}`)
    request.continue()
  })

  await new Promise(resolve => {
    let timeid = null

    page.on('response', async response => {
      try {
        const buffer = await response.buffer()
        log(chalk[isLoading ? 'green' : 'red'](`load resource:`), `${response.request().resourceType()} [${bytesToSize(buffer.length)}]`)
        timeid && clearTimeout(timeid)
        timeid = setTimeout(() => {
          isLoading = false
          log(chalk.green(`load page done:`), `${link}`)
          resolve()
        }, max_time_page_load)
      } catch (e) {
        log(chalk.bgRed(`critical loading error (!!!)`))
      }
    })
  })

  const pathIndex = path.join(dirPath, 'index.html')
  log(chalk.yellow(`save page:`), `${pathIndex}`)

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
  log(chalk.green(`save page done:`), `${pathIndex}`)

  screenshots && log(chalk.yellow(`screenshot page:`), `${link}`)
  if (screenshots) {
    const fullpath = path.join(dirPath, 'screenshot.png')
    await page.screenshot({ path: fullpath })
    log(chalk.green(`screenshot page done:`), `${fullpath}`)
  }

  const links = await page.evaluate(({ hash, question }) =>
    [...document.querySelectorAll('a')]
        .map(a => a.href)
        .filter(
          href =>
               href
            && href.match(window.location.origin)
            && (!!href.match('#') ? hash : true)
            && (!!href.match(/\?/) ? question : true)
        )
  , { hash, question })

  await page.close()

  return links.reduce((ctx, link) => {
    ctx[link] = false
    return ctx
  }, {})
}

const createRobots = async () => {
  const { path_build, site } = (await config)()
  const pathfile = path.join(path_build, 'robots.txt')
  log(chalk.yellow(`create robots.txt:`), `${pathfile}`)
  fs.writeFileSync(
    pathfile,
    `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.txt`
  )
  log(chalk.green(`create robots.txt done:`), `${pathfile}`)
}

const createSitemap = async () => {
  const { path_build, site, url } = (await config)()
  const pathfile = path.join(path_build, 'sitemap.txt')
  log(chalk.yellow(`create sitemap.txt:`), `${pathfile}`)
  fs.writeFileSync(
    pathfile,
    Object
      .keys(links)
      .map(
        link =>
          link
            .replace(url, site)
            .replace(/#/g, '_-hash-_')
            .replace(/\?/g, '_-quest-_')
      )
      .join('\n')
  )
  log(chalk.green(`create sitemap.txt done:`), `${pathfile}`)
}

const server = () => new Promise(
  async resolve => {
    const { launch, path_build } = (await config)()
    const app = express()
    app.get('*', (req, res, next) => {
      const urlPath = req.path === '/' ? 'index.html' : req.path
          , filepath = path.join(path_build, urlPath)

      if (
        fs.existsSync(filepath) &&
        !fs.statSync(filepath).isDirectory()
      ) {
        res.sendFile(filepath)
      } else {
        res.sendFile('index.html', { root: path_build })
      }
    })
    app.listen(5555, () => resolve())
  }
)

const bytesToSize = bytes => {
   const sizes = ['Bytes', 'Kb', 'Mb', 'Gb', 'Tb']
   if (bytes == 0) return '0 Byte'
   const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

;(async () => {
  const { debugLaunch, url, path_build } = (await config)()

  await server()

  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: true,
    args: [
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--window-size=1200,630'
    ],
  })

  links = await createPage(browser, url)

  for (let x = 0; Object.keys(links).find(link => !links[link]); x++) {
    const link = Object.keys(links).find(link => !links[link])

    await sleep(1000)
    const pageLinks = await createPage(browser, link)
    links[link] = true

    Object.keys(pageLinks)
      .forEach(
        link => !links[link] && (links[link] = false)
      )
  }
  await browser.close()

  await sleep(1000)
  await createRobots()
  await createSitemap()

  console.clear()
  console.log(chalk.green(`Good work!`))
  console.log('')
  console.log(`You may serve it with a static server:`)
  console.log(`  yarn global add serve`)
  console.log(`  serve build`)

  process.exit()
})()
