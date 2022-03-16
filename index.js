#!/usr/bin/env node

const inquirer = require('inquirer')
    , puppeteer = require('puppeteer')
    , path = require('path')
    , fs = require('fs')
    , express = require('express')

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
    message: 'How much maximum time to devote to loading one page (in ms)',
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
  },
  {
    type: 'list',
    name: 'debug',
    message: 'Do you want to see in real time how it happens:',
    choices: [
      'yes',
      'no'
    ]
  }
]

const config = new Promise(async resolve => {
  const answers = await inquirer.prompt(questions)

  const screenshots = answers.screenshots === 'yes'
      , question = answers.question === 'yes'
      , hash = answers.hash === 'yes'
      , debug = answers.debug === 'yes'
      , path_build = path.join(path.resolve(''), answers.path_build)

  resolve(
    () => ({
      ...answers,
      url: 'http://localhost:5555',
      debug,
      debugLaunch: false,
      path_build,
      screenshots,
      question,
      hash
    })
  )
})

const progress = async links => {
  const { debug } = (await config)()
  const linksValues = Object.values(links)

  if (debug) {
    console.clear()
    console.log('progress:', `${linksValues.filter(f => f).length + 1} / ${linksValues.length + 1}`)
  }
}

const createPage = async (browser, link) => {
  const { debug, max_time_page_load, screenshots, path_build } = (await config)()

  const { origin, href } = new URL(link)

  const pathname = href.replace(origin, '').replace(/#/gi, 'hash/')
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

  debug && console.log('goto load url:', link)
  await page.goto(link)

  await new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, max_time_page_load)
  })

  debug && console.log('goto endload url:', link)

  const pathIndex = path.join(dirPath, 'index.html')
  debug && console.log('save page:', pathIndex)

  const htmlpage = await page.evaluate(
    () => {
      const script = document.createElement('script')
      script.setAttribute('type', 'text/javascript')
      script.textContent = `
        const href = window.location.href
        if (href.match(/hash\\//)) {
          window.location.href = href.replace(/hash\\//, '#')
        }
      `
      document.head.appendChild(script)

      return document.getElementsByTagName('html')[0].outerHTML
    }
  )

  fs.writeFileSync(pathIndex, htmlpage)
  debug && console.log('save page ok:', pathIndex)

  debug && screenshots && console.log('screenshot page:', link)
  if (screenshots) {
    const fullpath = path.join(dirPath, 'screenshot.png')
    await page.screenshot({ path: fullpath })
    debug && console.log('screenshot page ok:', fullpath)
  }

  const links = await page.evaluate(() =>
      [...document.querySelectorAll('a')]
        .map(a => a.href)
        .filter(f => f && f.match(window.location.origin))
  )

  await page.close()

  return links.reduce((ctx, link) => {
    ctx[link] = false
    return ctx
  }, {})
}

const createRobots = async () => {
  const { path_build, site, debug } = (await config)()
  const pathfile = path.join(path_build, 'robots.txt')
  debug && console.log('create robots.txt:', pathfile)
  fs.writeFileSync(
    pathfile,
    `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.txt`
  )
  debug && console.log('create robots.txt ok:', pathfile)
}

const createSitemap = async (links) => {
  const { path_build, site, debug, url } = (await config)()
  const pathfile = path.join(path_build, 'sitemap.txt')
  debug && console.log('create sitemap.txt:', pathfile)
  fs.writeFileSync(
    pathfile,
    Object
      .keys(links)
      .map(
        link =>
          link
            .replace(url, site)
            .replace(/#/gi, 'hash/')
      )
      .join('\n')
  )
  debug && console.log('create sitemap.txt ok:', pathfile)
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

;(async () => {
  const { debugLaunch, url, debug, path_build } = (await config)()

  await server()

  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: !debugLaunch,
    args: [
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--window-size=1200,630'
    ],
  })

  let links = {}
  await progress(links)

  links = await createPage(browser, url)

  for (let x = 0; Object.keys(links).find(link => !links[link]); x++) {
    const link = Object.keys(links).find(link => !links[link])

    await progress(links)
    const pageLinks = await createPage(browser, link)
    links[link] = true

    Object.keys(pageLinks)
      .forEach(
        link => !links[link] && (links[link] = false)
      )
  }
  await browser.close()

  await progress(links)
  await createRobots()
  await createSitemap(links)

  if (debug) {
    console.clear()
    console.log('Good work!')
    console.log(`Start static site: http://localhost:5555`)
  }
})()
