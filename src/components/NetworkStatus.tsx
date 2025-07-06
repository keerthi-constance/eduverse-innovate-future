import React, { useState, useEffect } from 'react';
import { lucidService } from '../services/lucidService';

interface NetworkInfo {
  networkId: number | null;
  network: string;
  needsSwitch: boolean;
}

const NetworkStatus: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const checkNetwork = async () => {
    if (!lucidService.isConnected()) {
      setNetworkInfo(null);
      return;
    }

    setLoading(true);
    try {
      const info = await lucidService.checkNetwork();
      setNetworkInfo(info);
    } catch (error) {
      console.error('Failed to check network:', error);
      setNetworkInfo({ networkId: null, network: 'Error', needsSwitch: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkNetwork();
  }, []);

  if (!lucidService.isConnected()) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-800">Checking network...</span>
        </div>
      </div>
    );
  }

  if (!networkInfo) {
    return null;
  }

  if (networkInfo.needsSwitch) {
    // Check if this is the special case where network ID is mainnet but addresses are testnet
    const isTestnetByAddress = networkInfo.network.includes('detected by address');
    
    // If detected as testnet by address format, show success state instead
    if (isTestnetByAddress) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Connected to Preprod Testnet
              </h3>
              <p className="text-sm text-green-700">
                Your wallet is properly configured for testing. (Detected by address format)
              </p>
              <div className="mt-3">
                <button
                  onClick={async () => {
                    await lucidService.debugWalletState();
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
                >
                  Debug Info
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const found = await lucidService.findCorrectWalletInstance();
                      if (found) {
                        await checkNetwork();
                      } else {
                        alert('This wallet instance does not match your expected wallet. Please try refreshing or opening in a different window.');
                      }
                    } catch (error) {
                      console.error('Failed to find correct wallet:', error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
                >
                  Find Correct Wallet
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await lucidService.clearWalletCache();
                      await lucidService.forceRefresh();
                      await checkNetwork();
                      alert('Wallet cache cleared. Please check if the correct wallet is now connected.');
                    } catch (error) {
                      console.error('Failed to clear cache:', error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Switch to Preprod Testnet
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Your Eternl wallet is currently connected to {networkInfo.network}.</p>
              <p className="mt-1">To use this app, please switch to Preprod testnet:</p>
              <ol className="mt-2 list-decimal list-inside space-y-1">
                <li>Open your Eternl wallet extension</li>
                <li>Go to Settings → Network</li>
                <li>Select "Preprod" testnet</li>
                <li>Refresh this page</li>
              </ol>
            </div>
            <div className="mt-3">
              <button
                onClick={checkNetwork}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
              >
                Check Again
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await lucidService.forceRefresh();
                    await checkNetwork();
                  } catch (error) {
                    console.error('Failed to refresh:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
              >
                Refresh Connection
              </button>
              <button
                onClick={async () => {
                  await lucidService.debugWalletState();
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
              >
                Debug Info
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const found = await lucidService.findCorrectWalletInstance();
                    if (found) {
                      await checkNetwork();
                    } else {
                      alert('This wallet instance does not match your expected wallet. Please try refreshing or opening in a different window.');
                    }
                  } catch (error) {
                    console.error('Failed to find correct wallet:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
              >
                Find Correct Wallet
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await lucidService.clearWalletCache();
                    await lucidService.forceRefresh();
                    await checkNetwork();
                    alert('Wallet cache cleared. Please check if the correct wallet is now connected.');
                  } catch (error) {
                    console.error('Failed to clear cache:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
              >
                Clear Cache
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const success = await lucidService.forceNetworkSwitch();
                    await checkNetwork();
                    if (success) {
                      alert('Successfully switched to testnet!');
                    } else {
                      alert('Network switch failed. Please manually switch to Preprod testnet in your Eternl wallet.');
                    }
                  } catch (error) {
                    console.error('Failed to force network switch:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Force Network Switch
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Connected to Preprod Testnet
          </h3>
          <p className="text-sm text-green-700">
            Your wallet is properly configured for testing.
          </p>
          <div className="mt-3">
            <button
              onClick={async () => {
                await lucidService.debugWalletState();
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
            >
              Debug Info
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const found = await lucidService.findCorrectWalletInstance();
                  if (found) {
                    await checkNetwork();
                  } else {
                    alert('This wallet instance does not match your expected wallet. Please try refreshing or opening in a different window.');
                  }
                } catch (error) {
                  console.error('Failed to find correct wallet:', error);
                } finally {
                  setLoading(false);
                }
              }}
              className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-1 rounded text-sm font-medium transition-colors mr-2"
            >
              Find Correct Wallet
            </button>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  await lucidService.clearWalletCache();
                  await lucidService.forceRefresh();
                  await checkNetwork();
                  alert('Wallet cache cleared. Please check if the correct wallet is now connected.');
                } catch (error) {
                  console.error('Failed to clear cache:', error);
                } finally {
                  setLoading(false);
                }
              }}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus; 