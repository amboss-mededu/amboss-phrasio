import '@webcomponents/webcomponentsjs'
import 'construct-style-sheets-polyfill'
import { createRoot } from 'react-dom/client';
import {
  Icon,
  Card,
  Stack,
  CardBox,
  Divider,
  Inline,
  Link,
  Text,
  H5,
  ThemeProvider,
  light,
  dark,
  CacheProvider,
  createCache
} from "@amboss/design-system";
import { loadFonts } from "./utils";
import TooltipLogo from "./TooltipLogo";
import {
  FEEDBACK_URL_DE,
  FEEDBACK_URL_EN,
  FEEDBACK_TEXT_DE,
  FEEDBACK_TEXT_EN,
  LINKED_CLICKED,
  MATCH_WRAPPER_CONTENT_ID_ATTR, ARROW_ID
} from "./consts";

const LoadingCard = ({ theme }) => (
    <div id="content" className={theme}>
      <Card>
        <CardBox>
          <Stack space="xs">
            <svg id="triangle" width="100" height="100" viewBox="-3 -4 39 39">
              <polygon fill="transparent" strokeWidth="1" points="16,0 32,32 0,32" className="animated-logo-inner"></polygon>
            </svg>
          </Stack>
        </CardBox>
      </Card>
    </div>
);

const ContentCardUI = ({
  data,
  contentId,
  locale,
  theme,
  track,
}) => {
  const { title, subtitle = '', body, destinations=[] } = data || {}
  if (!title) return <div></div>
  return (
    <div id="content" className={theme}>
      <Card key={title}>
        <CardBox>
          <H5>{title}</H5>
          <Text variant='tertiary' size='s'>{subtitle}</Text>
        </CardBox>
        <Divider />
        <CardBox>
          <Stack space="xs">
            {body ? <Text size='s'>{body}</Text> : ""}
            {!!destinations.length && (
              <Stack space="xs">
                {destinations.map(({ label, href }) => {
                  function handleLinkClick(e) {
                    track([LINKED_CLICKED, {
                      content_id: contentId,
                      label,
                    }]);
                  }
                  return (
                    <Inline key={label} space="s" noWrap vAlignItems="center">
                      <Icon name="article" variant="primary"/>
                      <Link
                        href={href}
                        variant="primary"
                        size="m"
                        onClick={handleLinkClick}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {label}
                      </Link>
                    </Inline>
                  );
                })}
              </Stack>
            )}
          </Stack>
        </CardBox>
        <Divider />
        <CardBox>
          <Inline vAlignItems="center" alignItems="spaceBetween">
            <TooltipLogo theme={theme}/>
            <Link
              size="s"
              variant="tertiary"
              href={locale === "de" ? FEEDBACK_URL_DE : FEEDBACK_URL_EN}
              target="_blank"
              rel="noopener noreferrer"
            >
              {locale === "de" ? FEEDBACK_TEXT_DE : FEEDBACK_TEXT_EN}
            </Link>
          </Inline>
        </CardBox>
      </Card>
    </div>
  );
};

const Wrapper = ({ emotionCache, theme, themeName, children }) => {
  return <ThemeProvider theme={theme}>
      <CacheProvider value={emotionCache}>
        <div id={ARROW_ID} className={themeName} data-popper-arrow>
          <div id="buffer"></div>
        </div>
        {children}
      </CacheProvider>
    </ThemeProvider>
}

