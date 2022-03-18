const chalk = require('chalk')

const processLog = (() => {
  let i = 21
  return (pageLog, port, links, ...args) => {
    if (i > 20) {
      const linksValues = Object.values(links)
      const progress = `   devServer: ${chalk.bold(`http://localhost:${port}`)}   progress: ${chalk.bold(linksValues.filter(f => f).length)}/${chalk.bold(linksValues.length)}   ${pageLog ? `page: ${chalk.bold(pageLog)}   ` : ''}`

      console.clear()
      console.log(chalk.bgWhiteBright(' '.repeat(progress.length - 36)))
      console.log(
        chalk.black(
          chalk.bgWhiteBright(progress)
        )
      )
      console.log(chalk.bgWhiteBright(' '.repeat(progress.length - 36)))
      console.log('')
      i = 0
    }
    i++
    console.log(...args)
  }
})()

module.exports = processLog
