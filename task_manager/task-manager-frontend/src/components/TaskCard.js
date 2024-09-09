import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import TaskModal from './TaskModal';
import { Button } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TaskCard = ({ task, onSave, onDelete, projectId }) => {
  const [user, setUser] = useState(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const deleteRef = useRef(null);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setShowDelete(true);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setShowDelete(false);
  };

  const handleClickOutside = (event) => {
    if (deleteRef.current && !deleteRef.current.contains(event.target)) {
      setShowDelete(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/accounts/current_user/');
        setUser(response.data); // Set the user data
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData(); // Fetch user information

    if (showDelete) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDelete]);

  const deadline = task.deadline ? dayjs(task.deadline) : null;
  const now = dayjs();

  let timeLeft = null;
  let textColor = null;

  if (deadline) {
    if (deadline.isAfter(now)) {
      timeLeft = `Due in ${deadline.fromNow(true)}`;
      textColor = 'LightSalmon';
    } else {
      timeLeft = `Overdue by ${now.to(deadline)}`;
      textColor = 'red';
    }
  }

  return (
    <div
      onClick={showModal}
      onContextMenu={handleContextMenu}
      ref={drag}
      style={{
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        padding: '10px 15px',
        border: `1px solid ${user && task.owner.includes(user.id) ? '#1890ff' : '#444'}`, // Dark border for dark mode
        borderRadius: '4px',
        backgroundColor: '#282828', // Dark background color for task card
        color: '#fff', // White text color for dark mode
        cursor: 'grab',
        marginBottom: '10px',
      }}
    >
      <h4 style={{ margin: 0, color: '#fff' }}>{task.title}</h4> {/* Ensure the title is white */}
      {task.status !== 'Done' && (
        <>
          <p style={{ margin: 0, color: '#f5f5f5' }}>{task.percentage}%</p> {/* Percentage text in white */}
          <p style={{ margin: 0, color: textColor }}>{timeLeft}</p> {/* Time left with dynamic color */}
        </>
      )}
      {showDelete && (
        <div
          ref={deleteRef}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: '#333', // Dark background for delete option
            border: '1px solid #444', // Dark border for the delete option
            zIndex: 10,
          }}
        >
          <Button onClick={handleDelete} danger type="text">Delete</Button>
        </div>
      )}
      <TaskModal
        task={task}
        open={isModalOpen}
        onCancel={handleCancel}
        onSave={onSave}
        projectId={projectId}
      />
    </div>
  );
};

export default TaskCard;
