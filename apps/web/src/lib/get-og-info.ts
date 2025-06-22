export async function extractOpenGraphInfo(link: string): Promise<{
  previewImage: string | null;
  previewTitle: string | null;
  previewDescription: string | null;
}> {
  try {
    const response = await fetch(
      `/api/v1/og-preview?url=${encodeURIComponent(link)}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch preview: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      previewImage: data.previewImage,
      previewTitle: data.previewTitle,
      previewDescription: data.previewDescription,
    };
  } catch (error) {
    console.error("Error extracting OpenGraph info:", error);
    return {
      previewImage: null,
      previewTitle: null,
      previewDescription: null,
    };
  }
}
