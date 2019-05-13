(function($) {
  const VALID_TAGS = "h1, h2, h3, h4, h5, h6, p, code, blockquote, .md-table, li";
  const DELIMITER = "=";

  // http://davidwalsh.name/javascript-debounce-function
  function debounce(func, wait, immediate) {
    let timeout;

    return function() {
      const context = this,
        args = arguments;

      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      const callNow = immediate && !timeout;

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func.apply(context, args);
    };
  }

  function processChange($cooked, inputEvent, mappings) {
    const value = inputEvent.target.value;
    const key = inputEvent.target.dataset.key;

    let newValue;
    if (value && value.length && value !== "none") {
      newValue = value;
    } else {
      newValue = `${DELIMITER}${key}${DELIMITER}`;
    }

    $cooked.find(VALID_TAGS).each((index, elem) => {
      let replaced = false;
      const mapping = mappings[index];
      let newInnnerHTML = elem.innerHTML;
      let diff = 0;

      mapping.forEach(m => {
        if (m.pattern !== `${DELIMITER}${key}${DELIMITER}`) {
          m.position = m.position + diff;
          return;
        }

        replaced = true;

        const previousLength = m.length;
        const prefix = newInnnerHTML.slice(0, m.position + diff);
        const suffix = newInnnerHTML.slice(
          m.position + diff + m.length,
          newInnnerHTML.length
        );
        newInnnerHTML = `${prefix}${newValue}${suffix}`;

        m.length = newValue.length;
        m.position = m.position + diff;
        diff = diff + newValue.length - previousLength;
      });

      if (replaced) {
        elem.innerHTML = newInnnerHTML;
      }
    });
  }

  function processPlaceholders(placeholders, $cooked, mappings) {
    const keys = Object.keys(placeholders);
    const pattern = `(${DELIMITER}(?:${keys.join("|")})${DELIMITER})`;
    const regex = new RegExp(pattern, "g");

    $cooked.find(VALID_TAGS).each((index, elem) => {
      const innerHTML = elem.innerHTML;
      let match;

      mappings[index] = mappings[index] || [];

      while ((match = regex.exec(innerHTML)) != null) {
        mappings[index].push({
          pattern: match[1],
          position: match.index,
          length: match[1].length
        });
      }
    });

    $cooked
      .on(
        "input",
        ".discourse-placeholder-value",
        debounce(inputEvent => {
          processChange($cooked, inputEvent, mappings);
        }, 250)
      )
      .on(
        "change",
        ".discourse-placeholder-select",
        debounce(inputEvent => {
          processChange($cooked, inputEvent, mappings);
        }, 250)
      );

    // trigger fake event to setup initial state
    Object.keys(placeholders).forEach(placeholderKey => {
      const placeholder = placeholders[placeholderKey];

      const value =
        placeholder.default ||
        (placeholder.defaults.length && !placeholder.description
          ? placeholder.defaults[0]
          : null);

      processChange(
        $cooked,
        { target: { value, dataset: { key: placeholderKey } } },
        mappings
      );
    });
  }

  $.fn.applyDiscoursePlaceholder = function($cooked) {
    const mappings = [];
    const placeholders = {};

    this.each(function() {
      const $element = $(this);

      placeholders[$element.attr("data-key")] = {
        default: $element.attr("data-default"),
        defaults: ($element.attr("data-defaults") || "").split(","),
        description: $element.attr("data-description")
      };
    });

    if (Object.keys(placeholders).length > 0) {
      processPlaceholders(placeholders, $cooked, mappings);
    }
  };
})(jQuery);
