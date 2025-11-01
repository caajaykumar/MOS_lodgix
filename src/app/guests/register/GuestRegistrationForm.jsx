'use client';

import { useEffect, useMemo, useState } from 'react';

// Helper: compute max DOB so age >= 21
function getMaxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 21);
  return d.toISOString().split('T')[0];
}

const initialForm = {
  title: 'Mr.',
  first_name: '',
  last_name: '',
  email: '',
  confirm_email: '',
  dob: '',
  company: 'myorlandostay_website',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  phone: '',
  work_phone: '',
  work_phone_ext: '',
};

export default function GuestRegistrationForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const maxDob = useMemo(getMaxDob, []);

  // Real-time validation
  useEffect(() => {
    validateForm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, form.first_name, form.last_name, form.email, form.confirm_email, form.dob, form.work_phone_ext, form.company, form.address1, form.address2, form.city, form.state, form.zip, form.country, form.phone, form.work_phone]);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateForm(showAll = true) {
    const e = {};

    // Required fields
    if (!form.title) e.title = 'Title is required';
    if (!form.first_name?.trim()) e.first_name = 'First name is required';
    if (!form.last_name?.trim()) e.last_name = 'Last name is required';

    if (!form.email?.trim()) {
      e.email = 'Email is required';
    } else if (!emailRegex.test(form.email.trim())) {
      e.email = 'Enter a valid email address';
    }

    if (!form.confirm_email?.trim()) {
      e.confirm_email = 'Confirm your email';
    } else if (form.email.trim() && form.confirm_email.trim() !== form.email.trim()) {
      e.confirm_email = 'Emails do not match';
    }

    if (!form.dob) {
      e.dob = 'Date of birth is required';
    } else {
      const dob = new Date(form.dob);
      const min = new Date(maxDob);
      if (dob > min) {
        e.dob = 'You must be at least 21 years old';
      }
    }

    // Character limits
    if (form.first_name && form.first_name.length > 64) e.first_name = 'Max 64 characters';
    if (form.last_name && form.last_name.length > 64) e.last_name = 'Max 64 characters';
    if (form.company && form.company.length > 96) e.company = 'Max 96 characters';
    if (form.work_phone_ext && form.work_phone_ext.length > 5) e.work_phone_ext = 'Max 5 characters';

    setErrors(e);

    if (showAll) {
      const keys = Object.keys(e);
      if (keys.length) {
        const el = document.querySelector(`[name="${keys[0]}"]`);
        if (el) el.focus();
      }
    }

    return Object.keys(e).length === 0;
  }

  function buildPayload() {
    return {
      title: form.title,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      company: (form.company?.trim() || 'myorlandostay_website'),
      email: form.email.trim(),
      address: {
        address1: form.address1?.trim() || undefined,
        address2: form.address2?.trim() || undefined,
        city: form.city?.trim() || undefined,
        zip: form.zip?.trim() || undefined,
        country: form.country?.trim() || undefined,
        state: form.state?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        work_phone: form.work_phone?.trim() || undefined,
        work_phone_ext: form.work_phone_ext?.trim() || undefined,
      },
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!validateForm(true)) return;
    if (submitting) return;

    try {
      setSubmitting(true);

      const resp = await fetch(process.env.NEXT_PUBLIC_GUEST_API_URL || 'http://localhost:3000/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok || !data?.success) {
        const errText = data?.error || 'Failed to create guest';
        setMessage({ type: 'error', text: errText });
        return;
      }

      setMessage({ type: 'success', text: 'Guest created successfully.' });
      setForm(initialForm);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submit error:', err);
      setMessage({ type: 'error', text: 'Network or server error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  const formControl = (name, type = 'text', placeholder = '', extraProps = {}) => (
    <input
      type={type}
      name={name}
      id={name}
      className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
      value={form[name]}
      onChange={(e) => setField(name, e.target.value)}
      onBlur={() => validateForm(false)}
      placeholder={placeholder}
      {...extraProps}
    />
  );

  const ErrorText = ({ name }) => (
    errors[name] ? <div className="invalid-feedback d-block mt-1">{errors[name]}</div> : null
  );

  return (
    <>
      <style jsx global>{`
        .guest-form-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem 0;
        }

        .form-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .form-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 3rem 2rem;
          text-align: center;
          color: white;
        }

        .form-header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          font-size: 1rem;
          opacity: 0.95;
          margin: 0;
        }

        .form-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          backdrop-filter: blur(10px);
        }

        .form-icon i {
          font-size: 2.5rem;
        }

        .section-divider {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 3px;
          border-radius: 3px;
          margin: 2rem 0 1.5rem;
        }

        .section-title {
          color: #667eea;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-title i {
          font-size: 1.5rem;
        }

        .form-control {
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
        }

        .form-select {
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
        }

        .form-label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .required-star {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .btn-submit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 0.875rem 3rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-clear {
          background: transparent;
          border: 2px solid #d1d5db;
          color: #6b7280;
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .btn-clear:hover:not(:disabled) {
          border-color: #9ca3af;
          background: #f9fafb;
        }

        .alert-custom {
          border-radius: 10px;
          border: none;
          padding: 1rem 1.25rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .alert-success-custom {
          background: #d1fae5;
          color: #065f46;
        }

        .alert-error-custom {
          background: #fee2e2;
          color: #991b1b;
        }

        .alert-custom i {
          font-size: 1.25rem;
        }

        @media (max-width: 768px) {
          .form-header h1 {
            font-size: 1.5rem;
          }
          
          .form-header {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>

      <div className="guest-form-container">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="form-card">
            {/* Header */}
            <div className="form-header">
              <div className="form-icon">
                <i className="fa fa-user-plus" aria-hidden="true"></i>
              </div>
              <h1>Guest Registration</h1>
              <p>Complete the form below to create your account</p>
            </div>

            {/* Form Body */}
            <div className="p-4 p-md-5">
              {/* Alert Messages */}
              {message && (
                <div className={message.type === 'success' ? 'alert-custom alert-success-custom' : 'alert-custom alert-error-custom'}>
                  <i className={`fa ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} aria-hidden="true"></i>
                  <div>{message.text}</div>
                </div>
              )}

              <form onSubmit={onSubmit} noValidate>
                {/* Personal Information Section */}
                <div className="section-title">
                  <i className="fa fa-user" aria-hidden="true"></i>
                  Personal Information
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-12 col-md-3">
                    <label htmlFor="title" className="form-label">
                      Title<span className="required-star">*</span>
                    </label>
                    <select
                      id="title"
                      name="title"
                      className={`form-select ${errors.title ? 'is-invalid' : ''}`}
                      value={form.title}
                      onChange={(e) => setField('title', e.target.value)}
                    >
                      <option>Mr.</option>
                      <option>Mrs.</option>
                      <option>Ms.</option>
                      <option>Dr.</option>
                      <option>Mr. & Mrs.</option>
                    </select>
                    <ErrorText name="title" />
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="first_name" className="form-label">
                      First Name<span className="required-star">*</span>
                    </label>
                    {formControl('first_name', 'text', 'Enter first name', { maxLength: 64 })}
                    <ErrorText name="first_name" />
                  </div>

                  <div className="col-12 col-md-5">
                    <label htmlFor="last_name" className="form-label">
                      Last Name<span className="required-star">*</span>
                    </label>
                    {formControl('last_name', 'text', 'Enter last name', { maxLength: 64 })}
                    <ErrorText name="last_name" />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="dob" className="form-label">
                      Date of Birth<span className="required-star">*</span>
                    </label>
                    {formControl('dob', 'date', '', { max: maxDob })}
                    <ErrorText name="dob" />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="company" className="form-label">Company</label>
                    {formControl('company', 'text', 'Company name (optional)', { maxLength: 96 })}
                    <ErrorText name="company" />
                  </div>
                </div>

                <div className="section-divider"></div>

                {/* Contact Information Section */}
                <div className="section-title">
                  <i className="fa fa-envelope" aria-hidden="true"></i>
                  Contact Information
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-12 col-md-6">
                    <label htmlFor="email" className="form-label">
                      Email Address<span className="required-star">*</span>
                    </label>
                    {formControl('email', 'email', 'name@example.com')}
                    <ErrorText name="email" />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="confirm_email" className="form-label">
                      Confirm Email<span className="required-star">*</span>
                    </label>
                    {formControl('confirm_email', 'email', 'Confirm your email')}
                    <ErrorText name="confirm_email" />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    {formControl('phone', 'tel', 'Primary phone number')}
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="work_phone" className="form-label">Work Phone</label>
                    {formControl('work_phone', 'tel', 'Work phone')}
                  </div>

                  <div className="col-12 col-md-2">
                    <label htmlFor="work_phone_ext" className="form-label">Ext</label>
                    {formControl('work_phone_ext', 'text', 'Ext', { maxLength: 5 })}
                    <ErrorText name="work_phone_ext" />
                  </div>
                </div>

                <div className="section-divider"></div>

                {/* Address Information Section */}
                <div className="section-title">
                  <i className="fa fa-map-marker" aria-hidden="true"></i>
                  Address Information
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-12 col-md-6">
                    <label htmlFor="address1" className="form-label">Address Line 1</label>
                    {formControl('address1', 'text', 'Street address')}
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="address2" className="form-label">Address Line 2</label>
                    {formControl('address2', 'text', 'Apt, suite, etc. (optional)')}
                  </div>

                  <div className="col-12 col-md-5">
                    <label htmlFor="city" className="form-label">City</label>
                    {formControl('city', 'text', 'City')}
                  </div>

                  <div className="col-12 col-md-4">
                    <label htmlFor="state" className="form-label">State/Province</label>
                    {formControl('state', 'text', 'State or Province')}
                  </div>

                  <div className="col-12 col-md-3">
                    <label htmlFor="zip" className="form-label">ZIP Code</label>
                    {formControl('zip', 'text', 'ZIP/Postal')}
                  </div>

                  <div className="col-12">
                    <label htmlFor="country" className="form-label">Country</label>
                    {formControl('country', 'text', 'Country')}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-5 pt-4">
                  <button
                    type="button"
                    className="btn-clear"
                    onClick={() => setForm(initialForm)}
                    disabled={submitting}
                  >
                    <i className="fa fa-times me-2"></i>
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-check me-2"></i>
                        Register Guest
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Footer Text */}
              <div className="text-center mt-4 pt-3">
                <small className="text-muted">
                  <i className="fa fa-lock me-1"></i>
                  Your information is secure and will be kept confidential
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
