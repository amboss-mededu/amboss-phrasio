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
  Box,
  H5,
  H6,
} from "@amboss/design-system";
import { track, loadFonts, getPhrasio } from "./utils";
import TooltipLogo from "./TooltipLogo";
import { FEEDBACK_URL_DE, FEEDBACK_URL_EN } from "./config";
import { glossary_link_clicked, tooltip_link_clicked } from "./event-names";
import styles from "./phrasio-custom-element.css";

const TooltipContent = ({
  phrasioId,
  locale,
  theme,
  title,
  subtitle = "",
  body,
  destinations = [],
  media = [],
  customBranding,
  withLinks,
}) => {
  return (
    <div id="content" className={theme}>
      <Card
        key={title}
        title={phrasioId ? title : ""}
        subtitle={phrasioId ? subtitle : ""}
      >
        <CardBox>
          <Stack space="xs">
            {phrasioId && body ? <Text>{body}</Text> : ""}
            {withLinks !== "no" && destinations.length && phrasioId > 0 ? (
              <Stack space="xs">
                {destinations.map(({ label, href }) => {
                  function handleLinkClick(e) {
                    track(tooltip_link_clicked, {
                      phrasioId,
                      label,
                    });
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

export function GlossaryContent({
  phrasioId,
  title,
  subtitle = "",
  body,
  destinations = [],
  media = [],
  withLinks = "yes",
}) {
  return (
    <Box space="s">
      <H5>{title}</H5>
      {subtitle ? (
        <Box space="zero" vSpace="xxs">
          <H6>{subtitle}</H6>
        </Box>
      ) : (
        ""
      )}
      {body ? (
        <Box space="zero" vSpace="xs">
          <Text>{body}</Text>
        </Box>
      ) : (
        ""
      )}
      {withLinks !== "no" && destinations.length > 0 ? (
        <Stack space="zero">
          {destinations.map(({ label, href }, i) => {
            function handleLinkClick(e) {
              track(glossary_link_clicked, {
                phrasioId,
                label,
              });
            }
            return (
              <Box key={label} space="zero" vSpace="xs">
                <Inline space="s" noWrap vAlignItems="center">
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
              </Box>
            );
          })}
        </Stack>
      ) : (
        ""
      )}
    </Box>
  );
}

class AmbossPhrasio extends HTMLElement {
  static get observedAttributes() {
    return [
      "data-phrasio-id",
      "data-title",
      "data-subtitle",
      "data-body",
      "data-destinations",
      "data-media",
      "data-locale",
      "data-theme",
      "data-variant",
    ];
  }

  get phrasioId() {
    return this.getAttribute("data-phrasio-id");
  }

  get title() {
    return this.getAttribute("data-title");
  }

  get subtitle() {
    return this.getAttribute("data-subtitle");
  }

  get body() {
    return this.getAttribute("data-body");
  }

  get destinations() {
    return JSON.parse(this.getAttribute("data-destinations"));
  }

  get media() {
    return JSON.parse(this.getAttribute("data-media"));
  }

  get locale() {
    return this.getAttribute("data-locale");
  }

  get theme() {
    return this.getAttribute("data-theme");
  }

  get campaign() {
    return this.getAttribute("data-campaign");
  }

  get customBranding() {
    return this.getAttribute("data-custom-branding");
  }

  get withLinks() {
    return this.getAttribute("data-with-links");
  }

  get variant() {
    return this.getAttribute("data-variant");
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
      this.render();
    }
  }

  render() {
      if (this.variant === "tooltip") {
        render(
          <>
            <div id="amboss-annotation-arrow" data-popper-arrow>
              <div id="buffer"></div>
            </div>
            <TooltipContent
              phrasioId={this.phrasioId}
              title={this.title}
              subtitle={this.subtitle}
              body={this.body}
              destinations={this.destinations}
              media={this.media}
              locale={this.locale}
              theme={this.theme}
              campaign={this.campaign}
              customBranding={this.customBranding}
              withLinks={this.withLinks}
            />
          </>,
          this.shadowRoot
        );
      }
      if (this.variant === "glossary") {
        getPhrasio(this.phrasioId).then((res) => {
          console.log(`!! res =>`, res)
          const { phrasioId, title, subtitle, body, destinations=[], media=[] } = res || {};
          render(
            <GlossaryContent
              phrasioId={phrasioId}
              title={title}
              subtitle={subtitle}
              body={body}
              destinations={destinations}
              media={media}
              theme={this.theme}
              withLinks={this.withLinks}
            />,
            this.shadowRoot
          );
      });
      }
  }
}

export default AmbossPhrasio;
