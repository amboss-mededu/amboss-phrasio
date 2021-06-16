import { h, Fragment, render } from 'preact'
import { Icon, Card, Stack, Box, CardBox, Divider, Inline, Link, Text } from '@amboss/design-system'
import { getHref, getAssetSrc, track, getPhrasio } from './utils'
import TooltipLogo from './TooltipLogo'
import browser from 'webextension-polyfill'
import { FEEDBACK_URL_DE, FEEDBACK_URL_EN } from '../shared/config'
import { tooltip_link_clicked } from '../background/event-names'

export function Destinations({ destinations = [], title, locale, phrasioId, trackingLabel }) {
  if (!destinations.length) return ''
  return (
    <Stack space="xs">
      {destinations.map(({ label, anchor, lc_xid }) => {
        const href = getHref({ anchor, lc_xid, title, locale })
        function handleLinkClick(e) {
          // e.target.preventDefault()
          // const customEvent = new CustomEvent('amboss-event', {
          //   detail: { eventName: trackingEventName, phrasioId },
          // })
          // document.dispatchEvent(customEvent)
          track(trackingLabel, {
            phrasioId,
            label,
          })
        }
        return (
          <Inline key={lc_xid} space="s" noWrap vAlignItems="center">
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

const TooltipContent = ({ phrasioId, locale, theme, title, etymology, description, destinations }) => {
  return (
    <div id="content" className={theme}>
      <Card key={title} title={title} subtitle={etymology ? etymology : ''}>
        <CardBox>
          <Stack space="xs">
            {description ? <Text>{description}</Text> : ''}
            <Destinations
              destinations={destinations}
              locale={locale}
              title={title}
              phrasioId={phrasioId}
              trackingLabel={tooltip_link_clicked}
            />
          </Stack>
        </CardBox>
        <Divider />
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
              {browser.i18n.getMessage('Send_feedback')}
            </Link>
          </Inline>
        </CardBox>
      </Card>
    </div>
  )
}

class Content extends HTMLElement {
  static get observedAttributes() {
    return ['data-phrasio-id', 'data-locale', 'data-theme']
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

  constructor() {
    super()
    this.render = this.render.bind(this)
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    // todo: START: This is some very specific stuff re the ds and web-ext
    const styleElem = document.createElement('link')
    styleElem.setAttribute('rel', 'stylesheet')
    getAssetSrc({ fileHash: '/annotate/content-custom-element.css' }).then((res) => styleElem.setAttribute('href', res))

    const DSStyleElem = document.createElement('style')
    const reg = /Card|Text|Inline|Icon|Divider|Box|Stack|Header|Link|Button/
    DSStyleElem.innerText = Array.from(document.getElementsByTagName('style')).reduce((acc, cur) => {
      if (!cur.innerText) return acc
      return reg.test(cur.innerText.substring(0, 20)) ? `${acc} ${cur.innerText.split('\n')[0]}` : acc
    }, '')
    this.shadowRoot.appendChild(styleElem)
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
      console.warn(`in content-custom-element render method >> phrasioId: ${this.phrasioId} locale: ${this.locale}`)
      return undefined
    }
    // const { title, etymology, description, destinations } = getPhrasio(this.locale, this.phrasioId) || {}
    getPhrasio(this.locale, this.phrasioId).then((res) => {
      const { title, etymology, description, destinations } = res || {}
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
            phrasioId={this.phrasioId}
            theme={this.theme}
            description={description}
          />
        </>,
        this.shadowRoot
      )
    })
  }
}

export default Content
