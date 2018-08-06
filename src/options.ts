import { EventHandlerMap } from "./events";

/** All possible Checkout user interfaces. */
export enum UI {
  Fullscreen = "fullscreen",
  Modal = "modal",
  Inline = "inline"
}

// tslint:disable-next-line:completed-docs
export const DEFAULT_COMMON_OPTIONS: Readonly<CommonCheckoutInstanceOptions> = {
  // Ideally, the default UI should be overriden for all concrete implementations.
  ui: UI.Fullscreen,
  language: "en-US",
  endpoint: "https://v1.checkout.bambora.com"
};

// tslint:disable-next-line:completed-docs
export const DEFAULT_REDIRECT_OPTIONS: Readonly<
  RedirectCheckoutInstanceOptions
> = {
  ...DEFAULT_COMMON_OPTIONS,
  ui: UI.Fullscreen
};

// tslint:disable-next-line:completed-docs
export const DEFAULT_MODAL_OPTIONS: Readonly<ModalCheckoutInstanceOptions> = {
  ...DEFAULT_COMMON_OPTIONS,
  ui: UI.Modal
};

// tslint:disable-next-line:completed-docs
export const DEFAULT_INLINE_OPTIONS: Readonly<InlineCheckoutInstanceOptions> = {
  ...DEFAULT_COMMON_OPTIONS,
  ui: UI.Inline,
  container: null
};

/** Maps an options object to a client-side objects object. */
export function mapOptionsToClientSideOptions(
  options: CheckoutInstanceOptions
): Partial<PaymentWindowClientSideOptions> {
  const { styles, labels, demo } = options;

  let version = "NPM_VERSION";

  if (window && typeof window["__bambora-system"] === "string") {
    version += `-${window["__bambora-system"]}`;
  }

  return { styles, labels, demo, version };
}

/** Maps an options object to a server-side objects object. */
export function mapOptionsToServerSideOptions(
  options: CheckoutInstanceOptions
): PaymentWindowServerSideOptions {
  const { ui, language } = options;
  return { ui, language };
}

/** Converts a client-side options object to a base64 string. */
export function optionsToBase64(
  options: Partial<PaymentWindowClientSideOptions>
): string {
  const stringified = JSON.stringify(options);
  return stringified === "{}" ? "" : btoa(stringified);
}

/** Converts a server-side options object to a URL-friendly query string. */
export function optionsToQueryString(options: PaymentWindowServerSideOptions) {
  return Object.keys(options)
    .map(
      key =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          (options as any)[key]
        )}`
    )
    .join("&");
}

/** Options that are passed client-side only, via the URL `#` hash. */
export interface PaymentWindowClientSideOptions {
  /** Client-side style overrides. */
  styles: any;

  /** Client-side label overrides. */
  labels: { [key: string]: string };

  /** SDK version. */
  version: string;

  /** Whether to present Checkout in demo mode (internal). */
  demo: boolean;
}

/** Options that are passed server-side only, via GET parameters. */
export interface PaymentWindowServerSideOptions {
  /** Which Checkout user interface to use for the session. */
  ui: UI;

  /** The language of Checkout for the session, i.e. `"en-US"`. */
  language: string;
}

/** Options that are common to all Checkout experiences. */
export interface CommonCheckoutInstanceOptions
  extends Partial<PaymentWindowClientSideOptions>,
    PaymentWindowServerSideOptions {
  /** The Checkout endpoint to use. */
  endpoint: string;
}

/** Options that are specific to inline Checkout experiences. */
export interface InlineCheckoutInstanceOptions
  extends CommonCheckoutInstanceOptions {
  /** The container to append the iframe to. */
  container: Element | null;

  /** Attach event listeners immediately during instantiation. */
  eventHandlerMap?: Partial<EventHandlerMap>;
}

/** Options that are specific to modal Checkout experiences. */
export interface ModalCheckoutInstanceOptions
  extends CommonCheckoutInstanceOptions {
  /**
   * Set a Content-Securty-Policy nonce property for the inline stylesheet
   * created by `ModalCheckout`.
   */
  cspNonce?: string;

  /** Attach event listeners immediately during instantiation. */
  eventHandlerMap?: Partial<EventHandlerMap>;
}

/** Options that are specific to redirect Checkout experiences. */
export type RedirectCheckoutInstanceOptions = CommonCheckoutInstanceOptions;

/** Options generic for Checkout experiences that uses an iframe. */
export type IframeCheckoutInstanceOptions =
  | InlineCheckoutInstanceOptions
  | ModalCheckoutInstanceOptions;

/** Options generic for Checkout experiences. */
export type CheckoutInstanceOptions =
  | RedirectCheckoutInstanceOptions
  | IframeCheckoutInstanceOptions;
