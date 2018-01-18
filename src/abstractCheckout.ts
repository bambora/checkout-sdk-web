import {
  DEFAULT_COMMON_OPTIONS,
  CheckoutInstanceOptions,
  mapOptionsToClientSideOptions,
  mapOptionsToServerSideOptions,
  optionsToBase64,
  optionsToQueryString
} from "./options";
import { NoSessionTokenProvidedError } from "./errors";

// tslint:disable-next-line:completed-docs
export default abstract class AbstractCheckout<
  OptionsType extends CheckoutInstanceOptions
> {
  /** `_options` are readonly to avoid arbitrary changes. */
  protected readonly _options: Readonly<OptionsType>;

  constructor(
    public sessionToken: string | null,
    options: Partial<OptionsType>
  ) {
    this._options = {
      ...DEFAULT_COMMON_OPTIONS,
      ...(options as any)
    };
  }

  /**
   * Initializes a session by its session token.
   * Throws `NoSessionTokenProvidedError` if no session token has been provided.
   */
  async initialize(sessionToken?: string): Promise<string> {
    if (sessionToken) this.sessionToken = sessionToken;

    if (!this.sessionToken) {
      throw new NoSessionTokenProvidedError(
        "A session invocation was attempted while no session token was provided."
      );
    }

    return this.sessionToken;
  }

  protected get _checkoutUrl(): string {
    const clientSideOptions = mapOptionsToClientSideOptions(this._options);
    const serverSideOptions = mapOptionsToServerSideOptions(this._options);

    let anchorString = optionsToBase64(clientSideOptions);
    if (anchorString) anchorString = `#${anchorString}`;

    const queryString = `?${optionsToQueryString(serverSideOptions)}`;

    if (!this.sessionToken) {
      return `${this._options.endpoint}${queryString}${anchorString}`;
    }

    return `${this._options.endpoint}/${
      this.sessionToken
    }${queryString}${anchorString}`;
  }
}
