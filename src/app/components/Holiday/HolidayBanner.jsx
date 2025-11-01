import Link from 'next/link';
import styles from './HolidayBanner.module.css';

export default function HolidayBanner() {
  return (
    <section
      className={styles.holidayBanner}
      style={{ backgroundImage: `url('https://stssevastorage.blob.core.windows.net/myorlandostay/home-slider/slider-7.jpg')` }}>
      <div className={styles.overlay}>
        <h1 className={styles.heading}>RELAX AND ENJOY YOUR HOLIDAY</h1>
        <h2 className={styles.subheading}>@Myrolandostay</h2>
        <p className={styles.description}>Affordable Luxury Rooms &amp;  Pet-Friendly Stays for a Perfect Vacation </p>
        <Link href="/availability"  rel="noopener noreferrer">
          <button className={styles.bookNowBtn}>BOOK NOW</button>
        </Link>
      </div>
    </section>
  );
}

 