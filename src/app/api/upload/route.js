import { NextResponse } from 'next/server';
import { minioClient } from '../../../lib/upload.js';
import crypto from 'crypto';
import {auth0} from "@/lib/auth0";

export async function POST(request) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const email = session.user.email;
    const userId = session.user.sub;

    const hash = crypto
        .createHash("sha256")
        .update(email + userId)
        .digest("hex");

    const uploadedFiles = [];
    for (const file of files) {
      if (file && file.size > 0) {
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}_${crypto.randomUUID().substring(0, 8)}.${fileExtension}`;
        const filePath = `files/${hash}/${fileName}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await minioClient.putObject('changemakers', filePath, buffer, buffer.length, {
          'Content-Type': file.type,
          'Original-Name': encodeURIComponent(file.name),
        });

        uploadedFiles.push({
          file_path: filePath,
          original_name: file.name
        });
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
