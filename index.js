const downloadDocuments = require('./DownloadDocuments')
const InstallConnector = require('./InstallConnector')


// récupère l'opération (install (i) ou download (dld))
sOperation = process.argv[2]

switch (sOperation.toUpperCase())
{
    case 'INSTALL':
    case 'I':
    {
        InstallConnector(process.argv[3])
        break;
    }
    case 'DOWNLOAD':
    case 'DLD':
    {
        // On débute le téléchargement
        downloadDocuments()
        break
    }
    default:
    {
        console.log('Utilisez -install (-i) <url git> ou -download (-d)')
    }
}
