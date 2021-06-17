import { render } from 'preact'
import { Icon, Card, Stack, CardBox, Divider, Inline, Link, Text } from '@amboss/design-system'
import { getHref, track, getPhrasio, loadFonts } from './utils'
import TooltipLogo from './TooltipLogo'
import { FEEDBACK_URL_DE, FEEDBACK_URL_EN } from './config'
import { tooltip_link_clicked } from './event-names'
import styles from './phrasio-custom-element.css'

export function Destinations({ destinations = [], title, locale, phrasioId, trackingLabel, campaign }) {
  if (!destinations.length) return ''
  return (
    <Stack space="xs">
      {destinations.map(({ label, particleEid, articleEid }) => {
        const href = getHref({ particleEid, label, articleEid, title, locale, campaign })
        function handleLinkClick(e) {
          track(trackingLabel, {
            phrasioId,
            label,
          })
        }
        return (
          <Inline key={articleEid} space="s" noWrap vAlignItems="center">
            <Icon name="article" variant="primary" />
            <Link
              href={href}
              variant="primary"
              size="l"
              onClick={handleLinkClick}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </Link>
          </Inline>
        )
      })}
    </Stack>
  )
}

const TooltipContent = ({ phrasioId, locale, theme, title, etymology, description, destinations, campaign, customBranding }) => {
  return (
    <div id="content" className={theme}>
      <Card key={title} title={title} subtitle={etymology ? etymology : ''}>
        <CardBox>
          <Stack space="xs">
            {description ? <Text>{description}</Text> : ''}
            {customBranding === 'no' ? (<Destinations
              destinations={destinations}
              locale={locale}
              title={title}
              phrasioId={phrasioId}
              campaign={campaign}
              trackingLabel={tooltip_link_clicked}
            />) : ""}
          </Stack>
        </CardBox>
        {customBranding === 'no' ? (<><Divider />
        <CardBox>
          <Inline vAlignItems="center" alignItems="spaceBetween">
            <TooltipLogo />
            <Link
              size="s"
              variant="tertiary"
              href={locale === 'de' ? FEEDBACK_URL_DE : FEEDBACK_URL_EN}
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === 'de' ? "Feedback senden" : "Send feedback"}
            </Link>
          </Inline>
        </CardBox></>) : ''}
      </Card>
    </div>
  )
}

class AmbossPhrasio extends HTMLElement {
  static get observedAttributes() {
    return ['data-phrasio-id', 'data-locale', 'data-theme', 'data-campaign', 'data-custom-branding']
  }

  get phrasioId() {
    return this.getAttribute('data-phrasio-id')
  }

  get locale() {
    return this.getAttribute('data-locale')
  }

  get theme() {
    return this.getAttribute('data-theme')
  }

  get campaign() {
    return this.getAttribute('data-campaign')
  }

  get customBranding() {
    return this.getAttribute('data-custom-branding')
  }

  constructor() {
    super()
    this.render = this.render.bind(this)
    this.attachShadow({ mode: 'open' })
    loadFonts()
  }

  connectedCallback() {
    // todo: START: This is some very specific stuff re the ds and web-ext
    const DSStyleElem = document.createElement('style')
    const reg = /Card|Text|Inline|Icon|Divider|Box|Stack|Header|Link|Button/
    DSStyleElem.innerText = Array.from(document.getElementsByTagName('style')).reduce((acc, cur) => {
      if (!cur.innerText) return acc
      return reg.test(cur.innerText.substring(0, 20)) ? `${acc} ${cur.innerText.split('\n')[0]}` : acc
    }, '')
    DSStyleElem.innerText = DSStyleElem.innerText + styles.replace(/\n/, '')
    this.shadowRoot.appendChild(DSStyleElem)
    // END
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render()
    }
  }

  render() {
    if (!this.locale || !this.phrasioId) {
      console.warn(`in phrasio-custom-element render method >> phrasioId: ${this.phrasioId} locale: ${this.locale}`)
      return undefined
    }

    getPhrasio(this.locale, this.phrasioId).then((res) => {
      const { title, etymology, description, destinations, phrasioId } = res || {}
      render(
        <>
          <div id="arrow" data-popper-arrow>
            <div id="buffer"></div>
          </div>
          <TooltipContent
            destinations={destinations}
            etymology={etymology}
            title={title}
            locale={this.locale}
            phrasioId={phrasioId}
            theme={this.theme}
            campaign={this.campaign}
            customBranding={this.customBranding}
            description={description}
          />
        </>,
        this.shadowRoot
      )
    })
  }
}

export {AmbossPhrasio}
