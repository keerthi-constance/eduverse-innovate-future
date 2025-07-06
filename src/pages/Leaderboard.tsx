import { useEffect, useState } from 'react';
import { Card, Typography, Table, Tag } from 'antd';
import { CrownOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function Leaderboard() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch top donors from backend
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4567'}/api/donations/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setDonors(data?.data?.donors || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render: (text, record, idx) => (
        <span>
          {idx === 0 && <CrownOutlined style={{ color: '#F5C518', marginRight: 4 }} />}
          {idx + 1}
        </span>
      ),
    },
    {
      title: 'Donor',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (name, record) => (
        <span>{name} <Tag color="blue">{record.role}</Tag></span>
      ),
    },
    {
      title: 'Total Donated (ADA)',
      dataIndex: ['donorInfo', 'totalDonated'],
      key: 'totalDonated',
      render: (amount) => (amount / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
    },
    {
      title: 'Donations',
      dataIndex: ['donorInfo', 'donationCount'],
      key: 'donationCount',
    },
    {
      title: 'Supporter Rank',
      dataIndex: ['donorInfo', 'supporterRank'],
      key: 'supporterRank',
      render: (rank) => <Tag color="magenta">{rank}</Tag>,
    },
  ];

  return (
    <Card style={{ maxWidth: 900, margin: '32px auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Donor Leaderboard</Title>
      <Paragraph style={{ textAlign: 'center', color: '#555', marginBottom: 32 }}>
        Celebrate our top donors who are making a difference in Sri Lankan student research!
      </Paragraph>
      <Table
        columns={columns}
        dataSource={donors}
        loading={loading}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: 'No donors yet.' }}
      />
    </Card>
  );
} 
 
 