import React from 'react'
export function Select({ children }) { return <div className="select-root">{children}</div> }
export function SelectTrigger({ children, className }) { return <div className={className}>{children}</div> }
export function SelectContent({ children }) { return <div className="select-content">{children}</div> }
export function SelectItem({ children }) { return <div className="select-item">{children}</div> }
export function SelectValue({ children, placeholder }) { return <span>{children || placeholder}</span> }
