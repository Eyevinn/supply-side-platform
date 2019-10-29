const restify = require('restify');
const errs = require('restify-errors');
const debug = require('debug')('ssp-engine');
const fetch = require('node-fetch');

const BidRequest = require('../openrtb/bid_request.js');

class SSPEngine {
  constructor(options) {
    // Read from config
    this.providers = [
      {
        name: "Mock DSP 1",
        endpoint: "http://localhost:8081/dsp",
        openRtbVersion: "2.3",
      },
      {
        name: "Mock DSP 2",
        endpoint: "http://localhost:8081/dsp",
        openRtbVersion: "2.3",
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
    
    let noImps = Math.floor(req.query['dd'] / 15);
    let videoImpressionsOffered = [];
    for (let i = 0; i < noImps; i++) {
      videoImpressionsOffered.push({
        minDuration: 5, maxDuration: 15,
        width: 1920, height: 1080,
        bidFloor: 1.3
      });
    }

    try {
      let bidRequest = new BidRequest("1234", 2, videoImpressionsOffered);
      debug(bidRequest.body());

      // 2. Issue bid to all DSPs in parallell
      let promises = [];
      let bidResponses = [];
      this.providers.forEach(provider => {
        let p = new Promise((resolve, reject) => {
          fetch(provider.endpoint, { method: 'POST', body: bidRequest.body().stringify(), headers: { 'content-type': 'application/json'} })
          .then(resp => resp.json())
          .then(bidResponse => {
            bidResponses.push(bidResponse);
            resolve();
          });
        });
        promises.push(p);
      });

      // 3. Evaluate responses for highest bidder
      Promise.all(promises)
      .then(() => {
        let allBids = [];
        bidResponses.forEach(bidResponse => {
          debug(bidResponse);
          bidResponse.seatbid[0].bid.forEach(bid => {
            allBids.push(bid);
          });
        });
        let allBidsSorted = allBids.sort((a, b) => { b.price - a.price });
        let winnerBid = allBidsSorted[0];
        debug(winnerBid);

        fetch(winnerBid.nurl)
        .then(resp => resp.text())
        .then(msg => {
          // 4. Respond to site
          res.send(msg);
          next();
        });
      });

    } catch (errObj) {
      debug(errObj.errors);
      const err = new errs.InternalServerError(errObj.message);
      next(err);
    }
  }

  _handleHealthCheck(req, res, next) {
    debug('req.url=' + req.url);
    res.send(200);
    next();
  }
}

module.exports = SSPEngine;