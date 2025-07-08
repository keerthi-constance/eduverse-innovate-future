import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Progress, 
  Button, 
  Input, 
  InputNumber, 
  Checkbox, 
  Space, 
  Row, 
  Col, 
  Divider, 
  Tag, 
  Avatar, 
  Statistic, 
  Alert, 
  Spin,
  message,
  Steps,
  Tooltip,
  Image
} from 'antd';
import { 
  HeartOutlined, 
  WalletOutlined, 
  SendOutlined, 
  UserOutlined, 
  CheckCircleOutlined,
  LoadingOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  SafetyOutlined,
  RocketOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useProject, projectKeys } from '../hooks/useProjects';
import { useAuth } from '../contexts/AuthContext';
import { useLucidWallet } from '../hooks/useLucidWallet';
import { useNFTService } from '../services/nftService';
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { Lucid, fromText, toUnit, Blockfrost } from 'lucid-cardano';
import nftPolicy from '../../nft-policy.json';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// TEST WALLET ADDRESSES (for development/testing only)
const TEST_ADDRESSES = {
  student: 'addr_test1qzcpuxeu3fuskvu76vee7hgvjs2q057ddh06uuh3mweresst308dyd6xvy8zy4ah8jwdu8va6zw9y4k42vcztdznj24srgyv0w',
  donor: 'addr_test1qzx0y7avtk868vwvsqccvw62ns8yf67aye32kxgpc5u3lmy2wxx5d800rqg5ry68kpg3pw3f92h9t69yl0pgk4vzsvxs5nxn97',
};
const isDev = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test';

