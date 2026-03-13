import { parse } from 'csv-parse/sync';

const csvData = `id,name,category
1,Madera Roble,Madera
2,Piedra Marmol,Piedra
3,Liso Blanco,Liso`;

try {
    const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true
    });
    console.log('✅ CSV Parse successful!');
    console.table(records);
} catch (error) {
    console.error('❌ CSV Parse failed:', error.message);
    process.exit(1);
}
