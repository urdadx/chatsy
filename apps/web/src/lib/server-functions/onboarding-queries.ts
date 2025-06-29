import { db } from "@/db";
import { branding, question, socialLink, user } from "@/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const User = z.object({
  username: z.string(),
  bio: z.string(),
});

type User = z.infer<typeof User>;

// STEP ONE QUERY: Add bot's name and bio to database
export const addNameBio = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    try {
      return User.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw new Error("Invalid input data");
    }
  })
  .handler(async ({ data: { username, bio } }) => {
    const request = getWebRequest();

    try {
      const session = await auth.api.getSession({
        headers: request?.headers || new Headers(),
      });

      if (!session?.user?.id) {
        throw new Error("Unauthorized: Please log in to update your profile");
      }

      if (username) {
        const existingUser = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.username, username))
          .limit(1);

        if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
          throw new Error("Username is already taken");
        }
      }

      await db
        .update(user)
        .set({
          username: username || null,
          bio: bio || null,
        })
        .where(eq(user.id, session.user.id));

      return {
        success: true,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Error updating user profile:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("unique") ||
          error.message.includes("duplicate")
        ) {
          throw new Error("Username is already taken");
        }

        if (
          error.message.startsWith("Unauthorized") ||
          error.message.startsWith("Username is already taken") ||
          error.message.startsWith("User not found")
        ) {
          throw error;
        }
      }

      throw new Error("Failed to update profile. Please try again later.");
    }
  });

// STEP TWO QUERY: Add bot's color to database
const PrimaryColorSchema = z.object({
  primaryColor: z.string(),
});

export const updatePrimaryColor = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    try {
      return PrimaryColorSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw new Error("Invalid input data");
    }
  })
  .handler(async ({ data: { primaryColor } }) => {
    try {
      const request = getWebRequest();
      const session = await auth.api.getSession({
        headers: request?.headers || new Headers(),
      });

      if (!session?.user?.id) {
        throw new Error(
          "Unauthorized: Please log in to update your bot branding",
        );
      }

      console.log("Updating primary color for user:", session.user.id);

      const existingBranding = await db
        .select({ id: branding.id })
        .from(branding)
        .where(eq(branding.userId, session.user.id))
        .limit(1);

      let result: any;

      if (existingBranding.length === 0) {
        result = await db.insert(branding).values({
          userId: session.user.id,
          name: session.user.name,
          primaryColor,
        });
      } else {
        result = await db
          .update(branding)
          .set({
            primaryColor,
          })
          .where(eq(branding.userId, session.user.id));
      }

      return {
        success: true,
        message: "Primary color updated successfully",
        branding: result[0],
      };
    } catch (error) {
      console.error("Error updating primary color:", error);

      if (error instanceof Error) {
        if (
          error.message.startsWith("Unauthorized") ||
          error.message.startsWith("Validation failed") ||
          error.message.startsWith("Branding not found")
        ) {
          throw error;
        }
      }

      throw new Error(
        "Failed to update primary color. Please try again later.",
      );
    }
  });

// STEP THREE QUERY: Add common questions to database
const addQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  isSuggested: z.boolean().optional().default(false),
});

export const addQuestion = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    try {
      return addQuestionSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation failed: ${error.errors.map((e) => e.message).join(", ")}`,
        );
      }
      throw new Error("Invalid input data");
    }
  })
  .handler(
    async ({ data: { question: questionText, answer, isSuggested } }) => {
      try {
        const request = getWebRequest();
        const session = await auth.api.getSession({
          headers: request?.headers || new Headers(),
        });

        if (!session?.user?.id) {
          throw new Error("Unauthorized: Please log in to add a question");
        }

        await db.insert(question).values({
          userId: session.user.id,
          question: questionText,
          answer,
          isSuggested: isSuggested,
        });

        return {
          success: true,
          message: "Question added successfully",
        };
      } catch (error) {
        console.error("Error adding question:", error);

        if (error instanceof Error) {
          if (
            error.message.startsWith("Unauthorized") ||
            error.message.startsWith("Validation failed")
          ) {
            throw error;
          }
        }

        throw new Error("Failed to add question. Please try again later.");
      }
    },
  );

// STEP FOUR QUERY: Add social links to database
const AddSocialLinksSchema = z.object({
  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string().url("Please enter a valid URL"),
      isConnected: z.boolean().optional().default(true),
    }),
  ),
});

export const addSocialLinks = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    try {
      return AddSocialLinksSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error("Validation failed");
      }
      throw new Error("Invalid input data");
    }
  })
  .handler(async ({ data: { socialLinks } }) => {
    try {
      const request = getWebRequest();
      const session = await auth.api.getSession({
        headers: request?.headers || new Headers(),
      });

      if (!session?.user?.id) {
        throw new Error("Unauthorized: Please log in to add social links");
      }

      const linksToInsert = socialLinks.map((link) => ({
        userId: session.user.id,
        platform: link.platform,
        url: link.url,
        isConnected: link.isConnected || true,
      }));

      const insertedLinks = await db.insert(socialLink).values(linksToInsert);

      return {
        success: true,
        message: "Social links added successfully",
        socialLinks: insertedLinks,
      };
    } catch (error) {
      console.error("Error adding social links:", error);

      if (error instanceof Error) {
        if (
          error.message.startsWith("Unauthorized") ||
          error.message.startsWith("Validation failed")
        ) {
          throw error;
        }
      }

      throw new Error("Failed to add social links. Please try again later.");
    }
  });
