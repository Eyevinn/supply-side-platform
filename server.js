const SSPEngine = require('./index.js');

const engine = new SSPEngine({ healthCheck: '/healthcheck'});
if (process.env.DSPS) {
  let providers = process.env.DSPS.split(',');
  let providerId = 1;
  providers.forEach(provider => {
    engine.addProvider({
      name: `DSP ${providerId++}`,
      endpoint: provider,
      openRtbVersion: "2.3"
    });
  });
} else {
  engine.addProvider({
      name: "Mock DSP 1",
      endpoint: "http://localhost:8081/dsp?mock=1",
      openRtbVersion: "2.3",
    });
  engine.addProvider({
    name: "Mock DSP 1",
    endpoint: "http://localhost:8081/dsp?mock=1",
    openRtbVersion: "2.3",
  });
}
engine.listen(process.env.PORT || 8000);
