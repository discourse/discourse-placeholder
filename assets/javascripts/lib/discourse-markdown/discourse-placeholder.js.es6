import { parseBBCodeTag } from "pretty-text/engines/discourse-markdown/bbcode-block";

function addSelectOption(buffer, state, options = {}) {
  let token = new state.Token("option_open", "option", 0);
  token.attrs = [
    ["class", "discourse-placeholder-option"],
    ["value", options.value]
  ];

  if (options.selected) {
    token.attrs.push(["selected", true]);
  }

  buffer.push(token);

  token = new state.Token("text", "", 0);
  token.content = options.description || options.value;
  buffer.push(token);

  buffer.push(new state.Token("option_close", "option", -1));
}

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

  let defaultValues;
  if (parsed.attrs.defaults) {
    defaultValues = state.md.utils
      .escapeHtml(parsed.attrs.defaults)
      .split(",")
      .filter(x => x);
    token.attrs.push(["data-defaults", defaultValues.join(",")]);
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

  if (defaultValues) {
    token = new state.Token("select_open", "select", 0);
    token.attrs = [
      ["class", "discourse-placeholder-select"],
      ["data-key", key]
    ];
    buffer.push(token);

    if (description) {
      addSelectOption(buffer, state, { value: "none", description });
    }

    defaultValues.forEach(value =>
      addSelectOption(buffer, state, {
        value,
        selected: defaultValue === value
      })
    );

    token = new state.Token("select_close", "select", -1);
    buffer.push(token);
  } else {
    token = new state.Token("input", "input", 0);
    token.attrs = [["class", "discourse-placeholder-value"], ["data-key", key]];

    if (defaultValue) {
      token.attrs.push(["value", defaultValue]);
    }

    if (description) {
      token.attrs.push(["placeholder", description]);
    }

    buffer.push(token);
  }

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
    "input[value]",
    "select.discourse-placeholder-select",
    "option.discourse-placeholder-option",
    "select[data-key]",
    "option[value]",
    "option[selected]"
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
