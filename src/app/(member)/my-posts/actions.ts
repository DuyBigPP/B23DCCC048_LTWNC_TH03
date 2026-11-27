'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { saveImage } from '@/lib/images';
import { resolvePost, submitPost } from '@/lib/my-posts';
import { can } from '@/lib/permissions';
import type { PostFormState } from '@/lib/post-validate';
import { toPostInput, validateImage, validatePost } from '@/lib/post-validate';

// Server Action là endpoint công khai: luôn tự kiểm tra quyền bên trong.
export async function createPostAction(
  _prev: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  const input = toPostInput(formData);
  const session = await auth();
  const user = session?.user;
  if (!user?.email || !can(user.role, 'post:create')) {
    return { errors: {}, values: input, message: 'Không có quyền' };
  }

  const errors = validatePost(input);
  if (Object.keys(errors).length > 0) return { errors, values: input };

  const raw = formData.get('image');
  const image = raw instanceof File ? raw : null;
  const imageError = validateImage(image);
  if (imageError) return { errors: {}, values: input, message: imageError };

  const post = submitPost(user.email, input);
  if (image && image.size > 0) {
    saveImage(post.id, { type: image.type, bytes: new Uint8Array(await image.arrayBuffer()) });
  }
  revalidatePath('/my-posts');
  return { errors: {}, values: {}, message: 'Đã gửi tin, chờ kiểm duyệt', ok: true };
}

export async function resolvePostAction(id: number): Promise<void> {
  const session = await auth();
  const user = session?.user;
  if (!user?.email || !can(user.role, 'post:resolve')) throw new Error('Không có quyền');

  if (resolvePost(user.email, id) === 'ok') {
    revalidatePath('/my-posts');
    revalidatePath('/posts');
    revalidatePath('/');
    revalidatePath(`/posts/${id}`);
    revalidatePath('/sitemap.xml');
  }
}
