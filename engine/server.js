const restify = require('restify');
const errs = require('restify-errors');
const debug = require('debug')('ssp-engine');

const DEFAULT_PUBLISHER_ID = 0x01;

class SSPEngine {
  constructor(options) {
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

    let publisherId = req.query['publisherId'] || DEFAULT_PUBLISHER_ID;
    next();
  }

  _handleHealthCheck(req, res, next) {
    debug('req.url=' + req.url);
    res.send(200);
    next();
  }
}

module.exports = SSPEngine;