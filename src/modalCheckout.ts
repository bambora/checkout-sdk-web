import { DEFAULT_MODAL_OPTIONS, ModalCheckoutInstanceOptions } from "./options";
import AbstractIframeCheckout from "./abstractIframeCheckout";
import CheckoutEvent from "./events";

/**
 * A class for creating a modal Checkout experience.
 * Creates an iframe containing Checkout and handles all communication.
 * Creates an overlay and handles showing and hiding of it.
 */
export default class ModalCheckout extends AbstractIframeCheckout<
  ModalCheckoutInstanceOptions
> {
  /** The duration of animating the overlay in or out. */
  // tslint:disable-next-line:naming-convention
  static readonly ANIMATION_DURATION = 500;

  /** The defualt transition CSS value for the overlay animation. */
  static readonly DEFAULT_TRANSITION = `all ${
    ModalCheckout.ANIMATION_DURATION
  }ms cubic-bezier(0.25, 0.8, 0.25, 1)`;

  private _isActive: boolean = false;

  /**
   * The element that initiated showing the modal.
   * We return focus to this element when hiding the modal
   * to improve accessibility.
   */
  private _initiatingElement: EventTarget | null = null;

  private _id: string;

  private _overlayContainer: HTMLDivElement;

  private _backdrop: HTMLDivElement;

  private _enableBodyScroll: (() => void) | null = null;

  constructor(
    sessionToken: string | null,
    options: Partial<ModalCheckoutInstanceOptions> = {
      ...DEFAULT_MODAL_OPTIONS
    }
  ) {
    super(sessionToken, {
      ...DEFAULT_MODAL_OPTIONS,
      ...options
    });

    createAndApplyStyleSheet(this._options.cspNonce);

    this._id = Math.random()
      .toString(36)
      .substring(2, 15);

    this._overlayContainer = this._createOverlayContainer();
    this._backdrop = this._createBackdrop();
    this._container = this._createIframeContainer();

    document.body.appendChild(this._overlayContainer);

    this._overlayContainer.appendChild(this._backdrop);
    this._overlayContainer.appendChild(this._createFocusTrap());
    this._overlayContainer.appendChild(this._container);
    this._overlayContainer.appendChild(this._createFocusTrap());

    this._createAsyncIframe();
    this._mount(this._container);

    this.on(CheckoutEvent.Cancel, this.hide.bind(this));
    this.on(CheckoutEvent.Close, this.hide.bind(this));
  }

  /**
   * Removes the overlay and iframe from the DOM and unhooks all events.
   * If executed while the modal is displayed, body scrolling will be reenabled.
   */
  destroy() {
    super.destroy();

    this._overlayContainer.parentElement!.removeChild(this._overlayContainer);

    if (!this._enableBodyScroll) return;
    this._enableBodyScroll();
  }

  /** Shows the modal overlay. Resolves upon animation finish. */
  async show(event?: MouseEvent): Promise<void> {
    if (this._isActive) return;

    this._isActive = true;

    await this.iframe;

    this._initiatingElement = (event && event.target) || null;

    const coordinates = this._getElementCoordinates();
    const viewportDifference = this._getViewportDifference(coordinates);
    const iframeContainer = this._container as HTMLDivElement;

    iframeContainer.style.transform = `translateX(${
      viewportDifference.x
    }px) translateY(${viewportDifference.y}px)`;
    iframeContainer.style["-webkit-transform"] =
      iframeContainer.style.transform;
    this._overlayContainer.classList.add(Style.Enter);
    this._overlayContainer.style.display = "block";

    await delay(0);

    iframeContainer.style.transform = "translateX(0) translateY(0)";
    iframeContainer.style["-webkit-transform"] =
      iframeContainer.style.transform;
    this._overlayContainer.classList.add(Style.EnterActive);
    this._enableBodyScroll = disableBodyScroll();

    await delay(ModalCheckout.ANIMATION_DURATION);

    iframeContainer.focus();
    this._overlayContainer.classList.remove(Style.Enter, Style.EnterActive);
  }

  /** Hides the modal overlay. Resolves upon animation finish. */
  async hide(target?: Element): Promise<void> {
    if (!this._isActive) return;

    this._isActive = false;

    const coordinates = this._getElementCoordinates(target);
    const viewportDifference = this._getViewportDifference(coordinates);
    const iframeContainer = this._container as HTMLDivElement;

    if (this._enableBodyScroll) {
      this._enableBodyScroll();
      this._enableBodyScroll = null;
    }

    iframeContainer.style.transform = "translateX(0) translateY(0)";
    iframeContainer.style["-webkit-transform"] =
      iframeContainer.style.transform;
    this._overlayContainer.classList.add(Style.Leave);

    await delay(0);

    iframeContainer.style.transform = `translateX(${
      viewportDifference.x
    }px) translateY(${viewportDifference.y}px)`;
    iframeContainer.style["-webkit-transform"] =
      iframeContainer.style.transform;
    this._overlayContainer.classList.add(Style.LeaveActive);

    await delay(ModalCheckout.ANIMATION_DURATION);

    const initiatingElement = this._initiatingElement as HTMLElement;

    if (initiatingElement && initiatingElement.focus) {
      initiatingElement.focus();
    }

    this._initiatingElement = null;
    this._overlayContainer.style.display = "none";
    this._overlayContainer.classList.remove(Style.Leave, Style.LeaveActive);
  }

  /** Is `true` when the modal is visible. */
  get isActive(): boolean {
    return this._isActive;
  }

  private _getElementCoordinates(target?: Element): ElementCoordinates {
    const element =
      target && target.getBoundingClientRect ? target : this._initiatingElement;

    if (!element) {
      return { x: 0, y: 0 };
    }

    const boundingClientRect = (element as Element).getBoundingClientRect();

    return {
      x: boundingClientRect.left + boundingClientRect.width / 2,
      y: boundingClientRect.top + boundingClientRect.height / 2
    };
  }

  private _getViewportDifference(coordinates: ElementCoordinates) {
    if (!coordinates.x) return { x: 0, y: 0 };

    return {
      x: (coordinates.x || 0) - window.innerWidth / 2,
      y: (coordinates.y || 0) - window.innerHeight / 2
    };
  }

  private _createOverlayContainer(): HTMLDivElement {
    const overlayContainer = document.createElement("div");

    overlayContainer.setAttribute("id", `bc-overlay-container-${this._id}`);
    overlayContainer.setAttribute("aria-label", "Bambora Checkout");
    overlayContainer.setAttribute("role", "dialog");
    overlayContainer.style.display = "none";
    overlayContainer.classList.add(Style.OverlayContainer);

    return overlayContainer;
  }

  private _createIframeContainer(): HTMLDivElement {
    const iframeContainer = document.createElement("div");

    iframeContainer.setAttribute("id", `bc-iframe-container-${this._id}`);
    iframeContainer.classList.add(Style.IframeContainer);
    iframeContainer.tabIndex = 0;

    return iframeContainer;
  }

  private _createBackdrop(): HTMLDivElement {
    const backdrop = document.createElement("div");

    backdrop.setAttribute("id", `bc-backdrop-${this._id}`);
    backdrop.classList.add(Style.Backdrop);

    return backdrop;
  }

  private _createFocusTrap(): HTMLDivElement {
    const focusTrap = document.createElement("div");

    focusTrap.tabIndex = 0;
    focusTrap.addEventListener("focus", () =>
      (this._container as HTMLDivElement).focus()
    );

    return focusTrap;
  }
}

