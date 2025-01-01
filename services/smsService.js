const axios = require('axios');
const config = require('../config/config');

class SMSService {
  constructor() {
    this.baseUrl = config.sms.baseUrl;
    this.apiKey = config.sms.apiKey;
    this.senderId = config.sms.senderId;
  }

  async sendOTP(mobileNumber) {
    try {
      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      
      const response = await axios.post(`${this.baseUrl}/otp`, {
        template_id: "YOUR_TEMPLATE_ID", // Replace with your MSG91 template ID
        mobile: mobileNumber.replace('+91', ''),
        authkey: this.apiKey,
        otp: otp,
        otp_length: 6,
        sender: this.senderId
      });

      if (response.data.type === 'success') {
        return {
          success: true,
          otp: otp // In production, encrypt this before storing
        };
      }
      
      throw new Error('Failed to send OTP');
    } catch (error) {
      console.error('SMS Service Error:', error);
      throw new Error('Failed to send OTP. Please try again later.');
    }
  }

  async verifyOTP(mobileNumber, otp) {
    try {
      const response = await axios.post(`${this.baseUrl}/otp/verify`, {
        authkey: this.apiKey,
        mobile: mobileNumber.replace('+91', ''),
        otp: otp
      });

      return response.data.type === 'success';
    } catch (error) {
      console.error('OTP Verification Error:', error);
      throw new Error('Invalid OTP. Please try again.');
    }
  }

  async sendTransactionalSMS(mobileNumber, message) {
    try {
      const response = await axios.post(`${this.baseUrl}/flow/`, {
        authkey: this.apiKey,
        mobile: mobileNumber.replace('+91', ''),
        sender: this.senderId,
        message: message,
        route: config.sms.route
      });

      return response.data.type === 'success';
    } catch (error) {
      console.error('Transactional SMS Error:', error);
      throw new Error('Failed to send SMS');
    }
  }
}

module.exports = new SMSService();
