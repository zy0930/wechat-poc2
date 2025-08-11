import React, { useState, useEffect } from 'react';
import { submitBooking, BookingData, BookingResponse } from './api';
import './BookingForm.css';

interface BookingFormProps {
  openid: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ openid }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const bookingData: BookingData = {
      openid,
      ...formData,
    };

    try {
      const result = await submitBooking(bookingData);
      setBookingResult(result);
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        phone: '',
        date: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || '提交失败，请重试');
      console.error('Booking submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-form-container">
      <h2>预约信息</h2>
      
      {success && bookingResult && (
        <div className="success-message">
          <h3>预约成功！</h3>
          <p>预约编号: {bookingResult.bookingId}</p>
          <p>
            {bookingResult.guestMessageSent 
              ? '✅ 确认消息已发送到您的微信' 
              : '⚠️ 确认消息发送失败'}
          </p>
          <p>
            {bookingResult.supportMessageSent 
              ? '✅ 客服已收到通知' 
              : '⚠️ 客服通知发送失败'}
          </p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="name">姓名 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="请输入您的姓名"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">电话 *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={loading}
            pattern="[0-9]{11}"
            placeholder="请输入11位手机号码"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">预约日期 *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            disabled={loading}
            min={today}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="submit-button"
        >
          {loading ? '提交中...' : '提交预约'}
        </button>
      </form>

      <div className="info-text">
        <p>* 必填项</p>
        <p>提交后，您将收到微信模板消息确认</p>
        <p>我们的客服团队会尽快与您联系</p>
      </div>
    </div>
  );
};

export default BookingForm;