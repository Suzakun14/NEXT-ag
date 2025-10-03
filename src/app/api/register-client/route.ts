import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rut, name, address, phone } = body

    // Usar tu tabla clientes
    const client = await db.cliente.create({
      data: {
        rut: rut.trim(),
        nombre: name.trim(),
        direccion: address?.trim() || null,
        telefono: phone?.trim() || null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cliente registrado correctamente',
      client
    })
  } catch (error) {
    // Manejar error de RUT duplicado
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Ya existe un cliente con este RUT' },
        { status: 409 }
      )
    }
    console.error('Error registering client:', error)
    return NextResponse.json(
      { success: false, message: 'Error al registrar cliente' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const clients = await db.client.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        balances: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}