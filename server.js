const SSPEngine = require('./index.js');

const engine = new SSPEngine();
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
engine.listen(process.env.PORT || 8000);
