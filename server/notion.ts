import { Client } from "@notionhq/client";

if (!process.env.NOTION_TOKEN) {
  throw new Error("NOTION_TOKEN environment variable is not set");
}

export const notion = new Client({
  auth: process.env.NOTION_TOKEN
});
