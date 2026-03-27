import { useState, useEffect, useCallback } from 'react'
import { supabase, FileRow } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useFiles() {
  const { user } = useAuth()
  const [files, setFiles] = useState<FileRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setFiles((data ?? []) as FileRow[])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const addFile = async (fileData: Omit<FileRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null
    const { data, error } = await supabase
      .from('files')
      .insert({ ...fileData, user_id: user.id })
      .select()
      .single()
    if (!error && data) setFiles(prev => [data as FileRow, ...prev])
    return data
  }

  const updateFile = async (id: string, updates: Partial<FileRow>) => {
    const { data, error } = await supabase
      .from('files')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error && data) setFiles(prev => prev.map(f => f.id === id ? data as FileRow : f))
    return data
  }

  const deleteFile = async (id: string) => {
    await supabase.from('files').delete().eq('id', id)
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const pendingFiles = files.filter(f => f.status === 'pending')
  const organizedFiles = files.filter(f => f.status === 'organized')

  return { files, loading, addFile, updateFile, deleteFile, refetch: fetchFiles, pendingFiles, organizedFiles }
}
