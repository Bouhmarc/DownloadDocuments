const child_process = require('child_process')
const fs = require('fs')
const path = require('path')
var merge = require('package-merge')

async function mergePackages(sPackageOriginal, sPackageConnecteur) {
  var dst = ''
  if (!fs.existsSync(sPackageOriginal)) {
    return fs.copyFileSync(sPackageConnecteur, sPackageOriginal)
  }
  dst = fs.readFileSync(sPackageOriginal, 'utf8')
  var src = fs.readFileSync(sPackageConnecteur, 'utf8')

  // On resauve dans le package original
  fs.writeFile(sPackageOriginal, merge(dst, src))
}

async function StartProcess(sCommande) {
  child_process.execSync(sCommande, { stdio: 'inherit' })
}

async function installConnector(sURLGit) {
  // Récupère le nom du connecteur (le nom du répertoire dans lequel sera cloné le repo)
  var extension = path.extname(sURLGit)
  var sRepertoire = path.basename(sURLGit, extension)
  console.log('Récupération du repository')
  // Clone le repo
  await StartProcess('git clone ' + sURLGit)

  console.log('Remplacement de référence aux libs de cozy')
  // Remplace tous les cozy-lib par cozy-without-cozy
  await RemplaceLibs(path.join(process.cwd(), sRepertoire, 'src/'))

  console.log('Installation de dépendances')

  process.chdir(path.join(process.cwd(), sRepertoire))

  // Install
  await StartProcess('npm install')

  // Il reste l'installation dans le .json
  // Récupération du répertoire, login, user
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
  // Lit le répertoire de manière récursive
  let sListe = ReadDirRecursive(sRepertoire)

  for (var i = 0; i < sListe.length; i++) {
    // Lit le fichier

    let data = fs.readFileSync(sListe[i], 'utf8')
    var result = data.replace('require(\'cozy-konnector-libs\')', 'require(\'../../cozy-konnector-without-cozy/src/index.js\')')
    fs.writeFileSync(sListe[i], result, 'utf8')
  }
}
module.exports = installConnector
