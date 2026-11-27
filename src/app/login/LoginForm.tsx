'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="stack">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div className="field">
        <label htmlFor="password">Mật khẩu</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        Đăng nhập
      </button>
    </form>
  );
}
