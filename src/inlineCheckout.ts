import {
  DEFAULT_INLINE_OPTIONS,
  InlineCheckoutInstanceOptions
} from "./options";
import AbstractIframeCheckout from "./abstractIframeCheckout";

/**
 * A class for creating an inline Checkout experience.
 * Creates an iframe containing Checkout and handles all communication.
 */
export default class InlineCheckout extends AbstractIframeCheckout<
  InlineCheckoutInstanceOptions
> {
  constructor(
    sessionToken: string | null,
    options: Partial<InlineCheckoutInstanceOptions> = {
      ...DEFAULT_INLINE_OPTIONS
    }
  ) {
    super(sessionToken, {
      ...DEFAULT_INLINE_OPTIONS,
      ...options
    });

    if (this._options.container === null) return;

    // If the container is specified, create async iframe and mount it.
    this._container = this._options.container;
    this._createAsyncIframe();
  }

  /** Mounts the iframe to the specified container. */
  async mount(container: Element): Promise<HTMLIFrameElement> {
    // Set this._container to avoid exceptions when trying to access
    // this.iframe immediately after.
    this._container = container;

    return await this.iframe;
  }
}
