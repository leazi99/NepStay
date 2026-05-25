import React, { useEffect, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Container from '../../components/ui/Container'
import Card from '../../components/ui/Card'
import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'

const HotelsList = () => {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const fetch = async ()=>{
      try{
        const res = await axiosInstance.get(API_PATHS.HOTELS.GET_ALL)
        if (res.data?.success) setHotels(res.data.hotels || [])
      }catch(e){}
      finally{ setLoading(false) }
    }
    fetch()
  },[])

  return (
    <Container className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">My Hotels</h2>
        <Link to="/manager/hotels/new"><Button>New Hotel</Button></Link>
      </div>
      {loading ? <div>Loading…</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotels.map(h=> (
            <Card key={h._id} className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{h.name}</div>
                <div className="text-sm text-gray-500">{h.location}</div>
              </div>
              <div className="flex gap-2">
                <Link to={`/manager/hotels/${h._id}/rooms`} className="text-sm">Rooms</Link>
                <Link to={`/manager/hotels/${h._id}/edit`} className="text-sm">Edit</Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  )
}

export default HotelsList
