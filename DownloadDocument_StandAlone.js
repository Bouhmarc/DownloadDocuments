const fs = require('fs')
const { resolve } = require('bluebird');

// récupère le nom du fichier de configuration
sFichierConfig = process.argv[2]


    // Récupère la configuration du connecteur
//    stUnElement = JSON.parse(fs.readFileSync(sFichierConfig))

    stUnElement = JSON.parse('{"source": "/Users/marcpolycarpe/Documents/Sources/Cozy/konnectors/plugins/aprr/src/index.js","folder_to_save": "/Users/marcpolycarpe/Documents/Documents/APRR/","login": "250091389862","password": "mp0682969580"}')

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

    // Importe le connecteur
    require(stUnElement.source)

    // Supprime le fichier
//    fs.unlinkSync(sFichierConfig)
