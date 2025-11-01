'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ChooseResort() {
  return (
    <section className="choose_resort_area py-5">
      <div className="container">
        <div className="center_title mb-4 text-center">
          <h2 style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
            Why Choose <span style={{ color: '#f4a300' }}>Our MyOrlando Stay</span>
          </h2>
        </div>

        <div className="row choose_resort_inner align-items-center">
          <div className="col-md-5">
            <div className="resort_list">
              <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
  {[
    'Just 2 miles from Disney World',
    'Pet-friendly',
    'Free parking',
    'Budget-friendly',
    'Fully equipped kitchens',
    'High customer satisfaction',
    'Clean room service',
    'Walmart and gas station at a walking distance',
  ].map((item, index) => (
    <li className="List" key={index} style={{ marginBottom: '10px', fontSize: '16px', color: '#777' }}>
      <a href="#" className="linkItem" style={{ textDecoration: 'none', color: '#777' }}>
         <i className="fas fa-caret-right" style={{ color: '#f4a300', marginRight: '8px' }}></i>
        {item}
      </a>
    </li>
  ))}
</ul>
            </div>
          </div>

          <div className="col-md-7">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              loop
              spaceBetween={20}
            >
              {[
                'https://stssevastorage.blob.core.windows.net/myorlandostay/Unit1/13_Small.JPG',
                'https://stssevastorage.blob.core.windows.net/myorlandostay/Unit1/03_Small.JPG',
                'https://stssevastorage.blob.core.windows.net/myorlandostay/Unit1/04_Small.JPG',
              ].map((src, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={src}
                    alt={`Room ${index + 1}`}
                    width={800}
                    height={500}
                    className="img-fluid"
                    style={{ borderRadius: '8px' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
