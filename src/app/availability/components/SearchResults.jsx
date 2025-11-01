'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchResults({ checkIn, checkOut, guests, rooms }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!checkIn || !checkOut) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          checkIn,
          checkOut,
          guests: guests || 2,
          rooms: rooms || 1
        });

        const response = await fetch(`/api/availability/search?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data = await response.json();
        setResults(data.data || []);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError(err.message || 'Failed to load availability');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [checkIn, checkOut, guests, rooms]);

  if (!checkIn || !checkOut) {
    return (
      <div className="text-center" style={{ padding: '50px 0' }}>
        <div style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}>
          🏠
        </div>
        <h3>No search criteria</h3>
        <p className="text-muted">Select check-in and check-out dates to see available properties.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="row">
        {[1, 2, 3].map((i) => (
          <div key={i} className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
            <div className="panel panel-default">
              <div style={{ height: '200px', backgroundColor: '#f5f5f5' }}></div>
              <div className="panel-body">
                <div style={{ height: '20px', backgroundColor: '#f5f5f5', marginBottom: '10px' }}></div>
                <div style={{ height: '15px', backgroundColor: '#f5f5f5', width: '60%', marginBottom: '15px' }}></div>
                <div style={{ height: '20px', backgroundColor: '#f5f5f5', width: '40%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center" style={{ padding: '50px 0' }}>
        <div className="alert alert-danger" style={{ display: 'inline-block' }}>
          <strong>Error:</strong> {error}
        </div>
        <br />
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
          style={{ marginTop: '15px' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center" style={{ padding: '50px 0' }}>
        <div style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}>
          🏠
        </div>
        <h3>No properties available</h3>
        <p className="text-muted">Try adjusting your search or dates to find more options.</p>
      </div>
    );
  }

  return (
    <div className="row">
      {results.map((property) => (
        <div key={property.id} className="col-md-4 col-sm-6" style={{ marginBottom: '30px' }}>
          <div className="panel panel-default">
            <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
              <Image
                src={property.photo_url || '/placeholder-property.jpg'}
                alt={property.name}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {property.is_available === false && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span className="label label-danger">Booked</span>
                </div>
              )}
            </div>
            <div className="panel-body">
              <div className="row">
                <div className="col-xs-12 col-md-12">
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{property.name}</h4>
                </div>
                <div className="col-xs-12">
                  <div style={{ color: '#337ab7', fontWeight: 'bold', fontSize: '15px' }}>
                    ${property.nightly_rate?.toLocaleString()}
                    <small style={{ color: '#777', fontWeight: 'normal' }}> / night</small>
                  </div>
                  {property.weekly_rate && (
                    <div style={{ fontSize: '12px', color: '#777' }}>
                      ${property.weekly_rate.toLocaleString()} weekly
                    </div>
                  )}
                </div>
              </div>
              <p className="text-muted" style={{ fontSize: '13px', margin: '8px 0' }}>
                {property.bedrooms} beds • {property.bathrooms} baths • {property.sleeps} guests
              </p>
              <div className="row" style={{ marginTop: '15px' }}>
                {/* <div className="col-xs-6">
                  {property.is_available ? (
                    <span className="label label-success">Available</span>
                  ) : (
                    <span className="label label-danger">Not Available</span>
                  )}
                </div> */}
                <div className="col-xs-6 text-right">
                  <Link 
                    href={`/properties/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                    className="btn btn-primary btn-xs"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
