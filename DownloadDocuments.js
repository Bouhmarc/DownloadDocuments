const path = require('path')
const fs = require('fs')

async function DownloadDocuments()
{
    // Liste les connecteurs
    ConnectorsList = JSON.parse(fs.readFileSync(__dirname + '/connectors_list.json'))

    // Chaque connecteur a son fichier JSON "konnector-dev-config.json" dans son répertoire
    // Ajoute les données de ce fichier a la variable d'environnement

    ConnectorsList.forEach(stUnElement => {
        stOptions = {}
        // Construit la structure avec les options
        stOptions.COZY_URL = "https://localhost"
        stOptions.fields = {}
        stOptions.fields.login = stUnElement.login
        stOptions.fields.password = stUnElement.password
        stOptions.folder_to_save = stUnElement.folder_to_save
        stOptions.fields.folderPath = stUnElement.folder_to_save
        if (stUnElement.others)
        {
            stUnElement.others.forEach(stAddon => {
                stOptions.fields[stAddon.name] = stAddon.value
            });
        }   

        process.env.COZY_FIELDS = JSON.stringify(stOptions)
        
        // Charge l'élément et débute la récupération
        element = require(stUnElement.source)

        // On décharge l'élément pour pouvoir utiliser plusieurs fois le même connecteur
        var name = require.resolve(stUnElement.source);
        delete require.cache[name];
        
    })
}

module.exports = DownloadDocuments