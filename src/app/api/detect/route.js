import { detectSQLInjection } from '../../../lib/detector';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const { input } = await request.json();
    if (typeof input !== 'string') {
      return Response.json({ error: 'Input must be a string' }, { status: 400 });
    }
    const result = detectSQLInjection(input);
    return Response.json(result);
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
