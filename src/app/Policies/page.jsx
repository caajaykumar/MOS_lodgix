import React from 'react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';

const PrivacyPolicy = () => {
  return (

    <>

    <Breadcrumb
        title="Policies & Terms"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Policies & Terms', link: '/Poliicies', active: true },
        ]}
      />

   


    <section className="privacy_policy_area">
      <div className="container">
        {/* Title Section */}
        <div className="row get_contact_inner">
          <div className="left_ex_title">
            <h2 className="text-center">
              Privacy <span>&amp; Policy</span>
            </h2>
          </div>
        </div>

        {/* Main Content */}
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h2>Policies & Terms</h2>
                <p>Effective Date: December 2017</p>
              </div>

              <div className="panel-body">
                <p>
                  This privacy statement applies to Myorlandostay.com, owned and operated by Myorlandostay-com LLC.
                  This privacy statement describes how we collect and use the personal information you provide on
                  our website: MyOrlandoStay.com. It also describes the choices available to you regarding our use
                  of your personal information and how you can access and update this information. We might amend
                  this privacy statement from time to time, so visit this page regularly to stay up to date.
                </p>

                <h4>The type of personal information we collect.</h4>
                <p>The types of personal information that we collect include:</p>

                <ul className="list1">
                  <li>Your first name, last name, email address, phone number, and home address;</li>
                  <li>Credit card details (type of card, credit card number, name on card, expiration date, and security code);</li>
                  <li>Guest stay information, including date of arrival and departure, special requests made, observations about your service preferences (including room preferences, facilities or any other services used);</li>
                  <li>Information you provide regarding your marketing preferences or in the course of participating in surveys, contests or promotional offers;</li>
                </ul>

                <p>
                  When you visit our website, even if you do not make a reservation, we may collect certain
                  information, such as your IP address, which browser you’re using, and information about your
                  computer’s operating system, application version, language settings and pages that have been
                  shown to you. If you are using a mobile device, we may also collect data that identifies your
                  mobile device, device-specific settings and characteristics and latitude/longitude details.
                  When you make a reservation, our system registers through which means and from which websites
                  you have made your reservation. If this data can identify you as a natural person, this data is
                  considered personal information which is subject to this privacy statement.
                </p>

                <h4>How do we share your personal information with third parties?</h4>
                <p>
                  <strong>BookingSuite:</strong> Your personal data might be shared with BookingSuite B.V. located
                  at Herengracht 597, 1017 CE Amsterdam, the Netherlands, the company which operates this website
                  and the website suite.booking.com.
                </p>
              </div>
            </div>
          </div>

          {/* Optional Spacing */}
          <div className="col-12">
            <br />
            <p>&nbsp;</p>
            <br />
            <br />
          </div>
        </div>
      </div>
    </section>

    </>
  );
};

export default PrivacyPolicy;
