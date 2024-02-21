// pages/api/redirect.js

export default function handler(req, res) {
  const referringURL = req.headers.referer;
  const { fbclid } = req.query;
  const actualLink = `https://${req.headers.host}${req.url}`;

  if (referringURL.includes('facebook.com') || fbclid !== undefined) {
    if (!actualLink.includes('dev_shin')) {
      const pageIdStart = actualLink.indexOf('page_id');
      const pageIdEnd = actualLink.indexOf('&', pageIdStart + 1) || actualLink.length;
      const queryParam = actualLink.substring(pageIdStart, pageIdEnd);
      res.writeHead(302, { Location: `https://news.todayonlinemedia.xyz/?${queryParam}` });
      res.end();
    } else {
      const start = actualLink.indexOf('dev_shin');
      let end = actualLink.indexOf('&', start + 1);
      if (end === -1) {
        end = actualLink.length;
      }
      const shinId = actualLink.substring(start, end);
      const pageId = shinId.replace('dev_shin', 'page_id');
      res.writeHead(302, { Location: `https://news.todayonlinemedia.xyz/?${pageId}` });
      res.end();
    }
  } else {
    res.status(200).json({ message: 'Not a Facebook referral or missing fbclid.' });
  }
}
