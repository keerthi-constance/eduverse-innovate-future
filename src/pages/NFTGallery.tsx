import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Image, 
  ExternalLink, 
  Download,
  Calendar,
  DollarSign,
  GraduationCap
} from 'lucide-react';

const NFTGallery: React.FC = () => {
  const { user } = useAuth();
  const nfts = user?.nfts || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'minted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please connect your wallet to view your NFT gallery.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">NFT Gallery</h1>
        <p className="text-gray-600">
          Your collection of donation receipts and project NFTs
        </p>
      </div>

      {/* NFT Grid */}
      {nfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <Card key={nft.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                <img 
                  src={nft.imageUrl || '/placeholder-nft.jpg'} 
                  alt={nft.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-nft.jpg';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge className={getStatusColor(nft.status)}>
                    {nft.status}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{nft.name}</CardTitle>
                <CardDescription>{nft.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Donation Amount:</span>
                  <span className="font-medium text-green-600">{nft.donationAmount} ADA</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span>{formatDate(nft.createdAt)}</span>
                </div>
                {nft.project && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <GraduationCap className="h-4 w-4" />
                      <span>{nft.project.student?.name}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {nft.project.title}
                    </p>
                  </div>
                )}
                <div className="flex space-x-2 pt-2">
                  {nft.transactionHash && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(`https://preprod.cardanoscan.io/transaction/${nft.transactionHash}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View TX
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Image className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs yet</h3>
          <p className="text-gray-600 mb-6">
            Start donating to projects to receive NFT receipts and build your collection.
          </p>
          <Button asChild>
            <a href="/projects">
              <DollarSign className="h-4 w-4 mr-2" />
              Browse Projects
            </a>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default NFTGallery; 
 
 