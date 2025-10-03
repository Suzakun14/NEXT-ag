'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'

interface Account {
  id: number
  cuenta: string
  debito: number
  credito: number
  deudor?: number
  acreedor?: number
  activo?: number
  pasivo?: number
  perdidas: number
  ganancias: number
}

const defaultAccounts: Account[] = [
  { id: 1, cuenta: "CAJA", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 2, cuenta: "P.P.M.", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 3, cuenta: "MATERIALES", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 4, cuenta: "RETIROS", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 5, cuenta: "EXCESO RETIROS", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 6, cuenta: "INSTALACIONES", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 7, cuenta: "PLANCHA A VAPOR", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 8, cuenta: "MAQUINARIAS", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 9, cuenta: "CAPITAL", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 10, cuenta: "REV. CAPITAL PROPIO", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 11, cuenta: "IMPTO. POR PAGAR", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 12, cuenta: "LEYES SOCIALES", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 13, cuenta: "UTILIDAD ACUMULADA", debito: 0, credito: 0, perdidas: 0, ganancias: 0 },
  { id: 14, cuenta: "SUELDOS", debito: 0, credito: 0, perdidas: 0, ganancias: 0 }
]

const formatNumber = (number: number) => {
  if (number === null || number === undefined || isNaN(number) || number === '') return '0'
  return new Intl.NumberFormat('es-CL').format(Number(number))
}

