import { json, redirect } from 'react-router-dom';

import AuthForm from '../components/AuthForm';

function AuthenticationPage() {
  return <AuthForm />;
}

export default AuthenticationPage;

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get('mode') || 'login';

  if (mode !== 'login' && mode !== 'signup') {
    throw json({ message: 'Unsupported mode.' }, { status: 422 });
  }

  const data = await request.formData();

  let param = 'username=' + encodeURIComponent(data.get('email')) + '&password=' + encodeURIComponent(data.get('password'));
  console.log(param);

  const response = await fetch('/api/v1/ecommerce/' + mode, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: decodeURIComponent('username=' + encodeURIComponent(data.get('email')) + '&password=' + encodeURIComponent(data.get('password'))),
  });

  console.log('response: ');
  console.log(response);

  if (response.status === 422 || response.status === 401) {
    return response;
  }

  if (!response.ok) {
    throw json({ message: 'Could not authenticate user.' }, { status: 500 });
  }

  const resData = await response.json();
  console.log('resData: ');
  console.log(resData);

  const token = resData.token;

  localStorage.setItem('token', token);
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);
  localStorage.setItem('expiration', expiration.toISOString());

  return redirect('/');
}
