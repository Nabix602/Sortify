import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
}

export function useGoogleDrive() {
  const { session } = useAuth()
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)

  const listFiles = async (folderId = 'root') => {
    const token = session?.provider_token
    if (!token) return []
    setLoading(true)
    try {
      const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`)
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,size,modifiedTime)&pageSize=100`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setDriveFiles(data.files ?? [])
        setConnected(true)
        return data.files ?? []
      }
    } catch (e) {
      console.error('Drive error:', e)
    } finally {
      setLoading(false)
    }
    return []
  }

  const importFiles = async (selected: DriveFile[], userId: string) => {
    const inserts = selected.map(f => ({
      user_id: userId,
      original_name: f.name,
      file_type: f.mimeType.split('/')[1] ?? 'unknown',
      mime_type: f.mimeType,
      file_size: f.size ? parseInt(f.size) : null,
      source: 'google_drive' as const,
      google_drive_file_id: f.id,
      status: 'pending' as const,
    }))
    const { data, error } = await supabase.from('files').insert(inserts).select()
    if (error) throw error
    return data
  }

  return { driveFiles, loading, connected, listFiles, importFiles }
}
