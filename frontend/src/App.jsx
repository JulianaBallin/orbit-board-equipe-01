import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ProjectFormPage from './pages/ProjectFormPage';
import ProjectsPage from './pages/ProjectsPage';
import TaskFormPage from './pages/TaskFormPage';
import TasksPage from './pages/TasksPage';
import TeamMemberFormPage from './pages/TeamMemberFormPage';
import TeamPage from './pages/TeamPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectFormPage />} />
        <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TaskFormPage />} />
        <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team/new" element={<TeamMemberFormPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
