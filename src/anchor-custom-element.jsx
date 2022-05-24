import '@webcomponents/webcomponentsjs'
import 'construct-style-sheets-polyfill'
import { createPopper } from '@popperjs/core';
import {
  CARD_TAG_NAME,
  MATCH_WRAPPER_CONTENT_ID_ATTR,
  TOOLTIP_OPENED_EVENT,
  ARROW_ID_SELECTOR
} from './consts'

function getPopperOptions(arrow) {
  return {
    placement: 'auto',
    modifiers: [
      { name: 'eventListeners', enabled: true },
      {
        name: 'offset',
        enabled: true,
        options: {
          offset: [0, 8]
        }
      },
      {
        name: 'flip',
        enabled: true,
        options: {
          allowedAutoPlacements: ['top', 'bottom', 'left', 'right'],
          rootBoundary: 'viewport'
        }
      },
      {
        name: 'preventOverflow',
        enabled: true,
        options: {
          boundariesElement: 'viewport'
        }
      },
      {
        name: 'arrow',
        options: {
          element: arrow
        }
      }
    ]
  };
}

export default class Anchor extends HTMLElement {
  static get observedAttributes() {
    return [MATCH_WRAPPER_CONTENT_ID_ATTR, 'data-annotation-variant'];
  }

  get contentId() {
    return this.getAttribute(MATCH_WRAPPER_CONTENT_ID_ATTR);
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.track = (args) => console.log('Track method placeholder', args);
    this.popperInstance = null;
    this.content = document.querySelector(CARD_TAG_NAME);
    this.arrow = this.content?.shadowRoot.querySelector(ARROW_ID_SELECTOR);
    this.shadowRoot.innerHTML = `<span><slot></slot></span>`
    const slot = this.shadowRoot.querySelector('slot');
    this.target = this.shadowRoot.querySelectorAll('span')[0];

    slot.addEventListener('slotchange', () => this.addListeners(), { once: true });

    const stylesheet = new CSSStyleSheet();
    stylesheet.insertRule(
        ':host-context([data-annotation-variant="underline"]) > span {border-bottom: solid 2px #0aa6b8;}'
    );
    stylesheet.insertRule(
        ':host-context([data-annotation-variant="none"]) > span {border-bottom: initial;pointer-events: none;}'
    );

    this.shadowRoot.adoptedStyleSheets = [stylesheet];
  }

  addListeners() {
    this.target.addEventListener('mouseover', (event) => {
      event.stopPropagation();
      this.open();

      this.content.addEventListener(
          'mouseover',
          (event) => {
            event.stopPropagation();
            this.content.setAttribute('show-popper', '');
          },
          { once: true }
      );

      this.content.addEventListener(
          'mouseleave',
          (event) => {
            event.stopPropagation();
            this.content.removeAttribute('show-popper');
            this.close();
          },
          { once: true }
      );
    });

    this.target.addEventListener('mouseleave', (event) => {
      event.stopPropagation();
      this.content.removeAttribute('show-popper');
      this.close();
    });
  }

  open() {
    if (!this.content) {
      return undefined;
    }

    if (this.popperInstance !== null) {
      this.popperInstance.destroy();
      this.popperInstance = null;
    }

    this.content.setAttribute(MATCH_WRAPPER_CONTENT_ID_ATTR, this.contentId);
    if (this.content.getAttribute(MATCH_WRAPPER_CONTENT_ID_ATTR) !== this.contentId) {
      this.open();
      return undefined;
    }

    this.arrow = this.content.shadowRoot.querySelector(ARROW_ID_SELECTOR);
    if (!this.arrow) {
      this.open();
      return undefined;
    }

    this.popperInstance = createPopper(this.target, this.content, getPopperOptions(this.arrow));
    this.popperInstance.forceUpdate();
    this.content.setAttribute('show-popper', '');
    this.track([
      TOOLTIP_OPENED_EVENT,
      {
        contentId: this.contentId || ''
      }
    ]);
  }

  close() {
    setTimeout(() => {
      if (this.content !== null && !this.content.hasAttribute('show-popper')) {
        this.content.removeAttribute(MATCH_WRAPPER_CONTENT_ID_ATTR);
        if (this.popperInstance !== null) {
          this.popperInstance.destroy();
          this.popperInstance = null;
        }
      }
    }, 50);
  }
}
