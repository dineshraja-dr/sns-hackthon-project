import React from 'react'
export function Card({ children, className, onClick }) { return <div className={className} onClick={onClick}>{children}</div> }
export function CardContent({ children, className }) { return <div className={className}>{children}</div> }
export function CardHeader({ children, className }) { return <div className={className}>{children}</div> }
export function CardTitle({ children, className }) { return <div className={className}>{children}</div> }
export default Card
