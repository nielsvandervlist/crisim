# Supabase Storage Setup for Documents

This project now includes document upload functionality for scenarios using **Supabase Storage only** - no database table needed!

## Setup Instructions

### 1. Start Your Local Supabase Instance

Make sure your local Supabase instance is running:

```bash
supabase start
```

### 2. Create the Documents Storage Bucket

The storage bucket will be created automatically when you first upload a document, but you can also create it manually through the Supabase Dashboard or using the setup script.

#### Option A: Using the Setup Script

```bash
node scripts/setup-storage.js
```

#### Option B: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Storage → Buckets
3. Click "Create a new bucket"
4. Set bucket name: `documents`
5. Set public bucket to `false` (documents are private by default)
6. Set file size limit to `50MB`
7. Add allowed MIME types:
   - `application/pdf`
   - `text/plain`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - `application/vnd.ms-excel`
   - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
   - `application/vnd.ms-powerpoint`
   - `application/vnd.openxmlformats-officedocument.presentationml.presentation`

### 3. Storage Bucket Structure

Documents will be stored in the following structure:
```
documents/
└── scenarios/
    └── {scenario_id}/
        └── {timestamp}-{random}.{extension}
```

### 4. Supported File Types

- **PDF** (.pdf)
- **Text** (.txt)
- **Word Documents** (.doc, .docx)
- **Excel Spreadsheets** (.xls, .xlsx)
- **PowerPoint Presentations** (.ppt, .pptx)

### 5. File Size Limits

- Maximum file size: 50MB
- This can be adjusted in the Supabase configuration

### 6. Security

- Documents are stored in a private bucket
- Access is controlled through Supabase Storage bucket policies
- **No complex RLS policies needed** - storage handles access control
- **Simplified architecture** - just upload to storage and list files

### 7. Usage

Once set up, users can:

1. **Upload Documents**: Use the upload form in the scenario page
2. **View Documents**: See a list of all uploaded documents
3. **Download Documents**: Download documents for offline viewing
4. **Delete Documents**: Remove documents (admin/trainer only)

### 8. Troubleshooting

If you encounter issues:

1. **Check Supabase Status**: Ensure your local instance is running
2. **Verify Environment Variables**: Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Check Storage Policies**: Ensure the documents bucket exists and has proper permissions
4. **Check Console Logs**: Look for any error messages in the browser console

### 9. Production Considerations

For production deployment:

1. **Set up storage bucket policies** for document access control
2. **Configure CDN** for better file delivery performance
3. **Set up backup strategies** for important documents
4. **Monitor storage usage** and costs
5. **Implement file retention policies** if needed

## API Reference

The document functionality uses the standard Supabase Storage API:

- **Upload**: `supabase.storage.from('documents').upload(path, file)`
- **Download**: `supabase.storage.from('documents').download(path)`
- **Delete**: `supabase.storage.from('documents').remove(path)`
- **Public URL**: `supabase.storage.from('documents').getPublicUrl(path)`

For more information, see the [Supabase Storage documentation](https://supabase.com/docs/guides/storage).
