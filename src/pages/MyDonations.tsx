import React from 'react';
import { useMyDonations } from '../hooks/useDonations';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  Eye, 
  Calendar, 
  DollarSign, 
  GraduationCap,
  Building,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MyDonations: React.FC = () => {
  const { data: donationsData, isLoading } = useMyDonations();
  const donations = donationsData?.data?.donations || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months}mo ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-2 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Donations</h1>
            <p className="text-gray-600">
              Track your contributions to Sri Lankan student research
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/projects">
              <Heart className="h-4 w-4 mr-2" />
              Browse More Projects
            </Link>
          </Button>
        </div>
      </div>

      {/* Donations List */}
      {donations.length > 0 ? (
        <div className="space-y-4">
          {donations.map((donation) => (
            <Card key={donation.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {donation.project.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>{donation.project.student.name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{donation.project.student.institution}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {donation.amount} ADA
                        </div>
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                      </div>
                    </div>

                    {donation.message && (
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-gray-700 italic">
                          "{donation.message}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(donation.createdAt)}</span>
                        </div>
                        <span>•</span>
                        <span>{getTimeAgo(donation.createdAt)}</span>
                        {donation.anonymous && (
                          <>
                            <span>•</span>
                            <span className="text-gray-500">Anonymous donation</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {donation.transactionHash && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://preprod.cardanoscan.io/transaction/${donation.transactionHash}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Transaction
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/projects/${donation.project.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Project
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
          <p className="text-gray-600 mb-6">
            Start supporting Sri Lankan student research by making your first donation.
          </p>
          <Button asChild>
            <Link to="/projects">
              <Heart className="h-4 w-4 mr-2" />
              Browse Projects
            </Link>
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MyDonations; 