import mammoth from 'mammoth';

/**
 * Parses DOCX file buffer into clean, format-preserved HTML using mammoth.js.
 * Preserves bold, underline, lists, headers, and tables perfectly.
 */
export async function parseDocxToHtml(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ buffer });
    return result.value; // The generated HTML string
  } catch (error) {
    console.error('Error parsing DOCX file:', error);
    throw new Error('Failed to parse DOCX file structure. Ensure the file is not corrupted.');
  }
}
