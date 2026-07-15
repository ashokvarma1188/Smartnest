const params = new URLSearchParams(window.location.search);
const token  = params.get('token');
const user   = params.get('user');

if (!token || !user) {
  window.location.href = 'login.html';
} else {
  localStorage.setItem('smartnest_token', token);
  localStorage.setItem('smartnest_user', user);

  const parsed = JSON.parse(user);

  setTimeout(() => {
    window.location.href = parsed.role === 'owner'
      ? 'add-property.html'
      : 'browse-properties.html';
  }, 800);
}
