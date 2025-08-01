import { db } from "@/db";
import * as schema from "@/db/schema";
import { chatbot, user } from "@/db/schema";
import { sendOrganizationInvitation } from "@/lib/emails/email";
import { getActiveOrganization } from "@/lib/hooks/get-active-organization";
import { checkout, polar, portal, usage } from "@polar-sh/better-auth";
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

const polarClient = new Polar({
  accessToken: POLAR_ACCESS_TOKEN!,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: "sandbox",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

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
  appName: "chatsy",
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

            if (organization?.id) {
              return {
                data: {
                  ...session,
                  activeOrganizationId: organization.id,
                },
              };
            }
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
        afterCreate: async ({ organization }) => {
          try {
            await db.insert(chatbot).values({
              organizationId: organization.id,
              name: organization.name,
            });

            console.log(
              `Created default branding for organization: ${organization.id}`,
            );
          } catch (error) {
            console.error(
              `Failed to create default branding for organization ${organization.id}:`,
              error,
            );
          }
        },
      },
      async sendInvitationEmail(data) {
        const inviteLink = `https://example.com/accept-invitation/${data.id}`;
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
        checkout({
          products: [
            {
              productId: "60d0f6e4-f0f3-44a6-8683-38d57aa53077",
              slug: "starter",
            },
          ],
          successUrl: "/success",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
      ],
    }),
  ],
});
