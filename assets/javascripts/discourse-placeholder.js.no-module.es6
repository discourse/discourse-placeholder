(function($) {

  function processChange($cooked, inputEvent) {
    const value = inputEvent.target.value;
    const key = inputEvent.target.dataset.key;

    $cooked
      .find(`.discourse-placeholder-item[data-key=${key}]`)
      .each((_, e) => {
        const $item = $(e);

        if (value && value.length && value !== "none") {
          $item.text(value);
        } else {
          $item.text(`%${key}%`);
        }
      });
  }

  function processElement($element, $cooked, options = {}) {
    $cooked
      .html((_, html) => {
        const pattern = `(%${options.key}%)`;
        const regex = new RegExp(pattern, "g");

        html = html.replace(
          regex,
          `<span class="discourse-placeholder-item" data-key="${options.key}">${options.default || "$1"}</span>`
        );

        return html;
      })
      .on("input", ".discourse-placeholder-value", inputEvent => {
        processChange($cooked, inputEvent);
      })
      .on("change", ".discourse-placeholder-select", inputEvent => {
        processChange($cooked, inputEvent);
      });
  }

  $.fn.applyDiscoursePlaceholder = function($cooked) {
    return this.each(function() {
      const $element = $(this);

      const options = {};
      options.key = $element.attr("data-key")
      options.default = $element.attr("data-default")
      options.description = $element.attr("data-description")

      processElement($element, $cooked, options);
    });
  };
})(jQuery);
