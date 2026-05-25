import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Container from '../../components/ui/Container'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const RoomsList = () => {
  const { hotelId } = useParams()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const fetch = async ()=>{
      try{
        const res = await axiosInstance.get(API_PATHS.ROOMS.GET_BY_HOTEL(hotelId))
        if (res.data?.success) setRooms(res.data.rooms || [])
      }catch(e){}
      finally{ setLoading(false) }
    }
    fetch()
  },[hotelId])

  return (
    <Container className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Rooms</h2>
        <Link to="/manager/rooms/new"><Button>New Room</Button></Link>
      </div>
      {loading ? <div>Loading…</div> : (
        <div className="grid grid-cols-1 gap-3">
          {rooms.map(r=> (
            <Card key={r._id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{r.title}</div>
                <div className="text-sm text-gray-500">{r.roomType} — ${r.pricePerNight}/night</div>
              </div>
              <div className="flex gap-2">
                <Link to={`/room/${r._id}/manage`} className="text-sm">Edit</Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  )
}

export default RoomsList
