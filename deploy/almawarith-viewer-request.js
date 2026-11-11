// CloudFront viewer-request function "almawarith-www-redirect" on distribution E36MILXZBMINT5 (almawarith.com).
// Runtime: cloudfront-js-2.0.
//
// 1. One address per page: www.almawarith.com and any explicit ".../index.html" get a 301 to the
//    clean apex URL (https://almawarith.com/, https://almawarith.com/internal/), so search engines
//    never see /index.html as a second copy of the home page.
// 2. Folder requests are then mapped to their index page, since S3 behind an origin access control
//    has no directory index.
//
// Before 2026-11-11 the folder mapping ran first, so https://www.almawarith.com/ redirected to
// https://almawarith.com/index.html, which Search Console reported as "Alternate page with proper
// canonical tag".
function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';
  var uri = request.uri;
  var clean = uri.replace(/\/index\.html$/, '/');

  if (host === 'www.almawarith.com' || clean !== uri) {
    var parts = [];
    for (var key in request.querystring) {
      var q = request.querystring[key];
      if (q.multiValue) {
        for (var i = 0; i < q.multiValue.length; i++) parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(q.multiValue[i].value));
      } else {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(q.value));
      }
    }
    var qs = parts.length ? '?' + parts.join('&') : '';
    return { statusCode: 301, statusDescription: 'Moved Permanently', headers: { location: { value: 'https://almawarith.com' + clean + qs } } };
  }

  if (uri.endsWith('/')) request.uri = uri + 'index.html';
  else if (!uri.includes('.')) request.uri = uri + '/index.html';
  return request;
}
