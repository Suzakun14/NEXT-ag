import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      apis: 'unknown'
    },
    version: '1.0.0'
  }

  // Test database connection
  try {
    await db.$connect()
    await db.$queryRaw`SELECT 1`
    health.services.database = 'connected'
    
    // Test tables
    try {
      await db.cliente.count()
      health.services.database += ' (clientes: ok)'
    } catch (error) {
      health.services.database += ' (clientes: error)'
    }
    
    try {
      await db.balance.count()
      health.services.database += ' (balances: ok)'
    } catch (error) {
      health.services.database += ' (balances: error)'
    }
    
  } catch (error) {
    health.services.database = `error: ${error.message}`
    health.status = 'degraded'
  }

  // Test APIs
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/financial-data`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (response.ok) {
      health.services.apis = 'financial-data: ok'
    } else {
      health.services.apis = 'financial-data: error'
      health.status = 'degraded'
    }
  } catch (error) {
    health.services.apis = `error: ${error.message}`
    health.status = 'degraded'
  }

  const statusCode = health.status === 'ok' ? 200 : 503
  return NextResponse.json(health, { status: statusCode })
}