import { Client } from "@notionhq/client";

class NotionService {
  private notion: Client;

  constructor() {
    this.notion = new Client({
      auth: import.meta.env.VITE_NOTION_TOKEN,
    });
  }

  async syncDatabase() {
    try {
      const response = await this.notion.databases.query({
        database_id: import.meta.env.VITE_NOTION_DATABASE_ID,
      });

      const pages = response.results.map((page: any) => ({
        id: page.id,
        title: page.properties.Name?.title[0]?.plain_text || "Untitled",
        content: page.properties.Content?.rich_text[0]?.plain_text || "",
        type: "document",
        parentId: null,
        createdAt: new Date(page.created_time),
        updatedAt: new Date(page.last_edited_time),
      }));

      return pages;
    } catch (error: any) {
      console.error("Error syncing with Notion:", error);
      throw new Error(error.message);
    }
  }

  async createPage(title: string, content: string) {
    try {
      const response = await this.notion.pages.create({
        parent: { database_id: import.meta.env.VITE_NOTION_DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: title } }],
          },
          Content: {
            rich_text: [{ text: { content } }],
          },
        },
      });

      return {
        id: response.id,
        title,
        content,
        type: "document" as const,
        parentId: null,
        createdAt: new Date(response.created_time),
        updatedAt: new Date(response.last_edited_time),
      };
    } catch (error: any) {
      console.error("Error creating Notion page:", error);
      throw new Error(error.message);
    }
  }

  async updatePage(pageId: string, title: string, content: string) {
    try {
      await this.notion.pages.update({
        page_id: pageId,
        properties: {
          Name: {
            title: [{ text: { content: title } }],
          },
          Content: {
            rich_text: [{ text: { content } }],
          },
        },
      });
    } catch (error: any) {
      console.error("Error updating Notion page:", error);
      throw new Error(error.message);
    }
  }
}

export const notionService = new NotionService();
