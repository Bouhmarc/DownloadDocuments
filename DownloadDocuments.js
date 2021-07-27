const path = require('path')
const fs = require('fs')
const child_process = require('child_process')
var uuid = require('uuid');

function DownloadDocuments(sNomPlugin)
{

    if (!sNomPlugin)
        sNomPlugin = ''
    
    // Liste les connecteurs
    ConnectorsList = JSON.parse(fs.readFileSync(__dirname + '/connectors_list.json'))
    secrets = JSON.parse(fs.readFileSync(__dirname + '/secret.json'))
        
    for (nIndice in ConnectorsList) {

        stUnElement = ConnectorsList[nIndice]

        if (sNomPlugin != '' && stUnElement.name != sNomPlugin)
            return

        // Sauvegarde un fichier de config
        
        // On envoie les infos de secrets
        stUnElement.secrets = secrets

        // Construit le nom du fichier
        sNomFichier = uuid.v4() + '.json'

        fs.writeFileSync(sNomFichier, JSON.stringify(stUnElement))
        
        // Lancement d'un autre process
        try{
              console.log('----------------------------------------------------------------------')
              console.log('Exécution du connecteur ' + stUnElement.name)
              console.log('----------------------------------------------------------------------')
              var sSTDIO = child_process.execSync(
            'node ' + __dirname + '/DownloadDocument_StandAlone.js "'+sNomFichier + '"',
            {stdio: 'pipe'})

            var nIndice = sSTDIO.indexOf("critical")

            if (nIndice)
            {   
                console.log('ERREUR : ' + sSTDIO.toString('utf8', nIndice, sSTDIO.indexOf('\n', nIndice)))
                
            }
            console.log('----------------------------------------------------------------------')
            console.log('Fin du connecteur ' + stUnElement.name)
            console.log('----------------------------------------------------------------------')
          
        }catch(err){
              console.log('----------------------------------------------------------------------')
              console.log( "Erreur lors de l'exécution du connecteur "+stUnElement.name)
              console.log('----------------------------------------------------------------------')
              bErreur = true
        }
    }

}
module.exports = DownloadDocuments