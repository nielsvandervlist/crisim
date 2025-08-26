"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Download, Trash2, MoreHorizontal, Eye, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Document {
  id: string
  name: string
  size: number
  type: string
  path: string
  created_at: string
}

interface DocumentListProps {
  scenarioId: string
  canEdit?: boolean
}

export function DocumentList({ scenarioId, canEdit = false }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)


  const fetchDocuments = async () => {
    try {
      // List all files in the scenario's folder - use private folder to match storage policies
      const { data, error } = await supabase.storage
        .from('documents')
        .list(`private/scenarios/${scenarioId}`)

      if (error) {
        console.error('Error fetching documents from storage:', error)
        setDocuments([])
      } else {
        // Transform storage files to document objects
        const documentFiles = data?.map(file => ({
          id: file.id || file.name,
          name: file.name,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'application/octet-stream',
          path: `private/scenarios/${scenarioId}/${file.name}`,
          created_at: file.updated_at || new Date().toISOString()
        })) || []
        
        setDocuments(documentFiles)
      }
    } catch (error: any) {
      console.error('Unexpected error fetching documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [scenarioId])



  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️'
    if (fileType.includes('text')) return '📄'
    return '📎'
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('pdf')) return "bg-red-100 text-red-800"
    if (fileType.includes('word') || fileType.includes('document')) return "bg-blue-100 text-blue-800"
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return "bg-green-100 text-green-800"
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return "bg-orange-100 text-orange-800"
    if (fileType.includes('text')) return "bg-gray-100 text-gray-800"
    return "bg-gray-100 text-gray-800"
  }

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.path)

      if (error) {
        console.error('Error downloading document:', error)
        toast.error('Failed to download document')
        return
      }

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Download started')
    } catch (error: any) {
      console.error('Download error:', error)
      toast.error('Failed to download document')
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // Find the document to get its path
      const docToDelete = documents.find(doc => doc.id === documentId)
      if (!docToDelete) {
        toast.error('Document not found')
        return
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([docToDelete.path])

      if (storageError) throw storageError

      // Remove from local state
      setDocuments(docs => docs.filter(doc => doc.id !== documentId))
      toast.success('Document deleted successfully')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading documents...</p>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          This scenario doesn't have any supporting documents yet. 
          {canEdit ? ' Use the upload form above to add relevant files like reports, procedures, or reference materials.' : ' Documents will appear here once they are uploaded.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {documents.length > 0 && (
        <div className="text-xs text-gray-500 text-center pb-2">
          {documents.length} document{documents.length === 1 ? '' : 's'} available
        </div>
      )}
      {documents.map((document) => (
        <Card key={document.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFileTypeIcon(document.type)}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getFileTypeColor(document.type)}>
                      {document.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {formatFileSize(document.size)}
                    </Badge>
                  </div>
                  <CardTitle className="text-base mt-1">{document.name}</CardTitle>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(document)}
                >
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </Button>
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(document)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(document.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(document.created_at).toLocaleDateString()}
                </span>
              </div>
              <span className="text-xs text-gray-400">{document.name}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
