'use client';

import Link from 'next/link';

export default function Reservations() {
  return (
    <section className="spec_resort_area" id="reservations">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h4 className="text-center">Reservations</h4>
          </div>
          <div className="col-md-12">
            <div className="reservations_btn">
              <Link href="https://www.lodgix.com/25634/" target="_blank" className="book_now_btn">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
