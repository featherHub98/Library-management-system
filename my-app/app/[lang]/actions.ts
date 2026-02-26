
'use server';

export async function loginAction(previousState: unknown, formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');
  

  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!username || !password) {
    return { error: 'Username and password are required' };
  }
  

  if (username === 'demo' && password === 'password123') {
    return { success: true, user: { username: username as string } };
  }
  
  return { error: 'Invalid credentials' };
}

export async function signupAction(previousState: unknown, formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!name || !email || !password) {
    return { error: 'All fields are required' };
  }
  
  if ((password as string).length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }
  

  return { success: true, user: { name: name as string, email: email as string } };
}