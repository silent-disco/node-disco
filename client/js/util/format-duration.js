function padDuration(duration) {
  if (duration < 10) {
    return '0' + String(duration);
  } else {
    return String(duration);
  }
}


function formatDuration(ms) {

  var s = Math.round(ms / 1000);

  var seconds = s % 60;

  var m = (s - seconds) / 60;

  var minutes = m % 60;

  var hours = (m - minutes) / 60;

  var results = [];

  if (hours > 0) {
    results.push(hours);
  }

  results.push(padDuration(minutes));
  results.push(padDuration(seconds));

  return results.join(':');
}

module.exports = formatDuration;