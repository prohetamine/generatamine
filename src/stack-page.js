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

  links = Object.keys(links)
            .map(link =>
                  link
                    .replace(/#/gi, '/hash/')
                    .replace(/\?/, '/query/')
                    .replace(/&/gi, '/and/')
                    .replace(/=/gi, '/equally/')
            )

  resolve(links)
})

module.exports = stackPage
