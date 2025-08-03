# WhatsApp Business Integration for Chatsy

## ✅ Implementation Status

### COMPLETED ✅
1. **Database Schema Extensions** - WhatsApp fields added to existing tables
2. **Backend API Endpoints** - Complete WhatsApp Business API integration
3. **Authentication Flow** - OAuth connection to WhatsApp Business
4. **Webhook Processing** - Message receiving and AI response generation
5. **Frontend Components** - WhatsApp integration UI in admin panel
6. **Message Processing** - AI response generation using existing chat system

### Implementation Details

#### 🗄️ Database Schema Extensions
- Extended `chatbot` table with WhatsApp fields
- Extended `chat` table for multi-channel support (web/whatsapp)
- New `whatsappMessageMetadata` table for WhatsApp-specific data
- Integrated with existing `account` table for OAuth tokens

#### 🔌 Backend API Endpoints
- `/api/integrations/whatsapp/auth/connect` - Initiate OAuth flow
- `/api/integrations/whatsapp/auth/callback` - Handle OAuth callback
- `/api/integrations/whatsapp/settings/$chatbotId` - Manage settings
- `/api/integrations/whatsapp/webhooks/verify` - Webhook verification
- `/api/integrations/whatsapp/webhooks/receive` - Process incoming messages

#### 🎨 Frontend Integration
- WhatsApp dialog component for setup and configuration
- Integrated into existing integrations page
- Settings management for phone numbers and welcome messages
- Connection status indicators

## 🚀 Quick Setup Guide

### 1. Environment Configuration

Copy the example environment file and configure your WhatsApp Business API credentials:

```bash
cp .env.whatsapp.example .env.local
```

Required environment variables:
```env
WHATSAPP_APP_ID=your_app_id
WHATSAPP_APP_SECRET=your_app_secret  
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
APP_URL=https://yourdomain.com
```

### 2. WhatsApp Business Setup

