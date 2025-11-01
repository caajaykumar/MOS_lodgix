
import '@fortawesome/fontawesome-free/css/all.min.css'
import Image from 'next/image';

import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import Activities from './Activities';
import Team from './Team';

export default function AboutPage() {
  return (
    <>
      <Breadcrumb
        title="About Us"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'About Us', link: '/about', active: true },
        ]}
      />

      <section className="introduction_area intro_area2">
        <div className="container">
          <div className="row introduction_inner">
            <div className="col-md-6">
              <div className="introduction_left_text">
                <div className="intro_title">
                  <h2>VACATION RENTAL CLOSE TO DISNEYLAND BY MYORLANDOSTAY</h2>
                </div>


                <h4><span className="goal_heading"> <u> Who We Are</u></span> </h4>

                <p>

                  Located in the heart of <b>Orlando </b>(Orlando -- a city in Florida which is better known as the Sunshine State), MyOrlandoStay as a vacation rental company was started by Manny almost 18 years ago, and since then it has grown by leaps & bounds. Today MyOrlandoStay can boast of managing & marketing more than a dozen vacation homes. With a portfolio of over 30 properties (with some in Crestwynd Bay Community & others in Emerald Island Resort) & proven track record of more than 15 years in managing these properties, we (Manny & Team) strive to redefine the vacation rental experience for every guest who crosses paths with us.

                </p>




              </div>
            </div>


            <div className="col-md-6">
              <div className="introduction_img">
                <Image
                  src="/img/About-img.jpg" 
                  alt="Sample Image"
                  width={600} 
                  height={500}
                  className="lazyload"

                />
              </div>
            </div>

            <div className='col-md-12'>


              <p style={{ paddingTop: "20px" }}>
                It is here at MyOrlandoStay where you come to experience the best of your Orlando trip as what sets us apart is our unwavering dedication to guest satisfaction.

                Let alone a standalone vacation booking platform, MyOrlandoStay works closely with other trip planners and booking platforms to ensure all your vacation home needs are met successfully. Whether you need assistance with booking, recommendations for local attractions,
                or support during your stay, we’re just a phone call or message away, 24/7.
              </p>
              <h4><span className="goal_heading"> <u> Who We Are</u></span> </h4>

              <p> At MyOrlandoStay , our core mission is to deliver exceptional customer satisfaction and so we make every effort to serve our customers with delight every step of the way. We serve not only as a first point of contact but also the last with any guest who decides to exchange paths with us. That means we are there to provide every kind of customer assistance --- from a guest’s booking of our unit to entering into our contract to check-in and check-out.

                Further & beyond, our unique approach to handling each guest’s inquiries or recommendations is what fuels our passion for excellence.

                For us, every guest is unique and special and which is why we go beyond to proactively resolve the issues & concerns of our guests. We make sure we are available at their beck and call. Our distinctive approach to delivering customer satisfaction is what makes us shine and stand out!</p>



              <h4><span className="goal_heading"> <u> What more? </u></span> </h4>
              <p> We are always ready to talk about our vacation rental homes and services with guests who place their trust in us. We want our guests to feel special when they decide to stay in any of our vacation rental homes. To cut a long story short, MyOrlandoStay has come a long way in establishing itself as a one-in-kind vacation rental.</p>

            </div>

          </div>
        </div>
      </section>

      <Activities />
      <Team />

    </>

  );
}
