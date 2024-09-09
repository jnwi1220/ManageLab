import React from 'react';
import { Tabs } from 'antd';
import TaskBoard from './TaskBoard';
import LogTab from './LogTab';
import ChatTab from './ChatTab';
import MembersTab from './MembersTab';
import './TabNavigation.css'; // Import custom CSS for tab styles

const TabNavigation = ({ projectId }) => {
    const items = [
        {
            key: '1',
            label: 'Task Board',
            children: <TaskBoard projectId={projectId} />,
        },
        {
            key: '2',
            label: 'Activity Log',
            children: <LogTab projectId={projectId} />,
        },
        {
            key: '3',
            label: 'Chat',
            children: <ChatTab projectId={projectId} />,
        },
        {
            key: '4',
            label: 'Members',
            children: <MembersTab projectId={projectId} />,
        },
    ];

    return (
        <Tabs
            items={items}
            tabBarStyle={{ color: '#fff', padding: "0 10px" }} // Ensure the tab bar text remains white
        />
    );
};

export default TabNavigation;
