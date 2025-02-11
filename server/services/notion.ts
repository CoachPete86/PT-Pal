import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID;

export interface NotionDocument {
  id: string;
  title: string;
  type: string;
  url: string;
  createdAt: string;
  lastEdited: string;
}

export async function listDocuments(): Promise<NotionDocument[]> {
  try {
    const response = await notion.databases.query({
      database_id: databaseId!,
    });

    return response.results.map((page: any) => ({
      id: page.id,
      title: page.properties.Name?.title[0]?.plain_text || 'Untitled',
      type: page.properties.Status?.select?.name || 'Other',
      url: page.url,
      createdAt: page.created_time,
      lastEdited: page.last_edited_time,
    }));
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    throw new Error('Failed to fetch documents from Notion');
  }
}

export async function createDocument(title: string, type: string, content: string): Promise<NotionDocument> {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId! },
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
          object: 'block',
          type: 'paragraph',
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

    return {
      id: response.id,
      title,
      type,
      url: response.url || '',
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to create document:', error);
    throw new Error('Failed to create document in Notion');
  }
}

export async function getDocument(pageId: string): Promise<string> {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });

    return response.results
      .map((block: any) => {
        if (block.type === 'paragraph') {
          return block.paragraph.rich_text.map((text: any) => text.plain_text).join('');
        }
        return '';
      })
      .join('\n');
  } catch (error) {
    console.error('Failed to fetch document:', error);
    throw new Error('Failed to fetch document from Notion');
  }
}