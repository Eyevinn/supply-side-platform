const restify = require('restify');
const errs = require('restify-errors');
const debug = require('debug')('ssp-engine');

class SSPEngine {
  constructor(options) {
    // Read from config
    this.providers = [
      {
        name: "Mock DSP 1",
        endpoint: "http://localhost:8081/mockdsp",
        openRtbVersion: "2.2",
      },
      {
        name: "Mock DSP 2",
        endpoint: "http://localhost:8081/mockdsp",
        openRtbVersion: "2.2",
      },
    ];

    this.server = restify.createServer();
    this.server.use(restify.plugins.queryParser());

    this.server.get('/ssp', this._handleRequest.bind(this));
    this.server.get('/', this._handleHealthCheck.bind(this));
  }

  listen(port) {
    this.server.listen(port, () => {
      debug('%s listening at %s', this.server.name, this.server.url);
    });
  }

  _handleRequest(req, res, next) {
    debug('req.url=' + req.url);
    debug(req.query);

    let siteId = req.query['siteId'];
    // 1. Build Bid request

    // 2. Issue bid to all DSPs in parallell

    // 3. Evaluate responses for highest bidder

    // 4. Respond to site

    // 5. Respond to winner
    next();
  }

  _handleHealthCheck(req, res, next) {
    debug('req.url=' + req.url);
    res.send(200);
    next();
  }
}

module.exports = SSPEngine;