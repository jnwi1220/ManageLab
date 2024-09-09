import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Column from '../../components/Column';
import NewTaskCardForm from '../../components/NewTaskCardForm';
import TaskModal from '../../components/TaskModal';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Spin } from 'antd'; // Import Spin component
import { w3cwebsocket as W3CWebSocket } from 'websocket';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const TaskBoard = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null); // For managing the selected task for the modal
  const [loading, setLoading] = useState(true); // Loading state
  const clientRef = useRef(null);

  useEffect(() => {
    let retryAttempts = 0;

    const connectWebSocket = () => {
      const wsClient = new W3CWebSocket(`ws://localhost:8000/ws/projects/${projectId}/tasks/`);
      clientRef.current = wsClient;

      wsClient.onopen = () => {
        console.log('WebSocket Client Connected');
        retryAttempts = 0; // Reset retry attempts on successful connection
        setLoading(false); // WebSocket connected, hide loading spinner
      };

      wsClient.onclose = (e) => {
        console.log('WebSocket Client Disconnected:', e.code, e.reason);
        if (e.code !== 1000 && retryAttempts < 5) { // Retry connection if not a normal closure
          retryAttempts += 1;
          console.log(`Retrying connection... Attempt ${retryAttempts}`);
          setTimeout(connectWebSocket, 5000); // Retry after 5 seconds
        }
      };

      wsClient.onerror = (error) => {
        console.error('WebSocket Error:', error.message);
      };

      wsClient.onmessage = (message) => {
        const dataFromServer = JSON.parse(message.data);
        const updatedTask = dataFromServer.message;

        if (updatedTask && updatedTask.id) {
          // Handling tasks
          setTasks((prevTasks) => {
            const taskIndex = prevTasks.findIndex((task) => task.id === updatedTask.id);
            if (updatedTask.action === 'deleted') {
              return prevTasks.filter((task) => task.id !== updatedTask.id);
            } else if (taskIndex >= 0) {
              const newTasks = [...prevTasks];
              newTasks[taskIndex] = updatedTask;
              return newTasks;
            } else {
              return [...prevTasks, updatedTask];
            }
          });
        } else if (updatedTask && updatedTask.subtask_id) {
          // Handling subtasks
          setTasks((prevTasks) => {
            return prevTasks.map(task => {
              if (task.id === updatedTask.task_id) {
                const subTasks = task.subtasks || [];
                if (updatedTask.action === 'created') {
                  return { ...task, subtasks: [...subTasks, updatedTask] };
                } else if (updatedTask.action === 'updated') {
                  return {
                    ...task,
                    subtasks: subTasks.map(st => st.id === updatedTask.subtask_id ? updatedTask : st)
                  };
                } else if (updatedTask.action === 'deleted') {
                  return {
                    ...task,
                    subtasks: subTasks.filter(st => st.id !== updatedTask.subtask_id)
                  };
                }
              }
              return task;
            });
          });
        }
      };
    };

    connectWebSocket();

    axios.get(`/api/projects/${projectId}/tasks/`)
      .then(response => setTasks(response.data))
      .catch(error => console.error('Error fetching tasks:', error));

    return () => {
      if (clientRef.current) {
        clientRef.current.close();
        console.log('WebSocket Client Closed');
      }
    };
  }, [projectId]);

  const handleTaskAdded = (newTask) => {
    if (!clientRef.current) {
      console.error('WebSocket client is not initialized');
      return;
    }

    console.log('Adding new task:', newTask);
    axios.post(`/api/projects/${projectId}/tasks/`, { ...newTask, project_id: projectId })
      .then(response => {
        const createdTask = response.data;
        console.log('Task created:', createdTask);
        clientRef.current.send(JSON.stringify({
          message: { ...createdTask, action: 'created' }
        }));
        setTasks(prevTasks => [...prevTasks, createdTask]);
      })
      .catch(error => {
        console.error('Error adding task:', error);
      });
  };

  const handleDrop = (id, status) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === id) {
          const fromStatus = task.status;
          const updatedTask = { ...task, status, project_id: projectId };

          axios.put(`/api/projects/${projectId}/tasks/${id}/`, updatedTask)
            .then(response => {
              const movedTask = response.data;
              console.log('Task moved:', movedTask);

              clientRef.current.send(JSON.stringify({
                message: { ...movedTask, action: 'moved', from_status: fromStatus, to_status: status }
              }));

              setTasks(prevTasks => prevTasks.map(task =>
                task.id === movedTask.id ? movedTask : task
              ));
            })
            .catch(error => {
              console.error('Error updating task:', error);
            });

          return updatedTask;
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const handleTaskSave = (updatedTask) => {
    const oldTask = tasks.find(task => task.id === updatedTask.id);
    axios.put(`/api/projects/${projectId}/tasks/${updatedTask.id}/`, { ...updatedTask, project_id: projectId })
      .then(response => {
        const editedFields = [];
        if (oldTask.title !== updatedTask.title) editedFields.push('title');
        if (oldTask.description !== updatedTask.description) editedFields.push('description');
        if (oldTask.owner !== updatedTask.owner) editedFields.push('owner');

        clientRef.current.send(JSON.stringify({
          message: { ...response.data, action: 'edited', edited_fields: editedFields }
        }));
        setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? response.data : task));
      })
      .catch(error => console.error('Error saving task:', error));
  };

  const handleTaskDelete = (taskId) => {
    if (!clientRef.current) {
      console.error('WebSocket client is not initialized');
      return;
    }

    axios.delete(`/api/projects/${projectId}/tasks/${taskId}/`)
      .then(() => {
        clientRef.current.send(JSON.stringify({
          message: { id: taskId, action: 'deleted' }
        }));
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      })
      .catch(error => console.error('Error deleting task:', error));
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setSelectedTask(null);  // Close the modal by setting the selected task to null
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {loading ? (
        <Spin tip="Connecting to WebSocket..." style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
      ) : (
        <div style={{ padding: 0, margin: 0 }}>
          <div style={{ overflowX: 'auto', width: '100%', whiteSpace: 'nowrap' }}>
            <Column status="To-Do" tasks={tasks} onDrop={handleDrop} onSave={handleTaskSave} onDelete={handleTaskDelete} projectId={projectId}>
              <NewTaskCardForm onTaskAdded={handleTaskAdded} projectId={projectId} />
            </Column>
            <Column status="Doing" tasks={tasks} onDrop={handleDrop} onSave={handleTaskSave} onDelete={handleTaskDelete} projectId={projectId} />
            <Column status="Done" tasks={tasks} onDrop={handleDrop} onSave={handleTaskSave} onDelete={handleTaskDelete} projectId={projectId} />
          </div>
        </div>
      )}

      <TaskModal
        task={selectedTask}
        open={!!selectedTask}
        onCancel={handleCancel}
        onSave={handleTaskSave}
        projectId={projectId}
        websocketClient={clientRef.current} // Pass the WebSocket client to TaskModal
      />
    </DndProvider>
  );
};

export default TaskBoard;
