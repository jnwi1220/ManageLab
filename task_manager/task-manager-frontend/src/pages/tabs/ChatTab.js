import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Input, Button, List, Typography, Card, Spin } from 'antd';
import { w3cwebsocket as W3CWebSocket } from 'websocket';

const { TextArea } = Input;
const { Text } = Typography;

const ChatTab = ({ projectId }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true); // Loading state
  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isUserScrolled = useRef(false);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/chat-messages/`);
        setMessages(response.data);
        scrollToBottom(); // Scroll to bottom when messages are loaded
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    // Connect to WebSocket
    const connectWebSocket = () => {
      clientRef.current = new W3CWebSocket(`ws://localhost:8000/ws/chat/${projectId}/`);

      clientRef.current.onopen = () => {
        console.log('WebSocket Client Connected');
        setLoading(false); // Stop loading when WebSocket connects
      };

      clientRef.current.onmessage = (message) => {
        // Ensure scrolling happens after the message is rendered
        setTimeout(() => {
          if (!isUserScrolled.current) {
            scrollToBottom();
          }
        }, 10);
      };

      clientRef.current.onclose = () => {
        console.log('WebSocket Client Disconnected');
      };
    };

    const loadChatData = async () => {
      await fetchChatHistory(); // Fetch chat history
      connectWebSocket(); // Then connect WebSocket
    };

    loadChatData();

    return () => {
      if (clientRef.current) {
        clientRef.current.close();
      }
    };
  }, [projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop !== clientHeight) {
      isUserScrolled.current = true;
    } else {
      isUserScrolled.current = false;
    }
  };

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && clientRef.current) {
      clientRef.current.send(JSON.stringify({ message: trimmedMessage }));
      setMessage(''); // Clear the message input
      isUserScrolled.current = false;
      setTimeout(scrollToBottom, 100); // Ensure the scroll happens after rendering
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default behavior (inserting a new line)
      sendMessage();
    }
  };

  return (
    <Card
      title={<span style={{ color: '#fff' }}>Chat Room</span>} // White color for title
      bordered={false}
      style={{
        height: '100%',
        backgroundColor: '#1a1a1a', // Dark background for the card
        color: '#fff', // White text for the card content
        border: '1px solid #444', // Border color for the card
      }}
    >
      {loading ? (
        <Spin
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
          }}
        />
      ) : (
        <>
          <div
            style={{
              height: '300px',
              overflowY: 'scroll',
              marginBottom: '20px',
              backgroundColor: '#1a1a1a', // Dark background for the chat area
              padding: '10px',
              borderRadius: '4px',
            }}
            onScroll={handleScroll}
          >
            <List
              bordered={false}
              dataSource={messages}
              renderItem={(msg) => (
                <List.Item style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  <Text strong style={{ color: '#fff' }}>{msg.user}:</Text>{' '}
                  <Text style={{ color: '#ddd' }}>{msg.message}</Text> <br />
                  <Text type="secondary" style={{ color: '#aaa', fontSize: '12px' }}>
                    {new Date(msg.timestamp).toLocaleString()}
                  </Text>
                </List.Item>
              )}
            />
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
              placeholder="Type your message..."
              style={{
                flex: 1,
                resize: 'none',
                backgroundColor: '#333', // Dark background for input
                color: '#fff', // White text in the input
                borderColor: '#555', // Dark border for input
              }}
            />
            <Button
              type="primary"
              onClick={sendMessage}
              style={{
                backgroundColor: '#1890ff', // Blue button for dark mode
                borderColor: '#1890ff',
              }}
            >
              Send
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default ChatTab;
