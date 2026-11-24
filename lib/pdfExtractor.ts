import zlib from "zlib";

export function extractTextFromPdfBuffer(buffer: Buffer): string {
  const content = buffer.toString("latin1");
  const textPieces: string[] = [];

  // 1. Căutăm stream-uri comprimate sau necomprimate
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(content)) !== null) {
    const rawStream = match[1];
    let streamText = "";

    // Încercăm decompresia zlib (FlateDecode)
    try {
      const decompressed = zlib.inflateSync(Buffer.from(rawStream, "latin1"));
      streamText = decompressed.toString("latin1");
    } catch {
      // Dacă nu este comprimat cu Flate, folosim conținutul brut
      streamText = rawStream;
    }

    // Extragem fragmentele de text marcate cu Tj sau TJ
    // Format: (Text) Tj
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(streamText)) !== null) {
      textPieces.push(cleanPdfString(tjMatch[1]));
    }

    // Format: [(T) 10 (ext)] TJ
    const arrayRegex = /\[([^\]]+)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;
    while ((arrayMatch = arrayRegex.exec(streamText)) !== null) {
      const innerTj = /\(([^)]+)\)/g;
      let innerMatch: RegExpExecArray | null;
      let combined = "";
      while ((innerMatch = innerTj.exec(arrayMatch[1])) !== null) {
        combined += cleanPdfString(innerMatch[1]);
      }
      if (combined.trim()) {
        textPieces.push(combined);
      }
    }
  }

  // 2. Fallback: dacă nu am găsit text în stream-uri, căutăm șiruri de text lizibil
  if (textPieces.length === 0) {
    const directRegex = /\(([^)]{3,})\)/g;
    while ((match = directRegex.exec(content)) !== null) {
      const cleaned = cleanPdfString(match[1]);
      if (/^[a-zA-Z0-9ăîâșțĂÎÂȘȚ\s.,:;!?'"()\-–—]{4,}$/.test(cleaned)) {
        textPieces.push(cleaned);
      }
    }
  }

  return textPieces.join(" ").replace(/\s+/g, " ").trim();
}

function cleanPdfString(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "")
    .replace(/\\t/g, "\t")
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}
