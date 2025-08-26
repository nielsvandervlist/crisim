"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, X, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface DocumentUploadFormProps {
  scenarioId: string
  onUploadSuccess?: () => void
}

export function DocumentUploadForm({ scenarioId, onUploadSuccess }: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)



  const allowedFileTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️'
    if (fileType.includes('text')) return '📄'
    return '📎'
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error("File size must be less than 50MB")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error("You must be logged in to upload documents")
      }

      // Create a unique file path - use private folder to match storage policies
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `private/scenarios/${scenarioId}/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Store minimal metadata in localStorage or just rely on storage bucket structure
      // We can also store this in a simple JSON field in the scenarios table if needed
      console.log('Document uploaded successfully to storage:', {
        path: filePath,
        size: file.size,
        type: file.type
      })

      toast.success("Document uploaded successfully!")
      setFile(null)
      setUploadProgress(0)
      onUploadSuccess?.()

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || "Failed to upload document")
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="file" className="text-sm font-medium">
            Select File
          </label>
          <Input
            id="file"
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            disabled={isUploading}
          />
          <p className="text-xs text-gray-500">
            Supported formats: PDF, Text, Word, Excel, PowerPoint (Max 50MB)
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">{getFileTypeIcon(file.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
