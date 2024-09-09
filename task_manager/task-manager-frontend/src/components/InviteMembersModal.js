import React, { useState } from 'react';
import { Modal, Button, Form, Select, Spin } from 'antd';
import axios from 'axios';

const { Option } = Select;

const InviteMembersModal = ({ projectId, isOpen, onClose, onInvite, existingMembers }) => {
    const [usernames, setUsernames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const fetchUsernames = async (search) => {
        if (!search) {
            setUsernames([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get('/accounts/users/search/', { params: { q: search } });
            setUsernames(response.data);
        } catch (error) {
            console.error('Error fetching usernames:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        fetchUsernames(value);
    };

    const handleChange = (value) => {
        setSelectedUsers(value);
    };

    const handleSubmit = async () => {
        try {
            await axios.post(`/api/projects/${projectId}/invite/`, { usernames: selectedUsers });
            onInvite(selectedUsers); // Pass the invited users to the parent component
            onClose(); // Close the modal after inviting
        } catch (error) {
            console.error('Error inviting users:', error);
        }
    };

    return (
        <Modal
            title="Invite Members"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="invite" type="primary" onClick={handleSubmit} disabled={selectedUsers.length === 0}>
                    Invite
                </Button>,
            ]}
        >
            <Form>
                <Form.Item label="Usernames">
                    <Select
                        mode="multiple"
                        placeholder="Search and select users"
                        notFoundContent={loading ? <Spin size="small" /> : null}
                        filterOption={false}
                        onSearch={handleSearch}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                    >
                        {usernames.map(user => {
                            const isMember = existingMembers.includes(user.username);
                            return (
                                <Option key={user.username} value={user.username} disabled={isMember}>
                                    {user.username} {isMember && "(Already a member)"}
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default InviteMembersModal;
