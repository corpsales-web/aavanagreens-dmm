import React from 'react'

export default function TopNav(){
  return (
    <div className="topnav">
      <div className="brand">Aavana Marketing</div>
      <button
        className="preview-btn"
        onClick={async ()=>{
          try {
            const res = await fetch((import.meta.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_BACKEND_URL) + '/api/meta/oauth/start')
            const data = await res.json()
            if (data.redirect) {
              window.location.href = data.redirect
            } else if (data.success) {
              alert('Meta connected (mock)')
            } else {
              alert('Meta connect: unexpected response')
            }
          } catch (e) {
            alert('Failed to start Meta connect')
          }
        }}
        style={{marginLeft:'auto'}}
      >
        Connect Meta
      </button>

      <div className="spacer" />
      <div className="hint" style={{display:'none'}}>Connected to DMM Backend via REACT_APP_BACKEND_URL</div>
    </div>
  )
}