import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Container from '../../components/ui/Container'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const HotelForm = () => {
  const { hotelId } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(Boolean(hotelId))

  useEffect(()=>{
    if (!hotelId) return
    const fetch = async ()=>{
      try{
        const res = await axiosInstance.get(API_PATHS.HOTELS.GET_BY_ID(hotelId))
        if (res.data?.success) { setName(res.data.hotel.name); setLocation(res.data.hotel.location) }
      }catch(e){}
      finally{ setLoading(false) }
    }
    fetch()
  },[hotelId])

  const handleSave = async ()=>{
    try{
      const payload = { name, location }
      if (hotelId) await axiosInstance.put(API_PATHS.HOTELS.UPDATE(hotelId), payload)
      else await axiosInstance.post(API_PATHS.HOTELS.CREATE, payload)
      toast.success('Saved')
      navigate('/manager/hotels')
    }catch(e){ toast.error('Failed') }
  }

  return (
    <Container className="py-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">{hotelId ? 'Edit Hotel' : 'New Hotel'}</h2>
        <div className="grid gap-3">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Hotel name" className="border rounded p-2" />
          <input value={location} onChange={(e)=>setLocation(e.target.value)} placeholder="Location" className="border rounded p-2" />
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="ghost" onClick={()=>navigate('/manager/hotels')}>Cancel</Button>
          </div>
        </div>
      </Card>
    </Container>
  )
}

export default HotelForm
