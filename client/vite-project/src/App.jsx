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
import EmployerJobView from './pages/Employer/EmployerJobView.jsx'
import FreelancerProfileView from './pages/Employer/FreelancerProfileView.jsx'
import SavedJobs from './pages/JobSeeker/SavedJobs.jsx'
import JobDetails from './pages/JobSeeker/JobDetails.jsx'
import Messages from './pages/Common/Messages.jsx'
import Notifications from './pages/Common/Notifications.jsx'
import Reviews from './pages/Common/Reviews.jsx'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import NotFound from './pages/Common/NotFound.jsx'

const App = () => {
  return (
    <div className='min-h-screen bg-white text-gray-900 dark:bg-slate-950 dark:text-white'>
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            fontSize: '13px',
          },
          duration: 3500,
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

        <Route element={<ProtectedRoutes requiredRole="jobseeker" />}>
          <Route path='/freelancer-dashboard' element={<JobDashboard />} />
          <Route path='/job/:jobId' element={<JobDetails />} />
          <Route path='/saved-jobs' element={<SavedJobs />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path='/profile' element={<UserProfile />} />
          <Route path='/messages' element={<Messages />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/reviews' element={<Reviews />} />
        </Route>

        <Route element={<ProtectedRoutes requiredRole="jobseeker" />}>
          <Route path='/freelancer/messages' element={<Messages />} />
        </Route>


        <Route element={<ProtectedRoutes requiredRole="employer" />}>
          <Route path='/employer-dashboard' element={<EmployerDashboard />} />
          <Route path='/post-job' element={<JobPostingForm />} />
          <Route path='/post-job/:jobId/edit' element={<JobPostingForm />} />
          <Route path='/manage-jobs' element={<ManageJobs />} />
          <Route path='/employer-job/:jobId' element={<EmployerJobView />} />
          <Route path='/payments' element={<Payments />} />
          <Route path='/applicants/:jobId' element={<ApplicationView />} />
          <Route path='/freelancer/:freelancerId' element={<FreelancerProfileView />} />
          <Route path='/company-profile' element={<EmployerProfile />} />
        </Route>

        <Route element={<ProtectedRoutes requiredRole="admin" />}>
          <Route path='/admin-dashboard' element={<AdminDashboard />} />
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
