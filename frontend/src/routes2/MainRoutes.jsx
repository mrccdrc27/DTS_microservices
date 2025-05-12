import React from 'react';

// Route 
import { Route, Routes } from 'react-router-dom';

// Import Agent Pages
import AgentDashboard from '../pages/agent/dashboard-page/AgentDashboard';
import Ticket from '../pages/agent/ticket-page/Ticket';
import Track from '../pages/agent/track-page/Track';
import AgentArchive from '../pages/agent/archive-page/AgentArchive';
import AgentLogin from '../pages/auth/agent/AgentLogin';
import AgentProfile from '../pages/agent/profile-page/AgentProfile';
import TicketDetail from '../pages/agent/ticket-details-page/TicketDetail';
import Profile from '../pages/auth/profile/Profile';

// Import Admin Pages
import AdminDashboard from '../pages/admin/dashboard-page/AdminDashboard';
import Workflow from '../pages/admin/workflow-page/Workflow';
import Agent from '../pages/admin/agent-page/Agent';
import AdminArchive from '../pages/admin/archive-page/AdminArchive';
import AgentInvite from '../pages/admin/agent-page/AgentInvite';
import WorkflowEditor from '../pages/admin/workflow-page/WorkflowCreator';


function MainRoutes(){
  return (
    <Routes>
    {/* Login */}
    <Route path="/" element={<AgentLogin />}/>

    {/* Agent */}
    <Route path="/agent" element={<AgentDashboard />}/>
    <Route path="/agent/ticket" element={<Ticket />}/>
    <Route path="/agent/track" element={<Track />}/>
    <Route path="/agent/archive" element={<AgentArchive />}/>
    <Route path="/profile" element={<AgentProfile />}/>

    {/* Ticket Page */}
    <Route path="/agent/ticket/:id" element={<TicketDetail />} />

    {/* Profile */}
    <Route path="/agent/profile" element={<Profile />} />

    {/* Admin */}
    <Route path="/admin" element={<AdminDashboard />}/>
    <Route path="/admin/agent/invite" element={<AgentInvite/>}/>
    <Route path="/admin/agent" element={<Agent />}/>
    <Route path="/admin/workflow" element={<Workflow />}/>
    <Route path="/admin/workflow/create" element={<WorkflowEditor />}/>
    <Route path="/admin/archive" element={<AdminArchive />}/>

    {/* Error Page */}
    {/* <Route path="*" element={<NotFound />}/> */}

  </Routes>
  );
}

export default MainRoutes; 