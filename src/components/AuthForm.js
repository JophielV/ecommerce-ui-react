import {
  Form,
  Link,
  useSearchParams,
  useActionData,
  useNavigation,
} from 'react-router-dom';

import { useState, useEffect } from 'react'

import classes from './AuthForm.module.css';

function AuthForm() {
  const API_PREFIX = `${process.env.REACT_APP_API_URL}` ? `${process.env.REACT_APP_API_URL}` : null;

  const data = useActionData();
  const navigation = useNavigation();

  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get('mode') === 'login';
  const isSubmitting = navigation.state === 'submitting';
  const [options, setOptions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch data
      const response = await fetch(API_PREFIX + `/api/v1/ecommerce/cache/roles`, {
        method: 'GET'
      });
      const resData = await response.json();
      console.log('resData: ');
      console.log(resData);
      const results = []
      //Store results in the results array
      resData.forEach((value) => {
        results.push({
          key: value.key,
          value: value.value,
        });
      });
      // Update the options state
      setOptions([
        ...results
      ])

      console.log(options);
    }

    // Trigger the fetch
    fetchData();
  }, []);

  return (
    <>
      <Form method="post" className={classes.form}>
        <h1>{isLogin ? 'Log in32-minikube' : 'Create a new user'}</h1>
        {data && data.errors && (
          <ul>
            {Object.values(data.errors).map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}
        {data && data.message && <p>{data.message}</p>}
        <p>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" required />
        </p>
        <p>
          <label htmlFor="image">Password</label>
          <input id="password" type="password" name="password" required />
        </p>
        {!isLogin && (
            <p>
              <label htmlFor="role">Role</label>
              <select id="role" name="role">
                {options.map(option => <option key={option.key} value={option.value}>{option.key}</option>)}
              </select>
            </p>
        )}
        <div className={classes.actions}>
          <Link to={`?mode=${isLogin ? 'signup' : 'login'}`}>
            {isLogin ? 'Create new user' : 'Login'}
          </Link>
          <button disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Save'}
          </button>
        </div>
      </Form>
    </>
  );
}

export default AuthForm;
