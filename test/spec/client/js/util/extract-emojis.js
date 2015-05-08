var extractEmojis = require('../../../../../client/js/util/extract-emojis');


describe('client/util', function() {

  it('should extract emojis', function() {

    // given
    var text = 'Check out :sunrise_over_mountains: and :girl: and :non_existing_emoji: and so forth';

    // when
    var textParts = extractEmojis(text);

    // then
    expect(textParts).to.eql([
      { text: 'Check out ' },
      { emoji: 'sunrise-over-mountains' },
      { text: ' and ' },
      { emoji: 'girl' },
      { text: ' and ' },
      { text: ':non_existing_emoji:' },
      { text: ' and so forth' }
    ]);
  });

});