import React from 'react';
import { Button, Dropdown, Space, Typography, Tooltip } from 'antd';
import { WalletOutlined, LoadingOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useLucidWallet } from '../hooks/useLucidWallet';
import NetworkStatus from './NetworkStatus';

const { Text } = Typography;

const WalletConnect: React.FC = () => {
  const { 
    connected, 
    address, 
    balance, 
    loading, 
    error, 
    connect, 
    disconnect, 
    refreshBalance 
  } = useLucidWallet();

  const userBalanceADA = balance ? Number(balance) / 1_000_000 : 0;

  const walletMenuItems = [
    {
      key: 'status',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text strong>Wallet Status</Text>
          <div>
            <Text type={connected ? 'success' : 'danger'}>
              {connected ? 'Connected' : 'Not Connected'}
            </Text>
          </div>
        </div>
      )
    },
    {
      type: 'divider' as const
    },
    {
      key: 'balance',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text>Balance</Text>
          <div>
            <Text strong style={{ color: '#52c41a' }}>
              {userBalanceADA.toFixed(2)} ADA
            </Text>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      label: (
        <div style={{ padding: '8px 0' }}>
          <Text>Address</Text>
          <div>
            <Text code style={{ fontSize: '12px' }}>
              {address ? `${address.slice(0, 20)}...${address.slice(-20)}` : 'Not available'}
            </Text>
          </div>
        </div>
      )
    },
    {
      type: 'divider' as const
    },
    {
      key: 'refresh',
      label: (
        <Button 
          type="text" 
          size="small" 
          onClick={refreshBalance}
          style={{ width: '100%', textAlign: 'left' }}
        >
          Refresh Balance
        </Button>
      )
    },
    {
      key: 'disconnect',
      label: (
        <Button 
          type="text" 
          danger 
          size="small" 
          onClick={disconnect}
          style={{ width: '100%', textAlign: 'left' }}
        >
          Disconnect Wallet
        </Button>
      )
    }
  ];

  if (connected) {
    return (
      <div>
        <NetworkStatus />
      <Dropdown
        menu={{ items: walletMenuItems }}
        placement="bottomRight"
        trigger={['click']}
      >
        <Button 
          type="primary" 
          icon={<WalletOutlined />}
          style={{ 
            background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)',
            border: 'none'
          }}
        >
          <Space>
            <Text style={{ color: 'white' }}>
              {userBalanceADA.toFixed(2)} ADA
            </Text>
          </Space>
        </Button>
      </Dropdown>
      </div>
    );
  }

  return (
    <Tooltip title={error || 'Connect your Cardano wallet'}>
      <Button 
        type="primary" 
        icon={loading ? <LoadingOutlined /> : <WalletOutlined />}
        onClick={connect}
        loading={loading}
        style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          border: 'none'
        }}
      >
        Connect Wallet
      </Button>
    </Tooltip>
  );
};

export default WalletConnect; 
 
 