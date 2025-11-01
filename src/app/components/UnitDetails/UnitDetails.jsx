'use client';
import React from 'react';
import Breadcrumb from '../Breadcrumb/Breadcrumb';

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const imageUrls = [
  "IMG_0023.jpg",
  "IMG_0006.jpg",
  "IMG_0013.jpg",
  "IMG_0015.jpg",
  "IMG_0016.jpg",
  "IMG_0019.jpg",
  "IMG_0020.jpg",
  "IMG_0021.jpg",
  "IMG_0023.jpg",
  "IMG_0024.jpg",
  "IMG_0025.jpg",
  "IMG_0026.jpg",
  "IMG_0029.jpg",
  "IMG_0030.jpg",
  "IMG_0032.jpg",
  "IMG_0033.jpg",
  "IMG_0035.jpg",
  "IMG_0037.jpg",
  "IMG_0039.jpg",
  "IMG_0040.jpg",
  "IMG_0042.jpg",
  "IMG_0044.jpg",
  "IMG_0047.jpg",
];

export default  function  UnitDetails({ id}) {
  return (
    <>
      <Breadcrumb
        title={`Unit ${id}`}
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Units', link: '/Units', active: false },
          { name: `Unit ${id}`, link: `/Units/${id}`, active: true },
        ]}
      /> 

      <section className="room_details_area">
        <div className="container">
          <div className="row room_details_inner">
            <div className="col-md-6">
              <div className="room_details_content">
                <div className="room_d_main_text">
                  <div className="room_details_img">
                    <Swiper
                      modules={[Navigation, Pagination, Scrollbar, A11y]}
                      spaceBetween={10}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      scrollbar={{ draggable: true }}
                    >
                      {imageUrls.map((img, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={`https://stssevastorage.blob.core.windows.net/myorlandostay/Unit2/${img}`}
                            alt={`Unit2 Image ${index + 1}`}
                            className="img-fluid"
                            height={400}
                            width={700}
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>

           
            <div className="col-lg-3 col-md-3">
              <img
                src="https://stssevastorage.blob.core.windows.net/myorlandostay/Unit2/IMG_0035.jpg"
                className="img-responsive marbottomsm"
                alt="Image 1"
              />
              <img
                src="https://stssevastorage.blob.core.windows.net/myorlandostay/Unit2/IMG_0039.jpg"
                className="img-responsive marbottomsm"
                alt="Image 2"
              />
            </div>

            <div className="col-sm-3 col-md-3">
              <img
                src="https://stssevastorage.blob.core.windows.net/myorlandostay/Unit2/IMG_0042.jpg"
                className="img-responsive marbottomsm"
                alt="Image 3"
              />
              <img
                src="https://stssevastorage.blob.core.windows.net/myorlandostay/Unit2/IMG_0023.jpg"
                className="img-responsive marbottomsm"
                alt="Image 4"
              />
              <button className="btn btn-info photobtn" id="openBtn">
                <i className="fa fa-bars"></i> Show All Photos
              </button>
              <div className="overlay" id="overlay" style={{ display: "none" }}></div>
            </div>
          </div>
        </div>
      </section> 
    </>
  );
}
