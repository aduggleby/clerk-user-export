import { Clerk } from "@clerk/clerk-sdk-node";
import { createObjectCsvWriter } from "csv-writer";

// Get Clerk key as argument
var clerkSecretKey = process.argv[2];

if (!clerkSecretKey || clerkSecretKey.length < 1) {
  console.log("Please provide a Clerk secret key as an argument.");
} else {
  const clerkClient = Clerk({ secretKey: clerkSecretKey });

  const asUtc = (date) =>
    date && new Date(new Date(date).toUTCString()).toISOString();

  const path = "clerk_users.csv";

  const schema = [
    { id: "id", title: "ClerkUserId" },
    { id: "email", title: "To", path: "emailAddresses[0].emailAddress" },
    {
      id: "createdAtUtc",
      title: "CreatedAtUtc",
      path: "createdAt",
      convertDateToUtc: true,
    },
    {
      id: "lastSignInAtUtc",
      title: "LastSignInUtc",
      path: "lastSignInAt",
      convertDateToUtc: true,
    },
    { id: "gender", title: "Gender" },
    { id: "username", title: "Username" },
    { id: "firstName", title: "FirstName" },
    { id: "lastName", title: "LastName" },
  ];

  const csvWriter = createObjectCsvWriter({
    path,
    header: schema,
  });

  try {
    const MAX = 10;
    let users = [];

    while (true) {
      const newUsers = await clerkClient.users.getUserList({
        limit: MAX,
        offset: users.length,
        orderBy: "-created_at",
      });

      if (newUsers.length == 0) break;

      console.log(`Fetched ${newUsers.length} users.`);

      // Convert the users to the schema format
      const convertedUsers = newUsers.map((user) => {
        return schema.reduce((rec, field) => {
          rec[field.id] = (field.path || field.id)
            .replace(/\[([^\[\]]*)\]/g, ".$1.")
            .split(".")
            .filter((t) => t !== "")
            .reduce((acc, path) => acc[path], user);
          if (rec[field.id] && field.convertDateToUtc) {
            rec[field.id] = asUtc(rec[field.id]);
          }
          return rec;
        }, {});
      });

      users = [...users, ...convertedUsers];
    }

    // Then write to CSV
    csvWriter
      .writeRecords(users)
      .then(() => console.log(`The CSV file ${path} was written successfully`));
  } catch (err) {
    console.log(err);
  }
}