const Donate: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: projectData, isLoading } = useProject(projectId || '');
  const { user } = useAuth();
  const { 
    connected, 
    address, 
    balance, 
    loading: walletLoading, 
    error: walletError, 
    connect, 
    disconnect, 
    refreshBalance, 
    sendTransaction 
  } = useLucidWallet();
  const { generateReceiptImage } = useNFTService();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<number | null>(null);
  const [donationMessage, setDonationMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const project = projectData?.data?.project;

  const userBalanceADA = balance ? Number(balance) / 1_000_000 : 0;
  const amountADA = amount || 0;
  const amountLovelace = amountADA * 1_000_000;

  const handleDonate = async () => {
    if (!connected) {
      message.error('Please connect your wallet first');
      return;
    }

    if (!amount || amountADA < 1) {
      message.error('Minimum donation amount is 1 ADA');
      return;
    }

    if (amountADA > userBalanceADA) {
      message.error('Insufficient balance in your wallet');
      return;
    }

    setCurrentStep(1);
  };

  const confirmDonation = async () => {
    console.log('Confirm donation - Wallet state:', {
      connected,
      address,
      balance,
      amountADA,
      amountLovelace
    });

    if (!connected || !project) {
      message.error('Wallet not connected or project not found');
      return;
    }

    // Additional validation
    if (!address) {
      message.error('Wallet address not available');
      return;
    }

    if (!balance || balance < amountLovelace) {
      message.error('Insufficient balance in wallet');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // Get the student's wallet address
      const studentAddress = project.student?.walletAddress;
      console.log('Student address:', studentAddress);
      console.log('Amount in lovelace:', amountLovelace);

      // Validate address format
      if (!studentAddress || !studentAddress.startsWith('addr_')) {
        throw new Error('Invalid recipient address format');
      }

      // Ensure we're not sending to ourselves
      if (studentAddress === address) {
        throw new Error('Cannot send to your own address');
      }

      // Validate amount
      if (!amountLovelace || amountLovelace <= 0) {
        throw new Error('Invalid donation amount');
      }

      // Check for reasonable limits (max 100 ADA = 100,000,000 lovelace)
      if (amountLovelace > 100_000_000) {
        throw new Error('Donation amount too large (max 100 ADA)');
      }

      console.log('Sending transaction with Lucid...');
      
      // In confirmDonation, override the address with the student test address in dev/test
      const senderAddress = isDev ? TEST_ADDRESSES.student : address;
      
      // Enable wallet and select the correct API
      const namiApi = window.cardano?.nami ? await window.cardano.nami.enable() : undefined;
      const eternlApi = window.cardano?.eternl ? await window.cardano.eternl.enable() : undefined;
      const api = namiApi || eternlApi;
      if (!api) throw new Error('No Cardano wallet enabled.');
      
      // Send transaction using Lucid
      const txHash = await sendTransaction(senderAddress, amountLovelace);
      setTxHash(txHash);
      console.log('Transaction hash:', txHash);

      // Post donation details to backend
      console.log('user.id:', user.id, typeof user.id);
      const donationPayload = {
        donor: user.id,
        donorAddress: address,
        studentAddress: studentAddress,
        project: project._id || project.id,
        amount: amountLovelace,
        transactionHash: txHash,
        status: 'pending',
        message: donationMessage,
        anonymous: anonymous
      };
      console.log('Posting donation:', donationPayload);
      try {
        await apiService.donations.create(donationPayload);
        message.success('Donation recorded!');
        // Mint NFT after donation is recorded
        try {
          console.log('Calling mintNFT after donation...');
          const nftTxHash = await mintNFT(address, {
            amount: amountADA,
            receiptNumber: 'EDU-' + Date.now(), // Replace with real receipt from backend if available
            donationDate: new Date().toISOString().split('T')[0],
            txHash: txHash
          });
          message.success('NFT minted and sent to your wallet!');
          console.log('NFT mint transaction hash:', nftTxHash);
        } catch (e: any) {
          console.error('NFT minting failed:', e);
          message.error('NFT minting failed: ' + (e.message || String(e)));
        }
      } catch (err) {
        message.error('Failed to record donation in backend');
      }

      // Refetch project and my-donations data
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.myProjects() });
      queryClient.invalidateQueries({ queryKey: ['my-donations'] });

      // Success
      setCurrentStep(3);
      message.success(`Donation successful! Transaction: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`);
      
      // Generate NFT receipt
      try {
        const nftData = {
          donationId: `donation_${Date.now()}`,
          amount: amountLovelace,
          projectTitle: project.title,
          projectCategory: project.category,
          studentName: project.student.name,
          donorName: user?.displayName || 'Anonymous',
          message: donationMessage || undefined,
          anonymous: anonymous,
          transactionHash: txHash,
          date: new Date().toISOString()
        };
        const receiptImageData = await generateReceiptImage(nftData);
        setReceiptImage(receiptImageData);
      } catch (error) {
        console.error('Error generating receipt:', error);
      }
      
      // Show receipt and tx hash for a few seconds before redirect
      setTimeout(() => {
        setAmount(null);
        setDonationMessage('');
        setAnonymous(false);
        setCurrentStep(0);
        setIsProcessing(false);
        setReceiptImage(null);
        setTxHash(null);
        navigate('/projects');
      }, 6000);

    } catch (error) {
      console.error('Donation error:', error);
      setCurrentStep(0);
      setIsProcessing(false);
      message.error(error instanceof Error ? error.message : 'Donation failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: '16px' }}>Loading project details...</Paragraph>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={2}>Project Not Found</Title>
        <Paragraph>The project you're looking for doesn't exist.</Paragraph>
        <Button type="primary" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const progress = (project.currentFunding / project.fundingGoal) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const steps = [
    {
      title: 'Enter Amount',
      description: 'Set donation amount',
      icon: <DollarOutlined />
    },
    {
      title: 'Confirm',
      description: 'Review and confirm',
      icon: <SafetyOutlined />
    },
    {
      title: 'Processing',
      description: 'Transaction in progress',
      icon: <LoadingOutlined />
    },
    {
      title: 'Complete',
      description: 'Donation successful',
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <div style={{ minHeight: '80vh', padding: '32px 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, color: 'white' }}>
          <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
            <HeartOutlined style={{ marginRight: 12, color: '#ff4d4f' }} />
            Support This Project
          </Title>
          <Paragraph style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)' }}>
            Make a difference by supporting this student's research with ADA
          </Paragraph>
        </div>

        {/* Progress Steps */}
        <div style={{ marginBottom: 40 }}>
          <Steps
            current={currentStep}
            items={steps}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '24px', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>

        <Row gutter={[32, 32]} justify="center">
          {/* Project Details */}
          <Col xs={24} lg={10}>
            <Card 
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <Avatar 
                  size={64} 
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff', marginRight: 16 }}
                />
                <div>
                  <Title level={3} style={{ margin: 0 }}>{project.title}</Title>
                  <Paragraph style={{ margin: 0, color: '#666' }}>
                    by {project.student?.name} • {project.student?.institution}
                  </Paragraph>
                </div>
              </div>

              <Paragraph style={{ fontSize: '1rem', lineHeight: 1.6, marginBottom: 24 }}>
                {project.description}
              </Paragraph>

              <Divider />

              {/* Project Stats */}
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Funding Goal"
                    value={(project.fundingGoal / 1_000_000).toLocaleString()}
                    suffix="ADA"
                    valueStyle={{ color: '#1890ff', fontSize: '1.2rem' }}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Current Funding"
                    value={(project.currentFunding / 1_000_000).toLocaleString()}
                    suffix="ADA"
                    valueStyle={{ color: '#52c41a', fontSize: '1.2rem' }}
                    prefix={<DollarOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Days Left"
                    value={daysLeft}
                    suffix="days"
                    valueStyle={{ color: '#fa8c16', fontSize: '1.2rem' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Status"
                    value={project.status === 'active' ? 'Active' : 'Completed'}
                    valueStyle={{ 
                      color: project.status === 'active' ? '#52c41a' : '#722ed1',
                      fontSize: '1.2rem'
                    }}
                    prefix={<RocketOutlined />}
                  />
                </Col>
              </Row>

              {/* Progress Bar */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Funding Progress</Text>
                  <Text strong>{progress.toFixed(1)}%</Text>
                </div>
                <Progress 
                  percent={progress} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  showInfo={false}
                />
              </div>

              {/* Wallet Connection Status */}
              <Card size="small" style={{ background: connected ? '#f6ffed' : '#fff2e8', border: '1px solid #b7eb8f' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>Wallet Status</Text>
                    <div>
                      <Text type="secondary">
                        {connected ? 'Connected' : 'Not Connected'}
                      </Text>
                    </div>
                    {connected && address && (
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {address.slice(0, 20)}...{address.slice(-20)}
                        </Text>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {connected ? (
                      <div>
                        <Text strong style={{ color: '#52c41a' }}>
                          {userBalanceADA.toFixed(2)} ADA
                        </Text>
                        <div>
                          <Tooltip title="Refresh Balance">
                            <Button 
                              size="small" 
                              icon={<LoadingOutlined />} 
                              onClick={refreshBalance}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        type="primary" 
                        size="small"
                        icon={<WalletOutlined />}
                        onClick={connect}
                        loading={walletLoading}
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </Card>
          </Col>

          {/* Donation Form */}
          <Col xs={24} lg={14}>
            <Card 
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              {currentStep === 0 && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Donation Amount (ADA)</Text>
                    <InputNumber
                      value={amount}
                      onChange={(value) => setAmount(value as number)}
                      placeholder="Enter amount in ADA"
                      min={1}
                      max={userBalanceADA}
                      style={{ width: '100%', marginTop: 8 }}
                      size="large"
                      addonAfter="ADA"
                      disabled={!connected}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Available: {userBalanceADA.toFixed(2)} ADA
                    </Text>
                  </div>

                  <div>
                    <Text strong>Message (Optional)</Text>
                    <TextArea
                      rows={3}
                      placeholder="Leave a message of support..."
                      value={donationMessage}
                      onChange={(e) => setDonationMessage(e.target.value)}
                      maxLength={500}
                      style={{ marginTop: 8 }}
                      disabled={!connected}
                    />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {donationMessage.length}/500 characters
                    </Text>
                  </div>

                  <Checkbox
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    disabled={!connected}
                  >
                    Make this donation anonymous
                  </Checkbox>

                  {amount && amount > 0 && (
                    <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                      <div style={{ textAlign: 'center' }}>
                        <Text strong>Donation Summary</Text>
                        <div style={{ marginTop: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Amount:</span>
                            <span style={{ fontWeight: 'bold' }}>{amount} ADA</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Network Fee:</span>
                            <span>~0.17 ADA</span>
                          </div>
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>Total:</span>
                            <span>{(amount + 0.17).toFixed(2)} ADA</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleDonate}
                    disabled={!connected || !amount || amount < 1 || amount > userBalanceADA}
                    style={{ 
                      width: '100%',
                      height: '48px',
                      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                      border: 'none'
                    }}
                  >
                    {connected ? 'Continue to Donate' : 'Connect Wallet to Donate'}
                  </Button>
                </Space>
              )}

              {currentStep === 1 && (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Alert
                    message="Confirm Your Donation"
                    description="Please review your donation details before proceeding."
                    type="info"
                    showIcon
                  />

                  <Card size="small">
                    <div style={{ textAlign: 'center' }}>
                      <Text strong>Donation Details</Text>
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>Amount:</span>
                          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{amount} ADA</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>Network Fee:</span>
                          <span>~0.17 ADA</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>Total:</span>
                          <span style={{ fontWeight: 'bold' }}>{(amount + 0.17).toFixed(2)} ADA</span>
                        </div>
                        {donationMessage && (
                          <div style={{ marginTop: 16, textAlign: 'left' }}>
                            <Text type="secondary">Message:</Text>
                            <Paragraph style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>
                              "{donationMessage}"
                            </Paragraph>
                          </div>
                        )}
                        {anonymous && (
                          <Tag color="orange" style={{ marginTop: 8 }}>
                            Anonymous Donation
                          </Tag>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button 
                      size="large" 
                      onClick={() => setCurrentStep(0)}
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      icon={<SendOutlined />}
                      onClick={confirmDonation}
                      loading={isProcessing}
                      style={{ 
                        background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)',
                        border: 'none'
                      }}
                    >
                      Confirm & Send
                    </Button>
                  </Space>
                </Space>
              )}

              {currentStep === 2 && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                  <Title level={4} style={{ marginTop: 16 }}>Processing Transaction</Title>
                  <Paragraph>Please wait while we process your donation...</Paragraph>
                  <Paragraph type="secondary">Do not close this window or disconnect your wallet.</Paragraph>
                </div>
              )}

              {currentStep === 3 && (
                <Card style={{ margin: '24px 0', textAlign: 'center' }}>
                  <h2>🎉 Donation Successful!</h2>
                  {txHash && (
                    <div style={{ margin: '12px 0' }}>
                      <b>Transaction Hash:</b> <br />
                      <a href={`https://preprod.cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a>
                    </div>
                  )}
                  {receiptImage && (
                    <div style={{ margin: '12px 0' }}>
                      <b>Your NFT Receipt:</b><br />
                      <img src={receiptImage} alt="NFT Receipt" style={{ maxWidth: 320, margin: '12px auto' }} />
                    </div>
                  )}
                  <div style={{ marginTop: 16 }}>
                    <b>Thank you for your support!</b>
                  </div>
                  <div style={{ marginTop: 8, color: '#888' }}>
                    You will be redirected to the projects page shortly...
                  </div>
                </Card>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

async function mintNFT(address: string, donationData: any) {
  console.log('MintNFT: Starting...', { address, donationData });
  try {
    const lucid = await Lucid.new(
      new Blockfrost('https://cardano-preprod.blockfrost.io/api/v0', 'preproda1GVl38NyMYaPpoii6rnlaX8nsy7l3m3'),
      'Preprod'
    );
    // Enable wallet and select the correct API
    const namiApi = window.cardano?.nami ? await window.cardano.nami.enable() : undefined;
    const eternlApi = window.cardano?.eternl ? await window.cardano.eternl.enable() : undefined;
    const api = namiApi || eternlApi;
    if (!api) throw new Error('No Cardano wallet enabled.');
    lucid.selectWallet(api);

    // Dynamically generate a signature-based policy for the connected wallet
    const address = await lucid.wallet.address();
    const addressDetails = lucid.utils.getAddressDetails(address);
    const keyHash = addressDetails.paymentCredential?.hash;
    console.log('DEBUG: address', address, 'addressDetails', addressDetails, 'keyHash', keyHash);
    const currentSlot = await lucid.currentSlot();
    const futureSlot = currentSlot + 1000000; // 1 million slots in the future
    const policy = {
      type: 'all' as const,
      scripts: [
        { type: 'sig' as const, keyHash },
        { type: 'before' as const, slot: futureSlot }
      ]
    };
    console.log('DEBUG: dynamic policy:', policy);
    console.log('DEBUG: JSON.stringify(policy):', JSON.stringify(policy));
    const lucidPolicy = lucid.utils.nativeScriptFromJson(JSON.parse(JSON.stringify(policy)));
    console.log('DEBUG: lucidPolicy (should be NativeScript instance):', lucidPolicy);
    const policyId = lucid.utils.mintingPolicyToId(lucidPolicy);
    console.log('DEBUG: policyId used:', policyId);
    const assetName = 'EDU-' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    const assetNameHex = fromText(assetName);
    const unit = toUnit(policyId, assetNameHex);
    console.log('DEBUG: unit (asset) being minted:', unit);

    const metaObj = {
      [policyId]: {
        [assetNameHex]: {
          name: assetName,
          image: 'https://placehold.co/400x400/png?text=DonationNFT',
          description: `Thank you for your donation of ${donationData.amount} ADA!`,
          receiptNumber: donationData.receiptNumber,
          donationDate: donationData.donationDate,
          donationTx: donationData.txHash
        }
      }
    };

    // Pass the serialized policy JSON to mintAssets
    const tx = await lucid
      .newTx()
      .mintAssets({ [unit]: 1n }, lucidPolicy)
      .attachMetadata(721, metaObj)
      .payToAddress(address, { [unit]: 1n })
      .complete();

    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
    console.log('MintNFT: Success! Transaction hash:', txHash);
    return txHash;
  } catch (e) {
    console.error('MintNFT Error:', e);
    throw e;
  }
}

export default Donate; 
 
 