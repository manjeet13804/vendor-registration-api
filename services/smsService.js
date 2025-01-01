const axios = require('axios');
const config = require('../config/config');

class SMSService {
  constructor() {
    this.baseUrl = 'https://control.msg91.com/api/v5';
    this.apiKey = config.sms.apiKey;
    this.senderId = config.sms.senderId;
    this.templateId = config.sms.templates.registration;
  }

  async sendOTP(mobileNumber) {
    try {
      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      
      console.log('Sending OTP:', {
        mobileNumber,
        otp,
        apiKey: this.apiKey,
        senderId: this.senderId,
        templateId: this.templateId
      });

      const response = await axios.post(
        `${this.baseUrl}/flow/`,
        {
          template_id: this.templateId,
          short_url: "0",
          recipients: [{
            mobiles: mobileNumber.replace('+91', ''),
            otp: otp
          }]
        },
        {
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'authkey': this.apiKey
          }
        }
      );

      console.log('MSG91 API Response:', response.data);

      if (response.data.type === 'success' || response.status === 200) {
        return {
          success: true,
          otp: otp
        };
      }
      
      throw new Error(`Failed to send OTP: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error('SMS Service Error:', error.response?.data || error.message);
      throw new Error('Failed to send OTP. Please try again later.');
    }
  }

  async verifyOTP(mobileNumber, otp) {
    // Since we're storing OTP in our database, we don't need to verify with MSG91
    // The verification is handled in the auth routes
    return true;
  }

  async sendTransactionalSMS(mobileNumber, message) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/flow/`,
        {
          template_id: this.templateId,
          short_url: "0",
          recipients: [{
            mobiles: mobileNumber.replace('+91', ''),
            message: message
          }]
        },
        {
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'authkey': this.apiKey
          }
        }
      );

      console.log('MSG91 API Response:', response.data);
      return response.data.type === 'success' || response.status === 200;
    } catch (error) {
      console.error('Transactional SMS Error:', error.response?.data || error.message);
      throw new Error('Failed to send SMS');
    }
  }
}

module.exports = new SMSService();
