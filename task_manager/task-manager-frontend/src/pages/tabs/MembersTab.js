import React, { useState, useEffect } from 'react';
import { List, Button, Select, Typography, message, Dropdown, Modal, Spin } from 'antd';
import axios from 'axios';
import { EllipsisOutlined } from '@ant-design/icons';
import InviteMembersModal from '../../components/InviteMembersModal';

const { Text, Title } = Typography;
const { Option } = Select;

const MembersTab = ({ projectId }) => {
    const [members, setMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [manager, setManager] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const response = await axios.get(`/api/projects/${projectId}/`);
                setManager(response.data.manager);
            } catch (error) {
                console.error('Error fetching project details:', error);
            }
        };

        const fetchMembers = async () => {
            try {
                const response = await axios.get(`/api/projects/${projectId}/members/`);
                setMembers(response.data);
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get('/accounts/current_user/');
                setCurrentUserId(response.data.id);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        // Run all fetch functions in parallel and wait until all are complete
        const fetchAllData = async () => {
            try {
                await Promise.all([
                    fetchProjectDetails(),
                    fetchMembers(),
                    fetchCurrentUser(),
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false); // Set loading to false once all data is loaded
            }
        };

        fetchAllData();
    }, [projectId]);

    const handleInvite = async (newUsernames) => {
        try {
            const newMembers = await Promise.all(newUsernames.map(async (username) => {
                const response = await axios.get(`/accounts/get_user_by_username/${username}/`);
                return response.data; // This should return { id, username, email }
            }));

            setMembers([...members, ...newMembers]);
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleManagerChange = async (value) => {
        try {
            const response = await axios.patch(`/api/projects/${projectId}/set_manager/`, { manager_id: value });
            setManager(response.data.manager);
            message.success('Manager updated successfully');
        } catch (error) {
            console.error('Error updating manager:', error);
            message.error('Failed to update manager');
        }
    };

    const getManagerUsername = () => {
        const managerMember = members.find(member => member.id === manager);
        return managerMember ? managerMember.username : 'Unknown';
    };

    const handleKickMember = async (memberId) => {
        Modal.confirm({
            title: 'Confirm Kick',
            content: 'Are you sure you want to kick this member?',
            onOk: async () => {
                try {
                    await axios.delete(`/api/projects/${projectId}/kickmember/${memberId}/`);
                    setMembers(members.filter(member => member.id !== memberId));
                    message.success('Member kicked successfully');
                } catch (error) {
                    console.error('Error kicking member:', error);
                    message.error('Failed to kick member');
                }
            }
        });
    };

    const handleSetAsManager = (memberId) => {
        Modal.confirm({
            title: 'Confirm Set as Manager',
            content: 'Are you sure you want to set this member as the manager?',
            onOk: () => handleManagerChange(memberId),
        });
    };

    const renderMemberMenu = (memberId) => {
        const isCurrentUserManager = manager === memberId;

        const menuItems = [
            {
                key: 'set-manager',
                label: 'Set as Manager',
                onClick: () => handleSetAsManager(memberId),
                disabled: isCurrentUserManager, // Disable if the current user is the manager
            },
            {
                key: 'kick',
                label: 'Kick Member',
                onClick: () => handleKickMember(memberId),
                disabled: isCurrentUserManager, // Disable if the current user is the manager
            },
        ];

        return menuItems; // Return the menu items with the disabled flag
    };



    return (
        <div>
            {loading ? (
                <Spin style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }} />
            ) : (
                <>

                    {manager ? (
                        <Title level={5} style={{ color: "white" }}>Project Manager: {getManagerUsername()}</Title>
                    ) : (
                        <div style={{ marginBottom: '16px' }}>
                            <Text type="danger">Manager is not set yet.</Text>
                            <Select
                                placeholder="Select a manager"
                                style={{ width: 200, marginLeft: '10px', color: "fff" }}
                                onChange={handleManagerChange}
                                value={manager ? manager.id : undefined}
                            >
                                {members.map(member => (
                                    <Option key={member.id} value={member.id}>
                                        {member.username}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    )}
                    <hr style={{ borderColor: '#444' }} />
                    <Button type="primary" onClick={() => setIsModalOpen(true)} style={{ marginBottom: '0px' }}>
                        Invite Member
                    </Button>

                    <hr style={{ borderColor: '#444' }} />

                    <List
                        itemLayout="horizontal"
                        dataSource={members}
                        renderItem={member => (
                            <List.Item
                                actions={
                                    manager === currentUserId ? [
                                        <Dropdown
                                            menu={{ items: renderMemberMenu(member.id) }}
                                            trigger={['click']}
                                        >
                                            <Button icon={<EllipsisOutlined />} />
                                        </Dropdown>

                                    ] : null
                                }
                            >
                                <List.Item.Meta
                                    title={
                                        <Text style={{ color: "white" }}>
                                            {member.username} {member.id === currentUserId && <Text style={{ color: "#aaa" }}>(you)</Text>}
                                        </Text>
                                    }
                                    description={<Text style={{ color: "white" }}>{member.email || 'Email not available'}</Text>}
                                />
                            </List.Item>
                        )}
                    />

                    <InviteMembersModal
                        projectId={projectId}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onInvite={handleInvite}
                        existingMembers={members.map(member => member.username)} // Pass existing members
                    />
                </>
            )}

        </div>
    );
};

export default MembersTab;
