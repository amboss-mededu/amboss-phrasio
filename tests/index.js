import {AmbossPhrasio} from '../dist/amboss-phrasio.es.js'
import mockTermsEn from './mocks/terms_us_en.json'
import mockTermsDe from './mocks/terms_de_de.json'
import {mockPhrasioDe, mockPhrasioEn} from './mocks'
import {BASE_URL_NEXT} from '../src/config'

window.customElements.define('amboss-annotation-content', AmbossPhrasio)

const opts = {}

function generateHref({ anchor, particleEid, articleEid, title, locale, campaign, source='partner-sdk', medium='website' }) {
    const replaceSpacesWithUnderscores = (str) => str.replace(/ /g, '_')
    const urlify = (str) => encodeURIComponent(replaceSpacesWithUnderscores(str)).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16))
    const utmString = `?utm_campaign=${campaign}&utm_source=${source}&utm_medium=${medium}&utm_term=${urlify(title)}`
    const anchorString = particleEid ? `#${particleEid}` : ''
    // https://next.amboss.com/us/article/4N03Yg?utm_source=aaas&utm_medium=aaas&utm_campaign=aaas&utm_term=FAST#Zefeb92d093a9fbf8b7c983722bdbb10d
    return `${BASE_URL_NEXT}${locale}/article/${articleEid}${utmString}${anchorString}`
}

async function fetchPhrasioFromApi({ locale, campaign = '', token = '', phrasioId }) {
    if (locale !== 'de' && locale !== 'us') console.error(`locale === ${locale} in fetchPhrasio`)
    return fetch(`https://nextapi${locale}.amboss.com/`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
        },
        body: `{\"query\":\"{phraseGroup(eid: \\\"${phrasioId}\\\") {\\neid\\ntitle\\nabstract\\ntranslation\\nsynonyms\\ndestinations {\\nlabel\\narticleEid\\nparticleEid\\nanchor}\\nmedia {\\ntitle\\neid\\ncanonicalUrl\\ncopyright {\\nhtml}}}}\\n\"}`,
    }).then((response) => response.json()).catch((err) => console.error('!! err in fetchPhrasioFromApi', err))
}


function normaliseRawPhrasio(phrasioRAW, locale, campaign) {
    const destinations = Array.isArray(phrasioRAW?.data?.phraseGroup?.destinations)
        ? phrasioRAW.data.phraseGroup.destinations
        : []
    const media = Array.isArray(phrasioRAW?.data?.phraseGroup?.media) ? phrasioRAW.data.phraseGroup.media : []
    return {
        phrasioId: phrasioRAW?.data?.phraseGroup.eid || '',
        title: phrasioRAW?.data?.phraseGroup.title || '',
        subtitle: phrasioRAW?.data?.phraseGroup.translation || '',
        body: phrasioRAW?.data?.phraseGroup.abstract || '',
        media: media.map((m) => ({
            eid: m.eid,
            copyright: m?.copyright?.html,
            title: m.title,
            href: m.canonicalUrl,
        })),
        destinations: destinations.map((d) => ({
            label: d.label,
            href: generateHref({
                anchor: d.anchor || '',
                particleEid: d.particleEid || '',
                articleEid: d.articleEid || '',
                title: d.title || '',
                locale,
                campaign,
            }),
        })),
    }
}

const adaptorMethods = {
    track: async (trackingProperties) => console.info('adaptor track', trackingProperties),
    getTerms: async (locale, token) => locale === 'de' ? mockTermsDe : mockTermsEn,
    getTooltipContent: async (locale, token, id) => {
        // const phrasio = await fetchPhrasioFromApi(locale, token, id)
        const phrasio = await locale === 'de' ? mockPhrasioDe : mockPhrasioEn
        const normalisedPhrasio = await normaliseRawPhrasio(phrasio, locale, '')
        return normalisedPhrasio
    }
}

const annotationOpts = {
    shouldAnnotate: true,
    annotationVariant: 'underline',
    useGlossary: 'yes',
    theme: 'light-theme',
    locale: 'us',
    token: '123456789',
    customBranding: 'no',
    withLinks: 'yes',
    ...opts,
    adaptorMethods: {
        ...adaptorMethods,
        ...opts.adaptorMethods || {}
    },
}

window.adaptor = ({subject, locale=annotationOpts.locale, token=annotationOpts.token, id, trackingProperties, hrefProperties}) => {
    switch (subject) {
        case 'track': {
            return annotationOpts.adaptorMethods.track(trackingProperties)
        }
        case 'getTerms': {
            return annotationOpts.adaptorMethods.getTerms(locale, token)
        }
        case 'getTooltipContent': {
            return annotationOpts.adaptorMethods.getTooltipContent(locale, token, id)
        }
        case 'generateHref': {
            return annotationOpts.adaptorMethods.generateHref({...hrefProperties, locale})
        }
        default:
            throw new Error('Message requires message.subject')
    }
}
