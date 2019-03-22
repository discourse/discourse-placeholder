require 'rails_helper'

describe PrettyText do
  context 'generates markup' do
    it 'works with default markup' do
      cooked = PrettyText.cook('[placeholder=NAME]')
      result = '<p></p><div data-keys="NAME" class="discourse-placeholder"><div class="discourse-placeholder-container"><span class="discourse-placeholder-name">NAME</span><input class="discourse-placeholder-value" data-key="NAME" placeholder="String to use as replacement"></div></div>'

      expect(cooked).to match_html(result)
    end

    it 'works with multiple keys' do
      cooked = PrettyText.cook('[placeholder=NAME,COUNTRY]')

      expect(cooked).to include('<span class="discourse-placeholder-name">NAME</span>')
      expect(cooked).to include('<span class="discourse-placeholder-name">COUNTRY</span>')
    end

    it 'doesnt generate with no keys' do
      cooked = PrettyText.cook('[placeholder=]')

      expect(cooked).to match_html('<p>[placeholder=]</p>')
    end
  end
end
