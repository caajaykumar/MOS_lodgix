

import React from "react";
import Link from "next/link";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";

import attractionsData from "./attractionsData"


const Attractions = () => {
  return (

    <>

     <Breadcrumb
        title="Area Attractions"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Area Attractions', link: '/areaAttractions', active: true },
        ]}
      />

    <section className="explor_room_area explore_room_list">
      <div className="container">
        <div className="explor_title row m0">
          <div className="left_ex_title">
            <h2 className="text-center">ATTRACTIONS</h2>
          </div>
        </div>
        <div className="row explor_room_item_inner">
          {attractionsData.map((item, index) => (
            <div key={index} className="col-md-4 col-sm-6">
              <div className="explor_item">
                <a href={item.website} className="room_image" target="_blank" rel="noopener noreferrer">
                  <img src={item.image} alt={item.title} />
                </a>
                <div className="explor_text">
                  <h4>
                    <a href={item.website} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </h4>
                  <p>{item.description}</p>
                  <div className="explor_footer">
                    <ul>
                      <li>
                        <Link href={item.mapLink} target="_blank" rel="noopener noreferrer">
                          <i className="fa fa-map-marker"></i> {item.location}
                        </Link>
                      </li>
                      <li>
                        <Link href="#">
                          <i className="fa fa-location-arrow"></i> {item.distance}
                        </Link>
                      </li>
                      <li>
                        <Link href={item.website} target="_blank" rel="noopener noreferrer">
                          <i className="fa fa-globe"></i> Website
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    </>
  );
};

export default Attractions;
