// api/webhook/polar.ts
import { db } from "@/db";
import { subscription, user } from "@/db/schema";
import { Webhooks } from "@polar-sh/tanstack-start";
import { createServerFileRoute } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";

function safeParseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

export const ServerRoute = createServerFileRoute("/api/webhook/polar").methods({
  POST: Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
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
            customerCancellationReason: data.customerCancellationReason || null,
            customerCancellationComment:
              data.customerCancellationComment || null,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            customFieldData: data.customFieldData
              ? JSON.stringify(data.customFieldData)
              : null,
            userId: validUserId,
            meters: data.meters,
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
                meters: subscriptionData.meters,
              },
            });

          // STEP 4: Update user's isSubscribed status if userId is valid
          if (validUserId) {
            await db
              .update(user)
              .set({ isSubscribed: true })
              .where(eq(user.id, validUserId));
            console.log(`✅ Updated user ${validUserId} isSubscribed to true`);
          }

          console.log("✅ Upserted subscription:", data.id);
        } catch (error) {
          console.error("💥 Error processing subscription webhook:", error);
          // Don't throw - let webhook succeed to avoid retries
        }
      }
    },
  }),
});
