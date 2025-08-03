# WhatsApp Business Integration

This guide covers the complete WhatsApp Business API integration for Chatsy, allowing customers to interact with your AI chatbots directly through WhatsApp.

## 🎯 Features

- ✅ **Two-way messaging** - Customers can message your WhatsApp Business number
- ✅ **AI-powered responses** - Same AI system as web chat responds via WhatsApp  
- ✅ **Unified chat management** - WhatsApp conversations appear in admin panel
- ✅ **Multi-organization support** - Each organization can connect their own WhatsApp
- ✅ **Real-time webhook processing** - Instant message processing and responses
- ✅ **OAuth integration** - Secure WhatsApp Business account connection

## 🚀 Quick Start

### 1. Prerequisites

Before setting up WhatsApp integration, ensure you have:

- **WhatsApp Business Account** - Verified business account
- **Facebook Business Manager** - Access to Meta Business Manager
- **Developer Account** - Facebook Developer account with app creation permissions
- **Phone Number** - Business phone number for WhatsApp Business
- **HTTPS Domain** - Secure domain for webhook endpoints

### 2. WhatsApp Business API Setup

#### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click "Create App" → "Business" 
3. Enter app name and contact email
4. Add "WhatsApp Business Platform" product

#### Step 2: Configure WhatsApp Product
1. In your app, go to WhatsApp → Getting Started
2. Note your **App ID** and **App Secret**
3. Add webhook endpoint: `https://yourdomain.com/api/integrations/whatsapp/webhooks/receive`
4. Set verify token (you choose this value)
5. Subscribe to webhook fields: `messages`

#### Step 3: Get Business Account & Phone Number
1. Go to WhatsApp → API Setup
2. Note your **Business Account ID**
3. Add and verify your phone number
4. Note your **Phone Number ID**

### 3. Environment Configuration

Add these environment variables to your `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_APP_ID=your_app_id_here
WHATSAPP_APP_SECRET=your_app_secret_here  
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token_here

# Application URL (for OAuth redirects)
APP_URL=https://yourdomain.com
```

### 4. Platform Setup

#### Step 1: Connect WhatsApp Account
1. Log in to your Chatsy admin panel
2. Go to **Settings** → **Integrations**
3. Find WhatsApp integration card
4. Click **"Connect"**
5. Complete OAuth authorization with Facebook
6. You'll be redirected back to Chatsy

#### Step 2: Configure Integration
1. Enable WhatsApp integration toggle
2. Enter your **Phone Number ID** (from Step 2.3 above)
3. Enter your **Business Account ID** (from Step 2.3 above)
4. Set a welcome message for new WhatsApp users
5. Click **"Save Settings"**

### 5. Test Integration

#### Verify Webhook
Test webhook connectivity:
```bash
curl -X GET "https://yourdomain.com/api/integrations/whatsapp/webhooks/verify?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=YOUR_VERIFY_TOKEN"
# Should return: test123
```

#### Test Message Flow
1. Send a WhatsApp message to your business number
2. Check admin panel → **Chats** for new WhatsApp conversation
3. Verify AI response is sent back to WhatsApp
4. Response should appear in chat logs

## 📱 User Experience

### For Your Customers
1. **Discovery**: Customers find your WhatsApp Business number
2. **First Message**: Send any message to start conversation
3. **Welcome**: Receive configured welcome message
4. **AI Chat**: Interact with AI using natural language
5. **Support**: Get instant AI-powered customer support

### For Your Team
1. **Unified Dashboard**: All WhatsApp chats appear in admin panel
2. **Chat History**: Full conversation history with each customer
3. **Analytics**: WhatsApp usage included in platform analytics
4. **Management**: Enable/disable integration per chatbot

## 🔧 Technical Details

### Architecture
- **Webhook Endpoint**: `/api/integrations/whatsapp/webhooks/receive`
- **OAuth Flow**: Uses existing account system with provider `"whatsapp-business"`
- **Message Storage**: WhatsApp conversations stored as `channel: "whatsapp"` in existing chat system
- **AI Processing**: Uses same AI pipeline as web chat

### Database Schema
WhatsApp integration extends existing tables:

```sql
-- chatbot table extensions
whatsapp_enabled: boolean
whatsapp_phone_number_id: text  
whatsapp_business_account_id: text
whatsapp_welcome_message: text
whatsapp_settings: jsonb

-- chat table extensions  
channel: "web" | "whatsapp" | "telegram"
external_user_id: text (WhatsApp phone number)
external_user_name: text (Display name)

-- New whatsappMessageMetadata table
message_id: text (links to message.id)
whatsapp_message_id: text (WhatsApp's message ID)
status: "sent" | "received" | "delivered" | "read" | "failed"
timestamp: timestamp
```

