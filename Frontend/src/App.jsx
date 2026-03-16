import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import LandingPage from "./pages/LandingPage";
import CompleteProfile from './pages/CompleteProfile';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import MyNetwork from './pages/MyNetwork';
import CreateSprint from './pages/CreateSprint';
import { UserProvider } from './context/UserContext';
import JoinSprint from './pages/JoinSprint';
import SprintBoard from './pages/SprintRoom/SprintBoard';
import SprintHome from './pages/SprintRoom/SprintHome';
import UserProfile from './pages/UserProfile';
import SprintChat from './pages/SprintRoom/SprintChat';
import SprintTeams from './pages/SprintRoom/SprintTeams';
import SprintEndPage from './pages/SprintRoom/SprintEndPage';
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <UserProvider>
        <Routes>
          {/* Root route - Landing Page */}
          <Route path='/' element={<LandingPage />} />
          
          {/* Public Routes - Redirect authenticated users to dashboard */}
          <Route 
            path='/auth/login' 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path='/auth/register' 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes - Redirect unauthenticated users to login */}
          <Route 
            path='/completeprofile' 
            element={
              <ProtectedRoute>
                <CompleteProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/dashboard' 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/search' 
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/network' 
            element={
              <ProtectedRoute>
                <MyNetwork />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/create-sprint' 
            element={
              <ProtectedRoute>
                <CreateSprint />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/join-sprint' 
            element={
              <ProtectedRoute>
                <JoinSprint />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/sprint/:sprintId/board' 
            element={
              <ProtectedRoute>
                <SprintBoard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/sprint/:sprintId/home' 
            element={
              <ProtectedRoute>
                <SprintHome />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/sprint/:sprintId/chat' 
            element={
              <ProtectedRoute>
                <SprintChat />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/sprint/:sprintId/teams' 
            element={
              <ProtectedRoute>
                <SprintTeams />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/sprint/:sprintId/end' 
            element={
              <ProtectedRoute>
                <SprintEndPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/user/:userId' 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path='/chats' 
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 - Catch all route for non-existent pages */}
          <Route 
            path='*' 
            element={<NotFound />} 
          />
        </Routes>
      </UserProvider>
    </>
  )
}

export default App
