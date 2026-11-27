import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PostFormState } from '@/lib/post-validate';
import PostForm from './PostForm';

type Action = (prev: PostFormState, formData: FormData) => Promise<PostFormState>;
const mockAction = (result: PostFormState) => vi.fn<Action>().mockResolvedValue(result);

describe('PostForm', () => {
  it('action trả errors thì lỗi hiện ra dưới đúng ô', async () => {
    const user = userEvent.setup();
    const action = mockAction({
      errors: { title: 'Tiêu đề tối thiểu 5 ký tự', contact: 'Số Zalo gồm 10 chữ số, bắt đầu bằng 0' },
      values: { title: 'abc' },
    });
    render(<PostForm action={action} />);

    await user.click(screen.getByRole('button', { name: 'Đăng tin' }));

    expect(await screen.findByLabelText('Tiêu đề')).toHaveAccessibleDescription('Tiêu đề tối thiểu 5 ký tự');
    expect(screen.getByLabelText('Thông tin liên hệ')).toHaveAccessibleDescription(
      'Số Zalo gồm 10 chữ số, bắt đầu bằng 0',
    );
    expect(screen.getAllByRole('alert').map((e) => e.textContent)).toEqual([
      'Tiêu đề tối thiểu 5 ký tự',
      'Số Zalo gồm 10 chữ số, bắt đầu bằng 0',
    ]);
    expect(screen.getByLabelText('Tiêu đề')).toHaveValue('abc');
  });

  it('điền hợp lệ thì action được gọi 1 lần với FormData đúng kind, contactType, contact', async () => {
    const user = userEvent.setup();
    const action = mockAction({ errors: {}, values: {}, message: 'Đã gửi tin, chờ kiểm duyệt', ok: true });
    render(<PostForm action={action} />);

    await user.type(screen.getByLabelText('Tiêu đề'), 'Mất tai nghe không dây');
    await user.selectOptions(screen.getByLabelText('Loại tin'), 'Thất lạc');
    await user.selectOptions(screen.getByLabelText('Danh mục'), 'Khác');
    await user.selectOptions(screen.getByLabelText('Địa điểm'), 'Thư viện');
    await user.type(screen.getByLabelText('Ngày'), '2020-01-01');
    await user.type(screen.getByLabelText('Mô tả'), 'Tai nghe màu trắng, để quên ở bàn.');
    await user.selectOptions(screen.getByLabelText('Loại liên hệ'), 'Email');
    await user.type(screen.getByLabelText('Thông tin liên hệ'), 'an@ptit.edu.vn');
    await user.click(screen.getByRole('button', { name: 'Đăng tin' }));

    expect(await screen.findByText('Đã gửi tin, chờ kiểm duyệt')).toBeInTheDocument();
    expect(action).toHaveBeenCalledTimes(1);
    const fd = action.mock.calls[0][1];
    expect(fd.get('kind')).toBe('Thất lạc');
    expect(fd.get('contactType')).toBe('Email');
    expect(fd.get('contact')).toBe('an@ptit.edu.vn');
    expect(fd.get('date')).toBe('2020-01-01');
  });

  it('action trả message Không có quyền cùng values thì thông báo hiện ra và tiêu đề vẫn còn', async () => {
    const user = userEvent.setup();
    const action = mockAction({
      errors: {},
      values: { title: 'Mất ví da màu nâu', contactType: 'Email' },
      message: 'Không có quyền',
    });
    render(<PostForm action={action} />);

    await user.type(screen.getByLabelText('Tiêu đề'), 'Mất ví da màu nâu');
    await user.click(screen.getByRole('button', { name: 'Đăng tin' }));

    expect(await screen.findByText('Không có quyền')).toBeInTheDocument();
    expect(screen.getByLabelText('Tiêu đề')).toHaveValue('Mất ví da màu nâu');
    expect(screen.getByLabelText('Loại liên hệ')).toHaveValue('Email');
  });

  it('mặc định Loại liên hệ là Zalo', () => {
    render(<PostForm action={mockAction({ errors: {}, values: {} })} />);
    expect(screen.getByLabelText('Loại liên hệ')).toHaveValue('Zalo');
    expect(screen.getByRole('button', { name: 'Đăng tin' })).toBeEnabled();
  });
});
