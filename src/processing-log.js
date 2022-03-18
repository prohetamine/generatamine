const chalk = require('chalk')

const processLog = (() => {
  let i = 21
  return (pageLog, links, ...args) => {
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

module.exports = processLog