1. **Create WhatsApp Business Account**
   - Go to [Facebook Business Manager](https://business.facebook.com)
   - Create or select a business account
   - Add WhatsApp Business Account

2. **Set up WhatsApp Business API**
   - Create a new app in [Facebook Developers](https://developers.facebook.com)
   - Add WhatsApp Business API product
   - Configure webhook endpoints:
     - Webhook URL: `https://yourdomain.com/api/integrations/whatsapp/webhooks/receive`
     - Verify Token: Your `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

3. **Get Required IDs**
   - Business Account ID (from Meta Business Manager)
   - Phone Number ID (from WhatsApp Business API settings)
   - Webhook verification token (you create this)

### 3. Platform Configuration

1. **Connect WhatsApp Account**
   - Go to Admin → Integrations
   - Click "Connect" on WhatsApp card
   - Complete OAuth authorization
   - Enter Phone Number ID and Business Account ID

2. **Configure Settings**
   - Enable WhatsApp integration
   - Set welcome message
   - Configure phone number settings

### 4. Testing

1. **Verify Webhook**
   ```bash
   curl -X GET "https://yourdomain.com/api/integrations/whatsapp/webhooks/verify?hub.mode=subscribe&hub.challenge=test&hub.verify_token=YOUR_VERIFY_TOKEN"
   ```

2. **Test Message Flow**
   - Send a WhatsApp message to your business number
   - Check chat logs in admin panel
   - Verify AI response is sent back

## 📋 Migration Notes

### Database Migration
The database schema has been updated with new fields. Ensure your database is migrated:

```bash
pnpm db:push  # or your migration command
```

### Required Tables
- ✅ `chatbot` (extended with WhatsApp fields)
- ✅ `chat` (extended with channel support)  
- ✅ `message` (existing, no changes)
- ✅ `whatsappMessageMetadata` (new table)
- ✅ `account` (existing, stores WhatsApp tokens)

## 🔧 Technical Implementation

### Message Flow
1. **Incoming Message**: WhatsApp → Webhook → Process → Store in `chat`/`message`
2. **AI Processing**: Generate response using existing AI system
3. **Response**: Send back via WhatsApp Business API
4. **Storage**: Store response in database with metadata

### Authentication
- Uses existing OAuth pattern with `account` table
- Provider ID: `"whatsapp-business"`
- Stores access tokens, refresh tokens, and expiration

### Integration Points
- **Existing Chat System**: WhatsApp conversations appear as normal chats
- **Existing AI Pipeline**: Same AI response generation as web chat
- **Existing Analytics**: WhatsApp usage tracked in existing system
- **Existing User Management**: Same organization/permission model

## 🛠️ Development Notes

### Key Files Created/Modified
- `src/routes/api/integrations/whatsapp/` - All WhatsApp API endpoints
- `src/lib/ai/whatsapp-message-processor.ts` - Message processing logic
- `src/components/integrations/whatsapp-dialog.tsx` - UI component
- `src/db/schema.ts` - Extended with WhatsApp fields

### Architecture Decisions
- **Integrated Approach**: Extends existing systems rather than creating separate ones
- **Channel-Agnostic**: Chat system supports multiple channels (web, WhatsApp, future: Telegram, etc.)
- **Reusable Components**: Leverages existing authentication, AI, and storage systems

## 📚 Additional Resources

- [WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta Business Manager](https://business.facebook.com)
- [Facebook Developers Console](https://developers.facebook.com)

## 🔜 Future Enhancements

- **Rich Media Support**: Images, documents, videos
- **Template Messages**: Marketing and notification templates
- **Broadcast Messages**: Send messages to multiple users
- **WhatsApp Business Profile**: Business info and catalog integration
- **Advanced Analytics**: WhatsApp-specific metrics and insights
```sql
-- Add channel source to existing chat table
ALTER TABLE chat ADD COLUMN channel varchar(20) DEFAULT 'web'; -- 'web', 'whatsapp', 'telegram', etc.
ALTER TABLE chat ADD COLUMN external_user_id text; -- WhatsApp phone number, Telegram user ID, etc.
ALTER TABLE chat ADD COLUMN external_user_name text; -- External platform display name
```

**Minimal new tables for WhatsApp-specific metadata:**
```sql
-- WhatsApp message metadata (extends existing message table)
CREATE TABLE whatsapp_message_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES message(id) ON DELETE CASCADE,
  whatsapp_message_id text UNIQUE,
  status varchar DEFAULT 'sent', -- sent, delivered, read, failed
  timestamp timestamp NOT NULL,
  created_at timestamp DEFAULT NOW()
);
```

**Use existing `account` table for WhatsApp OAuth:**
```sql
-- No new table needed - use existing account table with:
-- provider_id: 'whatsapp-business'
-- access_token: encrypted WhatsApp access token
-- Additional metadata in existing fields
```

#### 2.2 API Endpoints Structure

```
/api/integrations/whatsapp/
├── auth/
│   ├── connect          # Initiate WhatsApp Business connection (extends existing OAuth)
│   ├── callback         # Handle OAuth callback (uses existing account table)
│   └── disconnect       # Disconnect WhatsApp account
├── settings/
│   ├── [chatbotId]      # Get/Update WhatsApp settings for specific chatbot
│   └── toggle           # Enable/disable WhatsApp for chatbot
├── webhooks/
│   ├── verify          # Webhook verification
│   └── receive         # Receive webhook events (creates entries in existing chat/message tables)
└── analytics/
    └── [organizationId] # WhatsApp analytics (integrates with existing analytics)
```

### 3. Implementation Steps

#### 3.1 Database Migration

**Step 1: Extend existing tables**
```typescript
// Add to existing schema.ts
export const chatbot = pgTable("chatbot", {
  // ...existing fields...
  whatsappEnabled: boolean("whatsapp_enabled").notNull().default(false),
  whatsappPhoneNumberId: text("whatsapp_phone_number_id"),
  whatsappBusinessAccountId: text("whatsapp_business_account_id"),
  whatsappWelcomeMessage: text("whatsapp_welcome_message")
    .default("Hello! 👋 How can I help you today?"),
  whatsappSettings: jsonb("whatsapp_settings").default({}),
  // ...existing fields...
});

export const chat = pgTable("Chat", {
  // ...existing fields...
  channel: varchar("channel", { enum: ["web", "whatsapp", "telegram"] })
    .notNull()
    .default("web"),
  externalUserId: text("external_user_id"), // WhatsApp phone number
  externalUserName: text("external_user_name"), // WhatsApp contact name
  // ...existing fields...
});

// New minimal table for WhatsApp metadata
export const whatsappMessageMetadata = pgTable("whatsapp_message_metadata", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  messageId: uuid("message_id")
    .notNull()
    .references(() => message.id, { onDelete: "cascade" }),
  whatsappMessageId: text("whatsapp_message_id").unique(),
  status: varchar("status").notNull().default("sent"),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

**Step 2: Use existing account table for WhatsApp OAuth**
```typescript
// No new tables needed - WhatsApp tokens stored in existing account table:
// providerId: "whatsapp-business"
// accessToken: encrypted WhatsApp access token
// scope: WhatsApp permissions
// Additional metadata in existing metadata field
```

#### 3.2 Backend Infrastructure Integration

##### Step 1: Environment Configuration
```env
# WhatsApp Business API
WHATSAPP_APP_ID=your_app_id
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_API_VERSION=v18.0
WHATSAPP_BASE_URL=https://graph.facebook.com/v22.0
```

##### Step 2: Extend Existing OAuth System
```typescript
// Extend existing auth system to support WhatsApp
// /src/routes/api/integrations/whatsapp/auth/connect.ts
export async function POST({ request, locals }) {
  const { organizationId } = await request.json();
  const { user } = locals;
  
  // Use existing OAuth pattern
  const oauthUrl = generateWhatsAppOAuthUrl({
    clientId: process.env.WHATSAPP_APP_ID,
    redirectUri: `${process.env.APP_URL}/api/integrations/whatsapp/auth/callback`,
    scope: 'whatsapp_business_management,whatsapp_business_messaging',
    state: generateSecureState(user.id, organizationId)
  });
  
  return json({ authUrl: oauthUrl });
}

// /src/routes/api/integrations/whatsapp/auth/callback.ts
export async function GET({ url, locals }) {
  // Store in existing account table with providerId: "whatsapp-business"
  const account = await db.insert(account).values({
    providerId: "whatsapp-business",
    userId: user.id,
    accessToken: encryptedToken,
    // Store WhatsApp-specific data in existing fields
  });
}
```

##### Step 3: Webhook Handler Using Existing Chat System
```typescript
// /src/routes/api/integrations/whatsapp/webhooks/receive.ts
export async function POST({ request }) {
  const data = await request.json();
  
  for (const entry of data.entry) {
    for (const change of entry.changes) {
      if (change.field === 'messages') {
        await processWhatsAppMessage(change.value);
      }
    }
  }
  
  return new Response('OK');
}

async function processWhatsAppMessage(messageData) {
  const { from, text } = messageData.messages[0];
  const phoneNumberId = messageData.metadata.phone_number_id;
  
  // Find chatbot by phone number ID
  const chatbot = await db.query.chatbot.findFirst({
    where: eq(chatbot.whatsappPhoneNumberId, phoneNumberId)
  });
  
  // Create or find existing chat using existing system
  let chat = await db.query.chat.findFirst({
    where: and(
      eq(chat.organizationId, chatbot.organizationId),
      eq(chat.channel, 'whatsapp'),
      eq(chat.externalUserId, from)
    )
  });
  
  if (!chat) {
    chat = await db.insert(chat).values({
      title: `WhatsApp: ${from}`,
      organizationId: chatbot.organizationId,
      channel: 'whatsapp',
      externalUserId: from,
      userId: null, // Anonymous external user
    });
  }
  
  // Store message using existing message table
  await db.insert(message).values({
    chatId: chat.id,
    role: 'user',
    content: text?.body || '',
    parts: [{ type: 'text', content: text?.body || '' }]
  });
  
  // Generate AI response using existing system
  const response = await generateAIResponse(chat.id, chatbot);
  
  // Send via WhatsApp and store response
  await sendWhatsAppMessage(phoneNumberId, from, response);
  await db.insert(message).values({
    chatId: chat.id,
    role: 'assistant',
    content: response,
    parts: [{ type: 'text', content: response }]
  });
}

```

#### 3.3 Frontend Integration

##### Step 1: Extend Existing Chatbot Settings
```typescript
// Add WhatsApp toggle to existing chatbot settings page
// /src/components/chatbot-settings/integrations-tab.tsx
export function IntegrationsTab({ chatbot }: { chatbot: Chatbot }) {
  const [whatsappEnabled, setWhatsappEnabled] = useState(chatbot.whatsappEnabled);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business Integration</CardTitle>
          <CardDescription>
            Connect your WhatsApp Business account to allow customers to chat via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              checked={whatsappEnabled}
              onCheckedChange={setWhatsappEnabled}
            />
            <Label>Enable WhatsApp Integration</Label>
          </div>
          
          {whatsappEnabled && !chatbot.whatsappPhoneNumberId && (
            <Button onClick={handleWhatsAppConnect} className="mt-4">
              Connect WhatsApp Business
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

##### Step 2: Extend Existing Chat Interface
```typescript
// Modify existing chat components to show channel indicator
// /src/components/chat/chat-message.tsx
export function ChatMessage({ message, chat }: { message: Message; chat: Chat }) {
  const channelIcon = {
    web: <Globe className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4 text-green-600" />,
    telegram: <Send className="h-4 w-4 text-blue-600" />
  };
  
  return (
    <div className="flex items-start space-x-3">
      <div className="flex items-center space-x-1">
        {channelIcon[chat.channel]}
        <Avatar>
          {/* existing avatar logic */}
        </Avatar>
      </div>
      {/* existing message content */}
    </div>
  );
}
```

##### Step 3: Extend Existing Analytics Dashboard
```typescript
// Add WhatsApp metrics to existing analytics
// /src/components/analytics/channel-breakdown.tsx
export function ChannelBreakdown({ organizationId }: { organizationId: string }) {
  const [channelStats, setChannelStats] = useState({
    web: 0,
    whatsapp: 0,
    telegram: 0
  });
  
  // Use existing analytics API with channel filter
  useEffect(() => {
    fetchChannelAnalytics(organizationId).then(setChannelStats);
  }, [organizationId]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages by Channel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Web Chat</span>
            </span>
            <span>{channelStats.web}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <span>WhatsApp</span>
            </span>
            <span>{channelStats.whatsapp}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

### 4. Integration Benefits

#### 4.1 Unified Platform Advantages
- **Single Dashboard**: WhatsApp conversations appear alongside web chats
- **Shared Knowledge Base**: Same training data works across all channels
- **Unified Analytics**: All channels report to existing analytics system
- **Single Billing**: WhatsApp usage counted in existing credit system
- **Consistent AI**: Same bot personality and responses across channels
- **Centralized Management**: One interface to manage all customer interactions

#### 4.2 Minimal Infrastructure Changes
- **80% Code Reuse**: Leverage existing chat, message, and analytics systems
- **Existing OAuth Flow**: Use current account management for WhatsApp tokens
- **Current UI Components**: Extend existing chat interface with channel indicators
- **Same Database**: Minimal new tables, mostly extend existing ones

### 5. Security & Compliance

#### 5.1 Data Protection (Using Existing Systems)
- **Token Security**: WhatsApp tokens encrypted using existing account encryption
- **Rate Limiting**: Apply existing API rate limiting to WhatsApp endpoints
- **User Permissions**: Use existing organization/member permissions for WhatsApp access
- **Webhook Security**: Verify signatures using existing security patterns

#### 5.2 Compliance Integration
- **GDPR**: Integrate with existing privacy controls and data retention
- **WhatsApp Policies**: Implement business API compliance alongside existing policies
- **Audit Trail**: WhatsApp interactions logged in existing audit systems

### 6. Configuration & Settings (Integrated)

#### 6.1 Chatbot Settings Extension
```typescript
// Extend existing chatbot settings with WhatsApp options
interface WhatsAppSettings {
  enabled: boolean;
  welcomeMessage: string;
  businessHours: {
    enabled: boolean;
    timezone: string;
    schedule: Record<string, { enabled: boolean; start: string; end: string }>;
    outOfHoursMessage: string;
  };
  autoReply: boolean;
  handoverKeywords: string[];
}
```

#### 6.2 Integration with Existing Features
- **Welcome Messages**: Reuse existing chatbot initial message system
- **Business Hours**: Integrate with existing organization settings
- **Analytics**: WhatsApp metrics flow into existing dashboard
- **Lead Capture**: WhatsApp contacts create entries in existing lead table

### 7. Implementation Timeline (Integrated Approach)

#### Week 1: Foundation & Schema
- Extend existing database schema (chatbot, chat, message tables)
- Set up WhatsApp app and webhook infrastructure
- Configure environment variables

#### Week 2: Backend Integration
- Extend existing OAuth system for WhatsApp
- Implement webhook handler using existing chat system
- Integrate with existing message processing pipeline

#### Week 3: Frontend Integration
- Add WhatsApp toggle to existing chatbot settings
- Extend existing chat interface with channel indicators
- Update existing analytics to include WhatsApp metrics

#### Week 4: Testing & Deployment
- Test with existing QA processes
- Deploy using existing CI/CD pipeline
- Monitor using existing observability tools

### 8. Success Metrics (Platform Integration)

#### 8.1 Technical Metrics
- **Zero Breaking Changes**: Existing functionality remains unaffected
- **Performance**: WhatsApp messages processed in < 3 seconds using existing pipeline
- **Reliability**: 99.9% uptime leveraging existing infrastructure

#### 8.2 User Experience Metrics
- **Seamless Setup**: < 2 minutes to enable WhatsApp on existing chatbot
- **Unified View**: All customer interactions visible in single dashboard
- **Feature Parity**: Same AI quality and features across web and WhatsApp

#### 8.3 Business Metrics
- **Adoption**: 30% of existing users enable WhatsApp within first month
- **Engagement**: 20% increase in total customer interactions
- **Retention**: Users with multi-channel bots show higher retention

### 9. Future Multi-Channel Expansion

#### 9.1 Platform Architecture Benefits
With this integrated approach, adding other channels becomes straightforward:

**Telegram Integration:**
- Add `telegram_enabled` and `telegram_bot_token` to chatbot table
- Set `channel: 'telegram'` in chat table
- Reuse existing message processing and AI systems

**Instagram/Messenger:**
- Similar pattern with existing OAuth account system
- Same unified chat interface
- Consistent analytics and management

#### 9.2 Roadmap
1. **Phase 1**: WhatsApp (current plan)
2. **Phase 2**: Telegram Bot API
3. **Phase 3**: Instagram Direct Messages  
4. **Phase 4**: Facebook Messenger
5. **Phase 5**: SMS/Voice integration

---

## Summary

This integration plan leverages Chatsy's existing robust infrastructure to add WhatsApp support with minimal disruption. By extending current tables and reusing existing systems, we achieve:

- **Fast Implementation**: 4 weeks vs 10+ weeks for separate system
- **Lower Risk**: Building on proven, stable infrastructure
- **Better UX**: Unified experience for users managing multiple channels
- **Scalable Foundation**: Easy expansion to other messaging platforms
- **Cost Effective**: 80% less development effort through code reuse

The approach treats WhatsApp as another input/output channel for existing chatbots rather than a separate product, providing a seamless multi-channel experience.