const styles = `
:host-context(content-card) {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12), 0 32px 112px rgba(0, 0, 0, 0.24);
  border-radius: 12px;
  color: initial;
  visibility: hidden;
  pointer-events: none;
  height: 0;
  max-width: 400px;
}

:host-context(content-card[show-popper]) {
  visibility: visible;
  pointer-events: auto;
  z-index: 9999;
  height: auto;
}

:host-context(content-card) #content * {
  height: 0;
}

:host-context(content-card[show-popper]) #content *, :host-context(content-card[as-card]) #content * {
  height: auto;
}

@keyframes c3 {
  to {
    stroke-dashoffset: 136;
  }
}
:host-context(content-card[show-popper]) .animated-logo-inner, :host-context(content-card[as-card]) .animated-logo-inner {
  stroke: rgb(13, 191, 143);
  animation: 2s linear 0s infinite normal none running c3;
  stroke-dasharray: 17;
}

:host-context(content-card[show-popper][as-card]) > #content-card-arrow, :host-context(content-card[show-popper][no-arrow]) > #content-card-arrow {
  display: none;
}

:host-context(content-card[show-popper]) > #content-card-arrow::before {
  content: "";
  visibility: visible;
  transform: rotate(45deg);
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #fff;
}

:host-context(content-card[show-popper]) > #content-card-arrow.dark-theme::before {
  background-color: #24282d;
}

:host-context(content-card[data-popper-placement^="top"]) > #content-card-arrow {
  bottom: 5px;
}

:host-context(content-card[data-popper-placement^="bottom"]) > #content-card-arrow {
  top: -5px;
}

:host-context(content-card[show-popper]) > #content-card-arrow > #buffer::before {
  content: "";
  position: absolute;
  background-color: transparent;
}

:host-context(content-card[data-popper-placement^="bottom"]) > #content-card-arrow > #buffer::before,
:host-context(content-card[data-popper-placement^="top"]) > #content-card-arrow > #buffer::before {
  width: 240px;
  height: 1.5rem;
  margin-left: -120px;
  margin-top: -0.5rem;
}

:host-context(content-card[data-popper-placement^="top"]) > #content-card-arrow > #buffer::before {
  margin-top: -0.5rem;
}
`

class ContentCard extends HTMLElement {
  static get observedAttributes() {
    return [ MATCH_WRAPPER_CONTENT_ID_ATTR, "data-locale", "data-theme", "data-popper-placement", "show-popper" ];
  }

  get contentId() {
    return this.getAttribute(MATCH_WRAPPER_CONTENT_ID_ATTR);
  }

  get locale() {
    return this.getAttribute("data-locale");
  }

  get theme() {
    return this.getAttribute("data-theme");
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.root = createRoot(this.shadowRoot);

    this.getContent = async () => 'getContent is not defined'
    this.track = (args) => console.log('placeholder tracking function', args)

    loadFonts();

    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(styles)
    this.shadowRoot.adoptedStyleSheets = [stylesheet];

    this.emotionCache = createCache({
      key: 'shadow-css',
      container: this.shadowRoot,
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this.render()
  }

  render() {
    if (typeof this.getContent !== 'function') return undefined;
    if (this.locale !== 'us' && this.locale !== 'de') return undefined;

    if (!this.contentId) {
      this.root.render(
          <Wrapper emotionCache={this.emotionCache} theme={this.theme === 'dark-theme' ? dark : light} themeName={this.theme} asTooltip={this.asTooltip} withArrow={this.withArrow}>
            <div></div>
          </Wrapper>
      )
      return undefined
    }

    this.root.render(
        <Wrapper emotionCache={this.emotionCache} theme={this.theme === 'dark-theme' ? dark : light} themeName={this.theme} asTooltip={this.asTooltip} withArrow={this.withArrow}>
          <LoadingCard theme={this.theme}/>
        </Wrapper>
    )

    this.getContent(this.contentId).then((data) => {
      if (data === 'getContent is not defined') console.log('|> getContent is not defined ===> ');
      this.root.render(
          <Wrapper emotionCache={this.emotionCache} theme={this.theme === 'dark-theme' ? dark : light} themeName={this.theme} asTooltip={this.asTooltip} withArrow={this.withArrow}>
            <ContentCardUI
                data={data}
                contentId={this.contentId}
                locale={this.locale}
                theme={this.theme}
                track={this.track}
            />
          </Wrapper>
      )
    });
  }
}

export default ContentCard;
