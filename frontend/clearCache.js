// Copy and paste this into your browser console to clear the cached token
// Then login again

localStorage.removeItem('token');
localStorage.removeItem('user');
console.log('✓ Token and user cleared! Please login again.');
alert('Cache cleared! Please login again with exam@nstu.edu.bd / exam123');
window.location.href = '/#/login';
