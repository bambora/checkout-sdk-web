// tslint:disable-next-line:no-reference
/// <reference path="./global.d.ts" />

import InlineCheckout from "../src/inlineCheckout";
import { LoadSessionError, ContainerNotSpecifiedError } from "../src/errors";
import AsyncIframe from "../src/asyncIframe";
import { getHtmlBlobUrl, handshakeHelper, eventHelper } from "./helpers";
import CheckoutEvent from "../src/events";

describe("InlineCheckout", () => {
  describe("#constructor()", () => {
    it("mounts the iframe when container is provided in the constructor", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());

      const checkoutUrl = sinon
        .stub(InlineCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const divElement = document.body.appendChild(
        document.createElement("div")
      );

      const checkout = new InlineCheckout("123456", {
        container: divElement
      });

      const iframe = await checkout.iframe;

      expect(iframe.parentElement).to.equal(divElement);
      checkoutUrl.restore();
    });
  });

  describe("#initialize()", () => {
    it("resolves upon successful load of session", async () => {
      const newSessionToken = "654321";
      const postMessage = sinon.stub(AsyncIframe.prototype, "postMessage");
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(InlineCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      postMessage.resolves(newSessionToken);

      const checkout = new InlineCheckout("123456", {
        container: document.body
      });

      expect(await checkout.initialize(newSessionToken)).to.equal(
        newSessionToken
      );

      postMessage.restore();
      checkoutUrl.restore();
    });

    it("throws LoadSessionError on failure to load session", async () => {
      const newSessionToken = "654321";
      const postMessage = sinon.stub(AsyncIframe.prototype, "postMessage");
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(InlineCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      postMessage.rejects();

      const checkout = new InlineCheckout("123456", {
        container: document.body
      });

      try {
        await checkout.initialize(newSessionToken);
        throw new Error("An error should be thrown");
      } catch (error) {
        expect(error).to.be.instanceof(LoadSessionError);
      }

      postMessage.restore();
      checkoutUrl.restore();
    });
  });

  describe("#mount()", () => {
    it("mounts the iframe to the provided container", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(InlineCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const divElement = document.body.appendChild(
        document.createElement("div")
      );

      const checkout = new InlineCheckout("123456", {
        container: null
      });

      await checkout.mount(divElement);

      const iframe = await checkout.iframe;

      expect(iframe.parentElement).to.equal(divElement);
      checkoutUrl.restore();
    });
  });

  describe("#iframe", () => {
    it("resolves to a HTMLIFrameElement", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(InlineCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const checkout = new InlineCheckout("123456");
      checkout.mount(document.body);

      const iframe = await checkout.iframe;

      expect(iframe).to.be.instanceof(HTMLIFrameElement);
      expect(iframe).not.to.be.instanceof(HTMLDivElement);

      checkoutUrl.restore();
    });

    it("throws ContainerNotSpecifiedError when accessing the iframe without having specified a container", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(InlineCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const checkout = new InlineCheckout("123456", {
        container: null
      });

      try {
        await checkout.iframe;
        throw new Error("An error should be thrown");
      } catch (error) {
        expect(error).to.be.instanceof(ContainerNotSpecifiedError);
      }

      checkoutUrl.restore();
    });
  });

  describe("#on()", () => {
    it("calls handler upon receiving events", async () => {
      const blobUrl = getHtmlBlobUrl(
        handshakeHelper(
          true,
          eventHelper(CheckoutEvent.Authorize, { transactionId: "123" })
        )
      );

      const checkoutUrl = sinon
        .stub(InlineCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const { type, event } = await new Promise<{ type: string; event: any }>(
        resolve => {
          const checkout = new InlineCheckout("123456");
          checkout.mount(document.body);
          checkout.on("*", (t, e) => resolve({ type: t, event: e }));
        }
      );

      expect(type).to.equal(CheckoutEvent.Authorize);
      expect(event.transactionId).to.equal("123");

      checkoutUrl.restore();
    });
  });

  describe("#destroy()", () => {
    it("removes the iframe element from the DOM", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());
      const checkoutUrl = sinon
        .stub(InlineCheckout.prototype, "_checkoutUrl" as any)
        .get(() => blobUrl);

      const checkout = new InlineCheckout("123456");
      checkout.mount(document.body);

      const iframe = await checkout.iframe;

      expect(document.body.contains(iframe)).to.equal(true);

      checkout.destroy();

      expect(document.body.contains(iframe)).to.equal(false);

      checkoutUrl.restore();
    });
  });
});
