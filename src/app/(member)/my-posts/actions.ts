'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { resolvePost, submitPost } from '@/lib/my-posts';
import { can } from '@/lib/permissions';
import type { PostFormState } from '@/lib/post-validate';
import { toPostInput, validatePost } from '@/lib/post-validate';

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

  submitPost(user.email, input);
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
  }
}
