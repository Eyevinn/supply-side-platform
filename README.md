This is an open source implementation of a Supply-Side Platform (SSP) to serve for testing and educational purpose.
It provides an interface for video ad inserters to request a sequence of ads (Ad Pods) to fill a linear ad break.

![Overview Drawing](/overview.png)

## Get Started

Install the dependencies

```
$ npm install
```

Startup a mock DSP endpoint that by default listens to port 8081. This can be overridden with the environment variable `DSPPORT`.

```
$ DEBUG=* node mockdsp/server.js
```

Startup the SSP server. By default it listens on port 8000 and this can be changed by setting the environment variable `PORT`.

```
$ DEBUG=* node server.js
```

It is by default configured with two mockup DSPs running on the localhost listening on port 8081, as specified in the file `server.js`

```
engine.addProvider({
  name: "Mock DSP 1",
  endpoint: "http://localhost:8081/dsp",
  openRtbVersion: "2.3",
});
engine.addProvider({
  name: "Mock DSP 1",
  endpoint: "http://localhost:8081/dsp",
  openRtbVersion: "2.3",
});
```

or specify on the command line when starting the server:

```
$ DEBUG=* DSPS=http://localhost:8081/dsp?mock=1,http://localhost:8081/dsp?mock=1 node server.js
```

To obtain a video ad markup (VAST) for an Ad Pod from the SSP:

```
$ curl -v http://localhost:8000/ssp?siteId=1&cat={IAB_CONTENT_CATEGORY}&dd={DESIRED_AD_POD_DURATION}
```

This VAST response can for example be tested in the Google IMA SDK Video Inspector: https://developers.google.com/interactive-media-ads/docs/sdks/html5/vastinspector
