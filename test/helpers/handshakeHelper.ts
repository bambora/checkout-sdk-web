import { Action } from '../../src/actions'

export function handshakeHelper(result = true, ...scripts: Array<string>): string {
  return `
    <script>
      function onMessage(event) {
        if (event.data.action !== "${Action.InitiateHandshake}") return;
        window.removeEventListener("message", onMessage);

        const result = ${result ? 'true' : 'false'};
        const { messageId, payload } = event.data;

        window.parent.postMessage({ result, messageId, payload }, "*");

        ${scripts && scripts.join('')}
      }

      window.addEventListener("message", onMessage, false);
    </script>
  `
}

export default handshakeHelper
