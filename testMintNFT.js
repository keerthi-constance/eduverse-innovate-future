import { Lucid, Blockfrost, fromText, toUnit } from 'lucid-cardano';
import fs from 'fs';

async function main() {
  // Load policy
  const policyData = JSON.parse(fs.readFileSync('./nft-policy.json', 'utf8'));
  const policy = policyData.policy; // Only use the inner object // support both wrapped and raw
  const policyId = policyData.policyId || '';
  const privateKey = policyData.privateKey || '';

  // Init Lucid
  const lucid = await Lucid.new(
    new Blockfrost('https://cardano-preprod.blockfrost.io/api/v0', process.env.BLOCKFROST_PROJECT_ID),
    'Preprod'
  );
  lucid.slotConfig = {
    zeroTime: 1654041600,
    zeroSlot: 0,
    slotLength: 1
  };
  await lucid.selectWalletFromPrivateKey(privateKey);

  // Prepare asset
  const assetName = 'EDUFUNDEDU-TEST';
  const assetNameHex = fromText(assetName);
  const unit = toUnit(policyId, assetNameHex);

  // Prepare metadata
  const metaObj = {
    [policyId]: {
      [assetNameHex]: {
        name: assetName,
        image: 'https://placehold.co/400x400/png?text=TestNFT'
      }
    }
  };

  // Log all
  console.log({ assetName, assetNameHex, policyId, unit, metaObj, policy });

  console.log('ACTUAL POLICY OBJECT:', JSON.stringify(policy, null, 2));

  try {
    const script = lucid.utils.nativeScriptFromJson(policy);
    const scriptHex = script.to_hex();

    const tx = await lucid
      .newTx()
      .mintAssets({ [unit]: 1n }, scriptHex)
      .attachMetadata(721, metaObj)
      .complete();
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    console.log('Minted! TxHash:', txHash);
  } catch (e) {
    console.error('Test Mint Error:', e);
  }
}

main(); 