# WeChat Official Account POC

A proof of concept for WeChat International Official Account integration with booking functionality and template messaging.

## Features

- WeChat OAuth2 authentication to get OpenID
- Simple booking form submission
- Template message sending to both guest and support team
- React frontend with TypeScript
- Express backend with TypeScript
- PM2 deployment configuration

## Prerequisites

- Node.js (v18+)
- npm
- PM2 (`npm install -g pm2`)
- WeChat International Official Account (verified)

## WeChat Official Account Setup

1. **Create Official Account**
   - Register at [WeChat Official Platform](https://mp.weixin.qq.com/)
   - Complete verification process

2. **Configure OAuth2**
   - Go to "接口权限" (Interface Permissions)
   - Enable "网页授权" (Web Authorization)
   - Add your domain to "网页授权域名" (OAuth Domain)

3. **Configure Server**
   - Go to "基本配置" (Basic Configuration)
   - Add your server URL
   - Set verification token

4. **Create Template Messages**
   - Go to "模板消息" (Template Messages)
   - Create two templates:
     - Guest confirmation template
     - Support notification template
   - Note the template IDs

5. **Add Menu**
   - Go to "自定义菜单" (Custom Menu)
   - Add a button linking to your website

## Installation

1. **Clone the repository**
   ```bash
   cd wechat-poc2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   cp client/.env.example client/.env
   ```
   Edit `.env` and `client/.env` with your actual values

4. **Build the project**
   ```bash
   npm run build
   ```

## Development

Run both frontend and backend in development mode:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- React frontend on http://localhost:3000

## Production Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

3. **Monitor logs**
   ```bash
   pm2 logs
   ```

4. **Save PM2 configuration**
   ```bash
   pm2 save
   pm2 startup
   ```

## API Endpoints

- `GET /api/wechat/auth` - Initiate WeChat OAuth
- `GET /api/wechat/callback` - OAuth callback handler
- `GET /api/user/info` - Get current user info
- `POST /api/booking/submit` - Submit booking form
- `GET /api/health` - Health check

## Project Structure

```
wechat-poc2/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main app component
│   │   ├── BookingForm.tsx # Booking form
│   │   └── api.ts         # API client
│   └── build/             # Production build
├── server/                 # Express backend
│   ├── src/
│   │   ├── index.ts       # Server entry
│   │   ├── wechat.ts      # WeChat integration
│   │   └── routes.ts      # API routes
│   └── dist/              # Compiled TypeScript
├── ecosystem.config.js     # PM2 configuration
├── .env                   # Environment variables
└── package.json           # Dependencies
```

## Testing Flow

1. Access your website through WeChat app
2. Click the authorization button
3. Approve WeChat authorization
4. Fill in the booking form
5. Submit and verify template messages are received

## Troubleshooting

1. **Authorization fails**
   - Check domain whitelist in WeChat platform
   - Verify APPID and SECRET are correct
   - Check server logs for errors

2. **Template messages not sent**
   - Verify template IDs are correct
   - Check access token is valid
   - Ensure OpenIDs are correct

3. **PM2 issues**
   - Check logs: `pm2 logs`
   - Restart: `pm2 restart all`
   - Check status: `pm2 status`

## Security Notes

- Never commit `.env` files to version control
- Use HTTPS in production
- Implement rate limiting for production
- Add proper error handling for production
- Consider adding database for persistent storage

## License

MIT