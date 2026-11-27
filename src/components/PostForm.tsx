'use client';

import { useActionState } from 'react';
import { CATEGORIES, KINDS, PLACES } from '@/data/posts';
import type { PostFormState, PostInput } from '@/lib/post-validate';

interface Props {
  action: (prev: PostFormState, formData: FormData) => Promise<PostFormState>;
}

const INITIAL: PostFormState = { errors: {}, values: {} };
const CONTACT_TYPES = ['Zalo', 'SĐT', 'Email'];

export default function PostForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const v = state.values;

  // Các ô có id, aria-describedby trỏ tới lỗi ngay bên dưới.
  const field = (name: keyof PostInput) => ({
    id: `post-${name}`,
    name,
    defaultValue: v[name] ?? '',
    'aria-invalid': state.errors[name] ? true : undefined,
    'aria-describedby': state.errors[name] ? `post-${name}-error` : undefined,
  });
  const error = (name: keyof PostInput) =>
    state.errors[name] && (
      <p id={`post-${name}-error`} role="alert">{state.errors[name]}</p>
    );
  const options = (list: string[]) => list.map((o) => <option key={o} value={o}>{o}</option>);

  return (
    // React 19 xóa form sau mỗi lần gửi: đổi key để dựng lại các ô với giá trị server trả về.
    <form key={JSON.stringify(v)} action={formAction} className="stack" noValidate>
      <div className="field">
        <label htmlFor="post-title">Tiêu đề</label>
        <input {...field('title')} />
        {error('title')}
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="post-kind">Loại tin</label>
          <select {...field('kind')}>
            <option value="">-- Chọn --</option>
            {options(KINDS)}
          </select>
          {error('kind')}
        </div>
        <div className="field">
          <label htmlFor="post-category">Danh mục</label>
          <select {...field('category')}>
            <option value="">-- Chọn --</option>
            {options(CATEGORIES)}
          </select>
          {error('category')}
        </div>
        <div className="field">
          <label htmlFor="post-place">Địa điểm</label>
          <select {...field('place')}>
            <option value="">-- Chọn --</option>
            {options(PLACES)}
          </select>
          {error('place')}
        </div>
        <div className="field">
          <label htmlFor="post-date">Ngày</label>
          <input type="date" {...field('date')} />
          {error('date')}
        </div>
      </div>
      <div className="field">
        <label htmlFor="post-description">Mô tả</label>
        <textarea {...field('description')} />
        {error('description')}
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="post-contactType">Loại liên hệ</label>
          <select {...field('contactType')} defaultValue={v.contactType || 'Zalo'}>
            {options(CONTACT_TYPES)}
          </select>
          {error('contactType')}
        </div>
        <div className="field">
          <label htmlFor="post-contact">Thông tin liên hệ</label>
          <input {...field('contact')} />
          {error('contact')}
        </div>
      </div>
      <div>
        <button type="submit" disabled={pending}>
          Đăng tin
        </button>
      </div>
      {state.message && (
        <p className={state.ok ? 'message ok' : 'message'}>{state.message}</p>
      )}
    </form>
  );
}
