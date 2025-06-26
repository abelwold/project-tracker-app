import React from 'react'
import { useState } from 'react'
import './App.css'
import ProjectTrackerDashboard from "./modules/ProjectTracker/pages/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainDashboard from "./modules/Dashboard/Pages/MainDashboard";
import OverdueTasks from  "./modules/Dashboard/Pages/OverdueTasks";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ViewProjectTasks from './modules/ProjectTracker/components/ViewProjectTasks';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

     <Router>
      <Routes>
         <Route path="/project-tracker" element={<ProjectTrackerDashboard />} />
         <Route path="/" element={<MainDashboard />} />
         <Route path="/overdue" element={<OverdueTasks />} />
         <Route path="/project/:projectId/tasks" element={<ViewProjectTasks />} />

      </Routes>
    </Router>
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  )
}

export default App
