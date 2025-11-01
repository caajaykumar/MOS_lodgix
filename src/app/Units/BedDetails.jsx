'use client'; 

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/navigation';

const BedDetails = () => {
  return (
    <div className="bed_details">
      <h3>Where you'll sleep</h3>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={2}
      >
        <SwiperSlide>
          <div className="card">
            <Image src="/img/icon/bedroom.png" alt="Bedroom 1" width={50} height={50} />
            <h3>Bedroom 1</h3>
            <p>1 king bed</p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="card">
            <Image src="/img/icon/bedroom.png" alt="Bedroom 2" width={50} height={50} />
            <h3>Bedroom 2</h3>
            <p>1 king bed</p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="card">
            <Image src="/img/icon/twinbed.png" alt="Bedroom 3" width={50} height={50} />
            <h3>Bedroom 3</h3>
            <p>1 single bed, 1 bunk bed</p>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="card">
            <Image src="/img/icon/beds.png" alt="Common spaces" width={50} height={50} />
            <h3>Common spaces</h3>
            <p>1 single bed</p>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default BedDetails;