### Message Flow
1. **Receive**: WhatsApp webhook → Process incoming message
2. **Store**: Save user message to database with metadata
3. **Process**: Generate AI response using existing chat system
4. **Send**: Send AI response back via WhatsApp Business API
5. **Track**: Store outgoing message with delivery status

## 🛠️ Development

### Local Development
For local testing with WhatsApp webhooks:

1. **Use ngrok for HTTPS tunnel**:
   ```bash
   ngrok http 3001
   # Use the HTTPS URL for webhook endpoint
   ```

2. **Set webhook URL** in Facebook App:
   ```
   https://your-ngrok-url.ngrok.io/api/integrations/whatsapp/webhooks/receive
   ```

3. **Test locally** with your WhatsApp Business number

### File Structure
```
src/
├── routes/api/integrations/whatsapp/
│   ├── auth/
│   │   ├── connect.ts          # OAuth initiation
│   │   └── callback.ts         # OAuth callback handler
│   ├── settings/
│   │   └── $chatbotId.ts       # Settings management
│   └── webhooks/
│       ├── verify.ts           # Webhook verification
│       └── receive.ts          # Message processing
├── lib/ai/
│   └── whatsapp-message-processor.ts  # AI response generation
└── components/integrations/
    ├── integrations.tsx        # Main integrations page
    ├── whatsapp-dialog.tsx     # WhatsApp setup dialog
    └── integration-card.tsx    # Integration card component
```

## 🔒 Security

### Webhook Security
- **Signature Verification**: All webhooks verified using app secret
- **HTTPS Only**: Webhooks only accepted over HTTPS
- **Token Validation**: Verify token validates webhook subscription

### Data Protection
- **Access Tokens**: Stored securely in database with encryption
- **User Privacy**: Customer phone numbers handled according to privacy policy
- **Rate Limiting**: API calls subject to Meta's rate limits

## 📊 Analytics & Monitoring

### Metrics Tracked
- **Message Volume**: Incoming/outgoing message counts
- **Response Time**: AI response generation time
- **User Engagement**: Conversation length and frequency
- **Error Rates**: Failed message delivery rates

### Monitoring
- **Webhook Health**: Monitor webhook endpoint uptime
- **API Status**: Track WhatsApp Business API availability  
- **Error Logging**: Comprehensive error logging for debugging

## 🚨 Troubleshooting

### Common Issues

#### "Webhook verification failed"
- Check `WHATSAPP_WEBHOOK_VERIFY_TOKEN` matches Facebook app settings
- Ensure webhook URL is accessible via HTTPS
- Verify webhook endpoint returns exact challenge value

#### "No WhatsApp access token found"
- Complete OAuth flow in admin panel
- Check account table has entry with `providerId: "whatsapp-business"`
- Verify token hasn't expired

#### "Messages not being received"
- Check webhook subscription is active in Facebook app
- Verify webhook URL is correct and accessible
- Check application logs for webhook processing errors

#### "AI responses not sent"
- Verify Phone Number ID is correct in settings
- Check WhatsApp Business API quotas haven't been exceeded
- Ensure access token has `whatsapp_business_messaging` permission

### Debug Mode
Enable detailed logging by setting:
```env
DEBUG=whatsapp:*
```

## 📞 Support

### Meta/Facebook Support
- [WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp)
- [Facebook Business Help Center](https://www.facebook.com/business/help)
- [Meta Developer Community](https://developers.facebook.com/community)

### Chatsy Platform Support
- Check application logs for error details
- Review webhook processing in admin panel
- Test integration step-by-step using this guide

## 🔜 Roadmap

### Upcoming Features
- **Rich Media Support**: Send/receive images, documents, audio
- **Template Messages**: Pre-approved marketing messages
- **Broadcast Messaging**: Send messages to multiple users
- **WhatsApp Business Profile**: Business info integration
- **Advanced Analytics**: WhatsApp-specific insights

### API Enhancements
- **Message Status Tracking**: Read receipts and delivery status
- **User Profile Information**: Access to WhatsApp profile data
- **Group Chat Support**: Support for WhatsApp group conversations
- **Automated Responses**: Time-based and trigger-based automation
