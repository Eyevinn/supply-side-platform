const debug = require('debug')('bid-request');
const moment = require('moment');
const openrtb = require('openrtb');
const RequestBuilder = openrtb.getBuilder({ builderType: 'bidRequest' });

class BidRequest {
  constructor(id, auctionType, videoImpressionsOffered) {
    let impId = 1;
    let imp = [];

    videoImpressionsOffered.forEach(vidOffer => {
      let video = {
        mimes: [ "video/mp4" ],
        minduration: vidOffer.minDuration,
        maxduration: vidOffer.maxDuration,
        w: vidOffer.width,
        h: vidOffer.height,
      };

      let impObj = {
        id: (impId++).toString(),
        video: video,
        tagid: vidOffer.tagId,
        bidfloor: vidOffer.bidFloor
      };
      imp.push(impObj);
    });

    this.request = RequestBuilder
    .timestamp(moment.utc().format())
    .id(id)
    .at(auctionType)
    .imp(imp)
    .build();

    debug(this.request);
  }

  body() {
    return this.request;
  }
}

module.exports = BidRequest;