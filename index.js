const downloadDocuments = require('./DownloadDocuments')
const InstallConnector = require('./InstallConnector').installConnector
const UpdateConnector = require('./InstallConnector').UpdateConnector


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
    case 'UPDATE':
    case 'U':
        {
            UpdateConnector(process.argv[3])
            break;
        }   
    case 'DOWNLOAD':
    case 'DLD':
    {
        // On débute le téléchargement
        downloadDocuments(process.argv[3])
        break
    }
    default:
    {
        console.log('Utilisez -install (-i) <url git> ou -download (-d)')
    }
}
