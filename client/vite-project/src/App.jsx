import React from 'react'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import EmailVerify from './pages/EmailVerify.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
}from 'react-router-dom';

import {Toaster} from 'react-hot-toast';
import LandingPage from './pages/LandingPage/LandingPage.jsx'
import SignUp from './pages/Auth/SignUp.jsx'
import JobDashboard from './pages/JobSeeker/JobDashboard.jsx'
import UserProfile from './pages/JobSeeker/UserProfile.jsx'
import ProtectedRoutes from './routes/ProtectedRoute.jsx'
import JobPostingForm from './pages/Employer/JobPostingForm.jsx'
import ManageJobs from './pages/Employer/ManageJobs.jsx'
import ApplicationView from './pages/Employer/ApplicationView.jsx'
import EmployerProfile from './pages/Employer/EmployerProfile.jsx'
import EmployerDashboard from './pages/Employer/EmployerDashboard.jsx'
import SavedJobs from './pages/JobSeeker/SavedJobs.jsx'
import JobDetails from './pages/JobSeeker/JobDetails.jsx'
// import Dashboard from './pages/Dashboard.jsx'
// import Landing from './pages/Landing.jsx'
const App = () => {
  return (
    <div >
      <Toaster
      toastOptions={{
        className: '',
        style:{
          fontSize:'13px',
        }
      }}></Toaster>
      <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/find-jobs' element={<JobDashboard/>}/>
        <Route path='/job/:jobId' element={<JobDetails/>}/>
        <Route path='/saved-jobs' element={<SavedJobs/>}/>
        <Route path='/profile' element={<UserProfile/>}/>


        <Route element={<ProtectedRoutes requiredRole="employer"/>}>
          <Route path='/employer-dashboard' element={<EmployerDashboard/>}/>
          <Route path='/post-job' element={<JobPostingForm/>}/>
          <Route path='/manage-jobs' element={<ManageJobs/>}/>
          <Route path='/applicants/:jobId' element={<ApplicationView/>}/>
           <Route path='/company-profile' element={<EmployerProfile/>}/>
        </Route>

        <Route path='*' element={<Navigate to='/' replace/>}/>
      </Routes>
      </Router>
    </div>
  )
}

export default App
