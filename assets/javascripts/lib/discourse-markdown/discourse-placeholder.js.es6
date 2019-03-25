import { parseBBCodeTag } from "pretty-text/engines/discourse-markdown/bbcode-block";

function addPlaceholder(buffer, matches, state) {
  let parsed = parseBBCodeTag(
    `[placeholder keys${matches[1]}]`,
    0,
    matches[1].length + 18
  );

  let token;

  const keys = parsed.attrs.keys
    .split(",")
    .filter(x => x)
    .map(x => state.md.utils.escapeHtml(x));

  token = new state.Token("div_open", "div", 1);
  token.attrs = [
    ["data-keys", keys.join(",")],
    ["class", "discourse-placeholder"]
  ];
  buffer.push(token);

  keys.forEach(key => {
    token = new state.Token("div_open", "div", 1);
    token.attrs = [["class", "discourse-placeholder-container"]];
    buffer.push(token);

    token = new state.Token("span_open", "span", 1);
    token.attrs = [["class", "discourse-placeholder-name"]];
    buffer.push(token);

    token = new state.Token("text", "", 0);
    token.content = key;
    buffer.push(token);

    token = new state.Token("span_close", "span", -1);
    buffer.push(token);

    token = new state.Token("input", "input", 0);
    token.attrs = [
      ["class", "discourse-placeholder-value"],
      ["data-key", key],
      ["placeholder", I18n.t("discourse_placeholder.placeholder")]
    ];
    buffer.push(token);

    token = new state.Token("div_close", "div", -1);
    buffer.push(token);
  });

  token = new state.Token("div_close", "div", -1);
  buffer.push(token);
}

export function setup(helper) {
  helper.whiteList([
    "div.discourse-placeholder",
    "div.discourse-placeholder-container",
    "input.discourse-placeholder-value",
    "span.discourse-placeholder-name",
    "div[data-keys]",
    "input[data-key]",
    "input[placeholder]"
  ]);

  helper.registerOptions((opts, siteSettings) => {
    opts.features[
      "discourse-placeholder"
    ] = !!siteSettings.discourse_placeholder_enabled;
  });

  helper.registerPlugin(md => {
    const rule = {
      matcher: /\[placeholder(=.+?)\]/,
      onMatch: addPlaceholder
    };

    md.core.textPostProcess.ruler.push("discourse-placeholder", rule);
  });
}
