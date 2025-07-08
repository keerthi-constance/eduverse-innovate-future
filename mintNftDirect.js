import { Lucid, Blockfrost, fromText, toUnit } from 'lucid-cardano';
import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';
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
  throw new Error("Unsupported script type: " + script.type);
}

async function main() {
  // Load policy
  const policyData = JSON.parse(fs.readFileSync('./nft-policy.json', 'utf8'));
  const policy = policyData.policy;
  const policyId = policyData.policyId;
  const privateKey = policyData.privateKey;
  const address = policyData.address;

  // Init Lucid
  const lucid = await Lucid.new(
    new Blockfrost('https://cardano-preprod.blockfrost.io/api/v0', process.env.BLOCKFROST_PROJECT_ID),
    'Preprod'
  );
  await lucid.selectWalletFromPrivateKey(privateKey);

  // Prepare asset
  const assetName = 'EDUFUNDEDU-DIRECT-' + Date.now();
  const assetNameHex = fromText(assetName);
  const unit = toUnit(policyId, assetNameHex);

  // Prepare metadata
  const metaObj = {
    [policyId]: {
      [assetNameHex]: {
        name: assetName,
        image: 'https://placehold.co/400x400/png?text=DirectMintNFT',
        description: 'Directly minted NFT using Lucid!'
      }
    }
  };

  // Determine scriptHex based on policy type
  let scriptHex;
  if (policy.type === 'Native' && policy.script) {
    scriptHex = policy.script;
    console.log('Using pre-serialized Native script hex.');
  } else {
    const cslScriptJson = lucidToCslScript(policy);
    const cslScript = CSL.NativeScript.from_json(JSON.stringify(cslScriptJson));
    scriptHex = Buffer.from(cslScript.to_bytes()).toString('hex');
    console.log('Converted Lucid-style script to hex.');
  }

  // Mint NFT
  try {
    const tx = await lucid
      .newTx()
      .mintAssets({ [unit]: 1n }, scriptHex)
      .attachMetadata(721, metaObj)
      .payToAddress(address, { [unit]: 1n })
      .complete();
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    console.log('🎉 NFT Minted! TxHash:', txHash);
    console.log('Asset:', unit);
  } catch (e) {
    console.error('Direct Mint Error:', e);
  }
}

main(); 