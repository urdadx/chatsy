import { db } from "@/db";
import * as schema from "@/db/schema";
import { Action, chatbot, session, subscription, user } from "@/db/schema";
import {
  sendOrganizationInvitation,
  sendVerificationEmail,
} from "@/lib/emails/email";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { getActiveOrganization } from "@/lib/hooks/get-active-organization";
import { polar, portal, usage, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN!;
if (!POLAR_ACCESS_TOKEN) {
  throw new Error("Polar access token is not set in environment variables");
}

export const polarClient = new Polar({
  accessToken: POLAR_ACCESS_TOKEN!,
  server: "sandbox",
});

function safeParseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

export const createDefaultActions = async (chatbotId: string) => {
  const defaultActions = [
    {
      chatbotId,
      name: "Knowledge base",
      toolName: "knowledge_base",
      description: "Search the knowledge base for relevant information.",
      isActive: true,
    },
    {
      chatbotId,
      name: "Feedback form",
      toolName: "collect_feedback",
      description:
        "Collects feedback, reviews, complaints, or suggestions from users.",
      isActive: true,
    },
    {
      chatbotId,
      name: "Collect leads",
      toolName: "collect_leads",
      description: "Capture leads from conversations with customers.",
      isActive: true,
    },
    {
      chatbotId,
      name: "Escalate to human",
      toolName: "escalate_to_human",
      description: "Escalates the conversation to a human agent.",
      isActive: true,
    },
  ];

  try {
    await db.insert(Action).values(defaultActions);
    console.log(
      `Created ${defaultActions.length} default actions for chatbot: ${chatbotId}`,
    );
  } catch (error) {
    console.error(
      `Failed to create default actions for chatbot ${chatbotId}:`,
      error,
    );
  }
};

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      console.log("Sending verification email to:", user.email, url);
      await sendVerificationEmail({
        email: user.email,
        username: user.name,
        verificationLink: url,
      });
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "email-password"],
      allowDifferentEmails: false,
    },
  },

  session: {
    additionalFields: {
      activeOrganizationId: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
      activeChatbotId: {
        type: "string",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://192.168.181.95:3001/",
  ],
  allowedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://192.168.181.95:3001/",
  ],
  appName: "padyna",
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    database: {
      generateId: () => uuidv4(),
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          try {
            const organization = await getActiveOrganization(session.userId);
            const activeChatbot = await getActiveChatbotId(session.userId);
            console.log("🏢 Found organization:", organization?.id);
            console.log("🤖 Found chatbot:", activeChatbot);

            return {
              data: {
                ...session,
                activeOrganizationId: organization.id,
                activeChatbotId: activeChatbot,
              },
            };
          } catch (error) {
            console.log(
              "No active organization found for user:",
              session.userId,
            );
          }
          return {
            data: {
              ...session,
              activeOrganizationId: null,
              activeChatbotId: null,
            },
          };
        },
      },
    },
  },
  plugins: [
    reactStartCookies(),
    organization({
      organizationCreation: {
        disabled: false,
        beforeCreate: async ({ organization }) => {
          return {
            data: {
              ...organization,
            },
          };
        },
        afterCreate: async ({ organization, user }) => {
          try {
            const embedToken = `embed_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

            // Create the default chatbot and get its ID
            const [createdChatbot] = await db
              .insert(chatbot)
              .values({
                organizationId: organization.id,
                name: organization.name,
                embedToken: embedToken,
              })
              .returning();

            // set id as activeChatbotId in session
            const activeChatbotId = createdChatbot?.id || null;
            await db.insert(session).values({
              createdAt: new Date(),
              updatedAt: new Date(),
              expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
              token: uuidv4(),
              userId: user.id || "",
              activeChatbotId,
            });

            console.log(
              `Created default chatbot for organization: ${organization.id}`,
            );

            // Create default actions for the chatbot
            if (createdChatbot?.id) {
              await createDefaultActions(createdChatbot.id);
            }
          } catch (error) {
            console.error(
              `Failed to create default chatbot for organization ${organization.id}:`,
              error,
            );
          }
        },
      },
      async sendInvitationEmail(data) {
        const serverUrl =
          process.env.NODE_ENV === "production"
            ? "https://padyna.com"
            : "http://localhost:3001";
        const inviteLink = `${serverUrl}/api/accept-invitation/${data.id}`;
        await sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink,
        });
      },
    }),
    // polar integration plugin
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      getCustomerCreateParams: async ({ user: newUser }) => {
        console.log("🚀 getCustomerCreateParams called for user:", newUser.id);

        try {
          // Look for existing customer by email
          const { result: existingCustomers } =
            await polarClient.customers.list({
              email: newUser.email,
            });

          const existingCustomer = existingCustomers.items[0];

          if (
            existingCustomer?.externalId &&
            existingCustomer.externalId !== newUser.id
          ) {
            console.log(
              `🔗 Found existing customer ${existingCustomer.id} with external ID ${existingCustomer.externalId}`,
            );
            console.log(
              `🔄 Updating user ID from ${newUser.id} to ${existingCustomer.externalId}`,
            );

            // Update the user's ID in database to match the existing external ID
            await db
              .update(user)
              .set({ id: existingCustomer.externalId })
              .where(eq(user.id, newUser.id));

            console.log(
              `✅ Updated user ID to match existing external ID: ${existingCustomer.externalId}`,
            );
          }

          return {};
        } catch (error) {
          console.error("💥 Error in getCustomerCreateParams:", error);
          return {};
        }
      },
      use: [
        portal(),
        usage(),
        webhooks({
          secret:
            process.env.POLAR_WEBHOOK_SECRET! ||
            (() => {
              throw new Error(
                "POLAR_WEBHOOK_SECRET environment variable is required",
              );
            })(),
          onPayload: async ({ data, type }) => {
            if (
              type === "subscription.created" ||
              type === "subscription.active" ||
              type === "subscription.canceled" ||
              type === "subscription.revoked" ||
              type === "subscription.uncanceled" ||
              type === "subscription.updated"
            ) {
              console.log("🎯 Processing subscription webhook:", type);
              console.log("📦 Payload data:", JSON.stringify(data, null, 2));

              try {
                // STEP 1: Extract user ID from customer data
                const userId = data.customer?.externalId;

                // STEP 1.5: Check if user exists to prevent foreign key violations
                let validUserId = null;
                if (userId) {
                  try {
                    const userExists = await db.query.user.findFirst({
                      where: eq(user.id, userId),
                      columns: { id: true },
                    });
                    validUserId = userExists ? userId : null;

                    if (!userExists) {
                      console.warn(
                        `⚠️ User ${userId} not found, creating subscription without user link - will auto-link when user signs up`,
                      );
                    }
                  } catch (error) {
                    console.error("Error checking user existence:", error);
                  }
                } else {
                  console.error("🚨 No external ID found for subscription", {
                    subscriptionId: data.id,
                    customerId: data.customerId,
                  });
                }
                // STEP 2: Build subscription data
                const subscriptionData = {
                  id: data.id,
                  createdAt: new Date(data.createdAt),
                  modifiedAt: safeParseDate(data.modifiedAt),
                  amount: data.amount,
                  currency: data.currency,
                  recurringInterval: data.recurringInterval,
                  status: data.status,
                  currentPeriodStart:
                    safeParseDate(data.currentPeriodStart) || new Date(),
                  currentPeriodEnd:
                    safeParseDate(data.currentPeriodEnd) || new Date(),
                  cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
                  canceledAt: safeParseDate(data.canceledAt),
                  startedAt: safeParseDate(data.startedAt) || new Date(),
                  endsAt: safeParseDate(data.endsAt),
                  endedAt: safeParseDate(data.endedAt),
                  customerId: data.customerId,
                  productId: data.productId,
                  discountId: data.discountId || null,
                  checkoutId: data.checkoutId || "",
                  customerCancellationReason:
                    data.customerCancellationReason || null,
                  customerCancellationComment:
                    data.customerCancellationComment || null,
                  metadata: data.metadata
                    ? JSON.stringify(data.metadata)
                    : null,
                  customFieldData: data.customFieldData
                    ? JSON.stringify(data.customFieldData)
                    : null,
                  userId: validUserId,
                };

                console.log("💾 Final subscription data:", {
                  id: subscriptionData.id,
                  status: subscriptionData.status,
                  userId: subscriptionData.userId,
                  amount: subscriptionData.amount,
                });

                // STEP 3: Use Drizzle's onConflictDoUpdate for proper upsert
                await db
                  .insert(subscription)
                  .values(subscriptionData)
                  .onConflictDoUpdate({
                    target: subscription.id,
                    set: {
                      modifiedAt: subscriptionData.modifiedAt || new Date(),
                      amount: subscriptionData.amount,
                      currency: subscriptionData.currency,
                      recurringInterval: subscriptionData.recurringInterval,
                      status: subscriptionData.status,
                      currentPeriodStart: subscriptionData.currentPeriodStart,
                      currentPeriodEnd: subscriptionData.currentPeriodEnd,
                      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
                      canceledAt: subscriptionData.canceledAt,
                      startedAt: subscriptionData.startedAt,
                      endsAt: subscriptionData.endsAt,
                      endedAt: subscriptionData.endedAt,
                      customerId: subscriptionData.customerId,
                      productId: subscriptionData.productId,
                      discountId: subscriptionData.discountId,
                      checkoutId: subscriptionData.checkoutId,
                      customerCancellationReason:
                        subscriptionData.customerCancellationReason,
                      customerCancellationComment:
                        subscriptionData.customerCancellationComment,
                      metadata: subscriptionData.metadata,
                      customFieldData: subscriptionData.customFieldData,
                      userId: subscriptionData.userId,
                    },
                  });

                console.log("✅ Upserted subscription:", data.id);
              } catch (error) {
                console.error(
                  "💥 Error processing subscription webhook:",
                  error,
                );
                // Don't throw - let webhook succeed to avoid retries
              }
            }
          },
        }),
      ],
    }),
  ],
});
