'use client';

import { Suspense } from 'react';
import ReservationForm from './components/ReservationForm';
import Breadcrumb from '@/app/components/Breadcrumb/Breadcrumb';

export default function ReservationPage() {
  return (
    <>
      <Breadcrumb
        title="Reservation"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Booking', link: '/booking', active: false },
          { name: 'Reservation', link: '#', active: true },
        ]}
      />
      <div className="container" style={{ marginTop: 20 }}>
        <div className="row">
          <div className="col-md-8 col-md-offset-2">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">Complete Your Reservation</h3>
              </div>
              <div className="panel-body">
                <Suspense fallback={<div>Loading reservation form…</div>}>
                  <ReservationForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
