import { useState, useEffect, useCallback } from 'react';
import { lucidService } from '../services/lucidService';

export const useLucidWallet = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if any wallets are available
      if (!lucidService.hasWallets()) {
        const availableWallets = ['Eternl', 'Nami', 'Flint', 'Yoroi', 'Typhon'];
        throw new Error(`No Cardano wallet found. Please install one of: ${availableWallets.join(', ')}`);
      }
      
      await lucidService.connectWallet();
      const walletAddress = await lucidService.getAddress();
      const walletBalance = await lucidService.getBalance();
      
      setAddress(walletAddress);
      setBalance(Number(walletBalance));
      setConnected(true);
      
      console.log('Wallet connected:', { address: walletAddress, balance: walletBalance });
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await lucidService.disconnect();
      setConnected(false);
      setAddress(null);
      setBalance(null);
      setError(null);
    } catch (err) {
      console.error('Wallet disconnection error:', err);
      setError('Failed to disconnect wallet');
    }
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!connected) return;
    
    try {
      const walletBalance = await lucidService.getBalance();
      setBalance(Number(walletBalance));
    } catch (err) {
      console.error('Balance refresh error:', err);
      setError('Failed to refresh balance');
    }
  }, [connected]);

  // Send transaction
  const sendTransaction = useCallback(async (recipientAddress: string, amountLovelace: number) => {
    if (!connected) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const txHash = await lucidService.sendTransaction(recipientAddress, amountLovelace);
      
      // Refresh balance after transaction
      await refreshBalance();
      
      return txHash;
    } catch (err) {
      console.error('Transaction error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [connected, refreshBalance]);

  // Initialize Lucid and check existing connection on mount
  useEffect(() => {
    const initLucid = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('useLucidWallet: Initializing...');
        const success = await lucidService.initialize();
        
        if (success) {
          console.log('Lucid initialized successfully');
          
          // Check if wallet is already connected and enabled
          const isConnected = lucidService.isConnected();
          const isEnabled = await lucidService.isWalletEnabled();
          
          console.log('useLucidWallet: Connection check:', { isConnected, isEnabled });
          
          if (isConnected && isEnabled) {
            try {
              console.log('useLucidWallet: Checking existing wallet connection...');
              const walletAddress = await lucidService.getAddress();
              const walletBalance = await lucidService.getBalance();
              
              setAddress(walletAddress);
              setBalance(Number(walletBalance));
              setConnected(true);
              
              console.log('useLucidWallet: Existing wallet connection found:', { 
                address: walletAddress, 
                balance: walletBalance,
                balanceADA: Number(walletBalance) / 1_000_000
              });
            } catch (err) {
              console.error('useLucidWallet: Failed to get existing wallet data:', err);
              // If we can't get wallet data, disconnect
              await lucidService.disconnect();
              setConnected(false);
              setAddress(null);
              setBalance(null);
            }
          } else {
            console.log('useLucidWallet: No existing wallet connection found or wallet not enabled');
          }
        } else {
          setError('Failed to initialize Lucid');
        }
      } catch (err) {
        console.error('Lucid initialization error:', err);
        setError('Failed to initialize Lucid');
      } finally {
        setLoading(false);
      }
    };

    initLucid();
  }, []);

  // Auto-connect effect
  useEffect(() => {
    if (!connected && !loading && lucidService.hasWallets()) {
      console.log('useLucidWallet: Attempting auto-connection...');
      connect().catch(err => {
        console.log('useLucidWallet: Auto-connection failed:', err);
      });
    }
  }, [connected, loading, connect]);

  return {
    connected,
    address,
    balance,
    loading,
    error,
    connect,
    disconnect,
    refreshBalance,
    sendTransaction,
    availableWallets: lucidService.getAvailableWalletNames(),
    hasWallets: lucidService.hasWallets(),
  };
}; 
 
 