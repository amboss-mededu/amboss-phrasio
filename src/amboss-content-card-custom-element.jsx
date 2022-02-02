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
  H1,
  H2
} from "@amboss/design-system";
import { loadFonts } from "./utils";
import TooltipLogo from "./TooltipLogo";
import { FEEDBACK_URL_DE, FEEDBACK_URL_EN } from "./config";
import { link_clicked } from "./event-names";
import styles from "./amboss-content-card-custom-element.css";

const ContentCard = ({
  contentId,
  locale,
  theme,
  title,
  subtitle = "",
  body,
  destinations = [],
  media = [],
  customBranding,
  track,
}) => {
  if (!contentId) return <div />
  return (
    <div id="content" className={theme}>
      <Card key={title}>
        <H1>{contentId ? title : ""}</H1>
        <H2>{contentId ? subtitle : ""}</H2>
        <CardBox>
          <Stack space="xs">
            {body ? <Text>{body}</Text> : ""}
            {destinations.length > 0 ? (
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
                        size="l"
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
                <TooltipLogo />
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
    loadFonts();
  }

  connectedCallback() {
    // todo: START: This is some very specific stuff re the ds and web-ext
    const DSStyleElem = document.createElement("style");
    const reg = /Card|Text|Inline|Icon|Divider|Box|Stack|Header|Link|Button/;
    DSStyleElem.innerText = Array.from(
      document.getElementsByTagName("style")
    ).reduce((acc, cur) => {
      if (!cur.innerText) return acc;
      return reg.test(cur.innerText.substring(0, 20))
        ? `${acc} ${cur.innerText.split("\n")[0]}`
        : acc;
    }, "");
    DSStyleElem.innerText = DSStyleElem.innerText + styles.replace(/\n/, "");
    this.shadowRoot.appendChild(DSStyleElem);
    // END
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      console.log('===> name, oldValue, newValue', name, oldValue, newValue)
      if (name === 'data-content-id') this.render(newValue);
    }
  }

  render(newValue) {
    if (!window.ambossAnnotationOptions || !window.ambossAnnotationAdaptor) return undefined;
    if (typeof window.ambossAnnotationAdaptor.getTooltipContent !== 'function') return undefined;
    if (window.ambossAnnotationOptions.locale !== 'us' && window.ambossAnnotationOptions.locale !== 'de') return undefined;
    if (!this.contentId) return undefined;

    setTimeout(window.ambossAnnotationAdaptor.getTooltipContent(newValue || this.contentId).then((res) => {
      const { title, subtitle, body, destinations=[], media=[] } = res || {};
      render(
          <>
            <div id="amboss-content-card-arrow" data-popper-arrow>
              <div id="buffer"></div>
            </div>
            <ContentCard
                contentId={this.contentId}
                title={title}
                subtitle={subtitle}
                body={body}
                media={media}
                destinations={window.ambossAnnotationOptions.withLinks === 'no' ? [] : destinations}
                locale={window.ambossAnnotationOptions.locale}
                theme={window.ambossAnnotationOptions.theme}
                campaign={window.ambossAnnotationOptions.campaign}
                customBranding={window.ambossAnnotationOptions.customBranding}
                track={window.ambossAnnotationAdaptor.track}
            />
          </>,
          this.shadowRoot
      );
    }), 10)}
  }

export default AmbossContentCard;
