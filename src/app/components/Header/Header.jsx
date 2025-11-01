"use client"

import React from 'react'
import Link from 'next/link'
import { useLoader } from '@/app/components/LoaderProvider'
import { usePathname } from 'next/navigation'

const Header = () => {
  const pathname = usePathname();
  const { showLoader, hideLoader } = useLoader();
  return (
    
    <>
    <header className="main_header_area white_menu">
    <div className="header_top">
        <div className="container">
            <div className="header_top_inner">
                <div className="pull-left">
                    <Link href="#"><i className="fa fa-phone"></i>+1(407) 557-8999</Link>
                    <Link href="#"><i className="fa fa-envelope-o"></i>crestwynd@earthlink.net </Link>
                </div>
                <div className="pull-right">
                    <ul className="header_social">
                        <li><Link href="#" id="google_translate_element"></Link></li>
                        <li>
                          <Link href="/availability" className="book_now_btn" onClick={() => { 
                            try { 
                              showLoader();
                              if (pathname === '/availability') {
                                // If we're already on the same page, clear the loader quickly
                                hideLoader(200);
                              }
                            } catch {}
                          }}>
                            <i className="fa fa-calendar"></i> availability
                          </Link>
                        </li>

                        <li><Link href="https://www.lodgix.com/25634/" className="book_now_btn"> <i className="fa fa-calendar"></i> Book Now</Link></li>


                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div className="header_menu">
        <nav className="navbar navbar-default">
            <div className="container-fluid">
                {/* <!-- Brand and toggle get grouped for better mobile display --> */}
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <Link className="navbar-brand" href="/">
                        <img src="https://stssevastorage.blob.core.windows.net/myorlandostay/mylogo.png" alt="MyOrlandoStay Logo " className="logo_img"/>
                        {/* <img src="https://stssevastorage.blob.core.windows.net/myorlandostay/mylogo.png" alt="MyOrlandoStay Logo " className="logo_img"/> */}
                        <img src="https://stssevastorage.blob.core.windows.net/myorlandostay/mylogo.png" alt="MyOrlando Stay Logo" className="logo_img1"/>
                    </Link>
                </div>
                {/* <!-- Collect the nav links, forms, and other content for toggling --> */}
                <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul className="nav navbar-nav">
    <li><Link href="/">Home</Link></li>
    <li><Link href="/about">About Us</Link></li>
    <li><Link href="/properties">Properties</Link></li>
    <li><Link href="/areaAttractions">Area Attractions</Link></li>
    <li><Link href="/contact">Contact Us</Link></li>

    {/* External link should use <a> */}
    <li>
      <Link href="https://na1.documents.adobe.com/public/esignWidget?wid=CBFCIBAA3AAABLblqZhD8HNp_8gsiruI1y2mWRLwkRlj9TcQ9sxJ0QqsHuYcdhGUUxxesA3B_BPM0jkpTV2Y*&hosted=false">
         Rental Agreement
      </Link>
    </li>
</ul>

                </div>
                {/* <!-- /.navbar-collapse --> */}
            </div>
            {/* <!-- /.container-fluid --> */}
        </nav>
    </div>
</header>
    
    
    </>
  )
}

export default Header