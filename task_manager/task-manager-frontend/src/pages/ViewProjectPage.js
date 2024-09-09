import React, { useEffect, useState } from 'react';
import TabNavigation from './tabs/TabNavigation';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Layout, Breadcrumb, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

const ViewProjectPage = () => {
    const { projectId } = useParams(); // Get the project ID from the URL
    const [projectName, setProjectName] = useState('');
    const [user, setUser] = useState(null);

    // Fetch the project name based on projectId
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/accounts/current_user/');
                setUser(response.data); // Set the user data
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        const fetchProjectName = async () => {
            try {
                const response = await axios.get(`/api/projects/${projectId}/`);
                setProjectName(response.data.name);
            } catch (error) {
                console.error('Error fetching project name:', error);
            }
        };

        fetchUserData(); // Fetch user information
        fetchProjectName(); // Fetch project name

    }, [projectId]);

    const breadcrumbItems = [
        {
            title: (
                <Link
                    to="/dashboard"
                    style={{
                        color: '#fff',
                        backgroundColor: '#808080',
                        padding: '0.5px 10px',
                        borderRadius: '4px',
                        textDecoration: 'none',
                    }}
                >
                    Back to Dashboard
                </Link>
            ),
            key: 'dashboard',
        },
        {
            title: <span style={{ color: '#fff' }}>View Project</span>, // Ensure the static text is white
            key: 'view-project',
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#333' }}>
                <Title level={2} style={{ color: '#fff', margin: 0 }}>{projectName}</Title>
                {user && <p style={{ color: '#fff', margin: 0 }}>{user.username}</p>}
            </Header>

            <Content style={{ padding: '20px', backgroundColor: '#1a1a1a', color: '#fff' }}>
                <Breadcrumb
                    separator={<span style={{ color: '#fff' }}>/</span>} // Set the separator (slash) color to white
                    items={breadcrumbItems}
                />
                <hr style={{ borderColor: '#444' }} /> {/* Darker line for separation */}
                <TabNavigation projectId={projectId} /> {/* Pass the project ID to the TabNavigation */}
            </Content>
        </Layout>
    );
};

export default ViewProjectPage;
