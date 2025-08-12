import { Router, Request, Response } from 'express';
import wechatService from './wechat';

const router = Router();

// WeChat server verification
router.get('/api/wechat/verify', (req: Request, res: Response) => {
  const { signature, timestamp, nonce, echostr } = req.query;
  
  if (wechatService.verifySignature(
    signature as string,
    timestamp as string,
    nonce as string
  )) {
    res.send(echostr);
  } else {
    res.status(401).send('Invalid signature');
  }
});

// Initiate WeChat OAuth
router.get('/api/wechat/auth', (req: Request, res: Response) => {
  const redirectUri = `${process.env.SERVER_URL}/api/wechat/callback`;
  const state = req.query.state as string || '';
  console.log('redirectUri', redirectUri);
  console.log('state', state);
  const authUrl = wechatService.getOAuthUrl(redirectUri, state);
  console.log('authUrl', authUrl);
  res.redirect(authUrl);
});

// Handle WeChat OAuth callback
router.get('/api/wechat/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    // Get access token and openid
    const tokenData = await wechatService.getOAuthAccessToken(code as string);
    
    // Get user info
    const userInfo = await wechatService.getUserInfo(
      tokenData.access_token,
      tokenData.openid
    );

    // Store user info in session
    (req.session as any).wechatUser = {
      openid: userInfo.openid,
      nickname: userInfo.nickname,
      headimgurl: userInfo.headimgurl
    };

    // Redirect to frontend booking page with user info
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/booking?authorized=true&openid=${userInfo.openid}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to authorize with WeChat' });
  }
});

// Get current user info from session
router.get('/api/user/info', (req: Request, res: Response) => {
  const user = (req.session as any).wechatUser;
  
  if (!user) {
    return res.status(401).json({ error: 'Not authorized' });
  }
  
  res.json(user);
});

// Submit booking and send template messages
router.post('/api/booking/submit', async (req: Request, res: Response) => {
  const { openid, name, phone, date } = req.body;
  
  // Validate input
  if (!openid || !name || !phone || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate booking ID
  const bookingId = `BK${Date.now()}`;
  
  try {
    // Send confirmation message to guest
    const guestTemplateId = process.env.WECHAT_TEMPLATE_GUEST || '';
    const guestMessageData = wechatService.createBookingConfirmationData(
      name,
      phone,
      date,
      bookingId
    );
    
    const guestMessageSent = await wechatService.sendTemplateMessage(
      openid,
      guestTemplateId,
      guestMessageData
    );

    // In a real application, you would save the booking to database here
    // For POC, we'll just return success
    
    res.json({
      success: true,
      bookingId,
      guestMessageSent,
      message: 'Booking submitted successfully'
    });
  } catch (error) {
    console.error('Failed to submit booking:', error);
    res.status(500).json({ 
      error: 'Failed to submit booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// WeChat domain verification
router.get('/MP_verify_6GIw6gWF6x17riAH.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send('6GIw6gWF6x17riAH');
});

// Health check endpoint
router.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;