import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

interface TogglePublicDialogProps {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  isPublic: boolean
  loading?: boolean
  onConfirm: () => void
}

const TogglePublicDialog: React.FC<TogglePublicDialogProps> = ({
  visible,
  onVisibleChange,
  isPublic,
  loading = false,
  onConfirm,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (visible && dialogRef.current) {
      dialogRef.current.showModal()
    } else if (!visible && dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close()
    }
  }, [visible])

  const closeDialog = () => {
    onVisibleChange(false)
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <dialog ref={dialogRef} onClick={closeDialog} className="z-50 fixed inset-0 flex bg-black/50 m-0 p-0 w-full max-w-full h-full max-h-full">
      <div onClick={(e) => e.stopPropagation()} className="relative flex flex-col bg-white shadow-xl m-auto rounded-xl w-120 max-w-[90%] max-h-[calc(100%-4rem)] overflow-hidden dialog-content">
        <div className="top-4 right-4 z-10 absolute">
          <button onClick={closeDialog} className="hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <div className="flex flex-col flex-1 justify-center items-center p-6 overflow-y-auto overscroll-contain">
          <h3 className="mb-4 text-amber-900 text-lg">{isPublic ? '确认隐藏成绩' : '确认公开成绩'}</h3>
          <p className="mb-8 max-w-xs text-gray-600 text-center">
            {isPublic 
              ? '确认要隐藏成绩吗？隐藏后第三方将无法通过ID查询Donder查分器中的成绩记录咚~' 
              : '确认要公开成绩吗？公开后第三方可直接通过ID查询Donder查分器中的成绩记录咚~'}
          </p>
          <div className="flex gap-3">
            <Button onClick={handleConfirm} disabled={loading} className="px-6">
              {loading ? '处理中...' : '确认'}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export default TogglePublicDialog
