'use client';

import GuestRegistrationForm from './GuestRegistrationForm';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

export default function GuestRegisterPage() {
  return (
    <>
      <Breadcrumb
        title="Guest Registration"
        breadcrumbs={[
          { name: 'Home', link: '/', active: false },
          { name: 'Guests', link: '/guests', active: false },
          { name: 'Register', link: '/guests/register', active: true },
        ]}
      />
      <div className="container" style={{ marginTop: '20px', marginBottom: '20px' }}>
        <GuestRegistrationForm />
      </div>
    </>
  );
}
