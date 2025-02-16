"use client"

import type React from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X } from "lucide-react"
import Image from "next/image"

interface SimpleDropzoneProps {
  onChange?: (files: File[]) => void
  maxFiles: number
  acceptMultiple: boolean
  value: File[]
}

const SimpleDropzone: React.FC<SimpleDropzoneProps> = ({ onChange, maxFiles, acceptMultiple, value }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...value, ...acceptedFiles].slice(0, maxFiles)
      if (typeof onChange === "function") {
        onChange(newFiles)
      }
    },
    [onChange, value, maxFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: maxFiles - value.length,
    multiple: acceptMultiple,
  })

  const removeFile = (fileToRemove: File) => {
    const newFiles = value.filter((file) => file !== fileToRemove)
    if (typeof onChange === "function") {
      onChange(newFiles)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getGridCols = (fileCount: number) => {
    if (fileCount === 1) return 'grid-cols-1'
    if (fileCount === 2) return 'grid-cols-2'
    if (fileCount === 3) return 'grid-cols-3'
    return 'grid-cols-4'
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
        isDragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-purple-400"
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-center mb-6">
        {isDragActive ? (
          <p className="text-purple-500">Déposez les fichiers ici ...</p>
        ) : (
          <p>Glissez et déposez des fichiers ici, ou cliquez pour sélectionner des fichiers</p>
        )}
      </div>
      
      {value.length > 0 && (
        <div className={`grid ${getGridCols(value.length)} gap-4 max-w-4xl mx-auto`}>
          {value.map((file, index) => (
            <div key={index} className="relative aspect-square w-full max-w-[200px] mx-auto group">
              <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <Image
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center p-3">
                  <div className="text-white text-sm font-medium truncate">
                    {file.name}
                  </div>
                  <div className="text-gray-300 text-xs text-center mt-2">
                    {formatFileSize(file.size)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors shadow-sm z-10"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SimpleDropzone
