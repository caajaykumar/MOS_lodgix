"use client";
import { useState } from "react";
import LODGIX_CONFIG  from '../../../config/lodgix'

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    zip: "",
    country: "",
    state: "",
    property_id: "",
    from_date: "",
    to_date: "",
    adults: 1,
    children: 0,
    subject: "",
    message: "",
    allow_sms: false,
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      // Prepare request body
      const requestBody = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address1: formData.address1.trim(),
        address2: formData.address2?.trim() || '',
        city: formData.city.trim(),
        zip: formData.zip.trim(),
        country: formData.country.trim(),
        state: formData.state.trim(),
        property_id: parseInt(formData.property_id) || 0,
        from_date: formData.from_date,
        to_date: formData.to_date,
        adults: parseInt(formData.adults) || 1,
        children: parseInt(formData.children) || 0,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        allow_sms: Boolean(formData.allow_sms),
      };

      // Log request details
      console.log('=== REQUEST DETAILS ===');
      console.log('Body:', JSON.stringify(requestBody, null, 2));

      // Make the API call to our Next.js API route
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('=== API ERROR ===');
        console.error('Status:', response.status);
        console.error('Response:', responseData);
        
        let errorMessage = 'Failed to submit inquiry';
        if (responseData.error) {
          errorMessage = responseData.error;
          if (responseData.details) {
            errorMessage += ` (${responseData.details})`;
          }
        }
        throw new Error(errorMessage);
      }

      // Process the successful response
      console.log('=== RESPONSE DETAILS ===');
      console.log('Status:', response.status, response.statusText);
      console.log('Response:', responseData);

      console.log('✅ Inquiry created:', responseData);
      setStatus("✅ Inquiry submitted successfully!");
      
      // Reset form after successful submission
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        zip: "",
        country: "",
        state: "",
        property_id: "",
        from_date: "",
        to_date: "",
        adults: "1",
        children: "0",
        subject: "",
        message: "",
        allow_sms: false
      });
      
    } catch (error) {
      console.error('API Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      setStatus(`❌ ${error.message || 'Failed to submit inquiry. Please try again.'}`);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="h4 mb-0">Send Us an Inquiry</h2>
              <p className="mb-0">We'll get back to you as soon as possible</p>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="first_name" className="form-label">First Name *</label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      className="form-control"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="last_name" className="form-label">Last Name *</label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      className="form-control"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="property_id" className="form-label">Property ID</label>
                    <input
                      type="text"
                      id="property_id"
                      name="property_id"
                      className="form-control"
                      value={formData.property_id}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="from_date" className="form-label">Check-in Date *</label>
                    <input
                      type="date"
                      id="from_date"
                      name="from_date"
                      className="form-control"
                      value={formData.from_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="to_date" className="form-label">Check-out Date *</label>
                    <input
                      type="date"
                      id="to_date"
                      name="to_date"
                      className="form-control"
                      value={formData.to_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="adults" className="form-label d-flex align-items-center">
                      <i className="fas fa-user me-2"></i> Adults
                    </label>
                    <div className="input-group" style={{ width: '100%' }}>
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-user-friends text-muted"></i>
                      </span>
                      <select
                        id="adults"
                        name="adults"
                        className="form-select ps-3"
                        value={formData.adults}
                        onChange={handleChange}
                        style={{
                          backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e\") !important",
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '16px 12px',
                          appearance: 'none',
                          paddingLeft: '2.5rem',
                          cursor: 'pointer',
                          height: '38px',
                          lineHeight: '1.5',
                          paddingTop: '0.375rem',
                          paddingBottom: '0.375rem',
                          minHeight: 'calc(1.5em + 0.75rem + 2px)',
                          width: '100%'
                        }}
                      >
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="children" className="form-label d-flex align-items-center">
                      <i className="fas fa-child me-2"></i> Children
                    </label>
                    <div className="input-group" style={{ width: '100%' }}>
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-child text-muted"></i>
                      </span>
                      <select
                        id="children"
                        name="children"
                        className="form-select ps-3"
                        value={formData.children}
                        onChange={handleChange}
                        style={{
                          backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e\") !important",
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 0.75rem center',
                          backgroundSize: '16px 12px',
                          appearance: 'none',
                          paddingLeft: '2.5rem',
                          cursor: 'pointer',
                          height: '38px',
                          lineHeight: '1.5',
                          paddingTop: '0.375rem',
                          paddingBottom: '0.375rem',
                          minHeight: 'calc(1.5em + 0.75rem + 2px)',
                          width: '100%'
                        }}
                      >
                        {[0, 1, 2, 3, 4].map(num => (
                          <option key={num} value={num}>
                            {num === 0 ? 'No children' : `${num} ${num === 1 ? 'Child' : 'Children'}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-12">
                    <label htmlFor="subject" className="form-label">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="form-control"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this regarding?"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="message" className="form-label">Your Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      className="form-control"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="allow_sms"
                        name="allow_sms"
                        className="form-check-input"
                        checked={formData.allow_sms}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="allow_sms">
                        I agree to receive SMS updates about my inquiry
                      </label>
                    </div>
                  </div>
                  <div className="col-12 mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100"
                      disabled={status && status.includes("Submitting")}
                    >
                      {status && status.includes("Submitting") ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : 'Submit Inquiry'}
                    </button>
                  </div>
                  {status && (
                    <div className="col-12">
                      <div className={`alert ${status.startsWith('✅') ? 'alert-success' : status.startsWith('❌') ? 'alert-danger' : 'alert-info'}`}>
                        {status.replace('✅', '').replace('❌', '')}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
