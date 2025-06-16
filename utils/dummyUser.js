const axios = require('axios');

const dummyUsers = [
{ username: 'celeb1', password: '123456', role: 'celebrity' },
{ username: 'celeb2', password: '123456', role: 'celebrity' },
{ username: 'public1', password: '123456', role: 'public' },
];

(async () => {
for (const user of dummyUsers) {
try {
await axios.post('http://localhost:5000/api/auth/register', user);
console.log(`Created: ${user.username}`);
} catch (err) {
console.log(`Skipped: ${user.username}`);
}
}
})();