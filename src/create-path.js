const path = require('path')

const createPath = (...paths) => path.join(path.resolve(''), ...paths)

module.exports = createPath
