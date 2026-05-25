import React, { useEffect, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Container from '../../components/ui/Container'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const Reservations = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const fetch = async ()=>{
      try{
        const res = await axiosInstance.get(API_PATHS.BOOKINGS.GET_MINE)
        if (res.data?.success) setBookings(res.data.bookings || [])
      }catch(e){}
      finally{ setLoading(false) }
    }
    fetch()
  },[])

  return (
    <Container className="py-6">
      <h2 className="text-xl font-semibold mb-4">Reservations</h2>
      {loading ? <div>Loading…</div> : (
        <div className="grid gap-3">
          {bookings.map(b=> (
            <Card key={b._id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{b.room?.title || b.room}</div>
                <div className="text-sm text-gray-500">{new Date(b.checkInDate).toLocaleDateString()} – {new Date(b.checkOutDate).toLocaleDateString()}</div>
              </div>
              <div>{b.status || 'pending'}</div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  )
}

export default Reservations
