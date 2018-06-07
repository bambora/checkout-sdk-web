import { IframeCheckoutInstanceOptions } from "./options";
import AsyncIframe, { getOrigin } from "./asyncIframe";
import Action from "./actions";
import {
  LoadSessionError,
  GenericMessageError,
  ContainerNotSpecifiedError
} from "./errors";
import AbstractCheckout from "./abstractCheckout";
import { OnOff, Emit, createEmitter } from "./events";

// tslint:disable-next-line:completed-docs
export default abstract class AbstractIframeCheckout<
  OptionsType extends IframeCheckoutInstanceOptions
> extends AbstractCheckout<OptionsType> {
  /** Subscribe to events. */
  on: OnOff;

  /** Unsubcribe from events. */
  off: OnOff;

  /** Emit events. */
  protected _emit: Emit;

  /** Used to avoid an exception thrown in `iframe` getter when the container is falsy. */
  protected _container: Element | null = null;

  /**
   * The `__asyncIframe` property should only be accessed via the `_asyncIframe` getter.
   * If you use `__asyncIframe` directly you better know what you're doing!
   */
  // tslint:disable-next-line:naming-convention
  private __asyncIframe?: AsyncIframe;

  constructor(sessionToken: string | null, options: Partial<OptionsType> = {}) {
    super(sessionToken, options);

    // Hook up emitter.
    const emitter = createEmitter(this._options.eventHandlerMap);
    this.on = emitter.on.bind(this);
    this.off = emitter.off.bind(this);
    this._emit = emitter.emit.bind(this);
  }

  /** Removes iframe from the DOM and unhooks all events. */
  destroy() {
    this._asyncIframe.destroy();

    delete this.on;
    delete this.off;
    delete this._emit;
  }

  /**
   * Tells the iframed Checkout to load a session via the `sessionToken` parameter.
   * Resolves upon successful load of session.
   * Throws `NoSessionTokenProvidedError` if no session token has been provided.
   * Throws `LoadSessionError` on failure to load session.
   */
  async initialize(sessionToken?: string): Promise<string> {
    return this._loadSession(await super.initialize(sessionToken));
  }

  /**
   * Resolves to the `HTMLIFrameElement` iframe.
   * Throws `ContainerNotSpecifiedError` when trying to access the element
   * without having mounted it to any container.
   */
  get iframe(): Promise<HTMLIFrameElement> {
    return this._asyncIframe.element;
  }

  protected _createAsyncIframe() {
    if (this.__asyncIframe) return;

    if (this._container === null) {
      throw new ContainerNotSpecifiedError(
        "A container must be specified before accessing the iframe."
      );
    }

    const url = this._checkoutUrl;
    const origin = getOrigin(url);

    this.__asyncIframe = new AsyncIframe(url, this._container, origin, {
      // Re-emit everything:
      "*": [(type, event) => this._emit(type, event)]
    });
  }

  protected async _loadSession(token: string): Promise<string> {
    try {
      return await this._asyncIframe.postMessage<string, string>({
        action: Action.LoadSession,
        payload: token
      });
    } catch (error) {
      throw new LoadSessionError((error as GenericMessageError).message);
    }
  }

  protected get _asyncIframe(): AsyncIframe {
    // The iframe is automatically created and mounted.
    this._createAsyncIframe();

    return this.__asyncIframe!;
  }
}
