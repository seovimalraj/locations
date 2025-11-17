import { handleRequest } from '../src/handler.js';

export default async function handler(req: Request): Promise<Response> {
  return handleRequest(req);
}
