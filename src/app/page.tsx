'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface FinancialData {
  uf: {
    valor: number
    fecha: string
    variacion: number
  }
  utm: {
    valor: number
    fecha: string
    variacion: number
  }
  dolar: {
    valor: number
    fecha: string
    variacion: number
  }
}

const sampleIndicators: FinancialData = {
  uf: { valor: 37834.23, fecha: "2025-09-28", variacion: 1.2 },
  utm: { valor: 64666, fecha: "2025-09", variacion: 0.8 },
  dolar: { valor: 945.67, fecha: "2025-09-28", variacion: -2.1 }
}

const formatNumber = (number: number) => {
  if (number === null || number === undefined || isNaN(number)) return '0'
  return new Intl.NumberFormat('es-CL').format(number)
}

const formatCurrency = (number: number) => {
  if (number === null || number === undefined || isNaN(number)) return '$0'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number)
}

const getCurrentChileTime = () => {
  const now = new Date()
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const chileTime = new Date(utc + (-3 * 3600000))
  return {
    time: chileTime.toLocaleTimeString('es-CL'),
    date: chileTime.toLocaleDateString('es-CL')
  }
}

const Clock = () => {
  const [time, setTime] = useState(getCurrentChileTime())

  useEffect(() => {
    const interval = setInterval(() => setTime(getCurrentChileTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="clock-display">
      <div className="clock-time">{time.time}</div>
      <div>{time.date}</div>
    </div>
  )
}

const IndicatorCard = ({ title, value, change, date, icon, isService = false, href }: {
  title: string
  value?: string
  change?: number
  date?: string
  icon: string
  isService?: boolean
  href?: string
}) => {
  const CardContent = () => (
    <div className={`indicator-card ${isService ? 'service-card' : ''}`}>
      <div className="indicator-header">
        <h3 className="indicator-title">{title}</h3>
        <span className="indicator-icon">{icon}</span>
      </div>

      {!isService ? (
        <>
          <div className="indicator-value">{value}</div>
          {change !== undefined && (
            <div className={`indicator-change ${change >= 0 ? 'positive' : 'negative'}`}>
              <span>{change >= 0 ? '↗' : '↘'}</span>
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
          {date && <div className="indicator-date">Actualizado: {date}</div>}
        </>
      ) : (
        <div className="service-card-content">
          <div className="service-card-description">
            {title === "Servicio Contable" ? "Crear Balance General con cálculos automáticos" : "Registrar y administrar clientes"}
          </div>
          <button className="service-button">
            {title === "Servicio Contable" ? "Acceder al Servicio Contable" : "Acceder"}
          </button>
        </div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}><CardContent /></Link>
  }
  return <CardContent />
}

export default function Dashboard() {
  const [indicators, setIndicators] = useState<FinancialData>(sampleIndicators)
  const [loading, setLoading] = useState(false)

  const fetchIndicators = useCallback(async () => {
    setLoading(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch('/api/financial-data', { signal: controller.signal })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setIndicators({
          uf: {
            valor: data.uf.value || sampleIndicators.uf.valor,
            fecha: data.uf.fecha || sampleIndicators.uf.fecha,
            variacion: data.uf.variation || sampleIndicators.uf.variacion
          },
          utm: {
            valor: data.utm.value || sampleIndicators.utm.valor,
            fecha: data.utm.fecha || sampleIndicators.utm.fecha,
            variacion: sampleIndicators.utm.variacion
          },
          dolar: {
            valor: data.dollar.value || sampleIndicators.dolar.valor,
            fecha: data.dolar.fecha || sampleIndicators.dolar.fecha,
            variacion: data.dollar.variation || sampleIndicators.dolar.variacion
          }
        })
      }
    } catch (error) {
      console.error('Error fetching indicators:', error)
      setIndicators(sampleIndicators)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIndicators()
    const interval = setInterval(fetchIndicators, 60000)
    return () => clearInterval(interval)
  }, [fetchIndicators])

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Financiero Chile</h1>
        <Clock />
      </header>

      <main className="indicators-grid">
        <IndicatorCard
          title="Unidad de Fomento (UF)"
          value={formatCurrency(indicators.uf.valor)}
          change={indicators.uf.variacion}
          date={indicators.uf.fecha}
          icon="📈"
        />

        <IndicatorCard
          title="Unidad Tributaria Mensual (UTM)"
          value={formatCurrency(indicators.utm.valor)}
          change={indicators.utm.variacion}
          date={indicators.utm.fecha}
          icon="📊"
        />

        <IndicatorCard
          title="Dólar Observado"
          value={formatCurrency(indicators.dolar.valor)}
          change={indicators.dolar.variacion}
          date={indicators.dolar.fecha}
          icon="💵"
        />

        <IndicatorCard
          title="Servicio Contable"
          icon="📋"
          isService={true}
          href="/accounting"
        />
        
        <IndicatorCard
          title="Registro de Clientes"
          icon="🧑‍💼"
          isService={true}
          href="/clients"
        />
      </main>

      {loading && (
        <div className="loading-indicator">
          <div className="loading-spinner"></div>
          <span>Actualizando indicadores...</span>
        </div>
      )}
    </div>
  )
}