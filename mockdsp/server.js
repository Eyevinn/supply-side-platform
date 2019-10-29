const restify = require('restify');
const errs = require('restify-errors');
const debug = require('debug')('dsp-mockup');
const openrtb = require('openrtb');
const moment = require('moment');
const ResponseBuilder = openrtb.getBuilder({ builderType: 'bidResponse' });

const EXAMPLE_ADS = [
  "http://testcontent.eyevinn.technology/ads/stswe19-teaser-15sek.mp4"
];

const MOCK_BIDS = [
  {
    status: 1,
    clearPrice: 0.9,
    adid: 1,
    id: 'mock-ad-1',
    deal: 'mock-deal-1',
    impid: 'IMPID',
    price: 1.05,
    nurl: 'http://localhost:8081/win?pid=1&price=${AUCTION_PRICE}',
    cid: '1000',
    crid: '1001'
  },
  {
    status: 1,
    clearPrice: 0.9,
    adid: 2,
    id: 'mock-ad-2',
    deal: 'mock-deal-2',
    impid: 'IMPID',
    price: 1.35,
    nurl: 'http://localhost:8081/win?pid=1&price=${AUCTION_PRICE}',
    cid: '2000',
    crid: '2001'
  }
];

function handleBidRequest(req, res, next) {
  debug('req.url=' + req.url);
  debug(req.body);

  if (req.body) {
    try {
      let bids = [];
      req.body.imp.forEach(imp => {
        let bid = MOCK_BIDS[Math.floor(Math.random() * MOCK_BIDS.length)];
        bid.impid = imp.id;
        bids.push(bid);
      });
      let bidResponse = ResponseBuilder
      .timestamp(moment.utc().format())
      .status(1)
      .id('1234-5678')
      .bidderName('eyevinn-mock-bidder')
      .seatbid([
        {
          bid: bids
        }
      ])
      .build();
      res.send(bidResponse, { 'x-openrtb-version': '2.3' });
      next();
    } catch (errObj) {
      debug(errObj.errors);
      const err = new errs.InternalServerError(errObj.message);
      next(err);
    };
  }
  else {
    next(new errs.InvalidContentError('Missing BidRequest body'));
  }
}

function handleBidWin(req, res, next) {
  let mediaFile = `<MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080" scalable="true"><![CDATA[${EXAMPLE_ADS[0]}]]></MediaFile>`;
  let videoAdMarkup = `<VAST version="2.0"><Ad id="stswe19-teaser"><Creatives><Creative id="video"><Linear><Duration>00:00:15</Duration><MediaFiles>${mediaFile}</MediaFiles></Linear></Creative></Creatives></Ad></VAST>`;
  res.setHeader('content-type', 'application/xml');
  res.sendRaw(videoAdMarkup);
  next();
}

let server = restify.createServer();
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.post('/dsp', handleBidRequest);
server.get('/win', handleBidWin);
server.listen(process.env.DSPPORT || 8081, () => {
  debug('%s listening at %s', server.name, server.url);
});
