![Overview Drawing](/overview.png)

Startup a mock DSP endpoint

```
$ DEBUG=* node mockdsp/server.js
```

Startup the SSP server

```
$ DEBUG=* node server.js
```

To obtain a video ad markup (VAST) for an Ad Pod from the SSP:

```
$ curl -v http://localhost:8000/ssp?siteId=1&cat={IAB_CONTENT_CATEGORY}&dd={DESIRED_AD_POD_DURATION}
```