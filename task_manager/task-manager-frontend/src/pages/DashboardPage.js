import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, message, List, Typography, Spin } from 'antd';
import CreateProjectModal from '../components/CreateProjectModal';
import {
    ProjectOutlined,
    LogoutOutlined,
    PlusOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

function DashboardComponent() {
    const [projects, setProjects] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate(); // Hook to navigate programmatically

    function getCsrfToken() {
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
    }

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/accounts/current_user/');
                setUser(response.data); // Set the user data
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to load user data.');
            }
        };

        const fetchProjects = async () => {
            const csrfToken = getCsrfToken();

            try {
                const response = await axios.get('/api/project_list/', {
                    headers: {
                        'X-CSRFToken': csrfToken,
                    },
                });
                setProjects(response.data);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setError('Failed to load projects.');
            } finally {
                setLoading(false); // Set loading to false after data is fetched
            }
        };

        fetchUserData(); // Fetch user information
        fetchProjects(); // Fetch projects
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token from localStorage
        navigate('/login'); // Redirect to login page
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const handleCreate = async (values, isManager) => {
        const csrfToken = getCsrfToken();
        const { name, description, members } = values;

        let managerId = null;
        if (isManager && user) {
            managerId = user.id; // Set the current user as the manager
        }

        const memberUsernames = members ? members.split(',').map(username => username.trim()) : [];

        try {
            // Fetch user IDs for the provided usernames
            const memberIds = [];
            for (const username of memberUsernames) {

                try {
                    const response = await axios.get(`/accounts/get_user_by_username/${username}/`, {
                        headers: {
                            'X-CSRFToken': csrfToken,
                        },
                    });
                    memberIds.push(response.data.id);
                } catch (error) {
                    console.error(`Failed to fetch user ID for username: ${username}`, error);
                    message.error(`User ${username} does not exist.`);
                    return;
                }
            }

            // Add the current user as a member
            if (user) {
                memberIds.push(user.id);
            }

            const data = {
                name,
                description,
                manager_id: managerId,
                members: memberIds
            };

            const response = await axios.post('/api/create_project/', data, {
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                message.success('Project created successfully!');
                setIsModalOpen(false); // Close the modal

                const newProjectId = response.data.project?.id;  // Safely access project ID using optional chaining
                if (newProjectId) {
                    navigate(`/projects/${newProjectId}`); // Navigate to the project page if the ID exists
                } else {
                    console.error('Project ID not found in the response');
                    message.error('Failed to retrieve the project ID.');
                }
            } else {
                console.error('Unexpected response:', response.data);
                message.error('Failed to create project.');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                console.error('Error:', error.response.data.error);
                message.error(`Error: ${error.response.data.error}`);
            } else {
                console.error('An unexpected error occurred:', error.message);
                message.error('An unexpected error occurred.');
            }
        }
    };

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#333' }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>Dashboard</Title>
                {user && <p style={{ color: '#ccc', margin: 0 }}>Welcome, {user.username}</p>}
                <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                    Logout
                </Button>
            </Header>
            <Content style={{ padding: '20px', backgroundColor: '#1a1a1a', color: '#fff' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                        <Spin size="large">
                        </Spin>
                    </div>
                ) : (
                    <>
                        {error && <p style={{ color: 'red' }}>{error}</p>}
                        <Button type="primary" icon={<PlusOutlined />} onClick={showModal} style={{ marginBottom: '20px', width: '100%' }}>
                            Create Project
                        </Button>
                        <List
                            itemLayout="horizontal"
                            dataSource={projects}
                            renderItem={project => (
                                <List.Item
                                    actions={[
                                        <Button type="link" onClick={() => navigate(`/projects/${project.id}`)}>
                                            View Project
                                        </Button>
                                    ]}
                                    style={{ backgroundColor: '#333', border: '1px solid #444', borderRadius: '8px', marginBottom: '10px' }}
                                >
                                    <List.Item.Meta
                                        avatar={<ProjectOutlined style={{ fontSize: '24px', color: '#1890ff', marginLeft: '10px' }} />}
                                        title={<span style={{ color: '#fff' }}>{project.name || "Unnamed Project"}</span>}
                                        description={<span style={{ color: '#aaa' }}>{project.description || ""}</span>}
                                    />
                                </List.Item>
                            )}
                        />
                        <CreateProjectModal
                            open={isModalOpen}
                            onCancel={handleCancel}
                            onCreate={handleCreate}
                        />
                    </>
                )}
            </Content>
        </Layout>
    );
}

export default DashboardComponent;
