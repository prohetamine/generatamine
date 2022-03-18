const fs = require('fs')
    , createPath = require('./create-path')
    , inquirer = require('inquirer')

let contextBuild = null

const questions = [
  {
    type: 'input',
    name: 'build',
    message: 'Which folder should i put the static build pages in:',
    default () {
      return 'build'
    },
    validate (value) {
      const isExists = fs.existsSync(createPath(value))

      if (isExists) {
        contextBuild = value
        return true
      }

      return 'This directory does not exist, you still have to create using yarn build or another tool.'
    }
  },
  {
    type: 'input',
    name: 'entry',
    message: 'Entry point:',
    default () {
      return '/'
    },
    validate (value) {
      const isExists = fs.existsSync(createPath(contextBuild, value === '/' ? 'index.html' : value))

      if (isExists) {
        return true
      }

      return 'This file does not exist, you still have to create using yarn build or another tool.'
    }
  },
  {
    type: 'input',
    name: 'port',
    message: 'Dev server port:',
    default () {
      return '5555'
    }
  },
  {
    type: 'input',
    name: 'expectation',
    message: 'How much time should I spend waiting for the next resource before the download stops (in ms):',
    default () {
      return '5000'
    },
    validate (value) {
      const ms = parseInt(value)
      if (ms > 1000) {
        return true
      }

      return 'The value is invalid, it is too small or not true at all.'
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
    name: 'query',
    message: 'You take the query sign (?) into account in your router as page:',
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
    name: 'ignore',
    message: 'Specify which file extensions to ignore: js, css, png, etc',
    default () {
      return 'none'
    },
    validate (value) {
      const types = value.split(',')
      const validTypes = types
                            .map(type => type.replace(/[^\w]/gi, ''))
                            .filter((type, i) => type === types[i])

      if (types.length === validTypes.length) {
        return true
      }

      return 'The value is invalid, not true at all.'
    }
  },
  {
    type: 'input',
    name: 'site',
    message: '',
    default () {
      return 'https://prohetamine.ru'
    }
  }
]

const cli = async () => {
  const output = await inquirer.prompt(questions)
  return {
    ...output
  }
}

module.exports = cli
