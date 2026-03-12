export { };
const data = {
    name: "Alvarez Placas",
    email: "alvarezjavierh@gmail.com",
    instagram: "@javiermixok"
};

try {
    const response = await fetch('http://localhost:4321/api/public/register-collector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await response.json();
    console.log('STATUS:', response.status);
    console.log('RESULT:', result);
} catch (e) {
    console.error('FETCH ERROR:', e);
}
