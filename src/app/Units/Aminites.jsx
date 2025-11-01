'use client';
import React, { useState } from 'react';
import style from './[unit]/unitdetails.module.css'; 

const Amenities = ({ amenities }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <h3 className="mb-3">What this place offers</h3>
          <ul className={`${style.amenities_list} d-flex flex-wrap`} style={{ listStyle: 'none', padding: 0 }}>
            {amenities.slice(0, 6).map((a, i) => (
              <li key={i} className="col-sm-6 mb-2 d-flex align-items-center">
                {a.icon && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={{ width: 20, height: 20, marginRight: 8 }}>
                    <path d={a.icon} />
                  </svg>
                )}
                {a.faClass && <i className={`${a.faClass} me-2`} style={{ width: 20 }}></i>}
                {a.name}
              </li>
            ))}
          </ul>
          <button onClick={handleModal} className="btn btn-outline-dark mt-2">Show All Amenities</button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className={style.modal_overlay}>
          <div className={style.modal_content}>
            <button className="btn-close" onClick={handleModal}></button>
            <h4 className="mb-3">All Amenities</h4>
            <ul className="d-flex flex-wrap" style={{ listStyle: 'none', padding: 0 }}>
              {amenities.map((a, i) => (
                <li key={i} className="col-sm-6 mb-2 d-flex align-items-center">
                  {a.icon && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" style={{ width: 20, height: 20, marginRight: 8 }}>
                      <path d={a.icon} />
                    </svg>
                  )}
                  {a.faClass && <i className={`${a.faClass} me-2`} style={{ width: 20 }}></i>}
                  {a.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Amenities;
