import { Document } from 'langchain/document';
import { readFile } from 'fs/promises';
import { BaseDocumentLoader } from 'langchain/document_loaders';
import * as Papa from 'papaparse';
import path from 'path';

export abstract class BufferLoader extends BaseDocumentLoader {
  constructor(public filePathOrBlob: string | Blob) {
    super();
  }

  protected abstract parse(
    raw: Buffer,
    metadata: Document['metadata'],
  ): Promise<Document[]>;

  public async load(): Promise<Document[]> {
    let buffer: Buffer;
    let metadata: Record<string, string>;
    if (typeof this.filePathOrBlob === 'string') {
      buffer = await readFile(this.filePathOrBlob);
      metadata = { source: this.filePathOrBlob };
    } else {
      buffer = await this.filePathOrBlob
        .arrayBuffer()
        .then((ab) => Buffer.from(ab));
      metadata = { source: 'blob', blobType: this.filePathOrBlob.type };
    }
    return this.parse(buffer, metadata);
  }
}

export class CustomPDFLoader extends BufferLoader {
  public async parse(
    raw: Buffer,
    metadata: Document['metadata'],
  ): Promise<Document[]> {
    const { pdf } = await PDFLoaderImports();
    const fileExtension = path.extname(metadata.source);

    if (fileExtension === '.pdf') {
      const parsed = await pdf(raw);
      return [
        new Document({
          pageContent: parsed.text,
          metadata: {
            ...metadata,
            pdf_numpages: parsed.numpages,
          },
        }),
      ];
    } else if (fileExtension === '.txt') {
      const text = raw.toString('utf-8');
      return [
        new Document({
          pageContent: text,
          metadata,
        }),
      ];
    } else if (fileExtension === '.csv') {
      // Parse CSV files
      const csvData = raw.toString('utf-8');
      const parsedCsv = parseCsv(csvData);

      // Extract the relevant text from the parsed CSV data
      const text = extractTextFromCsv(parsedCsv.data);
      return [
        new Document({
          pageContent: text,
          metadata,
        }),
      ];
    }

    // Handle other file types if needed

    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}

function parseCsv(data: string): Papa.ParseResult<any> {
  return Papa.parse(data);
}

function extractTextFromCsv(parsedCsv: any[]): string {
  // Extract the relevant text from the parsed CSV data and return it
  // Adjust this logic based on your specific CSV structure and requirements
  return parsedCsv.map((row) => row.join(' ')).join(' ');
}

async function PDFLoaderImports() {
  try {
    // the main entrypoint has some debug code that we don't want to import
    const { default: pdf } = await import('pdf-parse/lib/pdf-parse.js');
    return { pdf };
  } catch (e) {
    console.error(e);
    throw new Error(
      'Failed to load pdf-parse. Please install it with eg. `npm install pdf-parse`.',
    );
  }
}
