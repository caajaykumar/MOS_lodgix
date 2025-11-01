'use client';

import { useRef } from 'react';
import emailjs from 'emailjs-com';
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import Head from 'next/head';
import InquiryForm from '../components/InquiryForm/InquiryForm';

const Contact = () => {
  
  return (
    <>
      <Breadcrumb
        title="Contact US"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Contact Us', link: '/contact', active: true },
        ]}
      />

      <section className="get_contact_area">
        <Head>
          <title>Contact Us - MyOrlandoStay.com</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />
        </Head>
        <div className="container">
          <div className="row get_contact_inner">
            <div className="col-md-6">
              <div className="left_ex_title">
                <h2><span>Contact Us </span></h2>
              </div>
              <InquiryForm />
             
            </div>

            {/* <div className="col-md-6">
              <div className="right_contact_info">
                <div className="contact_info_title">
                  <h3>MyOrlandoStay</h3>
                </div>
                <div className="contact_info_list">
                  <div className="media">
                    <div className="media-left">
                      <i className="fa fa-envelope-o"></i>
                    </div>
                    <div className="media-body">
                      <h4>Email</h4>
                      <a href="mailto:crestwynd@earthlink.net">crestwynd@earthlink.net</a>
                    </div>
                  </div>
                  <div className="media">
                    <div className="media-left">
                      <i className="fa fa-phone"></i>
                    </div>
                    <div className="media-body">
                      <h4>Phone</h4>
                      <a href="tel:+14075578999">+1(407) 557-8999</a>
                    </div>
                  </div>
                  <div className="media">
                    <div className="media-left">
                      <i className="fa fa-whatsapp"></i>
                    </div>
                    <div className="media-body">
                      <h4>Whatsapp</h4>
                      <a href="tel:+919839048100">+91-9839048100</a>
                    </div>
                  </div>
                  <div className="media">
                    <div className="media-left">
                      <p>Response guaranteed between 6 AM -11 PM.<br /> For immediate response, call us at +1(407) 557-8999 or email us. (24x7)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
