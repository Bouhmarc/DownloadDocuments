const fs = require('fs')
const { resolve } = require('bluebird');

// récupère le nom du fichier de configuration
sFichierConfig = process.argv[2]


    // Récupère la configuration du connecteur
    stUnElement = JSON.parse(fs.readFileSync(sFichierConfig))

    stParametres = {}

    stParametres.secret = stUnElement.secrets
    
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
    process.env.COZY_PARAMETERS = JSON.stringify(stParametres)
    process.env.COZY_FIELDS = JSON.stringify(stOptions)

    

    // Importe le connecteur
    require(stUnElement.source)

    // Supprime le fichier
    fs.unlinkSync(sFichierConfig)
