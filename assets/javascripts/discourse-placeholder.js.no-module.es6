(function($) {
  function processElement($element, options = {}) {
    let $cooked = $element.parents(".cooked");

    $cooked
      .html((_, html) => {
        options.keys.forEach(key => {
          const pattern = `(%${key}%)`;
          const regex = new RegExp(pattern, "g");

          html = html.replace(
            regex,
            `<span class="discourse-placeholder-item" data-key="${key}">$1</span>`
          );
        });

        return html;
      })
      .on("input", ".discourse-placeholder-value", inputEvent => {
        const value = inputEvent.target.value;
        const key = inputEvent.target.dataset.key;

        $cooked
          .find(`.discourse-placeholder-item[data-key=${key}]`)
          .each((_, e) => {
            const $item = $(e);

            if (value && value.length) {
              $item.text(value);
            } else {
              $item.text(`%${key}%`);
            }
          });
      });
  }

  $.fn.applyDiscoursePlaceholder = function() {
    return this.each(function() {
      const $element = $(this);

      const options = {};
      options.keys = $element
        .attr("data-keys")
        .split(",")
        .filter(x => x);

      processElement($element, options);
    });
  };
})(jQuery);
