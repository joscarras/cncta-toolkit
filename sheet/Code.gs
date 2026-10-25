// Google Apps Script for the add-on's 📊 Sheet button: paste it into
// Extensions → Apps Script of your sheet and deploy it as a web app.
// Each post replaces the rows of one account and keeps the other accounts' rows.

const SHEET = "Bases";
const COLUMNS = [
    ["account", "Account"],
    ["base", "Base"],
    ["faction", "Faction"],
    ["level", "Level"],
    ["offense", "Offense"],
    ["defense", "Defense"],
    ["hourly", "Power / hour"],
    ["stored", "Power stored"],
    ["max", "Power max"],
    ["daysToFull", "Days to full"],
    ["defensePercent", "Defense %"],
    ["armyPercent", "Army %"],
    ["defenseNeeded", "Defense power needed"],
    ["armyNeeded", "Army power needed"],
    ["daysToDefense", "Days to max defense"],
    ["daysToTarget", "Days to target"],
    ["updated", "Updated"],
];

function doPost( e ) {
    const { account, rows } = JSON.parse( e.postData.contents );
    const lock = LockService.getScriptLock();

    lock.waitLock( 30000 );

    try {
        const book = SpreadsheetApp.getActive();
        const sheet = book.getSheetByName( SHEET ) ?? book.insertSheet( SHEET );
        const width = COLUMNS.length;
        const last = sheet.getLastRow();
        const old = last > 1 ? sheet.getRange( 2, 1, last - 1, width ).getValues() : [];
        const updated = new Date();
        const values = { account, updated };
        const fresh = rows.map( row => COLUMNS.map( ( [key] ) => values[key] ?? row[key] ?? "" ) );
        const all = old
            .filter( row => row[0] !== "" && row[0] !== account )
            .concat( fresh )
            .sort( ( a, b ) => String( a[0] ).localeCompare( b[0] ) || String( a[1] ).localeCompare( b[1] ) );

        sheet.getRange( 1, 1, 1, width ).setValues( [COLUMNS.map( ( [, label] ) => label )] );
        if ( old.length ) sheet.getRange( 2, 1, old.length, width ).clearContent();
        if ( all.length ) sheet.getRange( 2, 1, all.length, width ).setValues( all );

        return ContentService
            .createTextOutput( JSON.stringify( { count: fresh.length } ) )
            .setMimeType( ContentService.MimeType.JSON );
    }

    finally {
        lock.releaseLock();
    }
}
