const { google } = require('googleapis');

// 1. Crear el cliente de autenticación JWT
const authClient = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID = '1oHvQgXikMbm4I4QCqRsj2hsW4epaQINRp_3nwaFPDgU';


async function agregarRegistro(id, nombre) {
    try {
        // Inicializar el servicio de Sheets
        const sheets = google.sheets({ version: 'v4' });

        const values = [[id, nombre]];

        // 💡 SOLUCIÓN: Pasamos 'auth: authClient' DIRECTAMENTE dentro de la llamada del método append
        await sheets.spreadsheets.values.append({
            auth: authClient, // Asegura que inyecte los tokens OAuth2 correctos en los Headers
            spreadsheetId: SPREADSHEET_ID,
            range: 'hoja1!A:B', // Corregido a "Hoja 1" con espacio según tu captura
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

module.exports = { agregarRegistro };