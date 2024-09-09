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
            if (cookie.substring(0, 10) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return cookieValue;
};

const RegisterComponent = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password1: '',
        password2: '',
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        const csrfToken = getCsrfToken();

        try {
            const response = await axios.post(
                '/accounts/register/',
                JSON.stringify(formData),
                {
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success) {
                message.success('Registration successful!');
                window.location.href = '/login'; // Redirect to login page after successful registration
            } else {
                const errors = response.data.errors; // Expecting JSON data
                let errorMessage = '';
                for (const [errorArray] of Object.entries(errors)) {
                    errorMessage += errorArray.map(error => error.message).join(' ') + ' ';
                }
                setError(errorMessage.trim());
            }
        } catch (error) {
            console.error('There was an error registering!', error);
            setError('Registration failed.');
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
                <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']} items={items} style={{ flex: 1, justifyContent: 'flex-end' }} />
            </Header>
            <Content style={{ marginTop: '64px', padding: '50px', backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 134px)' }}>
                <Row justify="center" align="middle">
                    <Col span={12} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                        <Title level={2} style={{ textAlign: 'center' }}>Create Your Account</Title>
                        <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginBottom: '20px' }}>
                            Join ManageLab to manage your projects and collaborate with your team.
                        </Text>
                        <Form
                            name="register-form"
                            onFinish={handleSubmit}
                            style={{ maxWidth: '300px', margin: '0 auto' }}
                        >
                            <Form.Item
                                name="username"
                                rules={[{ required: true, message: 'Please enter your username' }]}
                            >
                                <Input
                                    placeholder="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Please enter your email' },
                                    { type: 'email', message: 'Please enter a valid email address' }
                                ]}
                            >
                                <Input
                                    placeholder="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password1"
                                rules={[
                                    { required: true, message: 'Please enter your password' },
                                    { min: 8, message: 'Password must be at least 8 characters long' },
                                    {
                                        pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]+$/, // Ensures alphanumeric
                                        message: 'Password must contain both letters and numbers',
                                    },
                                ]}
                            >
                                <Input.Password
                                    placeholder="Password"
                                    name="password1"
                                    value={formData.password1}
                                    onChange={handleChange}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password2"
                                dependencies={['password1']}
                                rules={[
                                    { required: true, message: 'Please confirm your password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password1') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The two passwords do not match!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    placeholder="Confirm Password"
                                    name="password2"
                                    value={formData.password2}
                                    onChange={handleChange}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>
                                    Register
                                </Button>
                            </Form.Item>

                            {error && (
                                <Form.Item>
                                    <Alert message={error} type="error" showIcon />
                                </Form.Item>
                            )}
                        </Form>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Text type="secondary">Already have an account?</Text>
                            <Button type="link">
                                <Link to="/login">Login here</Link>
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

export default RegisterComponent;
