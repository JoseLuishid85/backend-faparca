const { google } = require('googleapis');

// 1. Crear el cliente de autenticación JWT
const authClient = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = '1oHvQgXikMbm4I4QCqRsj2hsW4epaQINRp_3nwaFPDgU';
const sheets = google.sheets({ version: 'v4', auth: authClient });

async function agregarRegistro(id, nombre) {
    try {
        const values = [[id, nombre]];

        await sheets.spreadsheets.values.append({
            auth: authClient,
            spreadsheetId: SPREADSHEET_ID,
            range: 'hoja1!A:B',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values },
        });

        return { success: true, message: 'Registrado en Google Sheets con éxito' };
    } catch (error) {
        console.error('Error detallado en Google Sheets API:', error);
        throw error;
    }
}

// ============================================================
// Sincronización de Productos — hoja "Productos"
// Columnas: A Código | B Nombre | C Línea | D Unidad | E Stock | F Precio | G Estado
// La columna H (oculta a efectos visuales) guarda el ID interno del producto,
// usado únicamente para localizar la fila al actualizar/eliminar.
// ============================================================
const PRODUCT_SHEET_NAME = 'Productos';
const PRODUCT_RANGE = `${PRODUCT_SHEET_NAME}!A:H`;

function productRowValues(product) {
    const low = product.min_stock != null && Number(product.stock) < Number(product.min_stock);
    return [
        product.code || '',
        product.name || '',
        product.category?.name || '',
        product.unit?.abbreviation || '',
        product.stock ?? 0,
        product.price ?? '',
        low ? 'Stock Bajo' : 'OK',
        product.id,
    ];
}

// Ubica el número de fila (1-based) cuya columna H coincide con el ID dado
async function findProductRowNumber(productId) {
    const { data } = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PRODUCT_SHEET_NAME}!H:H`,
    });
    const rows = data.values || [];
    const idx = rows.findIndex(r => String(r[0]) === String(productId));
    return idx === -1 ? null : idx + 1; // filas de Sheets son 1-based
}

async function getProductSheetId() {
    const { data } = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
        fields: 'sheets.properties',
    });
    const sheet = (data.sheets || []).find(s => s.properties.title === PRODUCT_SHEET_NAME);
    if (!sheet) throw new Error(`No se encontró la hoja "${PRODUCT_SHEET_NAME}" en el spreadsheet`);
    return sheet.properties.sheetId;
}

async function syncProductCreate(product) {
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: PRODUCT_RANGE,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [productRowValues(product)] },
    });
}

async function syncProductUpdate(product) {
    const row = await findProductRowNumber(product.id);
    if (row == null) {
        // No existía en la hoja (p. ej. producto creado antes de activar la sincronización)
        await syncProductCreate(product);
        return;
    }
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PRODUCT_SHEET_NAME}!A${row}:H${row}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [productRowValues(product)] },
    });
}

async function syncProductDelete(productId) {
    const row = await findProductRowNumber(productId);
    if (row == null) return; // ya no está en la hoja, nada que hacer

    const sheetId = await getProductSheetId();
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId,
                        dimension: 'ROWS',
                        startIndex: row - 1,
                        endIndex: row,
                    },
                },
            }],
        },
    });
}

module.exports = {
    agregarRegistro,
    syncProductCreate,
    syncProductUpdate,
    syncProductDelete,
};
