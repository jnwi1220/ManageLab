import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Button, List, InputNumber, Row, Col, DatePicker, Divider, Select, Spin } from 'antd';
import axios from 'axios';
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import dayjs from 'dayjs';

const { Option } = Select;

const TaskModal = ({ task, open, onCancel, onSave, projectId }) => {
  const [form] = Form.useForm();
  const [subTasks, setSubTasks] = useState([]);
  const [newSubTask, setNewSubTask] = useState('');
  const clientRef = useRef(null);
  const [deadline, setDeadline] = useState(task?.deadline ? dayjs(task.deadline) : null);
  const [members, setMembers] = useState([]);
  const [selectedOwners, setSelectedOwners] = useState(task?.owner ? task.owner.map(owner => owner.id) : []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/members/`);
        setMembers(response.data);
      } catch (error) {
        console.error('Failed to fetch project members:', error);
      }
    };

    fetchMembers();

    if (task && task.id) {
      axios.get(`/api/tasks/${task.id}/sub-tasks/`)
        .then(response => setSubTasks(response.data))
        .catch(error => console.error('Error fetching sub-tasks:', error));

      if (task.owner) {
        if (Array.isArray(task.owner)) {
          // If task.owner is an array, map it directly
          setSelectedOwners(task.owner.map(owner => owner.id));
        } else {
          // If task.owner is a single object, treat it as one owner
          setSelectedOwners([task.owner.id]);  // Ensure it's in an array
        }
      }
    }
  }, [projectId, task]);

  // Reset form values when the modal is opened
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        title: task?.title || '',
        description: task?.description || '',
        owner: task?.owner ? task.owner.map(owner => owner.id) : [],
        percentage: task?.percentage || 0,
        deadline: task?.deadline ? dayjs(task.deadline) : null,
      });

      setDeadline(task?.deadline ? dayjs(task.deadline) : null);
      setSelectedOwners(task?.owner ? task.owner.map(owner => owner.id) : []);
    }
  }, [open, task, form]);

  useEffect(() => {
    if (open) {
      setLoading(true);  // Set loading to true when the modal opens

      const wsClient = new W3CWebSocket(`ws://localhost:8000/ws/projects/${projectId}/tasks/`);
      clientRef.current = wsClient;

      wsClient.onopen = () => {
        console.log('WebSocket Client Connected in TaskModal');
        setLoading(false);
      };

      wsClient.onclose = (e) => {
        console.log('WebSocket Client Disconnected in TaskModal:', e.code, e.reason);
      };

      wsClient.onerror = (error) => {
        console.error('WebSocket Error in TaskModal:', error.message);
      };

      wsClient.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data);
        const updatedSubTask = dataFromServer.message;
        const updatedField = dataFromServer.message;

        if (updatedField && updatedField.task_id === task.id) {
          form.setFieldsValue({
            [updatedField.field]: updatedField.value,
          });
        }

        if (updatedSubTask && updatedSubTask.subtask_id) {
          setSubTasks((prevSubTasks) => {
            if (updatedSubTask.action === 'created') {
              if (!prevSubTasks.some(st => st.id === updatedSubTask.subtask_id)) {
                return [...prevSubTasks, updatedSubTask];
              }
            } else if (updatedSubTask.action === 'updated') {
              return prevSubTasks.map(st => st.id === updatedSubTask.subtask_id ? updatedSubTask : st);
            } else if (updatedSubTask.action === 'deleted') {
              return prevSubTasks.filter(st => st.id !== updatedSubTask.subtask_id);
            }
            return prevSubTasks;
          });
        }
      };
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.close();
        console.log('WebSocket Client Closed in TaskModal');
      }
    };
  }, [open, projectId, task, form]);

  const handleFieldChange = (field, value) => {
    form.setFieldsValue({ [field]: value });

    if (clientRef.current && clientRef.current.send) {
      clientRef.current.send(JSON.stringify({
        message: {
          action: 'editing',
          task_id: task.id,
          field,
          value,
        }
      }));
    } else {
      console.error('WebSocket client is not available or not initialized.');
    }
  };

  const handleSelectChange = (value) => {
    setSelectedOwners(value);
    handleFieldChange('owner', value); // Ensure value is an array
  };

  const handleSave = () => {
    form.validateFields()
      .then((values) => {
        // Convert the deadline to ISO string if it's set
        if (deadline) {
          values.deadline = dayjs(deadline).toISOString();
        }

        // Ensure the owner field is an array
        if (values.owner && Array.isArray(values.owner)) {
          values.owner = values.owner.map(id => parseInt(id, 10)); // Ensure IDs are integers
        }

        // Merge the form values with the existing task data
        const updatedTask = { ...task, ...values };

        // Trigger the onSave callback with the updated task
        onSave(updatedTask);

        // Optionally, close the modal or cancel editing
        onCancel();
      })
      .catch((info) => {
        console.error('Validation Failed:', info);
      });
  };


  const handleAddSubTask = () => {
    if (newSubTask.trim()) {
      axios.post(`/api/tasks/${task.id}/sub-tasks/`, {
        title: newSubTask,
        task: task.id
      })
        .then(response => {
          setSubTasks([...subTasks, response.data]);

          console.log('WebSocket Client in TaskModal Adding Sub Task:', clientRef.current);

          if (clientRef.current && clientRef.current.send) {
            clientRef.current.send(JSON.stringify({
              message: {
                ...response.data,
                action: 'created',
                subtask_id: response.data.id,
                task_id: task.id
              }
            }));
          } else {
            console.error('WebSocket client is not available or not initialized.');
          }

          setNewSubTask('');
        })
        .catch(error => console.error('Error creating sub-task:', error));
    }
  };


  const handleToggleSubTask = (subTaskId, isCompleted) => {
    axios.patch(`/api/tasks/${task.id}/sub-tasks/${subTaskId}/`, { completed: isCompleted })
      .then(response => {
        console.log('Updated Sub-Task:', response.data);  // Log the updated sub-task data

        setSubTasks(prevSubTasks => prevSubTasks.map(st =>
          st.id === subTaskId ? response.data : st
        ));

        clientRef.current.send(JSON.stringify({
          message: {
            ...response.data,
            action: 'updated',
            subtask_id: response.data.id,
            task_id: task.id
          }
        }));
      })
      .catch(error => {
        console.error('Error updating sub-task:', error);
        console.log('Error Response:', error.response);  // Log any error response
      });
  };

  const handleDeleteSubTask = (subTaskId) => {
    axios.delete(`/api/tasks/${task.id}/sub-tasks/${subTaskId}/`)
      .then(() => {
        setSubTasks(subTasks.filter(st => st.id !== subTaskId));

        clientRef.current.send(JSON.stringify({
          message: {
            subtask_id: subTaskId,
            action: 'deleted',
            task_id: task.id
          }
        }));
      })
      .catch(error => console.error('Error deleting sub-task:', error));
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    onCancel();
  };

  return (
    <Modal
      title="Edit Task"
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      {loading ? (
        <Spin tip="Connecting to WebSocket..." style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }} />
      ) : (
        task && (
          <>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                title: task?.title || '',
                description: task?.description || '',
                owner: selectedOwners,
                percentage: task?.percentage || 0,
                deadline: deadline,
              }}
            >
              <Row gutter={16}>
                <Col span={15}>
                  <Form.Item
                    name="title"
                    label="Title"
                    rules={[{ required: true, message: 'Please input the title!' }]}
                  >
                    <Input onChange={(e) => handleFieldChange('title', e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={9}>
                  <Form.Item
                    name="owner"
                    label="Owner"
                    initialValue={selectedOwners}
                  >
                    <Select
                      mode="multiple"
                      placeholder="Select"
                      value={selectedOwners}
                      onChange={handleSelectChange}
                    >
                      {members.map((member) => (
                        <Option key={member.id} value={member.id}>
                          {member.username}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="description"
                    label="Description"
                  >
                    <Input.TextArea rows={4} onChange={(e) => handleFieldChange('description', e.target.value)} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="percentage"
                    label="Completion Percentage (%)"
                    rules={[{ type: 'number', min: 0, max: 100, message: 'Percentage must be between 0 and 100' }]}
                  >
                    <InputNumber min={0} max={100} onChange={(value) => handleFieldChange('percentage', value)} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="deadline"
                    label="Deadline"
                  >
                    <DatePicker
                      showTime
                      value={deadline}
                      onChange={(date) => setDeadline(date)}
                      format="DD-MM-YYYY HH:mm"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Divider style={{ marginBottom: 0 }}>Sub-Tasks</Divider>
            <List
              dataSource={subTasks}
              renderItem={subTask => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      onClick={() => handleToggleSubTask(subTask.id, !subTask.completed)}
                      style={{ color: subTask.completed ? "red" : "" }}
                    >
                      {subTask.completed ? "Mark as Uncomplete" : "Mark as Completed"}
                    </Button>,
                    <Button
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteSubTask(subTask.id)}
                      style={{ color: 'red' }}
                    />
                  ]}
                >
                  <span>
                    {subTask.title}
                    {subTask.completed && (
                      <CheckOutlined style={{ marginLeft: '10px', color: 'green' }} />
                    )}
                  </span>
                </List.Item>
              )}
            />

            <Row gutter={16}>
              <Col span={17}>
                <Input
                  placeholder="New sub-task"
                  value={newSubTask}
                  onChange={(e) => setNewSubTask(e.target.value)}
                  onPressEnter={handleAddSubTask}
                />
              </Col>
              <Col span={7}>
                <Button onClick={handleAddSubTask} type="primary" style={{ backgroundColor: 'green' }}>
                  Add Sub-Task
                </Button>
              </Col>
            </Row>
            <Divider />
          </>
        )
      )}
    </Modal>
  );
};

export default TaskModal;
