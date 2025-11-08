"use client";

type ComposeInput = {
  html?: string;
  css?: string;
  js?: string;
  title?: string;
};

const READY_EVENT = "practice:preview-ready";
const ERROR_EVENT = "practice:preview-error";

export const previewChannels = {
  ready: READY_EVENT,
  error: ERROR_EVENT,
};

const DEFAULT_TITLE = "Abollo Practice Preview";

function stripScripts(value: string) {
  return value.replace(/<\s*script[\s\S]*?>[\s\S]*?<\s*\/\s*script\s*>/gi, "");
}

function scrubProtocols(value: string) {
  return value.replace(
    /(href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi,
    (_match, attr) => `${attr}="#"`
  );
}

function sanitizeHtml(html: string) {
  return scrubProtocols(stripScripts(html));
}

function escapeScript(value: string) {
  return value.replace(/<\/script/gi, "<\\/script");
}

export function composeDocument({
  html = "",
  css = "",
  js = "",
  title = DEFAULT_TITLE,
}: ComposeInput) {
  const safeHtml = sanitizeHtml(html);
  const safeCss = css ?? "";
  const safeJs = escapeScript(js ?? "");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style id="__gaia-inline-style">
${safeCss}
    </style>
  </head>
  <body>
${safeHtml}
    <script>
      const __GAIA_PARENT__ = window.parent;
      Object.defineProperty(window, "top", {
        configurable: false,
        enumerable: false,
        get() {
          return null;
        },
        set() {},
      });
      Object.defineProperty(window, "parent", {
        configurable: false,
        enumerable: false,
        get() {
          return null;
        },
        set() {},
      });
      window.__gaiaPreview = {
        hadError: false,
        report(type, payload) {
          try {
            __GAIA_PARENT__?.postMessage({ type, payload }, "*");
          } catch (_) {
            // noop
          }
        },
        notifyError(message) {
          this.hadError = true;
          this.report("${ERROR_EVENT}", { message });
        },
        notifyReady() {
          if (!this.hadError) {
            this.report("${READY_EVENT}");
          }
        },
      };
      window.addEventListener("error", (event) => {
        window.__gaiaPreview.notifyError(event.message || "Preview error");
      });
      window.addEventListener("unhandledrejection", (event) => {
        const reason = event.reason;
        const message =
          (reason && (reason.message || reason.toString())) ||
          "Preview promise rejected";
        window.__gaiaPreview.notifyError(message);
      });
    </script>
    <script defer>
      try {
${safeJs}
      } catch (error) {
        window.__gaiaPreview.notifyError(
          (error && error.message) || "Runtime error"
        );
      } finally {
        window.__gaiaPreview.notifyReady();
      }
    </script>
  </body>
</html>`;
}
