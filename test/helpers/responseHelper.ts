import { Action } from '../../src/actions'

export function responseHelper(result = true, action: Action = Action.LoadSession, payload?: unknown): string {
  return `
    <script>
      function onLoadSession(event) {
        if (event.data.action !== "${action}") return;
        window.removeEventListener("message", onMessage);

        const result = ${result ? 'true' : 'false'};
        const { messageId } = event.data;

        window.parent.postMessage(
          { result, messageId, payload: ${JSON.stringify(payload)} },
          "*"
        );
      }

      window.addEventListener("message", onLoadSession, false);
    </script>
  `
}

export default responseHelper
