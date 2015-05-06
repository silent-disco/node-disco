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
 * @param  {String} text
 *
 * @return {Array<Object>}
 */
function extractUrls(text) {
  var urls = text.match(URL_REGEX);

  var parts = [];

  var lastIdx = 0,
      idx = 0;

  (urls || []).forEach(function(url) {

    idx = text.indexOf(url, lastIdx);

    parts.push({ text: text.substring(lastIdx, idx) });
    parts.push({ url: url });

    lastIdx = idx + url.length;
  });

  parts.push({ text: text.substring(lastIdx) });

  return parts;
}


module.exports = extractUrls;