export default function AccountingModule() {
  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts)
  const [rut, setRut] = useState('')
  const [nextId, setNextId] = useState(1000)

  // Funciones para guardar y cargar balances en servidor
  const saveBalanceToServer = async (balanceData: any) => {
    const res = await fetch('/api/balances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(balanceData)
    })
    return await res.json()
  }

  const getBalancesFromServer = async (rut: string) => {
    const res = await fetch(`/api/balances?rut=${rut}`)
    return await res.json()
  }

  // ==========================================
  // Cálculos automáticos
  // ==========================================
  const accountsWithCalculations = useMemo(() => {
    return accounts.map(acc => {
      const debito = parseFloat(acc.debito.toString()) || 0
      const credito = parseFloat(acc.credito.toString()) || 0
      let deudor = Math.max(0, debito - credito)
      let acreedor = Math.max(0, credito - debito)
      let activo = deudor
      let pasivo = acreedor
      let perdidas = parseFloat(acc.perdidas.toString()) || 0
      let ganancias = parseFloat(acc.ganancias.toString()) || 0

      // Si hay débito y crédito al mismo tiempo, no hay pérdidas ni ganancias
      if (debito > 0 && credito > 0) {
        perdidas = ganancias = 0
      }

      return { ...acc, debito, credito, deudor, acreedor, activo, pasivo, perdidas, ganancias }
    })
  }, [accounts])

  // Totales
  const totals = useMemo(() => {
    return accountsWithCalculations.reduce((t, a) => ({
      debito: t.debito + a.debito,
      credito: t.credito + a.credito,
      deudor: t.deudor + (a.deudor || 0),
      acreedor: t.acreedor + (a.acreedor || 0),
      activo: t.activo + (a.activo || 0),
      pasivo: t.pasivo + (a.pasivo || 0),
      perdidas: t.perdidas + a.perdidas,
      ganancias: t.ganancias + a.ganancias
    }), { debito: 0, credito: 0, deudor: 0, acreedor: 0, activo: 0, pasivo: 0, perdidas: 0, ganancias: 0 })
  }, [accountsWithCalculations])

  // ==========================================
  // Actualizaciones de fila
  // ==========================================
  const updateAccount = useCallback((id: number, field: keyof Account, value: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, [field]: parseFloat(value) || 0 } : acc
    ))
  }, [])

  const updateAccountName = useCallback((id: number, name: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === id ? { ...acc, cuenta: name } : acc
    ))
  }, [])

  const addAccount = useCallback(() => {
    const newAccount: Account = {
      id: nextId,
      cuenta: `Nueva Cuenta ${nextId}`,
      debito: 0,
      credito: 0,
      perdidas: 0,
      ganancias: 0
    }
    setAccounts(prev => [...prev, newAccount])
    setNextId(prev => prev + 1)
  }, [nextId])

  const deleteAccount = useCallback((id: number) => {
    if (accounts.length > 1) {
      setAccounts(prev => prev.filter(acc => acc.id !== id))
    }
  }, [accounts.length])

  // Guardar y cargar balance
  const saveBalance = useCallback(async () => {
    if (!rut.trim()) {
      alert('Por favor ingrese un RUT')
      return
    }
    
    try {
      await saveBalanceToServer({
        rut: rut.trim(),
        clientName: `Cliente ${rut.trim()}`,
        accounts: accountsWithCalculations,
        fecha: new Date().toISOString(),
        totalDebit: totals.debito,
        totalCredit: totals.credito,
        utility: totals.ganancias - totals.perdidas
      })
      alert('Balance guardado exitosamente')
    } catch (err: any) {
      alert('Error al guardar balance: ' + err.message)
    }
  }, [rut, accountsWithCalculations, totals])

  const loadBalance = useCallback(async () => {
    if (!rut.trim()) {
      alert('Por favor ingrese un RUT')
      return
    }
    
    try {
      const balances = await getBalancesFromServer(rut.trim())
      if (!balances.length) {
        alert('No se encontró balance para este RUT')
        return
      }

      const lastBalance = balances[0]
      setAccounts(lastBalance.accounts.map((acc: any) => ({
        id: acc.id,
        cuenta: acc.cuenta,
        debito: acc.debito,
        credito: acc.credito,
        perdidas: acc.perdidas || 0,
        ganancias: acc.ganancias || 0
      })))
      alert('Balance cargado exitosamente')
    } catch (err: any) {
      alert('Error al cargar balance: ' + err.message)
    }
  }, [rut])

  // Exportar PDF
  const exportToPDF = useCallback(() => {
    if (!rut.trim()) {
      alert('Por favor ingrese un RUT')
      return
    }

    const balanceData = {
      clientRut: rut.trim(),
      clientName: `Cliente ${rut.trim()}`,
      date: new Date().toISOString().split('T')[0],
      accounts: accountsWithCalculations,
      totals,
      utilidad: totals.ganancias - totals.perdidas
    }

    // Generar HTML para el PDF
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Balance General - ${rut.trim()}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            .text-right {
                text-align: right;
            }
            .totals-row {
                background-color: #f8f9fa;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>BALANCE GENERAL</h1>
            <h2>Cliente: ${rut.trim()}</h2>
            <p>Fecha: ${new Date().toLocaleDateString('es-CL')}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>CUENTA</th>
                    <th>DÉBITO</th>
                    <th>CRÉDITO</th>
                    <th>DEUDOR</th>
                    <th>ACREEDOR</th>
                    <th>ACTIVO</th>
                    <th>PASIVO</th>
                    <th>PÉRDIDAS</th>
                    <th>GANANCIAS</th>
                </tr>
            </thead>
            <tbody>
                ${accountsWithCalculations.map((account) => `
                <tr>
                    <td>${account.cuenta}</td>
                    <td>${formatNumber(account.debito)}</td>
                    <td>${formatNumber(account.credito)}</td>
                    <td>${formatNumber(account.deudor || 0)}</td>
                    <td>${formatNumber(account.acreedor || 0)}</td>
                    <td>${formatNumber(account.activo || 0)}</td>
                    <td>${formatNumber(account.pasivo || 0)}</td>
                    <td>${formatNumber(account.perdidas)}</td>
                    <td>${formatNumber(account.ganancias)}</td>
                </tr>
                `).join('')}
                <tr class="totals-row">
                    <td><strong>TOTALES</strong></td>
                    <td><strong>${formatNumber(totals.debito)}</strong></td>
                    <td><strong>${formatNumber(totals.credito)}</strong></td>
                    <td><strong>${formatNumber(totals.deudor)}</strong></td>
                    <td><strong>${formatNumber(totals.acreedor)}</strong></td>
                    <td><strong>${formatNumber(totals.activo)}</strong></td>
                    <td><strong>${formatNumber(totals.pasivo)}</strong></td>
                    <td><strong>${formatNumber(totals.perdidas)}</strong></td>
                    <td><strong>${formatNumber(totals.ganancias)}</strong></td>
                </tr>
            </tbody>
        </table>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 0.9em;">
            <p>Utilidad del ejercicio: ${formatNumber(totals.ganancias - totals.perdidas)}</p>
            <p>Generado el ${new Date().toLocaleString('es-CL')}</p>
        </div>
    </body>
    </html>
    `

    const blob = new Blob([html], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `balance-${rut.trim()}-${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    alert('PDF exportado exitosamente')
  }, [rut, accountsWithCalculations, totals])

  return (
    <div className="accounting-module">
      <header className="accounting-header">
        <h1 className="dashboard-title">Servicio Contable - Balance General</h1>
        <div className="accounting-controls">
          <input
            type="text"
            placeholder="RUT del cliente"
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            className="form-control rut-input"
          />
          <button className="btn btn--secondary" onClick={loadBalance}>
            Cargar Balance
          </button>
          <button className="btn btn--primary" onClick={saveBalance}>
            Guardar Balance
          </button>
          <button className="btn btn--secondary" onClick={exportToPDF}>
            Exportar PDF
          </button>
          <Link href="/">
            <button className="btn btn--outline">
              ← Volver al Dashboard
            </button>
          </Link>
        </div>
      </header>

      <div className="balance-container">
        <div className="balance-table-wrapper">
          <table className="balance-table">
            <thead>
              <tr>
                <th>CUENTA</th>
                <th>DÉBITO</th>
                <th>CRÉDITO</th>
                <th>DEUDOR</th>
                <th>ACREEDOR</th>
                <th>ACTIVO</th>
                <th>PASIVO</th>
                <th>PÉRDIDAS</th>
                <th>GANANCIAS</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {accountsWithCalculations.map((acc) => (
                <tr key={acc.id}>
                  <td>
                    <input
                      type="text"
                      value={acc.cuenta}
                      onChange={(e) => updateAccountName(acc.id, e.target.value)}
                      className="account-name-input"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={acc.debito}
                      onChange={(e) => updateAccount(acc.id, 'debito', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={acc.credito}
                      onChange={(e) => updateAccount(acc.id, 'credito', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formatNumber(acc.deudor || 0)}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formatNumber(acc.acreedor || 0)}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formatNumber(acc.activo || 0)}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={formatNumber(acc.pasivo || 0)}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={acc.perdidas}
                      onChange={(e) => updateAccount(acc.id, 'perdidas', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={acc.ganancias}
                      onChange={(e) => updateAccount(acc.id, 'ganancias', e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button 
                        className="delete-row-btn" 
                        onClick={() => deleteAccount(acc.id)}
                        disabled={accounts.length <= 1}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Fila de totales */}
              <tr className="totals-row">
                <td><strong>TOTALES</strong></td>
                <td><strong>{formatNumber(totals.debito)}</strong></td>
                <td><strong>{formatNumber(totals.credito)}</strong></td>
                <td><strong>{formatNumber(totals.deudor)}</strong></td>
                <td><strong>{formatNumber(totals.acreedor)}</strong></td>
                <td><strong>{formatNumber(totals.activo)}</strong></td>
                <td><strong>{formatNumber(totals.pasivo)}</strong></td>
                <td><strong>{formatNumber(totals.perdidas)}</strong></td>
                <td><strong>{formatNumber(totals.ganancias)}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <button className="add-account-btn" onClick={addAccount}>
          Añadir Cuenta
        </button>
      </div>
    </div>
  )
}