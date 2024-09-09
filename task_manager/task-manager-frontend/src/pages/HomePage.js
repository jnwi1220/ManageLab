import React from 'react';
import { Layout, Menu, Button, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';
import collabImage from '../img/collab.png';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

// Define the menu items
const items = [
    {
        key: '1',
        label: <Link to="/login">Login</Link>,
    },
    {
        key: '2',
        label: <Link to="/register">Register</Link>,
    },
];

function HomeComponent() {
    return (
        <Layout>
            <Header style={{ backgroundColor: '#001529', display: 'flex', alignItems: 'center' }}>
                <div className="logo" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                    ManageLab
                </div>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} items={items} style={{ flex: 1, justifyContent: 'flex-end' }} />
            </Header>
            <Content style={{ marginTop: '64px', padding:'0 12px' }}>
                <div className="site-layout-content" style={{ padding: '24px', minHeight: '380px', backgroundColor: '#fff', borderRadius:'8px' }}>
                    <Row justify="center" align="middle" style={{ height: '100%' }}>
                        <Col span={12}>
                            <Title level={1}>Welcome to ManageLab!</Title>
                            <Text type="secondary">
                                ManageLab is your ultimate solution for project management and team collaboration. 
                                Plan, track, and collaborate seamlessly with your team in real-time.
                            </Text>
                            <br /><br />
                            <Button type="primary" size="large" style={{ marginRight: '10px' }}>
                                <Link to="/login" style={{ color: 'white' }}>Get Started</Link>
                            </Button>
                            <Button size="large">
                                <Link to="/register">Sign Up Now</Link>
                            </Button>
                        </Col>
                        <Col span={12}>
                            <img 
                                src={collabImage}
                                alt="ManageLab Collaboration" 
                                style={{ width: '100%', borderRadius: '10px' }}
                            />
                        </Col>
                    </Row>
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                ManageLab ©2024. FYP. Created by JW
            </Footer>
        </Layout>
    );
}

export default HomeComponent;
