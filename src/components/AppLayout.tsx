import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const { Header, Content, Footer } = Layout;

const navItems = [
  { key: '/', label: 'Home' },
  { key: '/projects', label: 'Projects' },
  { key: '/my-donations', label: 'My Donations' },
  { key: '/leaderboard', label: 'Leaderboard' },
  { key: '/about', label: 'About' },
];

export default function AppLayout({ children }) {
  const location = useLocation();
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="EduFund" style={{ height: 40, marginRight: 24 }} />
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          style={{ flex: 1 }}
          items={navItems.map(item => ({
            key: item.key,
            label: <Link to={item.key}>{item.label}</Link>
          }))}
        />
      </Header>
      <Content style={{ padding: '32px 16px', background: '#fafcff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
      </Content>
      <Footer style={{ textAlign: 'center', color: '#888' }}>
        © 2024 EduFund. Built on Cardano blockchain.
      </Footer>
    </Layout>
  );
} 
 
 