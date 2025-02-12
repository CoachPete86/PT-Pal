import { Client } from "@notionhq/client";

if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY is not set");
}

if (!process.env.NOTION_DATABASE_ID) {
  throw new Error("NOTION_DATABASE_ID is not set");
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

export interface NotionDocument {
  id: string;
  title: string;
  type: string;
  url?: string; // Make url optional since it might not always be available
  createdAt: string;
  lastEdited: string;
}

export async function listDocuments(): Promise<NotionDocument[]> {
  try {
    console.log("Fetching documents from database:", databaseId);
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    return response.results.map((page: any) => {
      console.log("Processing page:", page.id);
      return {
        id: page.id,
        title: page.properties.Name?.title[0]?.plain_text || "Untitled",
        type: page.properties.Status?.select?.name || "Other",
        url: `https://notion.so/${page.id.replace(/-/g, '')}`,
        createdAt: page.created_time,
        lastEdited: page.last_edited_time,
      };
    });
  } catch (error: any) {
    console.error("Failed to fetch documents:", error);
    if (error.code === "object_not_found") {
      throw new Error("Notion database not found. Please check your database ID.");
    }
    throw new Error(`Failed to fetch documents: ${error.message}`);
  }
}

export async function createDocument(
  title: string,
  type: string,
  content: string,
): Promise<NotionDocument> {
  try {
    console.log("Creating document:", { title, type });
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
        Status: {
          select: {
            name: type,
          },
        },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                text: {
                  content,
                },
              },
            ],
          },
        },
      ],
    });

    console.log("Document created successfully:", response.id);

    // Construct the document URL using the page ID
    const notionUrl = `https://notion.so/${response.id.replace(/-/g, '')}`;

    return {
      id: response.id,
      title,
      type,
      url: notionUrl,
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error("Failed to create document:", error);
    if (error.code === "validation_error") {
      throw new Error(
        "Invalid document structure. Please ensure your Notion database has the required properties: Name (title) and Status (select).",
      );
    }
    throw new Error(`Failed to create document: ${error.message}`);
  }
}

export async function getDocument(pageId: string): Promise<string> {
  try {
    console.log("Fetching document content:", pageId);
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    const content = response.results
      .map((block: any) => {
        if (block.type === "paragraph") {
          return block.paragraph.rich_text
            .map((text: any) => text.plain_text)
            .join("");
        }
        return "";
      })
      .join("\n");

    console.log("Document content fetched successfully");
    return content;
  } catch (error: any) {
    console.error("Failed to fetch document:", error);
    if (error.code === "object_not_found") {
      throw new Error("Document not found");
    }
    throw new Error(`Failed to fetch document: ${error.message}`);
  }
}