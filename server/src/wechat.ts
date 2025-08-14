import axios from 'axios';
import crypto from 'crypto';

interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

interface UserInfoResponse {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

interface TemplateMessageData {
  [key: string]: {
    value: string;
    color?: string;
  };
}

class WeChatService {
  private appId: string;
  private appSecret: string;
  private token: string;
  private accessToken: string | null = null;
  private accessTokenExpiry: number = 0;

  constructor() {
    this.appId = process.env.WECHAT_APPID || '';
    this.appSecret = process.env.WECHAT_SECRET || '';
    this.token = process.env.WECHAT_TOKEN || '';
  }

  // Verify WeChat server signature
  verifySignature(signature: string, timestamp: string, nonce: string): boolean {
    const arr = [this.token, timestamp, nonce].sort();
    const str = arr.join('');
    const sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex') === signature;
  }

  // Get or refresh access token
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    
    // Check if token is still valid
    if (this.accessToken && this.accessTokenExpiry > now) {
      return this.accessToken;
    }

    try {
      const response = await axios.get<AccessTokenResponse>(
        'https://api.weixin.qq.com/cgi-bin/token',
        {
          params: {
            grant_type: 'client_credential',
            appid: this.appId,
            secret: this.appSecret
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.accessTokenExpiry = now + (response.data.expires_in - 300) * 1000;
      
      console.log('Access token refreshed, expires at:', new Date(this.accessTokenExpiry));
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw new Error('Failed to get WeChat access token');
    }
  }

  // Generate OAuth2 authorization URL
  getOAuthUrl(redirectUri: string, state: string = ''): string {
    const scope = 'snsapi_userinfo'; // Get user info permission
    const params = new URLSearchParams({
      appid: this.appId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      state: state
    });
    
    console.log('params', params);
    return `https://open.weixin.qq.com/connect/oauth2/authorize?${params}#wechat_redirect`;
  }

  // Exchange code for access token and openid
  async getOAuthAccessToken(code: string): Promise<any> {
    try {
      const response = await axios.get(
        'https://api.weixin.qq.com/sns/oauth2/access_token',
        {
          params: {
            appid: this.appId,
            secret: this.appSecret,
            code: code,
            grant_type: 'authorization_code'
          }
        }
      );

      if (response.data.errcode) {
        throw new Error(`WeChat OAuth error: ${response.data.errmsg}`);
      }

      return response.data;
    } catch (error) {
      console.error('Failed to get OAuth access token:', error);
      throw error;
    }
  }

  // Get user info using OAuth access token
  async getUserInfo(accessToken: string, openid: string): Promise<UserInfoResponse> {
    try {
      const response = await axios.get<UserInfoResponse>(
        'https://api.weixin.qq.com/sns/userinfo',
        {
          params: {
            access_token: accessToken,
            openid: openid,
            lang: 'zh_CN'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw error;
    }
  }

  // Create service booking notification template data
  createServiceBookingNotificationData(
    productType: string,
    customerName: string,
    bookingNumber: string,
    expiryDate: string,
    remark: string = ''
  ): TemplateMessageData {
    return {
      first: {
        value: '您好，您已预订成功，请尽快付款。',
        color: '#173177'
      },
      productType: {
        value: productType,
        color: '#173177'
      },
      name: {
        value: customerName,
        color: '#173177'
      },
      number: {
        value: bookingNumber,
        color: '#173177'
      },
      expDate: {
        value: expiryDate,
        color: '#173177'
      },
      remark: {
        value: remark || '如有疑问，请咨询13912345678。',
        color: '#666666'
      }
    };
  }

  // Send service booking notification using your specific template
  async sendServiceBookingNotification(
    openid: string,
    productType: string,
    customerName: string,
    bookingNumber: string,
    expiryDate: string,
    remark?: string,
    url?: string
  ): Promise<boolean> {
    const templateId = process.env.WECHAT_TEMPLATE_GUEST || 'tIkObjUKN-QrkrfqZ_OMS7X0I7aejVUwEqqfgi4YviY';
    const data = this.createServiceBookingNotificationData(
      productType,
      customerName,
      bookingNumber,
      expiryDate,
      remark
    );

    try {
      const result = await this.sendTemplateMessage(openid, templateId, data, url);
      
      if (result) {
        console.log('Service booking notification sent successfully', {
          openid,
          productType,
          bookingNumber,
          templateId
        });
      } else {
        console.error('Failed to send service booking notification', {
          openid,
          productType,
          bookingNumber,
          templateId
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error in sendServiceBookingNotification:', error);
      throw error;
    }
  }

  // Send customer service message to guest to enable chat
  async sendCustomerServiceMessage(
    openid: string, 
    message: string
  ): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      
      const data = {
        touser: openid,
        msgtype: 'text',
        text: {
          content: message
        }
      };

      console.log('Sending customer service message to guest:', {
        openid: openid.substring(0, 8) + '...',
        messageLength: message.length
      });

      const response = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`,
        data
      );

      if (response.data.errcode === 0) {
        console.log('Customer service message sent successfully to guest');
        return true;
      } else {
        console.error('Failed to send customer service message:', {
          errcode: response.data.errcode,
          errmsg: response.data.errmsg
        });
        
        // Common error codes
        if (response.data.errcode === 45015) {
          console.error('Reply time limit exceeded (48 hours)');
        } else if (response.data.errcode === 40001) {
          console.error('Invalid access token');
        } else if (response.data.errcode === 40013) {
          console.error('Invalid OpenID');
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error sending customer service message:', error);
      return false;
    }
  }

}

export default new WeChatService();