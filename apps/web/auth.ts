import { db } from "@/db";
import * as schema from "@/db/schema";
import { Action, chatbot, session, user } from "@/db/schema";
import {
  sendOrganizationInvitation,
  sendVerificationEmail,
} from "@/lib/emails/email";
import { getActiveChatbotId } from "@/lib/hooks/get-active-chatbot";
import { getActiveOrganization } from "@/lib/hooks/get-active-organization";
import { polar, portal, usage } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { reactStartCookies } from "better-auth/react-start";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { v4 as uuidv4 } from "uuid";

const isDevelopment = process.env.NODE_ENV === "development";

const POLAR_ACCESS_TOKEN = process.env.POLAR_ACCESS_TOKEN!;
if (!POLAR_ACCESS_TOKEN) {
  throw new Error("Polar access token is not set in environment variables");
}

export const polarClient = new Polar({
  accessToken: POLAR_ACCESS_TOKEN!,
  server: isDevelopment ? "sandbox" : "production",
});

export const createDefaultActions = async (chatbotId: string) => {
  const defaultActions = [
    {
      chatbotId,
      name: "Give us feedback",
      toolName: "collect_feedback",
      description:
        "Collects feedback, reviews, complaints, or suggestions from users.",
      isActive: true,
      showInQuickMenu: true,
    },
    {
      chatbotId,
      name: "Report an issue",
      toolName: "report_issue",
      description:
        "Allow users to report bugs, problems, or issues they encounter.",
      isActive: true,
      showInQuickMenu: true,
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

  user: {
    additionalFields: {
      isSubscribed: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
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
            const embedToken = `embed_${nanoid(4)}`;

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
      use: [portal(), usage()],
    }),
  ],
});
