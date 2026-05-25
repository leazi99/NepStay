import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Container from '../../components/ui/Container'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const BookingForm = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.ROOMS.GET_BY_ID(roomId))
        if (res.data?.success) setRoom(res.data.room || res.data)
      } catch (e) {}
      finally { setLoading(false) }
    }
    fetchRoom()
  }, [roomId])

  const handleSubmit = async () => {
    if (!checkIn || !checkOut) return toast.error('Please select dates')
    setSubmitting(true)
    try {
      const payload = { room: roomId, checkInDate: checkIn, checkOutDate: checkOut, guests }
      const res = await axiosInstance.post(API_PATHS.BOOKINGS.CREATE, payload)
      if (res.data?.success) {
        toast.success('Booking created')
        navigate(`/booking/${res.data.booking?._id || res.data._id}`)
      } else {
        toast.error(res.data?.message || 'Failed to create booking')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create booking')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="p-8">Loading…</div>

  return (
    <Container className="py-6">
      <Card>
        <h2 className="text-xl font-semibold mb-2">Book this room</h2>
        <p className="text-sm text-gray-600 mb-4">{room?.title || room?.name}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col">
            <span className="text-sm mb-1">Check-in</span>
            <input type="date" value={checkIn} onChange={(e)=>setCheckIn(e.target.value)} className="border rounded p-2" />
          </label>
          <label className="flex flex-col">
            <span className="text-sm mb-1">Check-out</span>
            <input type="date" value={checkOut} onChange={(e)=>setCheckOut(e.target.value)} className="border rounded p-2" />
          </label>
        </div>

        <div className="mt-3">
          <label className="flex items-center gap-3">
            <span className="text-sm">Guests</span>
            <input type="number" min={1} value={guests} onChange={(e)=>setGuests(Number(e.target.value))} className="w-20 border rounded p-2" />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Booking…' : 'Book Now'}</Button>
          <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </Card>
    </Container>
  )
}

export default BookingForm
