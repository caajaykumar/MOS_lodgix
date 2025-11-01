
import Link from 'next/link';
import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer_area}>
      <div className={styles.footer_widget_area}>
        <div className={styles.container}>
          <div className={styles.row}>

         

            <div className={styles.col}>
              <aside className={styles.about_widget}>
                <img src="https://stssevastorage.blob.core.windows.net/myorlandostay/mylogo.png" alt="MyOrlandoStay Logo" />
             
                <p> Affordable stays, pet-friendly spaces, and warm hospitality — that’s our promise at MyOrlandoStay.</p>
                
              </aside>
                  <aside className={styles.social_widget}>
                
                
                <h3 className={styles.f_title}>Social Links</h3>
                <ul className={styles.social_link}>
                  <li><Link href="https://www.facebook.com/MyOrlandoStay" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></Link></li>
                  <li><Link href="https://twitter.com/MyOrlandoStay" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></Link></li>
                </ul>
              </aside>
            </div>

           
            <div className={styles.col}>
              <aside className={styles.link_widget}>
                <h3 className={styles.f_title}>Quick Links</h3>
                <ul>
                  <li><Link href="/">Home</Link></li>
                  <li><Link href="/baout">About Us</Link></li>
                  <li><Link href="/proparties">Properties</Link></li>
                  <li><Link href="/contact">Contact</Link></li>
                  <li><Link href="/areaattraction">Area Attractions</Link></li>
                </ul>
              </aside>
            </div>

         
            <div className={styles.col}>
              <aside className={styles.link_widget}>
                <h3 className={styles.f_title}>Important Links</h3>
                <ul>
                  <li><Link href="/privacy">Privacy Policy</Link></li>
                  <li><Link href="/Policies">Policies & Terms</Link></li>
                  <li><Link href="/Cookies">Cookie Notice</Link></li>
                  <li><Link href="/Review">Reviews & Testimonials</Link></li>
                  <li><Link href="/MapDirections">Map & Directions</Link></li>
                </ul>
              </aside>
            </div>

         

            <div className={styles.col}>
              <aside className={styles.about_widget}>
                 <h3 className={styles.f_title}>Contact Us</h3>
                <div className={styles.ab_wd_list}>

                  <div className={styles.media}>
                    <i className="fas fa-map-marker-alt"></i>
                    <h5>
                      2655 Andros Lane (Central Location only)<br />
                      Celebration, Orlando FL 34747<br />
                      United States of America
                    </h5>
                  </div>


                  <div className={styles.media}>
                    <i className="fab fa-whatsapp"></i>
                    <Link href="tel:+1(407) 557-8999" >+1(407) 557-8999</Link>
                  </div>


                  
                  <div className={styles.media}>
                    <i className="fab fa-whatsapp"></i>
                    <Link href="tel:+919839048100">+91-9839048100</Link>
                  </div>   


                </div>
              </aside>

              
          
            </div>
            

          </div>
        </div>
      </div>

      <div className={styles.footer_copyright}>
        <p>Copyright © Disney Area Vacation Rental by <Link href="#" className={styles.footer_link}>My Orlando Stay</Link>, LLC. All rights reserved.</p>
      </div>
    </footer>
  );
}
