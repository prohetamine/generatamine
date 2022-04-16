const setHead = headObject => {
  const hash = '________generatamine'

  const headHtml = document.querySelector('head')

  Object.keys(headObject).forEach(tagKey => {
    const tagObject = headObject[tagKey]

    const tag = headHtml.querySelector(`${tagObject.tag}[class="${tagKey}${hash}"]`)

    if (tag) {
      Object.keys(tagObject.attributes).forEach(key => {
        if (key === 'innerHTML') {
          tag[key] = tagObject.attributes[key]
        } else {
          tag.setAttribute(key, tagObject.attributes[key])
        }
      })
    } else {
      const tagElement = document.createElement(tagObject.tag)

      Object.keys(tagObject.attributes).forEach(key => {
        if (key === 'innerHTML') {
          tagElement[key] = tagObject.attributes[key]
        } else {
          tagElement.setAttribute(key, tagObject.attributes[key])
        }
      })

      tagElement.className = tagKey + hash

      headHtml.appendChild(tagElement)
    }
  })
}

export default setHead
