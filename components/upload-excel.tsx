"use client"

import { useCallback } from "react"
import { Upload } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface UploadExcelProps {
  onFileUpload: (file: File) => void
}

export function UploadExcel({ onFileUpload }: UploadExcelProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith(".xlsx")) {
        onFileUpload(file)
      }
    },
    [onFileUpload]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileUpload(file)
      }
    },
    [onFileUpload]
  )

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
      <CardContent className="p-0">
        <label
          className="flex flex-col items-center justify-center gap-4 p-12 cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium">Arraste o arquivo Excel aqui</p>
            <p className="text-sm text-muted-foreground mt-1">
              ou clique para selecionar o arquivo (.xlsx)
            </p>
          </div>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleChange}
            className="sr-only"
          />
        </label>
      </CardContent>
    </Card>
  )
}
