import {AmbossPhrasio} from '../dist/amboss-phrasio.es.js'
import mockTermsEn from './mocks/terms_us_en.json'
import mockTermsDe from './mocks/terms_de_de.json'
import {mockPhrasioDe, mockPhrasioEn} from './mocks'

async function init(){

window.customElements.define('amboss-phrasio', AmbossPhrasio)

const opts = {}

const adaptorMethods = {
    track: async (trackingProperties) => console.info('adaptor track', trackingProperties),
    getTerms: async (locale, token) => locale === 'de' ? mockTermsDe : mockTermsEn,
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
    ...opts,
    adaptorMethods: {
        ...adaptorMethods,
        ...opts.adaptorMethods || {}
    },
}

const adaptor = async (message, locale, token) => {
    switch (message.subject) {
        case 'track': {
            return annotationOpts.adaptorMethods.track(message.trackingProperties)
        }
        case 'getTerms': {
            return annotationOpts.adaptorMethods.getTerms(locale, token)
        }
        case 'getTooltipContent': {
            return annotationOpts.adaptorMethods.getTooltipContent(locale, token, message.id)
        }
        default:
            throw new Error('Message requires message.subject')
    }
}
window.adaptor = adaptor
}

init()
