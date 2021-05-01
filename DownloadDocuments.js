const path = require('path')
const fs = require('fs')
const child_process = require('child_process')
var uuid = require('uuid');

function DownloadDocuments(sNomPlugin)
{
    // Liste les connecteurs
    ConnectorsList = JSON.parse(fs.readFileSync(__dirname + '/connectors_list.json'))

    ConnectorsList.forEach(stUnElement => {

        if (sNomPlugin != '' && stUnElement.name != sNomPlugin)
            return

        // Sauvegarde un fichier de config
        
        // Construit le nom du fichier
        sNomFichier = uuid.v4() + '.json'

        fs.writeFileSync(sNomFichier, JSON.stringify(stUnElement))
        
          // Lancement d'un autre process
          
          child_process.execSync(
            'node ' + __dirname + '/DownloadDocument_StandAlone.js "'+sNomFichier + '"',
            {stdio: 'inherit'})
    })

}
module.exports = DownloadDocuments