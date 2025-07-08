import { createRequire } from 'module';
const require = createRequire(import.meta.url);
console.log('CSL PATH:', require.resolve('@emurgo/cardano-serialization-lib-nodejs'));
import { Lucid, Blockfrost } from 'lucid-cardano';
import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';
console.log('CSL VERSION:', CSL?.__version__ || CSL?.version || 'unknown');
import fs from 'fs';

function lucidToCslScript(script) {
  if (script.type === "all") {
    return {
      type: "ScriptAll",
      scripts: script.scripts.map(lucidToCslScript)
    };
  }
  if (script.type === "before") {
    return {
      type: "TimelockExpiry",
      slot: script.slot
    };
  }
  // Add more cases if you use other script types
  throw new Error("Unsupported script type: " + script.type);
}

function getPolicyIdFromNativeScriptJson(policyJson) {
  const script = CSL.NativeScript.from_json(JSON.stringify(policyJson));
  return Buffer.from(script.hash().to_bytes()).toString('hex');
}

async function main() {
  const lucid = await Lucid.new(
    new Blockfrost('https://cardano-preprod.blockfrost.io/api/v0', process.env.BLOCKFROST_PROJECT_ID),
    'Preprod'
  );
  console.log('Lucid utils:', lucid.utils);
  const privateKey = lucid.utils.generatePrivateKey();
  await lucid.selectWalletFromPrivateKey(privateKey);

  const currentSlot = await lucid.currentSlot();
  const futureSlot = currentSlot + 10000000; // 10 million slots in the future

  const policy = {
    type: 'all',
    scripts: [
      {
        type: 'before',
        slot: futureSlot
      }
    ]
  };

  const cslPolicy = lucidToCslScript(policy);
  console.log('CSL policy JSON:', JSON.stringify(cslPolicy, null, 2));
  const policyId = getPolicyIdFromNativeScriptJson(cslPolicy);

  const script = lucid.utils.nativeScriptFromJson(cslPolicy);
  const scriptHex = script.to_hex();

  fs.writeFileSync(
    './nft-policy.json',
    JSON.stringify(
      {
        policy,
        policyId,
        privateKey
      },
      null,
      2
    )
  );

  console.log('New policy generated with slot:', futureSlot);
  console.log('Policy ID:', policyId);
}

main(); 