import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, Card, Typography, Spin } from 'antd';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import moment from 'moment';

const { Text } = Typography;

const LogTab = ({ projectId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const clientRef = React.useRef(null);

  useEffect(() => {
    // Fetch existing logs from the server when the component mounts
    axios.get(`/api/projects/${projectId}/activity-logs/`)
      .then(response => {
        setLogs(response.data);
        setLoading(false); // Set loading to false once data is fetched
      })
      .catch(error => {
        console.error('Error fetching logs:', error);
        setLoading(false); // Stop loading in case of error
      });
  }, [projectId]);

  useEffect(() => {
    // Initialize WebSocket connection
    clientRef.current = new W3CWebSocket(`ws://localhost:8000/ws/projects/${projectId}/tasks/`);

    clientRef.current.onopen = () => {
      console.log('WebSocket Client Connected');
    };

    clientRef.current.onmessage = (message) => {
      try {
        const dataFromServer = JSON.parse(message.data);

        if (dataFromServer.message) {
          const newLog = {
            user: dataFromServer.user,
            action: dataFromServer.message.action,
            task_title: dataFromServer.message.task_title,
            edited_fields: dataFromServer.message.edited_fields,
            timestamp: dataFromServer.timestamp,
          };

          if (newLog.action !== 'editing') {
            setLogs(prevLogs => [newLog, ...prevLogs]);
          }
        } else {
          console.error('No logs data received from server:', dataFromServer);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    clientRef.current.onclose = () => {
      console.log('WebSocket Client Disconnected');
    };

    clientRef.current.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    // Clean up WebSocket connection when the component unmounts
    return () => {
      if (clientRef.current) {
        clientRef.current.close();
      }
    };
  }, [projectId]);

  const renderLogMessage = (log) => {
    if (log.action === 'edited') {
      return (
        <div>
          {`${log.user} has edited the ${log.edited_fields}`}
        </div>
      );
    } else {
      switch (log.action) {
        case 'moved':
          return `${log.user} has moved '${log.task_title}' from '${log.from_status}' to '${log.to_status}'`;
        case 'created':
          return `${log.user} has created a task '${log.task_title}'`;
        case 'deleted':
          return `${log.user} has deleted '${log.task_title}'`;
        default:
          return '';
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    return moment(timestamp).format('HH:mm:ss DD/MM/YYYY dddd');
  };

  return (
    <div style={{ backgroundColor: '#1a1a1a', padding: '0 20px', minHeight: '100vh' }}>
      <h2 style={{ color: '#fff' }}>Activity Log</h2>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={logs}
          renderItem={(log, index) => (
            <List.Item key={index}>
              <Card style={{ backgroundColor: '#333', borderColor: '#444' }}>
                <Text type="secondary" style={{ color: '#888' }}>
                  {formatTimestamp(log.timestamp)}
                </Text>
                <br />
                <Text style={{ color: '#fff' }}>{renderLogMessage(log)}</Text>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default LogTab;
