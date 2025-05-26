// scripts/generate-vapid-keys.js
// Run this once to generate your VAPID keys

// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const webpush = require('web-push');

console.log('Generating VAPID keys...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated:');
console.log('====================');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
console.log('\n====================');
console.log('Add these to your environment files:');
console.log('\nFrontend (.env.local):');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log('\nBackend (.env):');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);

// Run with: node scripts/generate-vapid-keys.js