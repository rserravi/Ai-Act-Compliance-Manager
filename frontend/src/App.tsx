import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './shared/AppShell.view'
import DashboardView from './pages/Dashboard/Dashboard.view'
import ProjectsView from './pages/Projects/Projects.view'
import SystemDetailView from './pages/SystemDetail/SystemDetail.view'
import IncidentsView from './pages/Incidents/Incidents.view'
import DeliverablesView from './pages/Deliverables/Deliverables.view'
import CalendarWorkflowsView from './pages/CalendarWorkflows/CalendarWorkflows.view'
import ProjectsWizardView from './pages/Projects/ProjectsWizard.view'
import OrgRolesView from './pages/OrgRoles/OrgRoles.view'
import AuditEvidencesView from './pages/AuditEvidences/AuditEvidences.view'
import SettingsView from './pages/Settings/Settings.view'
import AuthLayout from './pages/Auth/AuthLayout.view'
import LoginView from './pages/Auth/Login.view'
import SignInView from './pages/Auth/SignIn.view'

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginView />} />
        <Route path="/sign-in" element={<SignInView />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardView />} />
        <Route path="/projects" element={<ProjectsView />} />
        <Route path="/projects/new" element={<ProjectsWizardView />} />
        <Route path="/projects/:id/incidents" element={<IncidentsView />} />
        <Route path="/projects/:id/deliverables" element={<DeliverablesView />} />
        <Route path="/projects/:id/calendar" element={<CalendarWorkflowsView />} />
        <Route path="/projects/:id/org" element={<OrgRolesView />} />
        <Route path="/projects/:id/audit" element={<AuditEvidencesView />} />
        <Route path="/systems/:id" element={<SystemDetailView />} />
        <Route path="/incidents" element={<IncidentsView />} />
        <Route path="/settings" element={<SettingsView />} />
      </Route>
    </Routes>
  )
}