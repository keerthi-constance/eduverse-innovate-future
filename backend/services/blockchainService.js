import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Lucid, Blockfrost, Data, fromText, toUnit } from 'lucid-cardano';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';

function truncateToBytes(str, maxBytes) {
  let bytes = 0;
  let i = 0;
  for (; i < str.length; i++) {
    bytes += Buffer.byteLength(str[i], 'utf8');
    if (bytes > maxBytes) break;
  }
  return str.slice(0, i);
}

function toHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function isValidHex(str) {
  return typeof str === 'string' && /^[0-9a-fA-F]+$/.test(str);
}

function logAndValidateHex(label, value) {
  console.log(`${label}:`, value, '| valid hex:', isValidHex(value));
}

function createCslNativeScript(script, slot) {
  if (script.type === "all") {
    const scripts = CSL.NativeScripts.new();
    script.scripts.forEach((subScript) => {
      if (subScript.type === "before") {
        const timelock = CSL.TimelockExpiry.new_timelockexpiry(BigInt(slot));
        scripts.add(CSL.NativeScript.new_timelock_expiry(timelock));
      } else {
        throw new Error("Unsupported sub-script type: " + subScript.type);
      }
    });
    return CSL.NativeScript.new_script_all(scripts);
  }
  throw new Error("Unsupported script type: " + script.type);
}

function isLucidScript(script) {
  return (
    script.type === "all" ||
    script.type === "any" ||
    script.type === "atLeast" ||
    script.type === "before" ||
    script.type === "after"
  );
}

