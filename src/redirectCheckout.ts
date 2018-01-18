import AbstractCheckout from "./abstractCheckout";
import {
  RedirectCheckoutInstanceOptions,
  DEFAULT_REDIRECT_OPTIONS
} from "./options";

/**
 * A class for creating a redirect Checkout experience.
 * Redirects in the `constructor` if a session token is provided.
 * To prevent the redirect, omit the session token from the constructor
 * and provide it via the `initialize` instance method instead.
 */
export default class RedirectCheckout extends AbstractCheckout<
  RedirectCheckoutInstanceOptions
> {
  constructor(
    sessionToken: string | null,
    options: Partial<RedirectCheckoutInstanceOptions> = {
      ...DEFAULT_REDIRECT_OPTIONS
    }
  ) {
    super(sessionToken, {
      ...DEFAULT_REDIRECT_OPTIONS,
      ...options
    });

    if (!this.sessionToken) return;
    this._redirect(this._checkoutUrl);
  }

  /**
   * Resolves to the URL for the Checkout session.
   * Throws `NoSessionTokenProvidedError` if no session token has been provided.
   */
  async initialize(sessionToken?: string): Promise<string> {
    await super.initialize(sessionToken);
    return this._checkoutUrl;
  }

  private _redirect(url: string) {
    window.location.assign(url);
  }
}
