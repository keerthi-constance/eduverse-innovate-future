import React, { useState, useEffect } from 'react';
import { useWallet } from '@meshsdk/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CircleDollarSign, Heart, X, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  student: {
    name: string;
    walletAddress: string;
  };
}

interface DonationModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DonationModal: React.FC<DonationModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { connected, wallet, balance } = useWallet();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm' | 'processing' | 'success' | 'error'>('input');
  const [manualBalance, setManualBalance] = useState<number | null>(null);

  // Manually fetch balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && wallet) {
        try {
          const balance = await wallet.getBalance();
          console.log('Manual balance fetch:', balance);
          console.log('Balance array details:', JSON.stringify(balance, null, 2));
          
          // Handle balance as array of assets
          if (Array.isArray(balance)) {
            // Find the ADA asset (lovelace)
            const adaAsset = balance.find(asset => asset.unit === 'lovelace');
            console.log('ADA asset found:', adaAsset);
            if (adaAsset) {
              setManualBalance(adaAsset.quantity);
            } else {
              setManualBalance(0);
            }
          } else {
            setManualBalance(balance);
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    fetchBalance();
  }, [connected, wallet]);

  const progress = (project.currentFunding / project.fundingGoal) * 100;
  
  // Debug balance information
  console.log('DonationModal - Wallet balance debug:', {
    balance,
    balanceType: typeof balance,
    balanceNumber: Number(balance),
    manualBalance,
    userBalanceADA: (manualBalance || balance) ? Number(manualBalance || balance) / 1_000_000 : 0,
    connected
  });
  
  const userBalanceADA = (manualBalance || balance) ? Number(manualBalance || balance) / 1_000_000 : 0;
  const amountADA = parseFloat(amount) || 0;
  const amountLovelace = amountADA * 1_000_000;

  const handleDonate = async () => {
    if (!connected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || amountADA < 1) {
      toast.error('Minimum donation amount is 1 ADA');
      return;
    }

    if (amountADA > userBalanceADA) {
      toast.error('Insufficient balance in your wallet');
      return;
    }

    setStep('confirm');
  };

  const confirmDonation = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      // Get the student's wallet address
      const studentAddress = project.student.walletAddress;
      console.log('Student address:', studentAddress);
      console.log('Amount in lovelace:', amountLovelace);

      // Validate address format
      if (!studentAddress || !studentAddress.startsWith('addr_')) {
        throw new Error('Invalid recipient address format');
      }

      // Get payment addresses (not stake addresses!)
      const paymentAddresses = await wallet.getUsedAddresses();
      console.log('Payment addresses:', paymentAddresses);

      if (paymentAddresses && paymentAddresses.length > 0) {
        // Test transaction to own payment address first
        const testTx = {
          recipient: paymentAddresses[0],
          amount: [{
            unit: 'lovelace',
            quantity: '1000000' // 1 ADA
          }]
        };

        console.log('Testing with own payment address transaction:', testTx);
        
        try {
          const testSignedTx = await wallet.signTx(testTx);
          console.log('Test transaction signed successfully');
          // Don't submit the test transaction, just verify signing works
        } catch (testError) {
          console.error('Test transaction signing failed:', testError);
          throw new Error('Transaction signing is not working. Please check your wallet connection.');
        }
      } else {
        throw new Error('No payment addresses found in wallet.');
      }

      // Now try the actual donation transaction
      const tx = {
        recipient: studentAddress,
        amount: [{
          unit: 'lovelace',
          quantity: amountLovelace.toString()
        }]
      };

      console.log('Creating actual donation transaction:', tx);

      // Sign and submit transaction
      const signedTx = await wallet.signTx(tx);
      const txHash = await wallet.submitTx(signedTx);
      
      console.log('Transaction submitted successfully:', txHash);

      // Create donation record in backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4567'}/api/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          projectId: project.id,
          amount: amountLovelace,
          message,
          transactionHash: txHash
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record donation');
      }

      setStep('success');
      toast.success(`Donation successful! Transaction: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`);
      onSuccess();

    } catch (error) {
      console.error('Donation error:', error);
      setStep('error');
      toast.error('Donation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setAmount('');
    setMessage('');
    setStep('input');
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const refreshBalance = async () => {
    if (connected && wallet) {
      try {
        const balance = await wallet.getBalance();
        console.log('Manual balance refresh:', balance);
        
        // Handle balance as array of assets
        if (Array.isArray(balance)) {
          // Find the ADA asset (lovelace)
          const adaAsset = balance.find(asset => asset.unit === 'lovelace');
          if (adaAsset) {
            setManualBalance(adaAsset.quantity);
          } else {
            setManualBalance(0);
          }
        } else {
          setManualBalance(balance);
        }
        
        toast.success('Balance refreshed!');
      } catch (error) {
        console.error('Error refreshing balance:', error);
        toast.error('Failed to refresh balance');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Support This Project</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isProcessing}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Project Info */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">{project.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
            
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{progress.toFixed(1)}% funded</span>
                <span>{project.currentFunding.toLocaleString()} / {project.fundingGoal.toLocaleString()} ADA</span>
              </div>
            </div>
          </div>

          {/* Step 1: Input */}
          {step === 'input' && (
            <div className="space-y-4">
              {!connected ? (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Please connect your wallet to donate</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Donation Amount (ADA)</label>
                    <Input
                      type="number"
                      min="1"
                      step="0.1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount in ADA"
                      className="text-lg"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Min: 1 ADA</span>
                      <div className="flex items-center gap-1">
                        <span>Your balance: {userBalanceADA.toFixed(2)} ADA</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshBalance}
                          className="h-4 w-4 p-0 hover:bg-gray-100"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Leave a message of support..."
                      rows={3}
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {message.length}/500 characters
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CircleDollarSign className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-700 font-medium">NFT Receipt</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      You'll receive a unique NFT as proof of your donation
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Confirm Your Donation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">{amountADA} ADA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>
                    <span className="font-mono text-xs">{project.student.name}</span>
                  </div>
                  {message && (
                    <div className="flex justify-between">
                      <span>Message:</span>
                      <span className="text-gray-600">"{message}"</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h4 className="font-medium mb-2">Processing Donation</h4>
              <p className="text-sm text-gray-600">Please wait while we process your transaction...</p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h4 className="font-medium mb-2 text-green-700">Donation Successful!</h4>
              <p className="text-sm text-gray-600 mb-4">
                Thank you for supporting this project. Your NFT receipt will be minted shortly.
              </p>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                NFT Receipt Pending
              </Badge>
            </div>
          )}

          {/* Step 5: Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h4 className="font-medium mb-2 text-red-700">Donation Failed</h4>
              <p className="text-sm text-gray-600">
                There was an error processing your donation. Please try again.
              </p>
            </div>
          )}

          {/* Debug: Minimal Transaction Test Button */}
          <Button
            variant="outline"
            onClick={async () => {
              try {
                if (!wallet) {
                  alert('Wallet not connected');
                  return;
                }
                const addrs = await wallet.getUsedAddresses();
                if (!addrs || addrs.length === 0) {
                  alert('No payment addresses found');
                  return;
                }
                const tx = {
                  recipient: addrs[0],
                  amount: [{ unit: 'lovelace', quantity: '1000000' }]
                };
                const signed = await wallet.signTx(tx);
                console.log('Signed!', signed);
                alert('Signed successfully!');
              } catch (e: any) {
                console.error('Sign error:', e);
                alert('Sign error: ' + (e?.message || e));
              }
            }}
            style={{ marginBottom: 16 }}
          >
            Debug: Test Minimal Transaction
          </Button>
        </CardContent>

        <CardFooter className="flex gap-2">
          {step === 'input' && (
            <>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleDonate} 
                disabled={!connected || !amount || amountADA < 1 || amountADA > userBalanceADA}
                className="flex-1"
              >
                <Heart className="h-4 w-4 mr-2" />
                Donate
              </Button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                Back
              </Button>
              <Button onClick={confirmDonation} className="flex-1">
                <CircleDollarSign className="h-4 w-4 mr-2" />
                Confirm & Send
              </Button>
            </>
          )}

          {step === 'success' && (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          )}

          {step === 'error' && (
            <>
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                Try Again
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default DonationModal; 