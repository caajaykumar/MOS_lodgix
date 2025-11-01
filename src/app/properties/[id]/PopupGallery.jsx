import React, { useEffect } from "react";
import styles from "./image_pop.module.css";

const PopupGallery = ({ isOpen, onClose, property }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10000 }}>
            {/* Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 10000
                }}
                onClick={onClose}
            />
            {/* Modal Popup */}
            <div className={`${styles.popup} ${styles.show}`} id="popup" style={{ zIndex: 10001, position: 'fixed', display: 'block', overflowY: 'auto' }}>
                {/* Close Button */}
                <button className={`btn btn-danger ${styles.closebtn}`} onClick={onClose} style={{ zIndex: 10002, position: 'absolute', top: 10, right: 10, fontSize: 24, width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                {/* Photo Gallery Section Start */}
                <div className="photo-gallery content-area">
                    <div className="container">
                        <div className="main-title">
                            <h1>{property.name}  Photos Tour</h1>
                        </div>
                        {property.photos && property.photos.length > 0 ? (
                            <div className="row">
                                {property.photos.map((photo, idx) => (
                                    <div key={idx} className="col-lg-4 col-md-6 col-sm-12 filtr-item">
                                        <figure className={styles.portofoliothumb}>
                                            <a href={photo.url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={photo.url}
                                                    alt={`${property.name || "Property"} - ${idx + 1}`}
                                                    width={350}
                                                    height={350}
                                                    className={styles.popimage}
                                                    onError={(e) => {
                                                        e.currentTarget.src = "/img/placeholder-property.jpg";
                                                    }}
                                                />
                                            </a>
                                        </figure>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full  flex flex-col items-center justify-center rounded-lg">
                                {/* SVG Icon */}
                                <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-gray-500">No images available</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Photo gallery end */}
            </div>
        </div>
    );
};

export default PopupGallery;
