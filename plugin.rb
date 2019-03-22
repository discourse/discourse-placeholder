# name: discourse-placeholder
# about:
# version: 0.1
# authors: jjaffeux
# url: https://github.com/jjaffeux

register_asset "javascripts/discourse-placeholder.js.no-module.es6"
register_asset "stylesheets/common/discourse-placeholder.scss"

enabled_site_setting :discourse_placeholder_enabled

PLUGIN_NAME ||= "discourse-placeholder".freeze

after_initialize do
  module ::DiscoursePlaceholder
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace DiscoursePlaceholder
    end
  end
end
