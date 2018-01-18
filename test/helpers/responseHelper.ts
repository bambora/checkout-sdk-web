import Action from "../../src/actions";

// tslint:disable:completed-docs
export function responseHelper(
  result: boolean = true,
  action: Action = Action.LoadSession,
  payload?: any
): string {
  return `
    <script>
      function onLoadSession(event) {
        if (event.data.action !== "${action}") return;
        window.removeEventListener("message", onMessage);

        const result = ${result ? "true" : "false"};
        const { messageId } = event.data;

        window.parent.postMessage(
          { result, messageId, payload: ${JSON.stringify(payload)} },
          "*"
        );
      }

      window.addEventListener("message", onLoadSession, false);
    </script>
  `;
}

export default responseHelper;
