import * as CSL from '@emurgo/cardano-serialization-lib-browser';

const script = {
  type: "ScriptAll",
  scripts: [
    { type: "TimelockExpiry", slot: 123456 }
  ]
};

try {
  const cslScript = CSL.NativeScript.from_json(JSON.stringify(script));
  console.log('from_json worked!');
} catch (e) {
  console.error('from_json error:', e);
}