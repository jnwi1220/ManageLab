import React from 'react';
import { useDrop } from 'react-dnd';
import TaskCard from './TaskCard';

const Column = ({ status, tasks, onDrop, onSave, onDelete, children, projectId }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item) => onDrop(item.id, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const filteredTasks = tasks.filter(task => task.status === status);

  return (
    <div
      ref={drop}
      style={{
        backgroundColor: isOver ? '#333' : '#1a1a1a', // Dark background color when hovering or not
        padding: '10px',
        width: '32.33%',
        minWidth: '250px',
        marginRight: '1%',
        display: 'inline-block',
        verticalAlign: 'top',
        minHeight: '500px',
        border: '1px solid #444', // Dark border for the column
        borderRadius: '12px',
        color: '#fff', // White text color for dark mode
      }}
    >
      <h2 style={{ textAlign: 'center', color: '#fff' }}>{status}</h2> {/* Ensure the title is white */}

      {
        filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onSave={onSave}
            onDelete={onDelete}
            projectId={projectId} // Pass projectId to TaskCard
          />
        ))
      }
      {children}
    </div>
  );
};

export default Column;
