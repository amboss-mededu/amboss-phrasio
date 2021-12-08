import { render } from "preact";
import { useState } from "preact/hooks";
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
import { track, loadFonts, getTooltipContent } from "./utils";
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
  withLinks,
}) => {
  return (
    <div id="content" className={theme}>
      <Card key={title}>
        <H1>{contentId ? title : ""}</H1>
        <H2>{contentId ? subtitle : ""}</H2>
        <CardBox>
          <Stack space="xs">
            {body ? <Text>{body}</Text> : ""}
            {withLinks !== "no" && destinations.length > 0 ? (
              <Stack space="xs">
                {destinations.map(({ label, href }) => {
                  function handleLinkClick(e) {
                    track(link_clicked, {
                      content_id: contentId,
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

class AmbossContentCard extends HTMLElement {
  static get observedAttributes() {
    return [
      "data-content-id",
      "data-locale",
      "data-theme",
    ];
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

  get campaign() {
    return this.getAttribute("data-campaign");
  }

  get customBranding() {
    return this.getAttribute("data-custom-branding");
  }

  get withLinks() {
    return this.getAttribute("data-with-links");
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
    getTooltipContent(this.locale, this.contentId).then((res) => {
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
                destinations={destinations}
                media={media}
                locale={this.locale}
                theme={this.theme}
                campaign={this.campaign}
                customBranding={this.customBranding}
                withLinks={this.withLinks}
            />
          </>,
          this.shadowRoot
      );
    })}
  }

export default AmbossContentCard;
