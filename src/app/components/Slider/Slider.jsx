
'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './slider.module.css'; // adjust path if you keep your CSS elsewhere

const slides = [
  '/img/home-slider/slider-1.jpg',
  '/img/home-slider/slider-2.jpg',
  '/img/home-slider/slider-10.jpg',
  '/img/home-slider/slider-11.jpg',
  '/img/home-slider/slider-5.jpg',
  '/img/home-slider/slider-6.jpg',
  '/img/home-slider/slider-9.jpg',
];

export default function MainSlider({ className = '' }) {
  return (
    <section
      className={`${className} ${styles.sliderSection}`}
      style={{ width: '100%', padding: 0, margin: 0 }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop
        spaceBetween={0}
        style={{ width: '100%' }}
      >
        {slides.map((src, i) => (
          <SwiperSlide key={i} style={{ width: '100%' }}>
            <div
              style={{
                width: '100%',
                position: 'relative',
                height: '700px', // set your desired height
              }}
            >
              <Image
                src={src}
                alt={`Slide ${i + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
