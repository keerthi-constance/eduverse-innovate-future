
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { 
  Diamond, 
  CircleDollarSign, 
  FlaskConical, 
  Calendar,
  ExternalLink,
  Download,
  Wallet,
  DiamondPercent,
  GraduationCap
} from 'lucide-react';

const Dashboard = () => {
  const [walletConnected] = useState(true); // Mock wallet connection state

  // Mock user data
  const userStats = {
    totalDonated: 2850,
    projectsSupported: 12,
    nftsOwned: 15,
    rank: 'Gold Supporter'
  };

  const nftReceipts = [
    {
      id: '1',
      projectTitle: 'AI-Powered Medical Diagnosis for Rural Areas',
      donationAmount: 500,
      date: '2024-06-25',
      transactionHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      nftImage: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop',
      status: 'Minted',
      category: 'AI'
    },
    {
      id: '2',
      projectTitle: 'Sustainable Energy Storage Research',
      donationAmount: 750,
      date: '2024-06-20',
      transactionHash: '0x8f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91386',
      nftImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop',
      status: 'Minted',
      category: 'Technology'
    },
    {
      id: '3',
      projectTitle: 'Quantum Computing Algorithms for Drug Discovery',
      donationAmount: 1200,
      date: '2024-06-15',
      transactionHash: '0x9f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91387',
      nftImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200&h=200&fit=crop',
      status: 'Minted',
      category: 'Health'
    },
    {
      id: '4',
      projectTitle: 'Climate Change Impact on Marine Ecosystems',
      donationAmount: 400,
      date: '2024-06-10',
      transactionHash: '0xaf9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91388',
      nftImage: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200&h=200&fit=crop',
      status: 'Pending',
      category: 'Environment'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ai':
      case 'technology':
        return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'health':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'environment':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-web3-gradient">
        <Navbar />
        <div className="pt-24 pb-12 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full flex items-center justify-center">
                <Wallet className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
              <p className="text-xl text-gray-300 mb-8 max-w-md">
                Connect your Cardano wallet to view your donation history and NFT receipts.
              </p>
              <Button className="web3-button text-lg px-8 py-4">
                <Wallet className="h-5 w-5 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-web3-gradient">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Donor Dashboard
            </h1>
            <p className="text-xl text-gray-300">
              Track your contributions and manage your NFT collection
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card p-6 text-center">
              <CircleDollarSign className="h-8 w-8 mx-auto mb-3 text-cyan-400" />
              <div className="text-3xl font-bold text-white mb-1">{userStats.totalDonated.toLocaleString()}</div>
              <div className="text-sm text-gray-400">ADA Donated</div>
            </Card>

            <Card className="glass-card p-6 text-center">
              <FlaskConical className="h-8 w-8 mx-auto mb-3 text-violet-400" />
              <div className="text-3xl font-bold text-white mb-1">{userStats.projectsSupported}</div>
              <div className="text-sm text-gray-400">Projects Supported</div>
            </Card>

            <Card className="glass-card p-6 text-center">
              <Diamond className="h-8 w-8 mx-auto mb-3 text-cyan-400" />
              <div className="text-3xl font-bold text-white mb-1">{userStats.nftsOwned}</div>
              <div className="text-sm text-gray-400">NFTs Owned</div>
            </Card>

            <Card className="glass-card p-6 text-center">
              <GraduationCap className="h-8 w-8 mx-auto mb-3 text-violet-400" />
              <div className="text-lg font-bold text-white mb-1">{userStats.rank}</div>
              <div className="text-sm text-gray-400">Supporter Rank</div>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="nfts" className="space-y-6">
            <TabsList className="bg-midnight-800/50 border border-white/20">
              <TabsTrigger value="nfts" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                NFT Collection
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                Donation History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nfts" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Your NFT Receipts</h2>
                <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  <Download className="h-4 w-4 mr-2" />
                  Export Collection
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nftReceipts.map((nft) => (
                  <Card key={nft.id} className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative mb-4">
                      <img 
                        src={nft.nftImage} 
                        alt={nft.projectTitle}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={getCategoryColor(nft.category)}>
                          {nft.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className={nft.status === 'Minted' 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }>
                          {nft.status}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-semibold text-white mb-2 line-clamp-2">{nft.projectTitle}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Donation:</span>
                        <span className="text-cyan-400 font-medium">{nft.donationAmount} ADA</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Date:</span>
                        <span className="text-white">{nft.date}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">TX Hash:</span>
                        <span className="text-white">{shortenHash(nft.transactionHash)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-violet-500 text-violet-400 hover:bg-violet-500/10">
                        <DiamondPercent className="h-3 w-3 mr-1" />
                        View NFT
                      </Button>
                      <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Donation History</h2>
                <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>

              <Card className="glass-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-gray-400 font-medium">Project</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Amount</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nftReceipts.map((donation) => (
                        <tr key={donation.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={donation.nftImage} 
                                alt={donation.projectTitle}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                              <div>
                                <div className="text-white font-medium line-clamp-1">{donation.projectTitle}</div>
                                <Badge className={`${getCategoryColor(donation.category)} text-xs`}>
                                  {donation.category}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-cyan-400 font-semibold">{donation.donationAmount} ADA</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-gray-300">
                              <Calendar className="h-4 w-4 mr-1" />
                              {donation.date}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={donation.status === 'Minted' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }>
                              {donation.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-violet-500 text-violet-400 hover:bg-violet-500/10">
                                View Receipt
                              </Button>
                              <Button variant="outline" size="sm" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
