import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardStats, useRecentActivity, useTopDonors, useTrendingProjects } from '../hooks/useDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Activity,
  Heart,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWallet, useLovelace } from '@meshsdk/react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: activityData, isLoading: activityLoading } = useRecentActivity();
  const { data: donorsData, isLoading: donorsLoading } = useTopDonors();
  const { data: projectsData, isLoading: projectsLoading } = useTrendingProjects();
  const { name, connected, wallet, address } = useWallet();
  const lovelace = useLovelace();
  const [txs, setTxs] = React.useState<string[]>([]);

  const stats = statsData?.data?.stats;
  const activities = activityData?.data?.activities || [];
  const topDonors = donorsData?.data?.donors || [];
  const trendingProjects = projectsData?.data?.projects || [];

  const isLoading = statsLoading || activityLoading || donorsLoading || projectsLoading;

  const adaBalance = lovelace ? (Number(lovelace) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 }) : '...';

  React.useEffect(() => {
    if (connected && wallet && wallet.getUtxos) {
      wallet.getUtxos().then((utxos: any[]) => {
        // Extract tx hashes from UTXOs
        const hashes = utxos.map((u) => u.txHash).filter(Boolean);
        setTxs(Array.from(new Set(hashes)));
      });
    }
  }, [connected, wallet]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please connect your wallet to view the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user.displayName}! Here's what's happening with your {user.role === 'student' ? 'projects' : 'donations'}.
        </p>
      </div>

      {/* Wallet Info Panel */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900 mb-1">Wallet Info</div>
            {connected ? (
              <>
                <div className="text-sm text-gray-700">Wallet: <span className="font-mono">{name}</span></div>
                <div className="text-sm text-gray-700 break-all">Address: <span className="font-mono">{address || '...'}</span></div>
                <div className="text-sm text-gray-700">Balance: <span className="font-mono">{adaBalance}</span> ADA</div>
                {Number(lovelace) < 2_000_000 && (
                  <div className="text-xs text-red-600 mt-2">Your balance is low. Get more test ADA from the faucet to make transactions.</div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">Please connect your wallet to see details.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Panel */}
      {connected && txs.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-lg font-semibold text-gray-900 mb-2">Recent Transactions</div>
            <ul className="space-y-2">
              {txs.slice(0, 5).map((tx) => (
                <li key={tx} className="text-sm font-mono flex items-center gap-2">
                  <a
                    href={`https://preprod.cardanoscan.io/transaction/${tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {tx.slice(0, 12)}...{tx.slice(-6)}
                  </a>
                  <span className="text-gray-400">(View on Cardanoscan)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {!isLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Donations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAmount} ADA</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents + stats.totalDonors}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest updates from the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">{activity.type === 'donation' ? '💰' : 
                          activity.type === 'project_created' ? '📝' : 
                          activity.type === 'project_funded' ? '🎉' : '🖼️'}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>

        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Top Donors</span>
            </CardTitle>
            <CardDescription>
              Our most generous supporters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : topDonors.length > 0 ? (
              <div className="space-y-4">
                {topDonors.slice(0, 5).map((donor, index) => (
                  <div key={donor.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {donor.displayName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {donor.donationCount} donations
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {donor.totalDonated} ADA
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {donor.supporterRank}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No donors yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trending Projects */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Trending Projects</span>
                </CardTitle>
                <CardDescription>
                  Most popular projects this week
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/projects">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : trendingProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {project.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(project.progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{project.currentFunding} ADA</span>
                        <span>{project.daysLeft} days left</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <Link to={`/projects/${project.id}`}>
                        View Project
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No trending projects</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
