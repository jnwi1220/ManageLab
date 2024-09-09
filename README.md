# ManageLab
ManageLab is a collaborative project management tool inspired by task management systems like Trello. The app allows users to create projects, manage tasks, and collaborate in real-time with other team members. It includes features such as drag-and-drop taskboards, real-time updates, and project-specific chat functionality.

## Features
Real-Time Collaboration: Instant updates to the task board and project changes via WebSocket.
Task Management: Create, edit, move, and delete tasks within projects.
Drag-and-Drop Interface: Intuitive drag-and-drop interface for managing tasks.
Project Chat: Chat with team members within each project.
Responsive Design: Optimized for desktops, tablets, and mobile devices.

## Prerequisites
Before you begin, ensure you have met the following requirements: 
- Python 3.8+
- Node.js 18+ and npm
- PostgreSQL installed and running

## Getting Started
# Running the Backend (Django)
Clone the repository and navigate to the backend folder
- git clone <this-repo-url>
- cd task_manager

Create and activate your virtual environment:
- For Linux/MacOS:
  - python3 -m venv env
  - source env/bin/activate
- For Windows: (Warning: I try to run on Windows, it needs a lot changes of codes to make it work. This repo is created for MacOS)
  - python -m venv env
  - .\env\Scripts\activate

Install the dependencies:
- pip install -r requirements.txt

Set up your PostgreSQL database (you’ll need to configure your own DATABASES settings in task_manager/settings.py).

Run database migrations:
- python manage.py migrate

Run the WebSocket server with Daphne:
- daphne -p 8000 task_manager.asgi:application

# Running the Frontend (React)
Navigate to the frontend folder:
- cd task_manager/task-manager-frontend

Install the frontend dependencies:
- npm install
- 
Start the frontend development server:
- npm start

The frontend will start on http://localhost:3000 and will connect to the backend running on port 8000.

## Environment Variables
You may need to configure environment variables for both the backend and frontend.

For the backend, update the .env file to include your PostgreSQL settings:
- DATABASE_URL=postgres://<username>:<password>@localhost:5432/<dbname>
- SECRET_KEY=your-secret-key
- DEBUG=True

For the frontend, update the API URLs in your configuration if needed.

### Contributing
If you would like to contribute to this project, please fork the repository and submit a pull request with detailed changes. You can also report any issues via the repository's issue tracker.

