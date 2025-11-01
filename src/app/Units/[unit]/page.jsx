'use client';
import Image from 'next/image';
import { use, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import style from './unitdetails.module.css';
import Link from 'next/link';
import BookingForm from '../BookingForm';
import BedDetails from '../BedDetails';
import AmenitiesModalData from './aminitesdata';
import unitData from './unitdata';
import { useEffect } from 'react';

const sharedAmenities = [
    { name: 'Bath', icon: 'M7.5 2a4.5 4.5 0 0 1 4.47 4H14v2H8V6h1.95A2.5 2.5 0 0 0 5 6.34V16h26v2h-2v5a5 5 0 0 1-3 4.58V30h-2v-2H8v2H6v-2.42a5 5 0 0 1-3-4.34V18H1v-2h2V6.5A4.5 4.5 0 0 1 7.5 2zM27 18H5v5a3 3 0 0 0 2.65 2.98l.17.01L8 26h16a3 3 0 0 0 3-2.82V23z' },
    { name: 'Hair dryer', icon: 'M14 27v.2a4 4 0 0 1-3.8 3.8H4v-2h6.15a2 2 0 0 0 1.84-1.84L12 27zM10 1c.54 0 1.07.05 1.58.14l.38.07 17.45 3.65a2 2 0 0 1 1.58 1.79l.01.16v6.38a2 2 0 0 1-1.43 1.91l-.16.04-13.55 2.83 1.76 6.5A2 2 0 0 1 15.87 27l-.18.01h-3.93a2 2 0 0 1-1.88-1.32l-.05-.15-1.88-6.76A9 9 0 0 1 10 1zm5.7 24-1.8-6.62-1.81.38a9 9 0 0 1-1.67.23h-.33L11.76 25z' },
    { name: 'Shampoo', icon: 'M20 1v2h-3v2h1a2 2 0 0 1 2 1.85V9a4 4 0 0 1 4 3.8V27a4 4 0 0 1-3.8 4H12a4 4 0 0 1-4-3.8V13a4 4 0 0 1 3.8-4h.2V7a2 2 0 0 1 1.85-2H15V3H8V1z' },
    { name: 'Kitchenware', faClass: 'fa fa-cutlery' },
    { name: 'Private entrance', faClass: 'fa fa-lock' },
    { name: 'Wardrobe/Closet', faClass: 'fa fa-archive' },
    { name: 'Tumble dryer', faClass: 'fa fa-asterisk' },
    { name: 'Oven', faClass: 'fa fa-fire' },
    { name: 'Barbecue', faClass: 'fa fa-fire-extinguisher' },
    { name: 'Toaster', faClass: 'fa fa-square-o' },
    { name: 'Stovetop', faClass: 'fa fa-fire' },
    { name: 'Tile/Marble floor', faClass: 'fa fa-th' },
    { name: 'View', faClass: 'fa fa-eye' },
    { name: 'Electric kettle', faClass: 'fa fa-bolt' },
    { name: 'Dining area', faClass: 'fa fa-cutlery' },
    { name: 'Alarm clock', faClass: 'fa fa-clock-o' }
];

export default function UnitDetails({ params }) {




    const { unit: unitId } = use(params); // ✅ unwrap the promise from async route params
    const unit = unitData[unitId];

    //    const { unit } = React.use(props.params);
    //   const unit = unitData[unitId];

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);

    const openPopup = () => setIsPopupOpen(true);
    const closePopup = () => setIsPopupOpen(false);

    const openAmenitiesModal = () => setIsAmenitiesModalOpen(true);
    const closeAmenitiesModal = () => setIsAmenitiesModalOpen(false);

    if (!unit) {
        return <div style={{ padding: '50px' }}><h2>404 - Unit not found</h2></div>;
    }

    useEffect(() => {
  if (typeof window !== 'undefined') {
    document.body.style.overflow = isPopupOpen ? 'hidden' : 'auto';
  }

  return () => {
    if (typeof window !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  };
}, [isPopupOpen]);
    

    return (
        <>
            <section className="banner_area">
                <div className="container">
                    <div className="banner_inner_content">
                        <h1>{unit.title}</h1>
                        <ul>
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="#">{unit.title}</Link></li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="room_details_area">
                <div className="container">
                    {/* Swiper and thumbnails */}
                    <div className="row room_details_inner">
                        <div className="col-md-6">
                            <Swiper style={{ borderRadius: '8px !important' }} modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 3000 }} loop spaceBetween={20}>
                                {unit.unitImages.map((src, index) => (
                                    <SwiperSlide key={index}>
                                        <Image src={src} alt={`Room ${index + 1}`} width={800} height={350} className="img-fluid" style={{ borderRadius: '8px !important' }} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                        <div className="col-md-6">
                            <div className="row">
                                {unit.galleryImages.slice(0, 4).map((src, i) => (
                                    <div key={i} className="col-sm-6">
                                        <Image src={src} alt={`Gallery ${i + 1}`} width={300} height={200} className={`img-responsive ${style.marbottomsm}`} layout="responsive" />
                                    </div>
                                ))}
                                <div className="col-12">
                                    <button className={`btn btn-info ${style.photobtn}`} onClick={openPopup}>
                                        <i className="fa fa-bars"></i> Show All Photos
                                    </button>
                                </div>
                            </div>
                        </div>



                    </div>

                    <div className="row room_details_inner">
                        <div className="col-md-8">
                            <div className="room_details">
                                <h2 className="home_name"> {unit.title}</h2>

                                <ul className="home_feature">
                                    <li>. 8 guests</li>
                                    <li>. 3 bedrooms</li>
                                    <li>. 5 beds</li>
                                    <li>. 2.5 bathrooms</li>
                                </ul>
                            </div>

                            <div className="host_details">
                                <div className="item item_img">
                                    <Image
                                        src="/img/manny.png"
                                        alt="Manny"
                                        className="manny_img"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="item item_name">
                                    <p>Hosted by Manny</p>
                                    <span> 13 years hosting</span>
                                </div>
                            </div>

                            <div className="host_details">
                                <div className="item item_img">
                                    <Image
                                        src="/img/icon/check-in.png"
                                        alt="Check-in"
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <div className="item item_name">
                                    <p>Self check-in</p>
                                    <span>Check yourself in with the keypad.</span>
                                </div>
                            </div>

                          <div className="s_blog_quote1">
  <div id="content">
    <div id="shortContent">
      {unit.descriptionDetails?.intro}
      <ul className="room_facilities_list">
        {unit.descriptionDetails?.sections.map((section, index) => (
          <li key={index}>
            {section.heading}:
            <ul>
              {section.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  </div>
</div>

                            {/* bed_details Slider start */}

                            <BedDetails />
                            {/* <div className="bed_details">
                                <h3>Where you'll sleep</h3>
                                <Swiper modules={[Navigation]} navigation spaceBetween={20} slidesPerView={2}>
                                    <SwiperSlide>
                                        <div className="card">
                                            <Image src="/img/icon/bedroom.png" alt="Bedroom icon" width={50} height={50} />
                                            <h3>Bedroom 1</h3>
                                            <p>1 king bed</p>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="card">
                                            <Image src="/img/icon/bedroom.png" alt="Bedroom icon" width={50} height={50} />
                                            <h3>Bedroom 2</h3>
                                            <p>1 king bed</p>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="card">
                                            <Image src="/img/icon/twinbed.png" alt="Twin bed icon" width={50} height={50} />
                                            <h3>Bedroom 3</h3>
                                            <p>1 single bed, 1 bunk bed</p>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="card">
                                            <Image src="/img/icon/beds.png" alt="Beds icon" width={50} height={50} />
                                            <h3>Common spaces</h3>
                                            <p>1 single bed</p>
                                        </div>
                                    </SwiperSlide>
                                </Swiper>
                            </div> */}

                            {/* bed_details Slider end here */}
                        </div>


                        {/*  Bookinng form */}
                        <BookingForm />


                    </div>





                    {/* Amenities Section */}


                    <div className="row">
                        <div className="col-md-12">
                            <h3 className="mb-3">What this place offers</h3>

                            <ul className={`${style.amenities_list} d-flex flex-wrap`} style={{ listStyle: 'none', padding: 0 }}>
                                {(sharedAmenities || []).map((a, i) => (
                                    <li key={i} className="col-sm-6 mb-2 d-flex align-items-center">
                                        {a.icon && (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={{ width: 24, height: 24 }}>
                                                <path d={a.icon} />
                                            </svg>
                                        )}
                                        {a.faClass && <i className={`${a.faClass} me-2`} style={{ width: 20, textAlign: 'center' }}></i>} {a.name}
                                    </li>
                                ))}
                            </ul>


                            {/* <ul className={`${style.amenities_list} d-flex flex-wrap`} style={{ listStyle: 'none', padding: 0 }}>
                                {unit.amenities.map((a, i) => (
                                    <li key={i} className="col-sm-6 mb-2 d-flex align-items-center">
                                        {a.icon && (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={{ width: 20, height: 20, marginRight: 8 }}>
                                                <path d={a.icon} />
                                            </svg>
                                        )}
                                        {a.faClass && <i className={`${a.faClass} me-2`} style={{ width: 20, textAlign: 'center' }}></i>}
                                        {a.name}
                                    </li>
                                ))}
                            </ul> */}


                            <button onClick={openAmenitiesModal} className={style.button1}>
                                Show All Amenities
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Popup */}
            {isPopupOpen && (
                <div className={`${style.popup} ${style.show}`}>
                    <button className={style.close_btn} onClick={closePopup}>X</button>
                    <div className="container">
                        <h2>{unit.title} – Photo Tour</h2>
                        <div className="row">
                            {unit.unitImages.map((src, index) => (
                                <div className="col-md-4" key={index}>
                                    <Image src={src} alt={`Gallery ${index}`} width={400} height={300} layout="responsive" className="img-fluid w-100"  style={{paddingTop:"5px", borderRadius:"8px"}}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Amenities Modal */}

           {isAmenitiesModalOpen && (
  <div className={style.modal} style={{ display: 'flex' }}>
    <div className={style.modal_content}>
      <div className={style.modal_header}>
        <button className={style.close_btn} onClick={closeAmenitiesModal}>X</button>
      </div>
      <h2 className={style.aminites_pop_main_Heading}>What this place offers</h2>

      {AmenitiesModalData.map((group, index) => (
        <div key={index}>
          <h4 className='text-left'>{group.category}</h4>
          <ul className={style.aminities_list}>
            {group.items.map((item, i) => {
              const isString = typeof item === 'string';
              return (
                <li key={i} className={style.aminity_item}>
                   {!isString && item.icon && (
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        style={{ width: 24, height: 24, marginRight: 10 }}
                        >
                      <path d={item.icon} />
                    </svg>
                  )}
                  {!isString && item.faClass &&  <i className={`${item.faClass} me-2`} style={{ marginRight: '10px' }}></i> }
                  {isString ? item : item.name}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  </div>
)}
        </>
    );
}
