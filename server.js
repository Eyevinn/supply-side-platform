const SSPEngine = require('./index.js');

const engine = new SSPEngine();
engine.listen(process.env.PORT || 8000);
