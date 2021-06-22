
export const getPhrasio = async (id) => {
  const phrasio = await window.adaptor({
    subject: 'getTooltipContent',
    id,
  })
  return phrasio
}

export const getTerms = (locale) => {
  if (locale === 'us' || locale === 'de') {
    return window
        .adaptor({
          subject: 'getTerms',
          locale,
        }).then((res) => {
          return res
        })
        .then((res) => new Map(Object.entries(res)))
    // you cannot get a map via the background script so get the array of tuples and create the map here
  } else {
    console.error('getTerms locale arg is :', locale)
    return undefined
  }
}

export function track(name, args) {
  return window.adaptor({
    subject: 'track',
    trackingProperties: [name, args],
  })
}

export function getHref(hrefProperties) {
  // {particleEid, articleEid, title, locale, campaign}
  return window.adaptor({
    subject: 'generateHref',
    hrefProperties,
  })
}

export function loadFonts() {
  const lato700 = new FontFace('Lato', '/fonts/Lato.700.normal.woff2')
  document.fonts.add(lato700)

  const lato400 = new FontFace('Lato', '/fonts/Lato.400.normal.woff2')
  document.fonts.add(lato400)
}
