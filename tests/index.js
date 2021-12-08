// import { AmbossContentCard } from '../dist/amboss-phrasio.es.js'
import { AmbossContentCard } from '../src/index'

window.customElements.define('amboss-content-card', AmbossContentCard)

const annotationOpts = {
    shouldAnnotate: true,
    annotationVariant: 'underline',
    useGlossary: 'yes',
    theme: 'light-theme',
    locale: 'de',
    token: '123456789',
    customBranding: 'no',
    withLinks: 'yes',
    adaptorMethods: {
        track: async (trackingProperties) => console.info('adaptor track', trackingProperties),
        getTerms: async (locale, token) => console.error('splat'),
        getTooltipContent: async (locale, token, contentId) => {
            const en = {"contentId":"test","title":"Creatinine clearance","subtitle":"Abbreviation: CrCl","body":"The rate at which creatinine is removed from the blood by the kidneys. Often used to estimate glomerular filtration rate because creatinine is freely filtered and secreted only in very small amounts.","media":[{"eid":"qLYCAp","copyright":"© AMBOSS","title":"Diabetes mellitus diagnosis","href":"https://media-us.amboss.com/media/thumbs/big_58905711861d9.jpg"},{"eid":"C5bqm8","copyright":"© AMBOSS","title":"Diabetes mellitus type 2 fact sheet","href":"https://media-us.amboss.com/media/thumbs/big_5f47b80b25dc9.jpg"}],"destinations":[{"label":"Diagnostic evaluation of the kidney and urinary tract → Renal function test","href":"https://next.amboss.com/us/article/kg0mv2?utm_campaign=&utm_source=partner-sdk&utm_medium=website&utm_term=#PJXW8_"}]}
            const de = {"contentId":"test","title":"ACE","subtitle":"","body":"Enzym, das vom Lungenendothel synthetisiert wird und am Regelkreis des Renin-Angiotensin-Aldosteron-Systems (RAAS) beteiligt ist. Es wandelt Angiotensin I in Angiotensin II um, das sympathikoton und vasokonstriktiv wirkt und die renale Natriumrückresorption steigert. Therapeutisch erfolgt eine Hemmung von ACE zur Behandlung der arteriellen Hypertonie. Die Bestimmung der ACE-Konzentration hat diagnostische Bedeutung bei der Beurteilung der Aktivität einer Sarkoidose.","media":[{"eid":"qLYCAp","copyright":"© AMBOSS","title":"Diabetes mellitus diagnosis","href":"https://media-us.amboss.com/media/thumbs/big_58905711861d9.jpg"},{"eid":"C5bqm8","copyright":"© AMBOSS","title":"Diabetes mellitus type 2 fact sheet","href":"https://media-us.amboss.com/media/thumbs/big_5f47b80b25dc9.jpg"}],"destinations":[{"label":"Nierendurchblutung und glomeruläre Filtration → Nierendurchblutung","href":"https://next.amboss.com/de/article/bJ0HsS?utm_campaign=&utm_source=partner-sdk&utm_medium=website&utm_term=#DHc1sd0"}]}
            return locale === 'de' ? de : en
        }
    },
}

const adaptor = async ({ subject, locale, token, trackingProperties, contentId }) => {
    switch (subject) {
        case 'track': {
            return annotationOpts.adaptorMethods.track(trackingProperties)
        }
        case 'getTerms': {
            return annotationOpts.adaptorMethods.getTerms(locale, token)
        }
        case 'getTooltipContent': {
            return annotationOpts.adaptorMethods.getTooltipContent(locale, token, contentId)
        }
        default:
            throw new Error('Message requires subject')
    }
}

window.ambossAnnotationAdaptor = (message) => adaptor({ ...annotationOpts, ...message });
