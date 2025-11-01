'use client';

import { useEffect, useState } from 'react';
import styles from './PropertyRates.module.css';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const PropertyRates = ({ propertyId }) => {
  const [rateData, setRateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      if (!propertyId) return;
      
      try {
        setLoading(true);
        
        // First, get the property details to find the default rate ID
        const propertyResponse = await fetch(`/api/lodgix/properties/${propertyId}`);
        if (!propertyResponse.ok) {
          throw new Error('Failed to fetch property details');
        }
        
        const propertyData = await propertyResponse.json();
        const rateId = propertyData.result?.default_rate_id;
        
        if (!rateId) {
          throw new Error('No default rate found for this property');
        }
        
        // Now fetch the rate details using the rate ID
        const response = await fetch(`/api/lodgix/properties/${propertyId}/rates/${rateId}`);
        console.log("Rate data response:", response);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch property rates');
        }
        
        const data = await response.json();
        console.log("Rate data:", data);
        setRateData(data);
      } catch (err) {
        console.error('Error fetching rates:', err);
        setError(err.message || 'Failed to load rates');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [propertyId]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading rates...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!rateData) {
    return <div className={styles.noRates}>No rate information available</div>;
  }

  return (
    <div className={styles.ratesContainer}>
      <h3>Rates & Availability</h3>
      
      <div className={styles.ratesGrid}>
        <div className={styles.rateCard}>
          <h4>Daily Rate</h4>
          <p className={styles.rateAmount}>{formatCurrency(rateData.daily_rate)}</p>
          <p className={styles.rateNote}>Per Night</p>
        </div>

        {rateData.weekend_rate && (
          <div className={styles.rateCard}>
            <h4>Weekend Rate</h4>
            <p className={styles.rateAmount}>{formatCurrency(rateData.weekend_rate)}</p>
            <p className={styles.rateNote}>Friday - Sunday</p>
          </div>
        )}

        {rateData.weekly_rate && (
          <div className={styles.rateCard}>
            <h4>Weekly Rate</h4>
            <p className={styles.rateAmount}>{formatCurrency(rateData.weekly_rate)}</p>
            <p className={styles.rateNote}>7+ nights</p>
          </div>
        )}

        {rateData.monthly_rate && (
          <div className={styles.rateCard}>
            <h4>Monthly Rate</h4>
            <p className={styles.rateAmount}>{formatCurrency(rateData.monthly_rate)}</p>
            <p className={styles.rateNote}>28+ nights</p>
          </div>
        )}
      </div>

      {rateData.extra_person_base !== null && rateData.extra_person_rate !== null && (
        <div className={styles.extraPerson}>
          <h4>Additional Guests</h4>
          <p>
            {rateData.extra_person_base > 0 
              ? `${formatCurrency(rateData.extra_person_rate)} per person after ${rateData.extra_person_base} guests`
              : `${formatCurrency(rateData.extra_person_rate)} per person`}
          </p>
        </div>
      )}

      {rateData.min_nights > 1 && (
        <div className={styles.minNights}>
          <p>Minimum Stay: {rateData.min_nights} nights</p>
        </div>
      )}
    </div>
  );
};

export default PropertyRates;
