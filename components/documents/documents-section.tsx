"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DocumentUploadForm } from "./document-upload-form"
import { DocumentList } from "./document-list"

interface DocumentsSectionProps {
  scenarioId: string
  canEdit?: boolean
}

export function DocumentsSection({ scenarioId, canEdit = false }: DocumentsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    // Trigger a refresh of the document list
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Supporting documents, reports, and reference materials</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <DocumentUploadForm 
          scenarioId={scenarioId} 
          onUploadSuccess={handleUploadSuccess}
        />
        <DocumentList 
          key={refreshKey}
          scenarioId={scenarioId} 
          canEdit={canEdit} 
        />
      </CardContent>
    </Card>
  )
}
