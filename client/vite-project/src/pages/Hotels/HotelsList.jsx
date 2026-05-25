import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import Container from "../../components/ui/Container";
import Button from "../../components/ui/Button";

const HotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await axiosInstance.get("/api/hotels");
        if (res.data?.success) setHotels(res.data.hotels || []);
      } catch (err) {
        // ignore - backend may be not implemented yet
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  if (loading) return <div className="p-8">Loading hotels…</div>;

  return (
    <Container className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Explore Hotels</h2>
        <Button variant="ghost" onClick={() => window.location.reload()}>Refresh</Button>
      </div>

      {hotels.length === 0 ? (
        <div className="text-gray-600">No hotels available yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotels.map((h) => (
            <Link to={`/hotels/${h._id}`} key={h._id} className="block">
              <Card className="hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 rounded-md mb-3 overflow-hidden">
                  {h.images?.[0] ? <img src={h.images[0]} alt={h.name} className="w-full h-full object-cover" /> : null}
                </div>
                <h3 className="text-lg font-semibold">{h.name}</h3>
                <p className="text-sm text-gray-500">{h.location || "—"}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
};

export default HotelsList;
