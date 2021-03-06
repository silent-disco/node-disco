var extractUrls = require('../../../util/extract-urls');


describe('client/util/extract-urls', function() {

  it('should extract urls', function() {

    // given
    var text = 'Check out http://foobar.com and http://some-song.bar?music=0011 and so forth';

    // when
    var textParts = extractUrls(text);

    // then
    expect(textParts).to.eql([
      { text: 'Check out ' },
      { url: 'http://foobar.com' },
      { text: ' and ' },
      { url: 'http://some-song.bar?music=0011' },
      { text: ' and so forth' }
    ]);
  });

});