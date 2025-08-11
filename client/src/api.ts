import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface UserInfo {
  openid: string;
  nickname: string;
  headimgurl: string;
}

export interface BookingData {
  openid: string;
  name: string;
  phone: string;
  date: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId: string;
  guestMessageSent: boolean;
  supportMessageSent: boolean;
  message: string;
}

// Get current user info
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await api.get<UserInfo>('/api/user/info');
  return response.data;
};

// Submit booking
export const submitBooking = async (data: BookingData): Promise<BookingResponse> => {
  const response = await api.post<BookingResponse>('/api/booking/submit', data);
  return response.data;
};

// Initiate WeChat authorization
export const initiateWeChatAuth = () => {
  window.location.href = `${API_BASE_URL}/api/wechat/auth`;
};

export default api;