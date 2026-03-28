
import { getCertificates } from './frontend/conexion/directus';

async function main() {
    const certs = await getCertificates();
    if (certs.length > 0) {
        console.log("REAL_UUID:", certs[0].uuid);
    } else {
        console.log("NO_CERTS_FOUND");
    }
}

main();
