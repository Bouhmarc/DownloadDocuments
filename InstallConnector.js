const child_process = require('child_process')
const fs = require('fs')
const path = require('path')
const shell = require('shelljs')

// Sette l'encodage du stdin pour gérer les accents
process.stdin.setEncoding('utf8');

async function StartProcess(sCommande) {
  child_process.execSync(sCommande, { stdio: 'inherit' })
}
function CreeRepertoire(sRepertoire)
{
  // Vérifie le répertoire de destination
  if (sRepertoire && fs.existsSync(sRepertoire) == false) {
    // Crée le répertoire
    // la création récursive est dispo uniquement a partir de la version 10 de node
    //fs.mkdirSync(saveOptions.folderPath, { recursive: true })
    shell.mkdir('-p', sRepertoire)
  }
}

async function installConnector(sURLGit) {

  let sRepertoirePlugin = path.join(process.cwd(),'/plugins/')
  // Crée le répertoire si il n'existe pas
  CreeRepertoire(sRepertoirePlugin)

  // On change le répertoire pour installer tous les plugins
  process.chdir(sRepertoirePlugin)

  // Récupère le nom du connecteur (le nom du répertoire dans lequel sera cloné le repo)
  var extension = path.extname(sURLGit)
  var sRepertoire = path.basename(sURLGit, extension)

  console.log('Récupération du repository')
  
  // Clone le repo
  await StartProcess('git clone ' + sURLGit)

  console.log('Remplacement de référence aux libs de cozy')
  
  // Remplace tous les cozy-lib par cozy-without-cozy
  await RemplaceLibs(path.join(sRepertoirePlugin, sRepertoire))

  console.log('Installation de dépendances')

  process.chdir(sRepertoirePlugin)

  // Install les modules nodes dans le répertoire parent
  await StartProcess('npm install ./' + sRepertoire)

  // Installe toutes les dépendances
  await InstallDependances(sRepertoire)

  // Il reste l'installation dans le .json
  // Récupération du répertoire, login, user
  await DeclareConnecteur(path.join(sRepertoirePlugin, sRepertoire))

  console.log("Le connecteur est correctement installé")
}
async function DeclareConnecteur(sRepertoireConnecteur)
{ 
  // objet final
  MonPackage = {}

  let sIndex = path.join(sRepertoireConnecteur, '/src/','index.js')
  // récupère le dernier répertoire : 
  let tabRepertoires = sRepertoireConnecteur.split('/')
  
  let sRepertoire = tabRepertoires[tabRepertoires.length -1]

  console.log('Saisissez le nom du plugin : ')
  let sNomPlugin = await readlineSync();


  console.log('Saisissez le répertoire de téléchargement : ')
  let sRepertoireTelechargement = await readlineSync();

  console.log('Saisissez le login de connexion au service : ')
  let sLogin = await readlineSync();

  console.log('Saisissez le mot de passe de connexion au service : ')
  let sMotDePasse = await readlineSync();


  // Lit le manifest du connecteur pour savoir si il reste des paramètres
  sContenuManifest = fs.readFileSync(path.join(sRepertoireConnecteur,'manifest.konnector'), 'utf8')
  // Parse le fichier JSON
  let oManifest = JSON.parse(sContenuManifest)

  
  MonPackage["name"] = sNomPlugin
  MonPackage["source"] = sIndex
  MonPackage["directoryName"] = sRepertoire
  MonPackage["folder_to_save"] = sRepertoireTelechargement
  MonPackage["login"] = sLogin
  MonPackage["password"] = sMotDePasse

  MonPackage["others"] = []
  
  for (key in oManifest.fields) {
    let stParametreSupplémentaire = {}
  
    if (key == 'login' || key == 'password' || key == 'advancedFields')
      continue;

    console.log('Saisissez la valeur correspondant à "' + key + '" : ')
    let sVariable = await readlineSync();
    
    stParametreSupplémentaire.name = key
    stParametreSupplémentaire.value = sVariable
    
    // on l'ajoute au tableau
    MonPackage["others"].push(stParametreSupplémentaire)

  }

  // Lit le JSON de configuration 
  sFichierPackage = path.join(__dirname , '/connectors_list.json')
  sContenuFichierListe = fs.readFileSync(sFichierPackage, 'utf8')
  if (sContenuFichierListe != ''){
    ConnectorsList = JSON.parse(sContenuFichierListe)
  }else{
    ConnectorsList = []
  }

  
  // Supprime les dépendances de dev
  ConnectorsList.push(MonPackage)

  fs.writeFileSync(sFichierPackage, JSON.stringify(ConnectorsList), 'utf8')

}

