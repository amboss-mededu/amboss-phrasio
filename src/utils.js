import { BASE_URL_NEXT } from './config'

function replaceSpacesWithUnderscores(str) {
  return str.replace(/ /g, '_')
}

function urlify(str) {
  return encodeURIComponent(replaceSpacesWithUnderscores(str)).replace(/[!'()*]/g, (c) => {
    return '%' + c.charCodeAt(0).toString(16)
  })
}

const filterTermsByText = (terms, text) => {
  if (!terms || !text) throw new Error('filterTermsByText')

  const _text = ' ' + text.replace(/[.?'"!:;()\n\t\r]+/g, ' ') + ' '
  // todo: do I need to clone the map here??????!!!!
  // todo: remove terms from inner text when matched to prevent double work. As 'terms' or ordered by key length desc, this will have to be done backwards to prevent 'diabetes mellitus' from matching 'diabetes' but not 'diabetes mellitus'
  terms.forEach((k, v) => {
    if (v.length <= 4 || !_text.includes(' ' + v + ' ')) terms.delete(v)
  })

  return terms
}

export const getPhrasio = async (locale, id) => {
  const phrasio = await window.adaptor({
    subject: 'getTooltipContent',
    locale,
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

export function loadFonts() {
  const lato700 = new FontFace('Lato', '/fonts/Lato.700.normal.woff2')
  document.fonts.add(lato700)

  const lato400 = new FontFace('Lato', '/fonts/Lato.400.normal.woff2')
  document.fonts.add(lato400)
}

export function getHref({ particleEid, articleEid, title, locale, campaign }) {
  // href for next
  // https://next.amboss.com/us/article/4N03Yg?utm_source=aaas&utm_medium=aaas&utm_campaign=aaas&utm_term=FAST#Zefeb92d093a9fbf8b7c983722bdbb10d
  const normalisedTitle = urlify(title)
  const utmString = `?utm_campaign=${campaign}&utm_source=partner-sdk&utm_medium=website&utm_term=${normalisedTitle}`

  const anchorString = particleEid ? `#${particleEid}` : ''
  return `${BASE_URL_NEXT}${locale}/article/${articleEid}${utmString}${anchorString}`
}

export const getTermsFromText = (locale, allText) => {
  if (!window.adaptor) return []
  if (!allText || (locale !== 'us' && locale !== 'de')) return
  if (!locale) throw new Error('getTermsFromText')

  return getTerms(locale).then((res) => filterTermsByText(res, allText))
}
