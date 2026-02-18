import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { uploadFileToDrive, getOrCreateClientFolder } from '@/lib/google-drive'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user.clientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }
    
    // Get client's Google Drive credentials
    const googleCred = await prisma.aPICredential.findUnique({
      where: {
        clientId_service: {
          clientId: session.user.clientId,
          service: 'GOOGLE_DRIVE',
        },
      },
    })
    
    if (!googleCred) {
      return NextResponse.json(
        { error: 'Google Drive not connected. Please connect your Google account first.' },
        { status: 400 }
      )
    }
    
    // Get client info for folder name
    const client = await prisma.client.findUnique({
      where: { id: session.user.clientId },
    })
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    
    // Get or create client folder in Drive
    const folder = await getOrCreateClientFolder(
      googleCred.accessToken!,
      client.companyName
    )
    
    const uploadedFiles = []
    
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      
      // Upload to Google Drive
      const driveFile = await uploadFileToDrive(
        googleCred.accessToken!,
        {
          name: file.name,
          mimeType: file.type,
          buffer,
        },
        folder.id!
      )
      
      // Save to database
      const dbFile = await prisma.contentLibrary.create({
        data: {
          clientId: session.user.clientId,
          fileName: file.name,
          fileType: getFileType(file.type),
          mimeType: file.type,
          fileUrl: driveFile.id!,
          thumbnailUrl: driveFile.thumbnailLink,
          fileSize: file.size,
          // TODO: Extract width/height for images, duration for videos
        },
      })
      
      uploadedFiles.push({
        id: dbFile.id,
        name: dbFile.fileName,
        url: driveFile.webViewLink,
      })
    }
    
    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  if (mimeType.startsWith('audio/')) return 'AUDIO'
  return 'DOCUMENT'
}

export const config = {
  api: {
    bodyParser: false,
  },
}
