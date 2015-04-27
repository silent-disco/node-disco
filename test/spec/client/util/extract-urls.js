var extractUrls = require('../../../../client/util/extract-urls');


describe('client/util', function() {

  it('should match url', function() {

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