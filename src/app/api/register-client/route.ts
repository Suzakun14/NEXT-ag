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
          rut: rut
        },
        orderBy: {
          id: 'desc'
        }
      })
    } else {
      balances = await db.balance.findMany({
        orderBy: {
          id: 'desc'
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientRut, accounts, totals, clientName } = body

    if (!clientRut) {
      return NextResponse.json(
        { error: 'RUT del cliente es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe (opcional)
    let usuario = null
    try {
      usuario = await db.usuario.findUnique({
        where: { rut: clientRut }
      })
    } catch (error) {
      console.log('Usuario no encontrado en tabla usuarios, continuando...')
    }

    // Guardar en tu tabla balances
    const balance = await db.balance.create({
      data: {
        rut: clientRut,
        data: {
          accounts,
          totals,
          clientName: clientName || `Cliente ${clientRut}`,
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