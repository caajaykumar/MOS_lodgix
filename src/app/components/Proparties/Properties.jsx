'use client'

import Link from 'next/link';
import Image from 'next/image';
import properties from './propertiesData';

export default function Properties() {
  return (


    <>
    
  
    <section className="explor_room_area explore_room_list">
      <div className="container">
        <div className="explor_title row m0">
          <div className="left_ex_title">
            <h2>Properties  <span></span></h2>
            <p>
              These homes are 3 bedrooms, 3 bath townhomes just 1 mile from the Disney parks. The homes are in a gated community with a semi-large swimming pool which is heated in the winters. The pool is open for our guests without a charge.
            </p>
          </div>
        </div>
        <div className="row explor_room_item_inner">
          {properties
            .filter(property => property.active)
            .map(property => (
              <div className="col-md-4 col-sm-6" key={property.id}>
                <div className="explor_item">
                  <Link href={property.unitLink} className="room_image">
                    <Image src={property.imageUrl} alt={property.alt} width={360} height={350}/>
                  </Link>
                  <div className="explor_text">
                    <Link href={property.unitLink} className="text-center">
                      <h4>{property.title}</h4>
                    </Link>
                    <div className="explor_footer">
                      <div className="pull-left">
                        <Link className="book_now_btn text-center" href={property.bookLink}>Book Now</Link>
                      </div>
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
}

