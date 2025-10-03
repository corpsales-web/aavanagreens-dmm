import React from 'react'

export default function TopNav(){
  return (
    <div className="topnav">
      <div className="brand">Aavana Marketing</div>
      <div className="spacer" />
      <div className="hint" style={{display:'none'}}>Connected to DMM Backend via REACT_APP_BACKEND_URL</div>
    </div>
  )
}