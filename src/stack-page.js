let links = {}
const stackPage = (_links, callback) => new Promise(async resolve => {
  links = _links
  for (let x = 0; Object.keys(links).find(link => !links[link]); x++) {
    const link = Object.keys(links).find(link => !links[link])

    const pageLinks = await callback(link, links)
    links[link] = true

    Object.keys(pageLinks)
      .forEach(
        link => !links[link] && (links[link] = false)
      )
  }

  resolve()
})

module.exports = stackPage
