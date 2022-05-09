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
import { FEEDBACK_URL_DE, FEEDBACK_URL_EN, FEEDBACK_TEXT_DE, FEEDBACK_TEXT_EN, LINKED_CLICKED } from "./config";
import styles from "./content-card-custom-element.css";

const LoadingCard = ({ theme }) => {
  return (
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
};

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
            {destinations.length && (
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
      <div id="content-card-arrow" className={themeName} data-popper-arrow>
        <div id="buffer"></div>
      </div>
      {children}
    </CacheProvider>
  </ThemeProvider>
}

class ContentCard extends HTMLElement {
  static get observedAttributes() {
    return [ "data-content-id", "data-locale", "data-theme" ];
  }

  get contentId() {
    return this.getAttribute("data-content-id");
  }

  get locale() {
    return this.getAttribute("data-locale");
  }

  get theme() {
    return this.getAttribute("data-theme");
  }

  constructor(getContent, track) {
    super();
    this.attachShadow({ mode: "open" });
    this.root = createRoot(this.shadowRoot);
    this.getContent = getContent
    this.track = track
    const styleEl = document.createElement('style')
    styleEl.innerText = styles.replaceAll(/\n/g, "")
    this.shadowRoot.appendChild(styleEl);
    loadFonts();
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
          <Wrapper emotionCache={this.emotionCache} theme={this.theme === 'dark-theme' ? dark : light} themeName={this.theme}>
            <div></div>
          </Wrapper>
      )
      return undefined
    }

    this.root.render(
        <Wrapper emotionCache={this.emotionCache} theme={this.theme === 'dark-theme' ? dark : light} themeName={this.theme}>
          <LoadingCard theme={this.theme}/>
          </Wrapper>
    )

    this.getContent(this.contentId).then((_data) => {
      const data = _data || { title: "Something went wrong while fetching this card." }
      this.root.render(
          <Wrapper emotionCache={this.emotionCache} theme={this.theme === 'dark-theme' ? dark : light} themeName={this.theme}>
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
