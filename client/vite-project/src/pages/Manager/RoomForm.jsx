import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Container from '../../components/ui/Container'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

const RoomForm = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(Boolean(roomId))

  useEffect(()=>{
    if(!roomId) return
    const fetch = async ()=>{
      try{
        const res = await axiosInstance.get(API_PATHS.ROOMS.GET_BY_ID(roomId))
        if (res.data?.success){ setTitle(res.data.room.title); setPrice(res.data.room.pricePerNight) }
      }catch(e){}
      finally{ setLoading(false) }
    }
    fetch()
  },[roomId])

  const handleSave = async ()=>{
    try{
      const payload = { title, pricePerNight: Number(price) }
      if (roomId) await axiosInstance.put(API_PATHS.ROOMS.UPDATE(roomId), payload)
      else await axiosInstance.post(API_PATHS.ROOMS.CREATE, payload)
      toast.success('Saved')
      navigate('/manager/hotels')
    }catch(e){ toast.error('Failed') }
  }

  return (
    <Container className="py-6">
      <Card>
        <h2 className="text-xl font-semibold mb-4">{roomId ? 'Edit Room' : 'New Room'}</h2>
        <div className="grid gap-3">
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Room title" className="border rounded p-2" />
          <input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Price per night" className="border rounded p-2" />
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="ghost" onClick={()=>navigate('/manager/hotels')}>Cancel</Button>
          </div>
        </div>
      </Card>
    </Container>
  )
}

export default RoomForm
