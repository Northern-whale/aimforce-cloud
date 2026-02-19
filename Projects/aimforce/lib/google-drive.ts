import { google } from 'googleapis'

export async function createDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  
  oauth2Client.setCredentials({
    access_token: accessToken,
  })
  
  return google.drive({ version: 'v3', auth: oauth2Client })
}

export async function uploadFileToDrive(
  accessToken: string,
  file: {
    name: string
    mimeType: string
    buffer: Buffer
  },
  folderId?: string
) {
  const drive = await createDriveClient(accessToken)
  
  const fileMetadata: any = {
    name: file.name,
    parents: folderId ? [folderId] : undefined,
  }
  
  const media = {
    mimeType: file.mimeType,
    body: file.buffer,
  }
  
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id,name,webViewLink,webContentLink,thumbnailLink,size',
  })
  
  return response.data
}

export async function createFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
) {
  const drive = await createDriveClient(accessToken)
  
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentFolderId ? [parentFolderId] : undefined,
  }
  
  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id,name',
  })
  
  return response.data
}

export async function getOrCreateClientFolder(
  accessToken: string,
  clientName: string
) {
  const drive = await createDriveClient(accessToken)
  
  // Escape single quotes in client name to prevent query injection
  const escapedClientName = clientName.replace(/'/g, "\\'")
  
  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${escapedClientName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  })
  
  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0]
  }
  
  // Create new folder if doesn't exist
  return await createFolder(accessToken, clientName)
}

export async function listFiles(accessToken: string, folderId?: string) {
  const drive = await createDriveClient(accessToken)
  
  const query = folderId
    ? `'${folderId}' in parents and trashed=false`
    : 'trashed=false'
  
  const response = await drive.files.list({
    q: query,
    fields: 'files(id,name,mimeType,size,createdTime,thumbnailLink,webViewLink)',
    orderBy: 'createdTime desc',
    pageSize: 100,
  })
  
  return response.data.files || []
}

export async function deleteFile(accessToken: string, fileId: string) {
  const drive = await createDriveClient(accessToken)
  await drive.files.delete({ fileId })
}
