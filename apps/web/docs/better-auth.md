Better Auth provides a type-safe way to extend the user and session schemas. You can add custom fields to your auth config, and the CLI will automatically update the database schema. These additional fields will be properly inferred in functions like useSession, signUp.email, and other endpoints that work with user or session objects.

To add custom fields, use the additionalFields property in the user or session object of your auth config. The additionalFields object uses field names as keys, with each value being a FieldAttributes object containing:

type: The data type of the field (e.g., "string", "number", "boolean").
required: A boolean indicating if the field is mandatory.
defaultValue: The default value for the field (note: this only applies in the JavaScript layer; in the database, the field will be optional).
input: This determines whether a value can be provided when creating a new record (default: true). If there are additional fields, like role, that should not be provided by the user during signup, you can set this to false.

import { betterAuth } from "better-auth";
 
export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // don't allow user to set role
      },
      lang: {
        type: "string",
        required: false,
        defaultValue: "en",
      },
    },
  },
});

//on signup
const res = await auth.api.signUpEmail({
  email: "test@example.com",
  password: "password",
  name: "John Doe",
  lang: "fr",
});
 
//user object
res.user.role; // > "admin"
res.user.lang; // > "fr"