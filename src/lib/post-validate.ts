import { CATEGORIES, KINDS, PLACES } from '../data/posts';

export interface PostInput {
  title: string; kind: string; category: string; place: string;
  date: string; description: string;
  contactType: string; contact: string;
}
export type PostErrors = Partial<Record<keyof PostInput, string>>;
export interface PostFormState {
  errors: PostErrors; // lỗi từng ô
  values: Partial<PostInput>; // giá trị đã nhập, để hiện lại khi có lỗi
  message?: string; // thông báo chung (thành công hoặc lỗi từ server)
  ok?: boolean; // true nếu message là thông báo thành công
}

const FIELDS: (keyof PostInput)[] = [
  'title', 'kind', 'category', 'place', 'date', 'description', 'contactType', 'contact',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Ngày hôm nay theo giờ máy (không dùng toISOString vì đó là giờ UTC). */
export const today = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const toPostInput = (raw: FormData | Record<string, unknown>): PostInput => {
  const get = (k: string): unknown => (raw instanceof FormData ? raw.get(k) : raw[k]);
  const input = Object.fromEntries(
    FIELDS.map((k) => {
      const v = get(k);
      return [k, typeof v === 'string' ? v : ''];
    }),
  ) as Record<keyof PostInput, string>;
  if (!input.contactType) input.contactType = 'Zalo';
  return input;
};

const isRealDate = (s: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

const PHONE = /^0\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactError = (type: string, contact: string): string | undefined => {
  switch (type) {
    case 'Zalo':
      return PHONE.test(contact) ? undefined : 'Số Zalo gồm 10 chữ số, bắt đầu bằng 0';
    case 'SĐT':
      return PHONE.test(contact) ? undefined : 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0';
    case 'Email':
      return EMAIL.test(contact) ? undefined : 'Email không hợp lệ';
    default:
      return 'Hãy chọn loại liên hệ';
  }
};

/** Nơi duy nhất giữ quy tắc kiểm tra tin đăng. Object rỗng nghĩa là hợp lệ. */
export const validatePost = (input: PostInput, now: string = today()): PostErrors => {
  const errors: PostErrors = {};
  const title = input.title.trim();
  if (title.length < 5) errors.title = 'Tiêu đề tối thiểu 5 ký tự';
  else if (title.length > 80) errors.title = 'Tiêu đề tối đa 80 ký tự';

  if (!(KINDS as string[]).includes(input.kind)) errors.kind = 'Hãy chọn loại tin';
  if (!(CATEGORIES as string[]).includes(input.category)) errors.category = 'Hãy chọn danh mục';
  if (!(PLACES as string[]).includes(input.place)) errors.place = 'Hãy chọn địa điểm';

  if (!isRealDate(input.date)) errors.date = 'Hãy chọn ngày';
  else if (input.date.localeCompare(now) > 0) errors.date = 'Ngày không được ở tương lai';

  if (input.description.trim().length < 20) errors.description = 'Mô tả tối thiểu 20 ký tự';

  const contact = contactError(input.contactType, input.contact.trim());
  if (contact) errors.contact = contact;
  return errors;
};
