import { withPluginApi } from "discourse/lib/plugin-api";

function initializeDiscoursePlaceholder(api) {
  api.decorateCooked($elem =>
    $(".discourse-placeholder", $elem).applyDiscoursePlaceholder()
  );
}

export default {
  name: "discourse-placeholder",

  initialize() {
    withPluginApi("0.8.24", initializeDiscoursePlaceholder);
  }
};
