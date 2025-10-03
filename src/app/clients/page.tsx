'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ClientRegistration() {
  const [rut, setRut] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const registerClient = async () => {
    if (!rut || !name) {
      setStatusMessage('RUT y nombre son obligatorios')
      setTimeout(() => setStatusMessage(''), 3000)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/register-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rut, name, address, phone }),
      })

      const data = await response.json()

      if (data.success) {
        setStatusMessage('Cliente registrado correctamente')
        setRut('')
        setName('')
        setAddress('')
        setPhone('')
      } else {
        setStatusMessage('Error al registrar cliente: ' + data.message)
      }
    } catch (err) {
      console.error(err)
      setStatusMessage('Error al registrar cliente')
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatusMessage(''), 3000)
    }
  }

  return (
    <div className="client-registration">
      <div className="registration-container">
        <header className="registration-header">
          <h2>Registrar Cliente</h2>
          <p>Complete los datos del nuevo cliente</p>
        </header>

        {statusMessage && (
          <div className={`status-message ${statusMessage.includes('correctamente') ? 'success' : 'error'}`}>
            {statusMessage}
          </div>
        )}

        <div className="registration-form">
          <div className="form-group">
            <label htmlFor="rut">RUT *</label>
            <input
              id="rut"
              placeholder="12.345.678-9"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Nombre / Razón Social *</label>
            <input
              id="name"
              placeholder="Nombre completo del cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input
              id="address"
              placeholder="Dirección del cliente"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              id="phone"
              placeholder="+56 9 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-actions">
            <button
              onClick={registerClient}
              disabled={isLoading}
              className="btn btn--primary"
            >
              {isLoading ? 'Registrando...' : 'Registrar Cliente'}
            </button>
            
            <Link href="/">
              <button className="btn btn--outline">
                ← Volver al Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}