#!/usr/bin/env node

const inquirer = require('inquirer')
    , puppeteer = require('puppeteer')
    , path = require('path')
    , fs = require('fs')

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
    name: 'url',
    message: 'Your development server is running, if running, then specify the url:',
    default() {
      return 'http://localhost:3000'
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
    type: 'list',
    name: 'launch',
    message: 'Do you want to see in real time how it happens:',
    choices: [
      'no',
      'yes'
    ]
  }
]

const config = new Promise(async resolve => {
  const answers = await inquirer.prompt(questions)

  const screenshots = answers.screenshots === 'yes'
      , question = answers.question === 'yes'
      , hash = answers.hash === 'yes'
      , launch = answers.launch === 'yes'
      , path_build = path.join(path.resolve(''), answers.path_build)

  resolve(
    () => ({
      ...answers,
      debug: true,
      launch,
      path_build,
      screenshots,
      question,
      hash
    })
  )
})

const createPage = async (browser, url) => {
  const { debug, max_time_page_load, screenshots, path_build } = (await config)()

  const { pathname = '/' } = new URL(url)

  const dirPath = path.join(path_build, pathname)

  if (pathname !== '/') {
    fs.mkdirSync(dirPath, { recursive: true })
  }

  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)

  debug && console.log('goto load url: ', url)
  await page.goto(url)

  await new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, max_time_page_load)
  })

  debug && console.log('goto endload url: ', url)

  const pathIndex = path.join(path_build, pathname, 'index.html')
  debug && console.log('save page: ', pathIndex)

  const htmlpage = await page.evaluate(() => document.getElementsByTagName('html')[0].outerHTML)
  fs.writeFileSync(pathIndex, htmlpage)
  debug && console.log('save page ok: ', pathIndex)

  debug && screenshots && console.log('screenshot page: ', url)
  if (screenshots) {
    const fullpath = path.join(path_build, pathname, 'screenshot.png')
    await page.screenshot({ path: fullpath })
    debug && console.log('screenshot page ok: ', fullpath)
  }

  const links = await page.evaluate(() =>
    [...document.querySelectorAll('a')].map(a => {
      return a.href
    }).filter(f => f)
  )

  await page.close()

  return links.reduce((ctx, link) => {
    ctx[link] = false
    return ctx
  }, {})
}

;(async () => {
  const { launch, url } = (await config)()

  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: !launch,
    args: ['--disable-setuid-sandbox', '--no-sandbox'],
  })

  let links = await createPage(browser, url)

  for (let x = 0; Object.keys(links).find(link => !links[link]); x++) {
    const link = Object.keys(links).find(link => !links[link])

    const pageLinks = await createPage(browser, link)

    links[link] = true

    Object.keys(pageLinks)
      .forEach(
        link => !links[link] && (links[link] = false)
      )
  }

  await browser.close()
  // 1200x630

})()
