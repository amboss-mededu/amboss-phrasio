// import { AmbossContentCard } from '../dist/amboss-phrasio.es.js'
import { AmbossContentCard } from './src/index'

// Ordinarily, the amboss-content-card custom element is created by the annotation engine
window.customElements.define('amboss-content-card', AmbossContentCard)

window.ambossAnnotationOptions = {}
window.ambossAnnotationOptions.shouldAnnotate = true
window.ambossAnnotationOptions.annotationVariant = 'underline'
window.ambossAnnotationOptions.campaign = '123890'
window.ambossAnnotationOptions.token = '794f2738efab8ed2814d44a638e10a43'

// window.ambossAnnotationOptions.locale = 'us'
window.ambossAnnotationOptions.locale = 'de'
// window.ambossAnnotationOptions.theme = 'light-theme'
window.ambossAnnotationOptions.theme = 'dark-theme'
// window.ambossAnnotationOptions.customBranding = 'no'
window.ambossAnnotationOptions.customBranding = 'yes'

window.ambossAnnotationAdaptor = {};
window.ambossAnnotationAdaptor.track = async (trackingProperties) => console.info('adaptor track', trackingProperties);
window.ambossAnnotationAdaptor.getTerms = async () => console.error('splat');
window.ambossAnnotationAdaptor.getTooltipContent = async (contentId) => {
    const us = {"contentId":"test","title":"Creatinine clearance","subtitle":"Abbreviation: CrCl","body":"The rate at which creatinine is removed from the blood by the kidneys. Often used to estimate glomerular filtration rate because creatinine is freely filtered and secreted only in very small amounts.","media":[{"eid":"qLYCAp","copyright":"© AMBOSS","title":"Diabetes mellitus diagnosis","href":"https://media-us.amboss.com/media/thumbs/big_58905711861d9.jpg"},{"eid":"C5bqm8","copyright":"© AMBOSS","title":"Diabetes mellitus type 2 fact sheet","href":"https://media-us.amboss.com/media/thumbs/big_5f47b80b25dc9.jpg"}],"destinations":[{"label":"Diagnostic evaluation of the kidney and urinary tract → Renal function test","href":"https://next.amboss.com/us/article/kg0mv2?utm_campaign=&utm_source=partner-sdk&utm_medium=website&utm_term=#PJXW8_"}]}
    const de = {"contentId":"test","title":"ACE","subtitle":"","body":"Enzym, das vom Lungenendothel synthetisiert wird und am Regelkreis des Renin-Angiotensin-Aldosteron-Systems (RAAS) beteiligt ist. Es wandelt Angiotensin I in Angiotensin II um, das sympathikoton und vasokonstriktiv wirkt und die renale Natriumrückresorption steigert. Therapeutisch erfolgt eine Hemmung von ACE zur Behandlung der arteriellen Hypertonie. Die Bestimmung der ACE-Konzentration hat diagnostische Bedeutung bei der Beurteilung der Aktivität einer Sarkoidose.","media":[{"eid":"qLYCAp","copyright":"© AMBOSS","title":"Diabetes mellitus diagnosis","href":"https://media-us.amboss.com/media/thumbs/big_58905711861d9.jpg"},{"eid":"C5bqm8","copyright":"© AMBOSS","title":"Diabetes mellitus type 2 fact sheet","href":"https://media-us.amboss.com/media/thumbs/big_5f47b80b25dc9.jpg"}],"destinations":[{"label":"Nierendurchblutung und glomeruläre Filtration → Nierendurchblutung","href":"https://next.amboss.com/de/article/bJ0HsS?utm_campaign=&utm_source=partner-sdk&utm_medium=website&utm_term=#DHc1sd0"}]}
    return window.ambossAnnotationOptions.locale === 'de' ? de : us
}