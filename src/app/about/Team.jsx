
import Image from 'next/image';
import React from 'react';
const teamMembers = [
  {
    name: 'Manny',
    image: 'https://stssevastorage.blob.core.windows.net/myorlandostay/teams/Manny.jpg',
    description:
      'Involved in IT for over 20 years and Vacation rental management for the last 5 years',
    details: 'M.S in Engineering, MBA.',
  },
  {
    name: 'Trevor',
    image: 'https://stssevastorage.blob.core.windows.net/myorlandostay/teams/Trevor.jpg',
    description: 'Manages properties, involved in construction, works with Disney and other parks',
  },
  {
    name: 'Richa',
    image: 'https://stssevastorage.blob.core.windows.net/myorlandostay/teams/richa.jpg',
    description: 'Involved in IT and manages vacation rentals and back office',
  },
  {
    name: 'Rajiv Sinha',
    image: 'https://stssevastorage.blob.core.windows.net/myorlandostay/teams/rajiv.jpg',
    description:
      'Working with the Travel Industry for over 6 years. Working with MyOrlandoStay from 2012 January. Specializes in Sales & Marketing.',
  },
  {
    name: 'Annie',
    image: 'https://stssevastorage.blob.core.windows.net/myorlandostay/teams/Annie.jpg',
    description:
      'Working with the Travel Industry for over 3 years. Working with MyOrlandoStay from 2021 January. Specializes in Sales & Marketing.',
  },
  {
    name: 'Jenny',
    image: 'https://stssevastorage.blob.core.windows.net/myorlandostay/teams/Jenny.jpg',
    description:
      'An avid traveler herself, Jenny has 15+ years of experience in diverse domains including pharmaceutical, IT, insurance & dotcom. Dedicated to making MyOrlandoStay #1.',
  },
];

const Team = () => {
  

  return (
    <section className="introduction_box_area">
      <div className="main_big_title">
        <h2>
          Meet <span>The Team</span>
        </h2>
      </div>

      <div className="container">
        <div className="row">
          {teamMembers.map((member, index) => (
            <div key={index} className="col-md-3 col-sm-3">
              <div className="team-member">
                <div className="team-img">
                  <Image
                    src={member.image}
                    alt={`team member ${member.name}`}
                    width={300}
                    height={300}
                    className="img-responsive"
                  />
                </div>
                <div className="team-hover">
                  <div className="desk">
                    <p>
                      {member.description}
                      {member.details && (
                        <>
                          <br />
                          <span>{member.details}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="team-title">
                <h5>
                  <b>{member.name}</b>
                </h5>
              </div>
              <div>
                <p>
                  {member.description}
                  {member.details && (
                    <>
                      <br />
                      <span>{member.details}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

       

       
      </div>
    </section>
  );
};

export default Team;