// This function reads only one line on console synchronously. After pressing `enter` key the console will stop listening for data.
function readlineSync() {
    return new Promise((resolve, reject) => {
        process.stdin.resume();
        process.stdin.on('data', function (data) {
            process.stdin.pause(); // stops after one line reads
            resolve(data.replace(/\n/g, ""));
        });
    });
}

function ReadDirRecursive(sRepertoire) {
  var results = []
  var list = fs.readdirSync(sRepertoire)
  list.forEach(function(file) {
    file = path.resolve(sRepertoire, file)
    var stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(ReadDirRecursive(file))
    } else {
      /* Is a file */
      results.push(file)
    }
  })
  return results
}
function RemplaceLibs(sRepertoire) {

  var sRepertoireSrc = path.join(sRepertoire,'/src')

  // Lit le répertoire de manière récursive
  let sListe = ReadDirRecursive(sRepertoireSrc)
  
  // Remplace les require dans le code
  for (var i = 0; i < sListe.length; i++) {
    // Lit le fichier

    let data = fs.readFileSync(sListe[i], 'utf8')
    var result = data.replace('require(\'cozy-konnector-libs\')', 'require(\'cozy-konnector-link\')')
    fs.writeFileSync(sListe[i], result, 'utf8')
  }

  // Remplace les dépendances dans le package.json
  // 
  let sFichierPackage = path.join(sRepertoire, 'package.json')

  // Charge le fichier
  var MonPackage = JSON.parse(fs.readFileSync(sFichierPackage, 'utf8'));

  // Supprime les dépendances de dev
  MonPackage.devDependencies = {}

  // Supprime les dépendances de prod
  MonPackage.dependencies = {}

  MonPackage.dependencies["cozy-konnector-link"] = "*"
  
  fs.writeFileSync(sFichierPackage, JSON.stringify(MonPackage), 'utf8')

}

function InstallDependances(sRepertoire)
{

  return true

}

async function UpdateConnector(sNomPlugin) {

var sRepertoireOrigine = process.cwd()

// Liste les connecteurs
ConnectorsList = JSON.parse(fs.readFileSync(__dirname + '/connectors_list.json'))

await ConnectorsList.forEach(stUnElement => {

    if (sNomPlugin && sNomPlugin != '' && stUnElement.name != sNomPlugin)
        return

  let sRepertoirePlugin = path.join(sRepertoireOrigine,'/plugins/')
    
  // Récupère le nom du connecteur (le nom du répertoire dans lequel sera cloné le repo)
  var extension = path.extname(stUnElement.directoryName)
  var sRepertoire = path.basename(stUnElement.directoryName, extension)

    // Récupère le nom du connecteur (le nom du répertoire dans lequel sera cloné le repo)
    
    // On se positionne dans le répertoire du plugin
    sRepertoirePluginUpdate = path.join(sRepertoirePlugin, sRepertoire)

      // Si le répertoire n'existe pas, on sort en erreur
    // if (fs.existsSync(sRepertoirePluginUpdate) == false)
    //  return false

    // On change le répertoire pour faire la maj
    process.chdir(sRepertoirePluginUpdate)

    // Annulation des modifications
    StartProcess('git checkout .')

    console.log('Récupération du repository')
    
    // Clone le repo
    StartProcess('git pull')

    console.log('Remplacement de référence aux libs de cozy')
    
    // Remplace tous les cozy-lib par cozy-without-cozy
    RemplaceLibs(sRepertoirePluginUpdate)

    console.log('Installation de dépendances')

    process.chdir(sRepertoirePluginUpdate)

    // Install les modules nodes dans le répertoire parent (comme ca on partage les modules)
    StartProcess('npm install --prefix ../../')

    // Installe toutes les dépendances
    InstallDependances(sRepertoirePlugin)

    console.log("Le connecteur est correctement mis à jour")
  })
}

module.exports = {installConnector, UpdateConnector}
