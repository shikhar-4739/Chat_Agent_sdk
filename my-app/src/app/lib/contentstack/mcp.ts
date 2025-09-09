
const CONTENTSTACK_MCP_URL = process.env.MCP_URL;

/**
 * Search entries in Contentstack via MCP REST wrapper
 */
export async function searchEntriesMCP(contentType: string, query: string, contentStack_api_key: string, contentStack_delivery_token: string) {
  console.log(`Searching for ${contentType} entries matching "${query}" via MCP REST`);

  try {
    const url = `${CONTENTSTACK_MCP_URL}/entries?content_type=${encodeURIComponent(contentType)}`;
    const res = await fetch(url, {
    headers: {
      "x-api-key": contentStack_api_key,
      "x-delivery-token": contentStack_delivery_token,
    },
  });
    if (!res.ok) {
      throw new Error(`MCP REST search failed: ${res.status} ${res.statusText}`);
    }

    const entries = await res.json();
    console.log(`MCP REST search returned ${entries.length} results`);
    // console.log("Entries:", JSON.stringify(entries, null, 2));
    return entries;
  } catch (error) {
    console.error("Error in searchEntriesMCP:", error);
    throw error;
  }
}

/**
 * Fetch a specific entry by UID via MCP REST wrapper
 */
export async function getEntryByUidMCP(contentType: string, entryUid: string) {
  console.log(`Fetching ${contentType} entry with UID: ${entryUid} via MCP REST`);

  try {
    const url = `${CONTENTSTACK_MCP_URL}/entries/${entryUid}?content_type=${encodeURIComponent(contentType)}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`MCP REST getEntry failed: ${res.status} ${res.statusText}`);
    }

    const entry = await res.json();
    console.log(`MCP REST getEntry returned:`, entry);
    return entry;
  } catch (error) {
    console.error("Error in getEntryByUidMCP:", error);
    throw error;
  }
}
