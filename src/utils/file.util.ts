import { Readable } from 'stream';

const bufferToBase64 = (buffer: Buffer) => {
  return buffer.toString('base64');
};

export const bufferToBase64Image = (buffer: Buffer) => {
  const base64 = bufferToBase64(buffer);
  return `data:image/jpeg;base64, ${base64}`;
};

export const base64ToBuffer = (base64String: string) => {
  return Buffer.from(base64String, 'base64');
};

const streamToBase64 = (stream: Readable): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const base64 = buffer.toString('base64');
      resolve(base64);
    });
  });
};

export const streamToBase64Image = async (
  stream: Readable,
  mimeType: string,
) => {
  const base64Data = await streamToBase64(stream);

  return `data:${mimeType};base64,${base64Data}`;
};
