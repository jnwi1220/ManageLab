import React, { useState } from 'react';
import axios from 'axios';
import { Layout, Menu, Form, Input, Button, Alert, Row, Col, Typography, message } from 'antd';
import { Link } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const getCsrfToken = () => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith('csrftoken=')) {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return cookieValue;
};

const LoginComponent = () => {
    const [error, setError] = useState(null);

    const handleSubmit = async (formData) => {
        try {
            const csrfToken = getCsrfToken();
            const response = await axios.post(
                '/accounts/login/',
                JSON.stringify(formData),
                {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                message.success('Login successful! Please Wait..');
                localStorage.setItem('token', response.data.token); // Store token
                window.location.href = '/dashboard'; // Redirect to dashboard
            } else {
                setError('Login failed. Please check your username and password.');
            }
        } catch (error) {
            console.error('There was an error logging in!', error);
            setError('Login failed. Please check your username and password.');
        }
    };

    // Header items
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

    return (
        <Layout>
            <Header style={{ backgroundColor: '#001529', display: 'flex', alignItems: 'center' }}>
                <div className="logo" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                    <Link to="/" style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', textDecoration: 'none' }}>
                        ManageLab
                    </Link>
                </div>
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']} items={items} style={{ flex: 1, justifyContent: 'flex-end' }} />
            </Header>
            <Content style={{ marginTop: '64px', padding: '50px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
                <Row justify="center" align="middle">
                    <Col span={12} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                        <Title level={2} style={{ textAlign: 'center' }}>Welcome Back to ManageLab</Title>
                        <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginBottom: '20px' }}>
                            Please login to your account to continue.
                        </Text>
                        <Form
                            name="login-form"
                            onFinish={handleSubmit}
                            style={{ maxWidth: '300px', margin: '0 auto' }}
                        >
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Please enter your username' }]}
                            >
                                <Input
                                    placeholder="Username"
                                    autoComplete="username"
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please enter your password' }]}
                            >
                                <Input.Password
                                    placeholder="Password"
                                    autoComplete="current-password"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    Login
                                </Button>
                            </Form.Item>

                            {error && (
                                <Form.Item>
                                    <Alert message={error} type="error" showIcon />
                                </Form.Item>
                            )}
                        </Form>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Text type="secondary">Don’t have an account?</Text>
                            <Button type="link">
                                <Link to="/register">Register here</Link>
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
                ManageLab ©2024. FYP. Created by JW
            </Footer>
        </Layout>
    );
};

export default LoginComponent;
