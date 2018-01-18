// tslint:disable-next-line:no-reference
/// <reference path="./global.d.ts" />

import AsyncIframe, { getOrigin } from "../src/asyncIframe";
import CheckoutEvent from "../src/events";
import { HandshakeError, GenericMessageError } from "../src/errors";
import {
  getHtmlBlobUrl,
  handshakeHelper,
  eventHelper,
  responseHelper
} from "./helpers";

describe("AsyncIframe", () => {
  describe("#constructor()", () => {
    it("loads the source parameter in an iframe and perform handshake", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());

      const asyncIframe = new AsyncIframe(
        blobUrl,
        document.body,
        getOrigin(blobUrl)
      );
      const iframeElement = await asyncIframe.element;

      expect(iframeElement).to.be.instanceOf(HTMLIFrameElement);
      expect(iframeElement.src).to.equal(blobUrl);
    });

    it("throws HandshakeError upon failure to load session", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper(false));

      try {
        await new AsyncIframe(blobUrl, document.body, getOrigin(blobUrl))
          .element;
        throw new Error("An error should be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(HandshakeError);
      }
    });
  });

  describe("#postMessage()", () => {
    it("resolves on successful response", async () => {
      // We just use any random action
      const action = "someRandomTestAction" as any;

      const blobUrl = getHtmlBlobUrl(
        handshakeHelper(),
        responseHelper(true, action)
      );
      const asyncIframe = new AsyncIframe(
        blobUrl,
        document.body,
        getOrigin(blobUrl)
      );

      await asyncIframe.postMessage({ action });
    });

    it("throws GenericMessageError on erronous response", async () => {
      // We just use any random action
      const action = "someRandomTestAction" as any;

      const blobUrl = getHtmlBlobUrl(
        handshakeHelper(),
        responseHelper(false, action)
      );
      const asyncIframe = new AsyncIframe(
        blobUrl,
        document.body,
        getOrigin(blobUrl)
      );

      try {
        await asyncIframe.postMessage({ action });
        throw new Error("An error should be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(GenericMessageError);
      }
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

      const { type, event } = await new Promise<{ type: string; event: any }>(
        resolve => {
          const asyncIframe = new AsyncIframe(
            blobUrl,
            document.body,
            getOrigin(blobUrl)
          );
          asyncIframe.on("*", ((t, e) =>
            resolve({ type: t, event: e })) as any);
        }
      );

      expect(type).to.equal(CheckoutEvent.Authorize);
      expect(event.transactionId).to.equal("123");
    });
  });

  describe("#destroy()", () => {
    it("removes the iframe element from the DOM", async () => {
      const blobUrl = getHtmlBlobUrl(handshakeHelper());

      const asyncIframe = new AsyncIframe(
        blobUrl,
        document.body,
        getOrigin(blobUrl)
      );
      const iframeElement = await asyncIframe.element;

      expect(document.body.contains(iframeElement)).to.equal(true);

      asyncIframe.destroy();

      expect(document.body.contains(iframeElement)).to.equal(false);
    });
  });
});
