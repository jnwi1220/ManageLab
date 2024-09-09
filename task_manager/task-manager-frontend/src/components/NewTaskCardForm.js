import React, { useState } from 'react';

const NewTaskCardForm = ({ onTaskAdded, projectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (title.trim()) {
      const newTask = { title, description, status: 'To-Do', project: projectId };

      onTaskAdded(newTask);
      setTitle('');
      setDescription('');
    }
  };

  return (
    <div className="task-card-form">
      <form onSubmit={handleSubmit}>
        <input
          style={{
            width: '100%',
            padding: '20px 15px',
            border: '1px solid #444', // Dark border for dark mode
            borderRadius: '4px',
            boxSizing: 'border-box',
            backgroundColor: '#1a1a1a', // Dark background for input field
            color: '#fff', // White text color for input
            caretColor: '#fff', // White caret color for typing
            placeholderColor: '#aaa' // Placeholder color for better readability in dark mode
          }}
          type="text"
          placeholder="+ Add a task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </form>
    </div>
  );
};

export default NewTaskCardForm;
