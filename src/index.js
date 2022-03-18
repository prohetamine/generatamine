#!/usr/bin/env node
const path = require('path')
    , rmConfig = require('./rm-config')
    , initConfig = require('./init-config')
    , getConfig = require('./get-config')
    , server = require('./server')
    , devServer = require('./dev-server')
    , processingBrowser = require('./processing-browser')
    , createRobots = require('./create-robots')
    , createSitemap = require('./create-sitemap')
    , getSitemap = require('./get-sitemap')

const command = (process.argv[2] || '').trim()

;(async () => {
  if (command === 'init') {
    await initConfig()
  }

  if (command === 'rm') {
    await rmConfig()
  }

  if (command === 'build') {
    const config = await getConfig()
    await server(config)
    const links = await processingBrowser(config)
    await createRobots(config)
    await createSitemap(config, links)
    process.exit()
  }

  if (command === 'start') {
    const config = await getConfig()
    await devServer(config)
    await getSitemap(config)
  }
})()
