import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import ProjectFormPage from './pages/ProjectFormPage/ProjectFormPage';
import ProjectsPage from './pages/ProjectsPage/ProjectsPage';
import TaskFormPage from './pages/TaskFormPage/TaskFormPage';
import TasksPage from './pages/TasksPage/TasksPage';
import TeamMemberFormPage from './pages/TeamMemberFormPage/TeamMemberFormPage';
import TeamPage from './pages/TeamPage/TeamPage';

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
        <Route path="/team/:id/edit" element={<TeamMemberFormPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
