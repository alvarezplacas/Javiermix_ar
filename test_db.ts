import { db, directus_folders } from './frontend/conexion/db';

async function test() {
  try {
    const folders = await db.select().from(directus_folders);
    console.log('Folders found:', folders);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
