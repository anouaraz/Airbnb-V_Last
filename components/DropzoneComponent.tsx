import type React from "react"
import { useEffect, useRef } from "react"
import Dropzone from "dropzone"
import "dropzone/dist/dropzone.css"

const DropzoneComponent: React.FC = () => {
  const dropzoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (dropzoneRef.current) {
      const dropzone = new Dropzone(dropzoneRef.current, {
        url: "/upload", // Change this to your upload endpoint
        maxFiles: 5,
        maxFilesize: 2, // Maximum file size in MB
        acceptedFiles: "image/*", // Accept only image files
        dictDefaultMessage: "Glissez et déposez les fichiers ici ou cliquez pour télécharger",
        previewTemplate: `
          <div class="dz-preview dz-file-preview flex flex-col items-center p-4 rounded-lg transition-all duration-300 m-2">
            <div class="dz-image relative" style="width: 100%; max-width: 300px; aspect-ratio: 3/2;">
              <img data-dz-thumbnail class="w-full h-full object-cover rounded-lg shadow-lg" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100 rounded-lg"></div>
            </div>
            <div class="dz-details text-center mt-3 w-full">
              <div class="dz-size text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full inline-block" data-dz-size></div>
              <div class="dz-filename text-sm font-medium text-gray-700 mt-1 truncate max-w-[280px]"><span data-dz-name></span></div>
            </div>
            <button data-dz-remove class="mt-3 px-4 py-1 text-sm rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-purple-900 font-bold transition-all duration-300 transform hover:scale-105">
              Supprimer
            </button>
          </div>`,
        addRemoveLinks: false,
      })

      dropzone.on("success", (file) => {
        console.log("File uploaded successfully:", file)
      })

      dropzone.on("removedfile", (file) => {
        console.log("File removed:", file)
      })

      return () => {
        dropzone.destroy()
      }
    }
  }, [])

  return (
    <div
      ref={dropzoneRef}
      className="dropzone border-2 border-dashed border-blue-300 p-8 rounded-lg text-center bg-gradient-to-br from-blue-100 to-purple-100 backdrop-blur-sm transition-all duration-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
    >
      <div className="text-gray-600 font-medium text-sm md:text-lg">Glissez et déposez les fichiers ici ou cliquez pour télécharger</div>
      <p className="text-sm text-gray-500 mt-2">Formats acceptés: JPG, PNG, GIF (max 5MB)</p>
    </div>
  )
}

export default DropzoneComponent

