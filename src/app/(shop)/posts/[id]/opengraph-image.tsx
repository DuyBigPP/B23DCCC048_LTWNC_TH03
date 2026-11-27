import { ImageResponse } from 'next/og';
import { formatDate } from '@/lib/format';
import { getPublicPost } from '@/lib/posts';

export const alt = 'Tin đăng PTIT Found';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPublicPost(Number(id));
  const lost = post?.kind === 'Thất lạc';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 72, background: '#fff', borderTop: '24px solid #b91c1c',
        }}
      >
        <div style={{ fontSize: 36, color: '#b91c1c', fontWeight: 700 }}>PTIT Found</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {post && (
            <div
              style={{
                display: 'flex', alignSelf: 'flex-start', fontSize: 32, padding: '8px 24px', borderRadius: 999,
                background: lost ? '#fee2e2' : '#dcfce7', color: lost ? '#991b1b' : '#166534',
              }}
            >
              {post.kind}
            </div>
          )}
          <div style={{ fontSize: 68, fontWeight: 700, color: '#1f2937' }}>
            {post ? post.title : 'Tìm đồ thất lạc trong trường PTIT'}
          </div>
        </div>
        <div style={{ fontSize: 32, color: '#6b7280' }}>
          {post ? `${post.place} · ${formatDate(post.date)}` : 'ptit-found'}
        </div>
      </div>
    ),
    size,
  );
}