class BlockchainService {
  constructor() {
    this.blockfrost = null;
    this.lucid = null;
    this.policyId = null;
    this.policy = null;
    this.privateKey = null;
    this.nativeScript = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      logger.info(`Blockfrost Init: PROJECT_ID=${process.env.BLOCKFROST_PROJECT_ID}, API_URL=${process.env.BLOCKFROST_API_URL}, NETWORK=${process.env.CARDANO_NETWORK}`);
      // Initialize Blockfrost API
      this.blockfrost = new BlockFrostAPI({
        projectId: process.env.BLOCKFROST_PROJECT_ID,
        isTestnet: process.env.CARDANO_NETWORK === 'testnet'
      });

      // Initialize Lucid
      this.lucid = await Lucid.new(
        new Blockfrost(
          process.env.BLOCKFROST_API_URL,
          process.env.BLOCKFROST_PROJECT_ID
        ),
        process.env.CARDANO_NETWORK && process.env.CARDANO_NETWORK.toLowerCase() === 'testnet' ? 'Preprod' : 'Mainnet',
        { csl: CSL }
      );

      // Load policy and key
      const policyData = JSON.parse(fs.readFileSync('./nft-policy.json', 'utf8'));
      this.policyId = policyData.policyId;
      this.privateKey = policyData.privateKey;

      // Fetch current slot and update policy
      const { slot } = await this.lucid.provider.getProtocolParameters();
      this.policy = {
        type: "all",
        scripts: [{ type: "before", slot: Number(slot) + 1000 }],
      };
      this.nativeScript = this.policy;
      console.log('DEBUG policy:', JSON.stringify(this.policy, null, 2));
      console.log('DEBUG nativeScript:', JSON.stringify(this.nativeScript, null, 2));

      await this.lucid.selectWalletFromPrivateKey(this.privateKey);
      this.isInitialized = true;
      logger.info('Blockchain service initialized successfully');
    } catch (error) {
      console.error('BlockchainService error:', error);
      logger.error('Failed to initialize blockchain service:', error && (error.stack || error.message || JSON.stringify(error)));
      throw error;
    }
  }

  async getWalletBalance(walletAddress) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }

      const account = await this.blockfrost.accounts(walletAddress);
      return {
        address: walletAddress,
        balance: account.controlled_amount,
        availableBalance: account.available_amount,
        rewards: account.rewards_sum,
        withdrawals: account.withdrawals_sum,
        deposits: account.deposits_sum
      };
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  async getTransaction(txHash) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }

      const tx = await this.blockfrost.txs(txHash);
      const utxos = await this.blockfrost.txsUtxos(txHash);

      return {
        hash: tx.hash,
        block: tx.block,
        blockHeight: tx.block_height,
        slot: tx.slot,
        index: tx.index,
        outputAmount: tx.output_amount,
        fees: tx.fees,
        deposit: tx.deposit,
        size: tx.size,
        invalidBefore: tx.invalid_before,
        invalidHereafter: tx.invalid_hereafter,
        utxos: utxos
      };
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw error;
    }
  }

  createNFTMetadata(donation, imageUrl) {
    const assetName = `${process.env.NFT_ASSET_NAME_PREFIX}${donation.receipt.receiptNumber}`;
    const name = truncateToBytes(`EduFund Donation #${donation.receipt.receiptNumber}`, 64);
    const description = truncateToBytes(
      `Thank you for your generous donation of ${donation.formattedAmount} ADA to support education. ${donation.message ? `Message: ${donation.message}` : ''}`,
      64
    );
    return {
      name,
      description,
      image: imageUrl,
      external_url: `https://edufund.io/donation/${donation._id}`,
      donationAmount: `${donation.formattedAmount} ADA`,
      category: donation.category,
      donationDate: donation.createdAt.toISOString().split('T')[0],
      receiptNumber: donation.receipt.receiptNumber,
      transactionHash: donation.transactionHash || (donation.blockchainTransaction ? donation.blockchainTransaction.txHash : '')
    };
  }

  async verifyTransaction(txHash, expectedAmount, recipientAddress) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }

      const tx = await this.getTransaction(txHash);
      
      if (!tx.block) {
        return {
          verified: false,
          status: 'pending',
          message: 'Transaction not yet confirmed'
        };
      }

      const outputAmount = parseInt(tx.outputAmount[0]?.quantity || 0);
      if (outputAmount < expectedAmount) {
        return {
          verified: false,
          status: 'failed',
          message: 'Transaction amount does not match expected amount'
        };
      }

      const utxos = await this.blockfrost.txsUtxos(txHash);
      const recipientUtxo = utxos.outputs.find(utxo => 
        utxo.address === recipientAddress
      );

      if (!recipientUtxo) {
        return {
          verified: false,
          status: 'failed',
          message: 'Recipient address not found in transaction outputs'
        };
      }

      return {
        verified: true,
        status: 'confirmed',
        message: 'Transaction verified successfully',
        blockHeight: tx.block_height,
        confirmations: tx.block_height ? 1 : 0
      };
    } catch (error) {
      logger.error('Error verifying transaction:', error);
      throw error;
    }
  }

  async getNetworkInfo() {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }

      const network = await this.blockfrost.network();
      const latestBlock = await this.blockfrost.blocksLatest();

      return {
        network: network.name,
        supply: network.supply,
        stake: network.stake,
        latestBlock: {
          hash: latestBlock.hash,
          height: latestBlock.height,
          slot: latestBlock.slot,
          timestamp: latestBlock.time
        }
      };
    } catch (error) {
      logger.error('Error getting network info:', error);
      throw error;
    }
  }

  async getAssetInfo(assetId) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }

      const asset = await this.blockfrost.assetsById(assetId);
      return asset;
    } catch (error) {
      logger.error('Error getting asset info:', error);
      throw error;
    }
  }

  isValidAddress(address) {
    try {
              const addressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^addr[0-9a-z]{98,103}$|^addr_test[0-9a-z]{98,103}$|^addr_test_[0-9a-f]{100,120}$|^addr_[0-9a-f]{100,120}$|^addr_test1[a-z0-9]{98,103}$/;
      return addressRegex.test(address);
    } catch (error) {
      return false;
    }
  }

  generateAssetName(prefix = 'EDUFUND') {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}${timestamp.slice(-6)}${random}`;
  }
}

const blockchainService = new BlockchainService();

export { blockchainService };

export const initializeBlockchain = async () => {
  await blockchainService.initialize();
}; 