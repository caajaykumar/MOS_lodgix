import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Activities = () => {
  return (
    <section className="activities_area">
      <div className="activities_item_inner">
        <div className="container">
          <div className="row activities_item_row">
            <div className="col-md-6">
              <div className="activities_content">
                <h4>
                  Our <span>Goals</span>
                </h4>

                <span className="goal_heading">Our Mission</span>
                <p>
                  To provide value and to provide comfort and luxury for vacation and long-term
                  customers.
                </p>

                <span className="goal_heading">Our Service</span>
                <p>Everything that you ask for and more.</p>

                <span className="goal_heading">Our Values</span>
                <p>Service, Quality, Customer Focus and a guarantee to keep our promises.</p>

                <span className="goal_heading">Our Vision</span>
                <p>To be the best provider of term property rentals in Orlando.</p>
              </div>
            </div>

            <div className="col-md-6">
              <Link href="/activities" className="activities_img">
                <Image
                  src="/img/vision.png"
                  alt="Vision"
                  width={500}
                  height={400}
                  className="img-responsive"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Activities;
