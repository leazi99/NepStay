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
import Home from './pages/LandingPage/Home.jsx'
import GlobalLayout from './components/layout/GlobalLayout.jsx'
import SignUp from './pages/Auth/SignUp.jsx'
import GuestDashboard from './pages/JobSeeker/GuestDashboard.jsx'
import GuestProfile from './pages/JobSeeker/GuestProfile.jsx'
import ProtectedRoutes from './routes/ProtectedRoute.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import RoomForm from './pages/Employer/RoomForm.jsx'
import ReservationView from './pages/Employer/ReservationView.jsx'
import HotelProfile from './pages/Employer/HotelProfile.jsx'
import HotelStaffDashboard from './pages/Employer/HotelStaffDashboard.jsx'
import Payments from './pages/Employer/Payments.jsx'
import ManageRooms from './pages/Employer/ManageRooms.jsx'
import GuestProfileView from './pages/Employer/GuestProfileView.jsx'
import Reservations from './pages/Employer/Reservations.jsx'
import SavedRooms from './pages/JobSeeker/SavedRooms.jsx'
import RoomDetails from './pages/JobSeeker/RoomDetails.jsx'
import HotelsList from './pages/Hotels/HotelsList.jsx'
import HotelDetail from './pages/Hotels/HotelDetail.jsx'
import BookingForm from './pages/Booking/BookingForm.jsx'
import BookingConfirmation from './pages/Booking/BookingConfirmation.jsx'
import ManagerHotelsList from './pages/Manager/HotelsList.jsx'
import ManagerHotelForm from './pages/Manager/HotelForm.jsx'
import ManagerRoomsList from './pages/Manager/RoomsList.jsx'
import ManagerRoomForm from './pages/Manager/RoomForm.jsx'
import ManagerReservations from './pages/Manager/Reservations.jsx'
import BookingsHistory from './pages/JobSeeker/BookingsHistory.jsx'
import Messages from './pages/Common/Messages.jsx'
import Notifications from './pages/Common/Notifications.jsx'
import Reviews from './pages/Common/Reviews.jsx'
import WelcomeOnboarding from './pages/Common/WelcomeOnboarding.jsx'
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
            fontSize: '15px',
          },
          duration: 3500,
        }}></Toaster>
      <Routes>
        <Route element={<GlobalLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/home' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/verify-email' element={<VerifyEmail />} />
          <Route path='/verifyEmail' element={<VerifyEmail />} />
          <Route path='/verifyemail' element={<VerifyEmail />} />
          <Route path='/find-jobs' element={<Navigate to='/hotels' replace />} />
          <Route path='/hotels' element={<HotelsList />} />
          <Route path='/hotels/:hotelId' element={<HotelDetail />} />
        </Route>
        <Route path='/guest-dashboard' element={<GuestDashboard />} />
        <Route path='/freelancer-dashboard' element={<Navigate to='/guest-dashboard' replace />} />
        <Route path='/job/:jobId' element={<Navigate to='/guest-dashboard' replace />} />
        <Route path='/room/:roomId' element={<RoomDetails />} />

        <Route element={<ProtectedRoutes requiredRole="customer" />}>
          <Route element={<DashboardLayout />}>
            <Route path='/saved-rooms' element={<SavedRooms />} />
            <Route path='/saved-jobs' element={<Navigate to='/saved-rooms' replace />} />
            <Route path='/my-proposals' element={<Navigate to='/booking-history' replace />} />
            <Route path='/client-reviews' element={<Reviews />} />
            <Route path='/book-room/:roomId' element={<BookingForm />} />
            <Route path='/booking/:bookingId' element={<BookingConfirmation />} />
            <Route path='/booking-history' element={<BookingsHistory />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route element={<DashboardLayout />}>
            <Route path='/welcome' element={<WelcomeOnboarding />} />
            <Route path='/profile' element={<GuestProfile />} />
            <Route path='/messages' element={<Messages />} />
            <Route path='/notifications' element={<Notifications />} />
            <Route path='/reviews' element={<Reviews />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoutes requiredRole="customer" />}>
          <Route element={<DashboardLayout />}>
            <Route path='/freelancer/messages' element={<Navigate to='/messages' replace />} />
          </Route>
        </Route>


        <Route element={<ProtectedRoutes requiredRole="hotelstaff" />}>
          <Route element={<DashboardLayout />}>
            <Route path='/hotel-staff-dashboard' element={<HotelStaffDashboard />} />
            <Route path='/employer-dashboard' element={<Navigate to='/hotel-staff-dashboard' replace />} />
            <Route path='/reservations' element={<Reservations />} />
            <Route path='/manager/hotels' element={<ManagerHotelsList />} />
            <Route path='/manager/hotels/new' element={<ManagerHotelForm />} />
            <Route path='/manager/hotels/:hotelId/edit' element={<ManagerHotelForm />} />
            <Route path='/manager/hotels/:hotelId/rooms' element={<ManagerRoomsList />} />
            <Route path='/manager/rooms/new' element={<ManagerRoomForm />} />
            <Route path='/manager/rooms/:roomId/edit' element={<ManagerRoomForm />} />
            <Route path='/manager/reservations' element={<ManagerReservations />} />
            <Route path='/manage-rooms' element={<ManageRooms />} />
            <Route path='/manage-rooms/new' element={<RoomForm />} />
            <Route path='/manage-rooms/:roomId/edit' element={<RoomForm />} />
            <Route path='/post-job' element={<Navigate to='/manage-rooms/new' replace />} />
            <Route path='/post-job/:jobId/edit' element={<Navigate to='/manage-rooms' replace />} />
            <Route path='/manage-jobs' element={<Navigate to='/manage-rooms' replace />} />
            <Route path='/room/:roomId/manage' element={<Navigate to='/manage-rooms' replace />} />
            <Route path='/employer-job/:jobId' element={<Navigate to='/manage-rooms' replace />} />
            <Route path='/payments' element={<Payments />} />
            <Route path='/booking-requests/:jobId' element={<Navigate to='/reservations' replace />} />
            <Route path='/applicants/:jobId' element={<Navigate to='/reservations' replace />} />
            <Route path='/guest/:freelancerId' element={<Navigate to='/hotel-profile' replace />} />
            <Route path='/freelancer/:freelancerId' element={<Navigate to='/hotel-profile' replace />} />
            <Route path='/hotel-profile' element={<HotelProfile />} />
            <Route path='/company-profile' element={<Navigate to='/hotel-profile' replace />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoutes requiredRole="admin" />}>
          <Route element={<DashboardLayout />}>
            <Route path='/admin-dashboard' element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
