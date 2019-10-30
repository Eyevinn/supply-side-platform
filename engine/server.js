const restify = require('restify');
const errs = require('restify-errors');
const debug = require('debug')('ssp-engine');
const fetch = require('node-fetch');

const BidRequest = require('../openrtb/bid_request.js');

class SSPEngine {
  constructor(options) {
    this.providers = [];
    this.server = restify.createServer();
    this.server.use(restify.plugins.queryParser());

    this.server.get('/ssp', this._handleRequest.bind(this));
    this.server.get('/', this._handleHealthCheck.bind(this));

    this.bidCounter = 1;
  }
  
  addProvider(provider) {
    this.providers.push(provider);
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
    const bidFloor = 1.3;

    // 1. Build Bid request
    
    let noImps = Math.floor(req.query['dd'] / 15);
    let videoImpressionsOffered = [];
    for (let i = 0; i < noImps; i++) {
      videoImpressionsOffered.push({
        minDuration: 5, maxDuration: 15,
        width: 1920, height: 1080,
        bidFloor: bidFloor
      });
    }

    try {
      let bidRequest = new BidRequest((this.bidCounter++).toString(), 2, videoImpressionsOffered);
      debug(bidRequest.body());

      // 2. Issue bid to all DSPs in parallell (header bidding)
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
        let allBids = {};
        bidResponses.forEach(bidResponse => {
          bidResponse.seatbid[0].bid.forEach(bid => {
            if (!allBids[bid.impid]) {
              allBids[bid.impid] = [];
            }
            // Filter out the bids that is not above floor price
            if (bid.price >= bidFloor) {
              allBids[bid.impid].push(bid);
            }
          });
        });
        let winnerBids = {};
        Object.keys(allBids).forEach(k => {
          let bidsSorted = allBids[k].sort((a, b) => { b.price - a.price });
          winnerBids[k] = bidsSorted[0];
        });

        let winnerPromises = [];
        let adMarkups = [];
        Object.keys(winnerBids).forEach(k => {
          if (winnerBids[k]) {
            let p = new Promise((resolve, reject) => {
              let nurl = winnerBids[k].nurl.replace("${AUCTION_PRICE}", winnerBids[k].price);
              fetch(nurl)
              .then(resp => resp.text())
              .then(vast => {
                adMarkups.push(vast);
                resolve();
              });
            });
            winnerPromises.push(p);
          }
        });
        Promise.all(winnerPromises)
        .then(() => {
          // TODO: Parse Ad Markup / VAST and construct new VAST instead of this ugly stuff...
          let response = "";

          adMarkups.forEach(markup => {
            let markupNoRoot = markup.replace("<VAST version\"2.0\">", "");
            markupNoRoot = markupNoRoot.replace("</VAST>", "");
            response = response + markupNoRoot;
          });
          response = response + "</VAST>";

          // 4. Respond to site
          res.setHeader('content-type', 'application/xml');
          res.sendRaw(response);
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