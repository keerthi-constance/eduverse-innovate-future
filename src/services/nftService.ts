import { useWallet } from '@meshsdk/react';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface DonationNFTData {
  donationId: string;
  amount: number;
  projectTitle: string;
  projectCategory: string;
  studentName: string;
  donorName: string;
  message?: string;
  anonymous: boolean;
  transactionHash: string;
  date: string;
}

interface DonationData {
  donationId: string;
  amount: number;
  projectTitle: string;
  projectCategory: string;
  studentName: string;
  donorName: string;
  message?: string;
  anonymous: boolean;
  transactionHash: string;
  date: string;
}

class NFTService {
  // Generate a receipt image using Canvas API
  async generateReceiptImage(donationData: DonationData): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('');
        return;
      }

      // Set canvas size
      canvas.width = 600;
      canvas.height = 400;

      // Background
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header
      ctx.fillStyle = '#1890ff';
      ctx.fillRect(0, 0, canvas.width, 80);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('EduFund Donation Receipt', canvas.width / 2, 30);

      // Subtitle
      ctx.font = '14px Arial';
      ctx.fillText('Thank you for supporting education!', canvas.width / 2, 50);

      // Content
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'left';
      ctx.font = '16px Arial';

      const startY = 120;
      const lineHeight = 25;

      // Donation ID
      ctx.fillText(`Donation ID: ${donationData.donationId}`, 40, startY);
      
      // Amount
      ctx.fillText(`Amount: ${(donationData.amount / 1_000_000).toFixed(2)} ADA`, 40, startY + lineHeight);
      
      // Project
      ctx.fillText(`Project: ${donationData.projectTitle}`, 40, startY + lineHeight * 2);
      ctx.fillText(`Category: ${donationData.projectCategory}`, 40, startY + lineHeight * 3);
      
      // Student
      ctx.fillText(`Student: ${donationData.studentName}`, 40, startY + lineHeight * 4);
      
      // Donor
      const donorText = donationData.anonymous ? 'Anonymous Donor' : donationData.donorName;
      ctx.fillText(`Donor: ${donorText}`, 40, startY + lineHeight * 5);
      
      // Message
      if (donationData.message) {
        ctx.fillText(`Message: ${donationData.message}`, 40, startY + lineHeight * 6);
      }
      
      // Transaction Hash
      ctx.font = '12px Arial';
      ctx.fillText(`Transaction: ${donationData.transactionHash}`, 40, startY + lineHeight * 7);
      
      // Date
      ctx.fillText(`Date: ${new Date(donationData.date).toLocaleDateString()}`, 40, startY + lineHeight * 8);

      // Footer
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('This receipt is generated on the Cardano blockchain', canvas.width / 2, canvas.height - 20);

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    });
  }

  // Download receipt as PNG
  downloadReceipt(dataURL: string, filename: string = 'donation-receipt.png') {
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generate metadata for NFT (if needed for future minting)
  generateMetadata(donationData: DonationData) {
    return {
      name: `EduFund Donation #${donationData.donationId}`,
      description: `Donation receipt for ${donationData.projectTitle}`,
      image: `ipfs://[CID]`, // Would be replaced with actual IPFS CID
      attributes: [
        {
          trait_type: "Amount",
          value: `${(donationData.amount / 1_000_000).toFixed(2)} ADA`
        },
        {
          trait_type: "Project",
          value: donationData.projectTitle
        },
        {
          trait_type: "Category",
          value: donationData.projectCategory
        },
        {
          trait_type: "Student",
          value: donationData.studentName
        },
        {
          trait_type: "Donor",
          value: donationData.anonymous ? "Anonymous" : donationData.donorName
        },
        {
          trait_type: "Transaction Hash",
          value: donationData.transactionHash
        },
        {
          trait_type: "Date",
          value: donationData.date
        }
      ]
    };
  }
}

// React hook for using the NFT service
export const useNFTService = () => {
  const nftService = new NFTService();

  return {
    generateReceiptImage: nftService.generateReceiptImage.bind(nftService),
    downloadReceipt: nftService.downloadReceipt.bind(nftService),
    generateMetadata: nftService.generateMetadata.bind(nftService)
  };
};

export default NFTService; 
 
 