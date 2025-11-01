import React from 'react'

const BookingForm = () => {
  return (
    <>
         <div className="col-md-4">
                            <div className="search_right_sidebar">
                                <div className="book_room_area">
                                    <div className="book_room_box">
                                        <div className="book_table_item">
                                            <h3>check availability</h3>
                                        </div>
                                        <div className="book_table_item">
                                            <div className="input-append date form_datetime">
                                                <input size="16" type="text" readOnly placeholder="Arrival Date" />
                                                <span className="add-on"><i className="fa fa-calendar" aria-hidden="true"></i></span>
                                            </div>
                                        </div>
                                        <div className="book_table_item">
                                            <div className="input-append date form_datetime">
                                                <input size="16" type="text" readOnly placeholder="Departure Date" />
                                                <span className="add-on"><i className="fa fa-calendar" aria-hidden="true"></i></span>
                                            </div>
                                        </div>
                                        <div className="book_table_item">
                                            <select className="form-control" tabIndex="-98">
                                                <option> Select Adults</option>
                                                <option> 1</option>
                                                <option> 2</option>
                                                <option> 3</option>
                                                <option> 4</option>
                                                <option> 5</option>
                                                <option> 6</option>
                                                <option> 7</option>
                                                <option> 8</option>
                                            </select>
                                        </div>
                                        <div className="book_table_item">
                                            <select className="form-control" tabIndex="-98">
                                                <option> Select Child</option>
                                                <option> 1</option>
                                                <option> 2</option>
                                                <option> 3</option>
                                                <option> 4</option>
                                                <option> 5</option>
                                                <option> 6</option>
                                                <option> 7</option>
                                                <option> 8</option>
                                            </select>
                                        </div>
                                        <div className="book_table_item">
                                            <select className="form-control" tabIndex="-98">
                                                <option> Select Pets </option>
                                                <option> Yes</option>
                                                <option> No</option>
                                            </select>
                                        </div>
                                        <div className="book_table_item">
                                            <a className="book_now_btn" href="https://www.lodgix.com/booking-calendar/websites/25634/properties/62271/">
                                                Reserve now
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
    </>
  )
}

export default BookingForm