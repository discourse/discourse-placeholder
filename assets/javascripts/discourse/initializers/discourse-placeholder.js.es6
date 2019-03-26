import { withPluginApi } from "discourse/lib/plugin-api";

function initializeDiscoursePlaceholder(api) {
  api.decorateCooked(
    $cooked => {
      $(".discourse-placeholder", $cooked).applyDiscoursePlaceholder($cooked);
    },
    { onlyStream: true }
  );
}

export default {
  name: "discourse-placeholder",

  initialize() {
    withPluginApi("0.8.24", initializeDiscoursePlaceholder);
  }
};