interface ElementCoordinates {
  x: number;
  y: number;
}

/** All the CSS classes the modal uses. */
export enum Style {
  Backdrop = "bc-backdrop",
  IframeContainer = "bc-iframe-container",
  OverlayContainer = "bc-overlay-container",
  Leave = "bc-leave",
  LeaveActive = "bc-leave-active",
  Enter = "bc-enter",
  EnterActive = "bc-enter-active"
}

function createAndApplyStyleSheet(cspNonce?: string) {
  // We avoid creating multiple stylesheets:
  if (document.querySelector("style[bc-style]")) return;

  const style = document.createElement("style");

  if (cspNonce) style.setAttribute("nonce", cspNonce);

  style.setAttribute("bc-style", "");
  style.appendChild(document.createTextNode(""));

  // We insert the stylesheet at the top to make style overrides easy:
  document.head.insertBefore(style, document.head.firstChild);

  const styleSheet = style.sheet as CSSStyleSheet;
  const addRuleToStyleSheet = addRule(styleSheet);

  addRuleToStyleSheet(
    `.${Style.IframeContainer}, .${Style.OverlayContainer}, .${Style.Backdrop}`,
    ["width: 100vw", "height: 100vh"]
  );

  addRuleToStyleSheet(`.${Style.OverlayContainer}`, [
    "z-index: 999999",
    "position: fixed"
  ]);

  addRuleToStyleSheet(`.${Style.OverlayContainer}, .${Style.Backdrop}`, [
    "top: 0",
    "left: 0"
  ]);

  addRuleToStyleSheet(`.${Style.Backdrop}`, [
    "background: rgba(0, 0, 0, 0.5)",
    "position: absolute"
  ]);

  addRuleToStyleSheet(`.${Style.IframeContainer}`, ["position: relative"]);

  const overlayEnter = `.${Style.OverlayContainer}.${Style.Enter}`;
  const overlayLeave = `.${Style.OverlayContainer}.${Style.Leave}`;
  const overlayEnterActive = `${overlayEnter}.${Style.EnterActive}`;
  const overlayLeaveActive = `${overlayLeave}.${Style.LeaveActive}`;

  addRuleToStyleSheet(
    `${overlayEnter}, ${overlayLeave}, ` +
      `${overlayEnter} .${Style.Backdrop}, ` +
      `${overlayLeave} .${Style.Backdrop}, ` +
      `${overlayEnter} .${Style.IframeContainer}, ` +
      `${overlayLeave} .${Style.IframeContainer}, ` +
      `${overlayEnter} iframe, ` +
      `${overlayLeave} iframe`,
    [
      `transition: ${ModalCheckout.DEFAULT_TRANSITION}`,
      `-webkit-transition: ${ModalCheckout.DEFAULT_TRANSITION}`
    ]
  );

  addRuleToStyleSheet(
    `${overlayEnter} iframe, ` + `${overlayLeaveActive} iframe`,
    ["opacity: 0", "transform: scale(0.1)"]
  );

  addRuleToStyleSheet(
    `${overlayEnter} .${Style.Backdrop}, ` +
      `${overlayLeaveActive} .${Style.Backdrop}`,
    ["opacity: 0"]
  );

  addRuleToStyleSheet(
    `${overlayEnterActive} .${Style.Backdrop}, ${overlayEnterActive} iframe, ` +
      `${overlayLeave} .${Style.Backdrop}, ${overlayLeave} iframe`,
    ["opacity: 1"]
  );

  addRuleToStyleSheet(`${overlayEnterActive} iframe, ${overlayLeave} iframe`, [
    "transform: scale(1)",
    "-webkit-transform: scale(1)"
  ]);
}

