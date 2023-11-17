# Simple CSV Export for Clerk Users

To run simply run with your Clerk secret key

```
node clerk-user-export.mjs secret-key
```

Writes a file to the current directory "clerk_users.csv" with all users returned from the Clerk API.

Created by [twitter.com/@alexduggleby](https://twitter.com/@alexduggleby)

## Customization

Adapt the schema variable in the script to add/remove fields. Currently supports three different types to map properties from the [Clerk User Object](https://clerk.com/docs/reference/backend-api/tag/Users).

```
const schema = [
  
  // Simply map a property called id from the Clerk User Object and give it a title
  { id: "id", title: "ClerkUserId" },
  
  // Map the first array object from the Clerk User Object
  { id: "email", title: "Email", path: "emailAddresses[0].emailAddress" },
  
  // Convert the property into a UTC ISO Date String
  {
    id: "createdAtUtc",
    title: "Email",
    path: "createdAt",
    convertDateToUtc: true,
  },
  
];
```

