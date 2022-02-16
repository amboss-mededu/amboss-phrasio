import { render } from "preact";
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
import { FEEDBACK_URL_DE, FEEDBACK_URL_EN } from "./config";
import { link_clicked } from "./event-names";
import styles from "./amboss-content-card-custom-element.css";

const LoadingCard = ({ theme }) => {
  return (
      <div id="content" className={theme}>
        <Card>
          <CardBox>
            <Stack space="xs"><svg id="triangle" width="100" height="100" viewBox="-3 -4 39 39">
              <polygon fill="transparent" stroke-width="1" points="16,0 32,32 0,32" className="amboss-animated-logo-inner"></polygon>
            </svg></Stack>
          </CardBox>
        </Card>
      </div>
  );
};

const ContentCard = ({
  data,
  showDestinations,
  contentId,
  locale,
  theme,
  customBranding,
  track,
}) => {
  const { title, subtitle = '', body, destinations=[], media=[] } = data || {}
  if (!contentId || !title) return <div></div>
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
            {showDestinations && destinations.length > 0 ? (
              <Stack space="xs">
                {destinations.map(({ label, href }) => {
                  function handleLinkClick(e) {
                    track([link_clicked, {
                      content_id: contentId,
                      label,
                    }]);
                  }
                  return (
                    <Inline key={label} space="s" noWrap vAlignItems="center">
                      <Icon name="article" variant="primary" />
                      <Link
                        href={href}
                        variant="primary"
                        size="xs"
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
            ) : (
              ""
            )}
          </Stack>
        </CardBox>
        {customBranding !== "yes" ? (
          <>
            <Divider />
            <CardBox>
              <Inline vAlignItems="center" alignItems="spaceBetween">
                <TooltipLogo theme={window.ambossAnnotationOptions.theme}/>
                <Link
                  size="s"
                  variant="tertiary"
                  href={locale === "de" ? FEEDBACK_URL_DE : FEEDBACK_URL_EN}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {locale === "de" ? "Feedback senden" : "Send feedback"}
                </Link>
              </Inline>
            </CardBox>
          </>
        ) : (
          ""
        )}
      </Card>
    </div>
  );
};

const Wrapper = ({ emotionCache, theme, children }) => {
    return (
        <ThemeProvider theme={theme}>
            <CacheProvider value={emotionCache}>
                <div id="amboss-content-card-arrow" data-popper-arrow>
                    <div id="buffer"></div>
                </div>
                {children}
            </CacheProvider>
        </ThemeProvider>
    )
}

class AmbossContentCard extends HTMLElement {
  static get observedAttributes() {
    return [ "data-content-id" ];
  }

  get contentId() {
    return this.getAttribute("data-content-id");
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.emotionCache = createCache({
      container: this.shadowRoot,
    });
    const styleEl = document.createElement('style')
    styleEl.innerText = styles.replaceAll(/\n/g, "")
    this.shadowRoot.appendChild(styleEl);
    loadFonts();

  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this.render()
  }

  render() {
    if (!window.ambossAnnotationOptions || !window.ambossAnnotationAdaptor) return undefined;
    if (typeof window.ambossAnnotationAdaptor.getTooltipContent !== 'function') return undefined;
    if (window.ambossAnnotationOptions.locale !== 'us' && window.ambossAnnotationOptions.locale !== 'de') return undefined;
    if (!this.contentId) {
      render(
          <Wrapper emotionCache={this.emotionCache} theme={window.ambossAnnotationOptions.theme === 'dark-theme' ? dark : light}>
            <div></div>
          </Wrapper>,
          this.shadowRoot
      )
      return undefined
    }

    render(
        <Wrapper emotionCache={this.emotionCache} theme={window.ambossAnnotationOptions.theme === 'dark-theme' ? dark : light}>
          <LoadingCard theme={window.ambossAnnotationOptions.theme}/>
          </Wrapper>,
        this.shadowRoot
    )

    window.ambossAnnotationAdaptor.getTooltipContent(this.contentId).then((_data) => {
      const data = _data || { title: "Something went wrong while fetching this card." }
      render(
          <Wrapper emotionCache={this.emotionCache} theme={window.ambossAnnotationOptions.theme === 'dark-theme' ? dark : light}>
            <ContentCard
                data={data}
                contentId={this.contentId}
                showDestinations={window.ambossAnnotationOptions.withLinks !== 'no'}
                locale={window.ambossAnnotationOptions.locale}
                theme={window.ambossAnnotationOptions.theme}
                campaign={window.ambossAnnotationOptions.campaign}
                customBranding={window.ambossAnnotationOptions.customBranding}
                track={window.ambossAnnotationAdaptor.track}
            />
          </Wrapper>,
          this.shadowRoot
      )
    });
  }
  }

export default AmbossContentCard;
