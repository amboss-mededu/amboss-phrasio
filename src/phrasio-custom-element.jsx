import { render } from 'preact'
import { Icon, Card, Stack, CardBox, Divider, Inline, Link, Text } from '@amboss/design-system'
import { track, getPhrasio, loadFonts } from './utils'
import TooltipLogo from './TooltipLogo'
import { FEEDBACK_URL_DE, FEEDBACK_URL_EN } from './config'
import { tooltip_link_clicked } from './event-names'
import styles from './phrasio-custom-element.css'

const Destinations = ({ destinations = [], phrasioId, trackingLabel }) => {
  if (!destinations.length) return ''
  return (
    <Stack space="xs">
      {destinations.map(({ label, href }) => {
        function handleLinkClick(e) {
          track(trackingLabel, {
            phrasioId,
            label,
          })
        }
        return (
          <Inline key={label} space="s" noWrap vAlignItems="center">
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

const TooltipContent = ({ phrasioId, locale, theme, title, subtitle, body, destinations, customBranding, withLinks }) => {
  return (
    <div id="content" className={theme}>
      <Card key={title} title={title} subtitle={subtitle=''}>
        <CardBox>
          <Stack space="xs">
            {body ? <Text>{body}</Text> : ''}
            {withLinks !== 'no' ? (<Destinations
              destinations={destinations}
              phrasioId={phrasioId}
              trackingLabel={tooltip_link_clicked}
            />) : ""}
          </Stack>
        </CardBox>
        {customBranding !== 'yes' ? (<><Divider />
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
    return ['data-phrasio-id', 'data-locale', 'data-theme', 'data-campaign', 'data-custom-branding', 'data-with-links']
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

  get withLinks() {
    return this.getAttribute('data-with-links')
  }

  constructor() {
    super()
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

    getPhrasio(this.phrasioId).then((res) => {
      const { title, subtitle, body, destinations, media, phrasioId } = res || {}
      render(
        <>
          <div id="amboss-annotation-arrow" data-popper-arrow>
            <div id="buffer"></div>
          </div>
          <TooltipContent
            phrasioId={phrasioId}
            title={title}
            subtitle={subtitle}
            body={body}
            media={media}
            destinations={destinations}
            locale={this.locale}
            theme={this.theme}
            campaign={this.campaign}
            customBranding={this.customBranding}
            withLinks={this.withLinks}
          />
        </>,
        this.shadowRoot
      )
    })
  }
}

export default AmbossPhrasio
