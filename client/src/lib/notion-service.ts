import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Document } from "@shared/schema";

class NotionService {
  private notion: Client;
  private databaseId: string;

  constructor() {
    const token = import.meta.env.VITE_NOTION_TOKEN;
    this.databaseId = import.meta.env.VITE_NOTION_DATABASE_ID;

    if (!token || !this.databaseId) {
      throw new Error("Notion configuration is incomplete. Please ensure both VITE_NOTION_TOKEN and VITE_NOTION_DATABASE_ID are set.");
    }

    this.notion = new Client({ auth: token });
  }

  async syncDatabase(): Promise<Partial<Document>[]> {
    try {
      const response = await this.notion.databases.query({
        database_id: this.databaseId,
      });

      return response.results.map((page) => {
        const typedPage = page as PageObjectResponse;
        const title = typedPage.properties.Name?.type === 'title' 
          ? typedPage.properties.Name.title[0]?.plain_text 
          : 'Untitled';
        const content = typedPage.properties.Content?.type === 'rich_text' 
          ? typedPage.properties.Content.rich_text[0]?.plain_text 
          : '';

        return {
          title: title || "Untitled",
          content: content || "",
          type: "document" as const,
          parentId: null,
          notionId: page.id,
        };
      });
    } catch (error: any) {
      console.error("Error syncing with Notion:", error);
      if (error.code === 'unauthorized') {
        throw new Error("Invalid Notion token. Please check your configuration.");
      } else if (error.code === 'object_not_found') {
        throw new Error("Notion database not found. Please check your database ID.");
      }
      throw new Error(error.message || "Failed to sync with Notion");
    }
  }

  async updatePage(pageId: string, title: string, content: string): Promise<void> {
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
      if (error.code === 'unauthorized') {
        throw new Error("Invalid Notion token. Please check your configuration.");
      } else if (error.code === 'object_not_found') {
        throw new Error("Notion page not found. Please check the page ID.");
      }
      throw new Error(error.message || "Failed to update Notion page");
    }
  }
}

export const notionService = new NotionService();