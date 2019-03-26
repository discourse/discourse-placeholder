import { parseBBCodeTag } from "pretty-text/engines/discourse-markdown/bbcode-block";

function addPlaceholder(buffer, matches, state) {
  const parsed = parseBBCodeTag(
    `[placeholder key${matches[1]}]`,
    0,
    matches[1].length + 17
  );

  if (!parsed.attrs.key) {
    return;
  }

  const key = state.md.utils.escapeHtml(parsed.attrs.key);

  let token;
  token = new state.Token("div_open", "div", 1);
  token.attrs = [["class", "discourse-placeholder"], ["data-key", key]];

  let defaultValue;
  if (parsed.attrs.default) {
    defaultValue = state.md.utils.escapeHtml(parsed.attrs.default);
    token.attrs.push(["data-default", defaultValue]);
  }

  let description;
  if (parsed.attrs.description) {
    description = state.md.utils.escapeHtml(parsed.attrs.description);
    token.attrs.push(["data-description", description]);
  }

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
  token.attrs = [["class", "discourse-placeholder-value"], ["data-key", key]];

  if (defaultValue) {
    token.attrs.push(["value", defaultValue]);
  }

  if (description) {
    token.attrs.push(["placeholder", description]);
  }

  buffer.push(token);

  token = new state.Token("div_close", "div", -1);
  buffer.push(token);
}

export function setup(helper) {
  helper.whiteList([
    "div.discourse-placeholder",
    "input.discourse-placeholder-value",
    "span.discourse-placeholder-name",
    "div[data-key]",
    "div[data-default]",
    "div[data-description]",
    "input[data-key]",
    "input[placeholder]",
    "input[value]"
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
