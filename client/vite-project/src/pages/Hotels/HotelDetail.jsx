import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Container from "../../components/ui/Container";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const HotelDetail = () => {
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(`/api/hotels/${hotelId}`);
        if (res.data?.success) setHotel(res.data.hotel || null);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [hotelId]);

  if (loading) return <div className="p-8">Loading hotel…</div>;
  if (!hotel) return <div className="p-8">Hotel not found.</div>;

  return (
    <Container className="py-6">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{hotel.name}</h2>
          <p className="text-gray-600 mb-4">{hotel.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotel.rooms?.length ? (
              hotel.rooms.map((r) => (
                <Card key={r._id} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{r.title}</h4>
                    <p className="text-sm text-gray-500">{r.roomType}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${r.pricePerNight}/night</div>
                    <Button className="mt-2" onClick={() => window.location.href = `/room/${r._id}`}>Book</Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-gray-600">No rooms listed yet.</div>
            )}
          </div>
        </div>

        <aside className="w-80">
          <Card>
            <h4 className="font-semibold mb-2">Location</h4>
            <p className="text-sm text-gray-500">{hotel.location || '—'}</p>
          </Card>
        </aside>
      </div>
    </Container>
  );
};

export default HotelDetail;
