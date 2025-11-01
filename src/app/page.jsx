
import AboutUs from './components/About/AboutUs'
import WhychooseUs from './components/Whychoose/Whychoose'
import Properties from "./components/Proparties/Properties";
import DiscountSection from "./components/Discount/Discount";
import Reservations from "./components/Reservation/Reservations";
import HolidayBanner from "./components/Holiday/HolidayBanner";
import MainSlider from "./components/Slider/Slider";

export default function Home() {
  return (
    <>
     
       
         <MainSlider/>
         {/* <HomePropertiesList/> */}
        <AboutUs/>

       <HolidayBanner/>

      
     
     
       <WhychooseUs/>
       <br/>

       <DiscountSection/>
       <Reservations/>
    </>
  );
}
