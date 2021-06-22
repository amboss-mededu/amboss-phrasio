import {AmbossPhrasio} from '../dist/amboss-phrasio.es.js'
import mockTermsEn from './mocks/terms_us_en.json'
import mockTermsDe from './mocks/terms_de_de.json'
import {mockPhrasioDe, mockPhrasioEn} from './mocks'
import {BASE_URL_NEXT} from '../src/config'

window.customElements.define('amboss-phrasio', AmbossPhrasio)

const opts = {}

const adaptorMethods = {
    track: async (trackingProperties) => console.info('adaptor track', trackingProperties),
    getTerms: async (locale, token) => locale === 'de' ? mockTermsDe : mockTermsEn,
    generateHref: ({ particleEid, articleEid, title, locale, campaign }) => {
        const replaceSpacesWithUnderscores = (str) => str.replace(/ /g, '_')
        const urlify = (str) => encodeURIComponent(replaceSpacesWithUnderscores(str)).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16))
        const utmString = `?utm_campaign=${campaign}&utm_source=partner-sdk&utm_medium=website&utm_term=${urlify(title)}`
        const anchorString = particleEid ? `#${particleEid}` : ''
        // https://next.amboss.com/us/article/4N03Yg?utm_source=aaas&utm_medium=aaas&utm_campaign=aaas&utm_term=FAST#Zefeb92d093a9fbf8b7c983722bdbb10d
        return `${BASE_URL_NEXT}${locale}/article/${articleEid}${utmString}${anchorString}`
    },
    getTooltipContent: async (locale, token, id) => {
        const phrasio = await locale === 'de' ? mockPhrasioDe : mockPhrasioEn
        const title = phrasio?.data?.phraseGroup.title
        const description = phrasio?.data?.phraseGroup.abstract
        const etymology = phrasio?.data?.phraseGroup.translation
        const destinations = phrasio?.data?.phraseGroup.destinations
        const phrasioId = phrasio?.data?.phraseGroup.eid
        return {
            title,
            description,
            etymology,
            destinations,
            phrasioId
        }
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
