var transform = require('lodash/object/transform');

var URL_REGEX = new RegExp(
  '(' +
    // protocol identifier (optional) + //
    '(?:(?:https?:)?//)+' +
    // host (optional) + domain + tld
    '(?:(?!-)[-a-z0-9\\u00a1-\\uffff]*[a-z0-9\\u00a1-\\uffff]+(?!./|\\.$)\\.?){2,}' +
    // server port number (optional)
    '(?::\\d{2,5})?' +
    // resource path (optional)
    '(?:/?[^\\s"]*)?' +
  ')', 'gi'
);


/**
 * Returns a list of { text: ... }, { url: ... } parts extracted
 * from the given text.
 *
 * @param {Array<Object>|String} parts
 *
 * @return {Array<Object>}
 */
function extractUrls(parts) {

  if (typeof parts === 'string') {
    parts = [ {
      text: parts
    } ];
  }

  return transform(parts, function(newParts, part) {

    var text = part.text;

    if (text) {
      var urls = text.match(URL_REGEX);

      var lastIdx = 0,
          idx = 0;

      (urls || []).forEach(function(url) {

        idx = text.indexOf(url, lastIdx);

        newParts.push({ text: text.substring(lastIdx, idx) });
        newParts.push({ url: url });

        lastIdx = idx + url.length;
      });

      newParts.push({ text: text.substring(lastIdx) });
    } else {
      newParts.push(part);
    }
  });
}

module.exports = extractUrls;