function addRule(styleSheet: CSSStyleSheet) {
  return (selector: string, properties: Array<string>) =>
    createRule(styleSheet, selector, properties);
}

function createRule(
  styleSheet: CSSStyleSheet,
  selector: string,
  properties: Array<string>
) {
  styleSheet.insertRule(`${selector} { ${properties.join("; ")} }`, 0);
}

function disableBodyScroll() {
  const documentElement = document.documentElement;
  const body = document.body;

  const previousDocumentStyle = documentElement.style.cssText || "";
  const previousBodyStyle = body.style.cssText || "";

  const scrollTop =
    window.pageYOffset || documentElement.scrollTop || body.scrollTop || 0;
  const clientWidth = body.clientWidth;
  const hasScrollbar =
    window.innerWidth > document.documentElement.clientWidth ||
    document.documentElement.scrollHeight >
      document.documentElement.clientHeight;

  if (hasScrollbar) {
    body.style.position = "fixed";
    body.style.width = "100%";
    body.style.top = `${-scrollTop}px`;
  }

  if (body.clientWidth < clientWidth) body.style.overflow = "hidden";

  if (hasScrollbar) documentElement.style.overflowY = "scroll";

  return () => {
    body.style.cssText = previousBodyStyle;
    documentElement.style.cssText = previousDocumentStyle;
    body.scrollTop = scrollTop;
    documentElement.scrollTop = scrollTop;
  };
}

/** Delays execution asynchronously. Does not block execution. */
export async function delay(duration: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, duration));
}
