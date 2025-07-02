import { Lucid, Blockfrost, PolicyId } from "lucid-cardano";
import { logger } from '../utils/logger.js';

const generateNFTPolicy = async () => {
  try {
    logger.info('🔧 Generating NFT Policy for EduFund...');

    // Initialize Lucid with Blockfrost
    const lucid = await Lucid.new(
      new Blockfrost(
        "https://cardano-preprod.blockfrost.io/api/v0",
        "preproda1GVl38NyMYaPpoii6rnlaX8nsy7l3m3"
      ),
      "Preprod"
    );

    // Generate a new wallet for policy creation
    const { privateKey, address } = lucid.utils.generateKeyPair();
    
    logger.info(`📝 Generated wallet address: ${address}`);

    // Create NFT policy
    const { policyId } = await lucid.utils.mintingPolicyToId({
      type: "Native",
      script: lucid.utils.nativeScriptFromJson({
        type: "all",
        scripts: [
          {
            type: "before",
            slot: lucid.utils.unixTimeToSlot(Date.now() + 1000 * 60 * 60 * 24 * 365) // 1 year from now
          }
        ]
      })
    });

    logger.info(`✅ NFT Policy ID generated: ${policyId}`);
    logger.info(`🔑 Private Key (keep secure): ${privateKey}`);
    logger.info(`📍 Wallet Address: ${address}`);

    // Save to a secure file
    const fs = await import('fs');
    const policyData = {
      policyId,
      privateKey,
      address,
      createdAt: new Date().toISOString(),
      network: 'preprod'
    };

    fs.writeFileSync('./nft-policy.json', JSON.stringify(policyData, null, 2));
    logger.info('💾 Policy data saved to nft-policy.json');

    return policyId;

  } catch (error) {
    logger.error('❌ Error generating NFT policy:', error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateNFTPolicy()
    .then(policyId => {
      console.log(`\n🎉 NFT Policy created successfully!`);
      console.log(`Policy ID: ${policyId}`);
      console.log(`\n📋 Next steps:`);
      console.log(`1. Add this Policy ID to your .env file:`);
      console.log(`   NFT_POLICY_ID=${policyId}`);
      console.log(`2. Fund the wallet address in nft-policy.json with test ADA`);
      console.log(`3. Keep the private key secure!`);
    })
    .catch(error => {
      console.error('Failed to generate NFT policy:', error);
      process.exit(1);
    });
}

export { generateNFTPolicy }; 
 