'use client';
import React from 'react';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';

const cookesnotes = () => {
  return (


    <>

   <Breadcrumb
        title="Cookie Notice"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Cookie Notice', link: '/cookesnotes', active: true },
        ]}
      />

    <section className="privacy_policy_area">
      <div className="container">
        {/* Header Title */}
        <div className="row get_contact_inner">
          <div className="left_ex_title">
            <h2 className="text-center">
              Privacy <span>&amp; Policy</span>
            </h2>
          </div>
        </div>

        {/* Privacy Content */}
        <div className="row">
          <div className="col-md-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h2>My Orlando Stay Cookie Notice</h2>
                <p>Effective Date: April 2018</p>
              </div>

              <div className="panel-body">
                <p>
                  This Cookie Notice applies to www.myorlandostay.com, owned and operated by Disney Area Vacation Rental by My Orlando Stay, LLC, and describes how we use personal data collected through Cookies and other techniques, including pixels ("Cookies") on our website www.myorlandostay.com("Site").
                </p>

                <h4>Data Collection</h4>

                <p>When entering the Site or viewing our targeted advertisements, we automatically collect data using Cookies.</p>
                

                <p>
                 The types of information that we collect through Cookies include IP address; device ID; viewed pages; browsing information; browser type; operating system; internet service provider; timestamp; the referring URL; and location data depending on the device you use.
                </p>

                <p> More information on Cookies: Cookies are small bits of electronic information that a website sends to a visitor’s browser and are stored on the visitor’s hard drive. We place Cookies on your computer if you visit our website. If you are concerned about having Cookies on your device, you can set your browser to refuse all Cookies or to indicate when a cookie is being set, letting you decide whether to accept it or not. You can also delete Cookies from your device. However, if you choose to block or delete Cookies, certain features of the websites you visit might not operate correctly.</p>
                <p>Third-party Cookies: We allow certain third parties to place Cookies. If you have questions about which Cookies are used and which parties place these Cookies, contact us using the contact details set out below.</p>
                <h4>How do we share your personal information with third parties?</h4>

               <h4> Processing Purposes</h4>
               <p> We use your information, including personal data, collected through Cookies for the following purposes:</p>
              <ul className="list1">
    <li>Provide usage of our Site: We use information that we collect through Cookies to let you use the Site. It is our legitimate business interest to use Cookies for this purpose.</li>
    <li> Perform analytics regarding the use of our services: We use information that we collect through Cookies to analyze how our Site is used and to prepare reports on the use of our Site. We also use Cookies to keep track of your use of the Site, and to improve your user experience and the quality of the Site. It is our legitimate business interest to use Cookies for these purposes.</li>
    <li>Providing targeted advertisements: We use information that we collect through Cookies to pursue our legitimate interests by providing targeted advertising. Where necessary, we will obtain prior consent before Cookies are placed for this purpose. If consent is given, you can withdraw it at any time. In addition, you can object to our processing of your personal data for advertising purposes at any time.</li>
    <li>Market research: We use information that we collect through Cookies to pursue our legitimate interests to engage in market research (including the analysis of market segmentation or trends, preferences and behaviors, research about products or services, or the effectiveness of marketing or advertising) or product development (including the analysis of the characteristics of a market segment or group of customers or the performance of our Site, in order to improve our Site).</li>
</ul>

 <p>
     If you prefer to opt out of the use of Cookies described in this section and no opt-out mechanism is available to you directly (e.g. in your browser settings), contact <a href="mailto:crestwynd@earthlink.net">crestwynd@earthlink.net</a>.

 </p>
 <h4>
     Data Sharing
 </h4>

 <ul className="list1">
     <li>BookingSuite: Your personal data may be shared with BookingSuite B.V. located at Herengracht 597, 1017 CE Amsterdam, the Netherlands, the company which operates the website suite.booking.com.</li>
     <li>Sharing with third parties: We share your personal data with third parties as permitted by law and as described below, including service providers acting on our behalf. We do not sell or rent your personal data.</li>
     <li>Competent authorities: We disclose personal data to law enforcement and other governmental authorities insofar as is required by law or is strictly necessary for the prevention, detection or prosecution of criminal acts and fraud.</li>
 </ul>

 <h4>
     Data Retention
 </h4>
 <p>There is a difference between session Cookies and permanent Cookies. Session Cookies only exist until you close your browser. Permanent Cookies have a longer lifespan and are not automatically deleted once you close your browser. We strive to serve Cookies or allow the serving of Cookies with a maximum lifespan of 5 years. Only in exceptional circumstances (e.g. for security purposes including fraud detection) and where absolutely necessary, a Cookie will have a longer lifespan. If you have questions about specific retention periods, contact us using the contact details included below.</p>

 <h4>
     Questions or Complaints
 </h4>

 <p>
     If you have questions or concerns about our processing of your personal data, or if you want to exercise any of the rights you have under this notice, you are welcome to contact us at <a href="mailto:crestwynd@earthlink.net">crestwynd@earthlink.net.</a>  You can also contact your local data protection authority with questions and complaints.

 </p>

 <h4>
     Changes to the Notice
 </h4>
 <p>
     Just as our business changes constantly, this Cookie Notice will also change from time to time. If you want to see changes made to this Cookie Notice from time to time, we invite you to access this Cookie Notice to see the changes.

 </p>
              </div>
            </div>
          </div>

         
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

export default cookesnotes;
