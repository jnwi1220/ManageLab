import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginComponent from './pages/LoginPage';
import RegisterComponent from './pages/RegisterPage';
import DashboardComponent from './pages/DashboardPage';
import HomeComponent from './pages/HomePage';
import ViewProjectPage from './pages/ViewProjectPage';
import { Navigate } from 'react-router-dom';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomeComponent />} />
                <Route path="/login" element={<LoginComponent />} />
                <Route path="/register" element={<RegisterComponent />} />
                <Route path="/dashboard" element={<PrivateRoute component={DashboardComponent} />} />
                <Route path="/projects/:projectId" element={<ViewProjectPage />} />
            </Routes>
        </Router>
    );
}

function PrivateRoute({ component: Component, ...rest }) {
    const isAuthenticated = localStorage.getItem('token'); // Check if the user is authenticated
    return isAuthenticated ? <Component {...rest} /> : <Navigate to="/login" />;
}

export default App;
