import React from 'react'
export function Avatar({ children }) { return <div className="avatar">{children}</div> }
export function AvatarImage({ src, alt }) { return <img src={src} alt={alt} /> }
export function AvatarFallback({ children }) { return <div>{children}</div> }
export default Avatar
