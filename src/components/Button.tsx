import React, { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  className?: string
}

const Button: React.FC<ButtonProps> = ({ children, disabled = false, onClick, className = '' }) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`bg-gradient-to-b from-amber-200 to-amber-400 text-border text-white w-max p-2 rounded ring-2 ring-amber-950 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:(from-amber-100 to-amber-300)'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default Button
