import React from 'react'

import Login from './pages/Auth/Login.jsx'
import ForgotPassword from './pages/Auth/ForgotPassword.jsx'
import VerifyEmail from './pages/Auth/VerifyEmail.jsx'
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
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
import Payments from './pages/Employer/Payments.jsx'
import SavedJobs from './pages/JobSeeker/SavedJobs.jsx'
import JobDetails from './pages/JobSeeker/JobDetails.jsx'
import Messages from './pages/Common/Messages.jsx'
import Notifications from './pages/Common/Notifications.jsx'

const App = () => {
  return (
    <div >
      <Toaster
        toastOptions={{
          className: '',
          style: {
            fontSize: '13px',
          }
        }}></Toaster>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/verifyEmail' element={<VerifyEmail />} />
        <Route path='/verifyemail' element={<VerifyEmail />} />
        <Route path='/find-jobs' element={<Navigate to='/freelancer-dashboard' replace />} />
        <Route path='/freelancer-dashboard' element={<JobDashboard />} />
        <Route path='/job/:jobId' element={<JobDetails />} />
        <Route path='/saved-jobs' element={<SavedJobs />} />
        <Route element={<ProtectedRoutes />}>
          <Route path='/profile' element={<UserProfile />} />
          <Route path='/messages' element={<Messages />} />
          <Route path='/notifications' element={<Notifications />} />
        </Route>


        <Route element={<ProtectedRoutes requiredRole="employer" />}>
          <Route path='/employer-dashboard' element={<EmployerDashboard />} />
          <Route path='/post-job' element={<JobPostingForm />} />
          <Route path='/manage-jobs' element={<ManageJobs />} />
          <Route path='/payments' element={<Payments />} />
          <Route path='/applicants/:jobId' element={<ApplicationView />} />
          <Route path='/company-profile' element={<EmployerProfile />} />
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </div>
  )
}

export default App
