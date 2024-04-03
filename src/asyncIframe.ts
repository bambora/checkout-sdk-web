import Action from "./actions";
import { GenericMessageError, HandshakeError } from "./errors";
import { EventHandlerMap, OnOff, Emit, createEmitter } from "./events";

// tslint:disable-next-line:completed-docs
export default class AsyncIframe {
  /** Subscribe to events. */
  on: OnOff;

  /** Unsubcribe from events. */
  off: OnOff;

  /** Emit events. */
  private _emit: Emit;

  private readonly _iframeElement: Promise<HTMLIFrameElement>;
  private readonly _id: string;
  private readonly _origin: string;
  private _onMessageListener: any;

  constructor(
    source: string,
    container: Element,
    origin: string,
    eventHandlerMap?: Partial<EventHandlerMap>
  ) {
    this._origin = origin;

    // Generate unique iframe ID
    this._id = `iframe_${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Hook up emitter
    const emitter = createEmitter(eventHandlerMap);
    this.on = emitter.on.bind(this);
    this.off = emitter.off.bind(this);
    this._emit = emitter.emit.bind(this);

    // Create iframe element promise
    this._iframeElement = this._createIFrameElementAsync(source, container);
  }

  /** Removes iframe from the DOM and unhooks all events. */
  destroy() {
    const iframe = document.getElementById(this._id);

    window.removeEventListener("message", this._onMessageListener);

    delete this.on;
    delete this.off;
    delete this._emit;

    if (!iframe) return;
    iframe.parentElement!.removeChild(iframe);
  }

  /** Resolves to the HTMLIFrameElement upon handshake completion. */
  get element(): Promise<HTMLIFrameElement> {
    return this._iframeElement;
  }

  /**
   * Posts a message to the iframe content documents.
   * Resolves or rejects with a reply or acknowledgement from the iframe.
   */
  async postMessage<RequestType = any, ResponseType = any>(
    message: GenericMessageRequest<RequestType>,
    // The iframeElement parameter should only be used for the initial handshake.
    iframeElement?: HTMLIFrameElement
  ): Promise<ResponseType> {
    const iframe = iframeElement || (await this.element);
    const origin = this._origin;

    const messageId = `message_${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    const messagePromise = new Promise<ResponseType>((resolve, reject) => {
      window.addEventListener("message", onMessage, false);

      function onMessage(event: MessageEvent) {
        if (event.origin !== origin) return;
        if (!event.data || event.data.messageId !== messageId) return;

        window.removeEventListener("message", onMessage);

        const { payload } = event.data;

        if (!event.data.result) {
          reject(new GenericMessageError(payload));
        }

        resolve(payload);
      }
    });

    iframe.contentWindow.postMessage({ ...message, messageId }, this._origin);

    return messagePromise;
  }

  private async _createIFrameElementAsync(source: string, container: Element) {
    const iframeElementPromise = new Promise<HTMLIFrameElement>(
      (resolve, reject) => {
        const createdIframeElement = this._createIframeElement();

        createdIframeElement.onload = () => resolve(createdIframeElement);
        createdIframeElement.onerror = () => reject(createdIframeElement);

        createdIframeElement.setAttribute("src", source);

        container.appendChild(createdIframeElement);
      }
    );

    const iframeElement = await iframeElementPromise;

    this._rebindIframeEventHandlers(iframeElement);
    this._initiateEventProxy();

    await this._initiateHandshake(iframeElement);

    return iframeElement;
  }

  private _createIframeElement(): HTMLIFrameElement {
    const iframeElement = document.createElement("iframe");

    iframeElement.setAttribute("id", this._id);
    iframeElement.setAttribute("name", this._id);
    iframeElement.setAttribute("frameborder", "0");
    iframeElement.setAttribute("allowTransparency", "true");
    iframeElement.setAttribute("style", "width:100%; height:100%;");
    iframeElement.setAttribute("allow", "payment 'src'");

    return iframeElement;
  }

  private async _initiateHandshake(
    iframeElement: HTMLIFrameElement
  ): Promise<void> {
    try {
      await this.postMessage(
        {
          action: Action.InitiateHandshake,
          payload: this._id
        },
        iframeElement
      );
    } catch (error) {
      throw new HandshakeError((error as GenericMessageError).message);
    }
  }

  private _initiateEventProxy() {
    this._onMessageListener = this._onMessage.bind(this);
    window.addEventListener("message", this._onMessageListener, false);
  }

  private _onMessage(event: MessageEvent) {
    if (event.origin !== this._origin) return;
    if (!event.data || event.data.handshakeId !== this._id) return;

    this._emit(event.data.event, event.data.payload);
  }

  private _rebindIframeEventHandlers(
    iframeElement: HTMLIFrameElement
  ): HTMLIFrameElement {
    iframeElement.onload = () => this._initiateHandshake(iframeElement);
    iframeElement.onerror = null as any;

    return iframeElement;
  }
}

/** Takes a URL and returns its origin. */
export function getOrigin(url: string): string {
  url = url.indexOf("blob:") === 0 ? url.slice(5) : url;

  const a = document.createElement("a");
  a.setAttribute("href", url);

  return (
    `${a.protocol}//${a.hostname}` +
    (a.port !== "80" && a.port !== "443" && a.port !== "0" && a.port
      ? `:${a.port}`
      : "")
  );
}

/** The signature of message requests. */
export interface GenericMessageRequest<T = any> {
  action: Action;
  payload?: T;
}
