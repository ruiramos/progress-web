/* eslint-env node */
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const sslRedirect = require('heroku-ssl-redirect');

const PORT = process.env.PORT || 3000;

if (!dev) {
  app.use(sslRedirect());
}

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, err => {
    if (err) throw err;
    console.log('> Ready on http://localhost:' + PORT); // eslint-disable-line no-consle
  });
});
