import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { Lucid, Blockfrost, Data, fromText, toUnit } from 'lucid-cardano';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

class BlockchainService {
  constructor() {
    this.blockfrost = null;
    this.lucid = null;
    this.policyId = null;
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
        process.env.CARDANO_NETWORK && process.env.CARDANO_NETWORK.toLowerCase() === 'testnet' ? 'Preprod' : 'Mainnet'
      );

      this.policyId = process.env.NFT_POLICY_ID;
      this.isInitialized = true;

      logger.info('Blockchain service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize blockchain service:', error);
      throw error;
    }
  }

  // Get wallet balance
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

  // Get transaction details
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

  // Create NFT metadata
  createNFTMetadata(donation, imageUrl) {
    const assetName = `${process.env.NFT_ASSET_NAME_PREFIX}${donation.receipt.receiptNumber}`;
    
    return {
      name: `EduFund Donation #${donation.receipt.receiptNumber}`,
      description: `Thank you for your generous donation of ${donation.formattedAmount} ADA to support education. ${donation.message ? `Message: ${donation.message}` : ''}`,
      image: imageUrl,
      external_url: `https://edufund.io/donation/${donation._id}`,
      attributes: [
        {
          trait_type: 'Donation Amount',
          value: `${donation.formattedAmount} ADA`
        },
        {
          trait_type: 'Category',
          value: donation.category
        },
        {
          trait_type: 'Donation Date',
          value: donation.createdAt.toISOString().split('T')[0]
        },
        {
          trait_type: 'Receipt Number',
          value: donation.receipt.receiptNumber
        },
        {
          trait_type: 'Transaction Hash',
          value: donation.blockchainTransaction.txHash
        }
      ]
    };
  }

  // Mint NFT
  async mintNFT(donation, walletAddress, imageUrl) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }

      if (!this.policyId) {
        throw new Error('NFT Policy ID not configured');
      }

      // Create asset name
      const assetName = `${process.env.NFT_ASSET_NAME_PREFIX}${donation.receipt.receiptNumber}`;
      const unit = toUnit(this.policyId, fromText(assetName));

      // Create metadata
      const metadata = this.createNFTMetadata(donation, imageUrl);

      // Create minting transaction
      const tx = await this.lucid
        .newTx()
        .mintAssets({ [unit]: 1n })
        .attachMetadata(parseInt(process.env.NFT_METADATA_LABEL) || 721, {
          [this.policyId]: {
            [fromText(assetName)]: metadata
          }
        })
        .complete();

      // Sign and submit transaction
      const signedTx = await tx.sign().complete();
      const txHash = await signedTx.submit();

      logger.info(`NFT minted successfully. Asset: ${unit}, TX: ${txHash}`);

      return {
        assetId: unit,
        assetName: assetName,
        txHash: txHash,
        metadata: metadata,
        policyId: this.policyId
      };
    } catch (error) {
      logger.error('Error minting NFT:', error);
      throw error;
    }
  }

  // Verify transaction
  async verifyTransaction(txHash, expectedAmount, recipientAddress) {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }

      const tx = await this.getTransaction(txHash);
      
      // Check if transaction is confirmed
      if (!tx.block) {
        return {
          verified: false,
          status: 'pending',
          message: 'Transaction not yet confirmed'
        };
      }

      // Check if amount matches
      const outputAmount = parseInt(tx.outputAmount[0]?.quantity || 0);
      if (outputAmount < expectedAmount) {
        return {
          verified: false,
          status: 'failed',
          message: 'Transaction amount does not match expected amount'
        };
      }

      // Check if recipient address matches
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

  // Get network information
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

  // Get asset information
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

  // Check if address is valid
  isValidAddress(address) {
    try {
      // Basic Cardano address validation
              const addressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^addr[0-9a-z]{98,103}$|^addr_test[0-9a-z]{98,103}$|^addr_test_[0-9a-f]{100,120}$|^addr_[0-9a-f]{100,120}$|^addr_test1[a-z0-9]{98,103}$/;
      return addressRegex.test(address);
    } catch (error) {
      return false;
    }
  }

  // Generate unique asset name
  generateAssetName(prefix = 'EDUFUND') {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}${timestamp.slice(-6)}${random}`;
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

export { blockchainService };

// Initialize function for server startup
export const initializeBlockchain = async () => {
  await blockchainService.initialize();
}; 
 
 
 
 
 
 
 