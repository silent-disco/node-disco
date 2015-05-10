var extractEmojis = require('../../../util/extract-emojis');


describe('client/util/extract-emojis', function() {

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
      { text: ' and :non_existing_emoji: and so forth' }
    ]);
  });


  it('should extract common smilies', function() {

    // given
    var text = 'Available moods: :-), :-D, :-(, :-((, ;-), :-P, :-o, :-O, :-|, ;-P, <3, O_o, 0_o';

    // when
    var textParts = extractEmojis(text);

    // then
    expect(textParts).to.eql([
      { text: 'Available moods: ' },
      { emoji: 'smiley' },
      { text: ', ' },
      { emoji: 'grinning' },
      { text: ', ' },
      { emoji: 'worried' },
      { text: ', ' },
      { emoji: 'disappointed' },
      { text: ', ' },
      { emoji: 'wink' },
      { text: ', ' },
      { emoji: 'stuck-out-tongue' },
      { text: ', ' },
      { emoji: 'hushed' },
      { text: ', ' },
      { emoji: 'open-mouth' },
      { text: ', ' },
      { emoji: 'neutral-face' },
      { text: ', ' },
      { emoji: 'stuck-out-tongue-closed-eyes' },
      { text: ', ' },
      { emoji: 'heart' },
      { text: ', ' },
      { emoji: 'flushed' },
      { text: ', ' },
      { emoji: 'flushed' }
    ]);
  });

});