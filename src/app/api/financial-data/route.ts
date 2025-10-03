import { NextResponse } from 'next/server'

interface FinancialData {
  uf: {
    value: number
    variation: number
    monthlyVariation: number
  }
  utm: {
    value: number
  }
  dollar: {
    value: number
    variation: number
  }
  accountingDate: string
  currentTime: string
}

async function getFinancialData(): Promise<FinancialData> {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)

  // Valores aproximados actuales
  const currentUF = 37850.32
  const yesterdayUF = 37820.15
  const lastMonthUF = 37500.00

  const currentUTM = 63234.00
  const currentDollar = 978.50
  const yesterdayDollar = 975.20

  const ufVariation = ((currentUF - yesterdayUF) / yesterdayUF) * 100
  const ufMonthlyVariation = ((currentUF - lastMonthUF) / lastMonthUF) * 100
  const dollarVariation = ((currentDollar - yesterdayDollar) / yesterdayDollar) * 100

  const accountingDate = today.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const currentTime = today.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Santiago'
  })

  return {
    uf: { value: currentUF, variation: ufVariation, monthlyVariation: ufMonthlyVariation },
    utm: { value: currentUTM },
    dollar: { value: currentDollar, variation: dollarVariation },
    accountingDate,
    currentTime
  }
}

export async function GET() {
  try {
    const data = await getFinancialData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
