import {CHARACTERS} from '../src/data/characters.js';
import {analyzeBalanceData,formatBalanceAudit} from '../src/systems/balanceAudit.js';

const report=analyzeBalanceData(CHARACTERS);
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else console.log(formatBalanceAudit(report));
// Solo i problemi strutturali invalidano la verifica automatica.
// I candidati ai buff/nerf richiedono partite di prova, non devono bloccare CI.
if(report.duplicateIds.length||report.missingMoveNames.length){
 console.error('ATTENZIONE: duplicati o mosse incomplete rilevati nel roster.');
 process.exitCode=1;
}
