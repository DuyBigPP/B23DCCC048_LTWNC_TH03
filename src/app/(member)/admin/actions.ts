'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { can } from '@/lib/permissions';
import { moderatePostInDb } from '@/lib/posts';

export async function moderatePost(id: number, status: 'approved' | 'hidden'): Promise<void> {
  const session = await auth();
  if (!can(session?.user?.role, 'post:moderate')) throw new Error('Không có quyền');
  if (status !== 'approved' && status !== 'hidden') throw new Error('Trạng thái không hợp lệ');

  if (moderatePostInDb(id, status)) {
    revalidatePath('/admin');
    revalidatePath('/posts');
    revalidatePath('/');
    revalidatePath(`/posts/${id}`);
  }
}
