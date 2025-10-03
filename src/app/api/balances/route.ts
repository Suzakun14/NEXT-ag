import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rut = searchParams.get('rut')
    
    let balances
    if (rut) {
      balances = await db.balance.findMany({
        where: {
          clientRut: rut
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      balances = await db.balance.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
    }
    
    return NextResponse.json(balances)
  } catch (error) {
    console.error('Error fetching balances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    )
  }
}

// src/app/api/balances/route.ts - Adaptado a tu schema
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientRut, accounts, totals } = body

    // Verificar que el usuario existe
    const usuario = await db.usuario.findUnique({
      where: { rut: clientRut }
    })

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Guardar en tu tabla balances
    const balance = await db.balance.create({
      data: {
        rut: clientRut,
        data: {
          accounts,
          totals,
          fecha: new Date().toISOString()
        }
      }
    })

    return NextResponse.json(balance, { status: 201 })
  } catch (error) {
    console.error('Error creating balance:', error)
    return NextResponse.json(
      { error: 'Failed to create balance' },
      { status: 500 }
    )
  }
}