import { db, directus_folders } from '../../conexion/db';

async function test() {
  try {
    const folders = await db.select().from(directus_folders);
    console.log('Folders found:', JSON.stringify(folders, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
