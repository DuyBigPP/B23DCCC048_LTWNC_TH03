import { getImage } from '@/lib/images';

export async function GET(_req: Request, ctx: RouteContext<'/api/images/[id]'>) {
  const { id } = await ctx.params;
  const image = getImage(Number(id));
  if (!image) return new Response('Không tìm thấy ảnh', { status: 404 });
  return new Response(new Blob([image.bytes as BlobPart], { type: image.type }), {
    headers: { 'Content-Type': image.type, 'Cache-Control': 'public, max-age=3600' },
  });
}
