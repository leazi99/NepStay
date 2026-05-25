import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Container from '../../components/ui/Container'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const BookingConfirmation = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const fetch = async ()=>{
      try{
        const res = await axiosInstance.get(API_PATHS.BOOKINGS.GET_BY_ID(bookingId))
        if (res.data?.success) setBooking(res.data.booking || res.data)
      }catch(e){}
      finally{ setLoading(false) }
    }
    fetch()
  },[bookingId])

  if (loading) return <div className="p-8">Loading…</div>
  if (!booking) return <div className="p-8">Booking not found</div>

  return (
    <Container className="py-6">
      <Card>
        <h2 className="text-xl font-semibold mb-2">Booking Confirmed</h2>
        <p className="text-sm text-gray-600 mb-4">Reservation ID: {booking._id}</p>
        <p className="mb-2">Room: {booking.room?.title || booking.room}</p>
        <p className="mb-2">Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
        <p className="mb-2">Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
        <p className="mb-4">Guests: {booking.guests}</p>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/guest-dashboard')}>My Bookings</Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>Close</Button>
        </div>
      </Card>
    </Container>
  )
}

export default BookingConfirmation
