import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clientRut, clientName, date, accounts, totalDebit, totalCredit, utility } = body

    // Generar HTML para el PDF
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Balance General - ${clientName}</title>
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
            .client-info {
                margin-bottom: 20px;
                background: #f5f5f5;
                padding: 15px;
                border-radius: 5px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            th {
                background-color: #f2f2f2;
                font-weight: bold;
            }
            .text-right {
                text-align: right;
            }
            .text-center {
                text-align: center;
            }
            .summary {
                margin-top: 30px;
            }
            .summary-card {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 10px;
            }
            .total-bar {
                background: #212529;
                color: white;
                padding: 20px;
                border-radius: 5px;
                margin-top: 20px;
            }
            .total-bar-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 20px;
                text-align: center;
            }
            .positive {
                color: #28a745;
                font-weight: bold;
            }
            .negative {
                color: #dc3545;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Balance General</h1>
            <h2>${clientName}</h2>
            <p>RUT: ${clientRut}</p>
            <p>Fecha: ${date}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Cuenta</th>
                    <th class="text-right">Débito</th>
                    <th class="text-right">Crédito</th>
                </tr>
            </thead>
            <tbody>
                ${accounts.map((account: any) => `
                <tr>
                    <td>${account.accountName}</td>
                    <td class="text-right">$${new Intl.NumberFormat('es-CL').format(account.debit || 0)}</td>
                    <td class="text-right">$${new Intl.NumberFormat('es-CL').format(account.credit || 0)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="summary">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;">
                <div class="summary-card">
                    <h3>Total Débito</h3>
                    <p class="text-right positive" style="font-size: 1.2em;">
                        $${new Intl.NumberFormat('es-CL').format(totalDebit)}
                    </p>
                </div>
                <div class="summary-card">
                    <h3>Total Crédito</h3>
                    <p class="text-right positive" style="font-size: 1.2em;">
                        $${new Intl.NumberFormat('es-CL').format(totalCredit)}
                    </p>
                </div>
                <div class="summary-card">
                    <h3>Utilidad/Pérdida</h3>
                    <p class="text-right ${utility >= 0 ? 'positive' : 'negative'}" style="font-size: 1.2em;">
                        $${new Intl.NumberFormat('es-CL').format(utility)}
                    </p>
                </div>
            </div>
        </div>

        <div class="total-bar">
            <div class="total-bar-grid">
                <div>
                    <h4>SALDOS</h4>
                    <p>DEUDOR: $${new Intl.NumberFormat('es-CL').format(totalDebit)}</p>
                    <p>ACREEDOR: $${new Intl.NumberFormat('es-CL').format(totalCredit)}</p>
                </div>
                <div>
                    <h4>INVENTARIO</h4>
                    <p>ACTIVO: $${new Intl.NumberFormat('es-CL').format(totalDebit)}</p>
                    <p>PASIVO: $${new Intl.NumberFormat('es-CL').format(totalCredit)}</p>
                </div>
                <div>
                    <h4>RESULTADOS</h4>
                    <p>PÉRDIDAS: $${new Intl.NumberFormat('es-CL').format(utility < 0 ? Math.abs(utility) : 0)}</p>
                    <p>GANANCIAS: $${new Intl.NumberFormat('es-CL').format(utility > 0 ? utility : 0)}</p>
                </div>
            </div>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 0.9em;">
            <p>Generado el ${new Date().toLocaleString('es-CL')}</p>
        </div>
    </body>
    </html>
    `

    // Para esta implementación, devolveremos el HTML como respuesta
    // En una implementación real, usaríamos una librería como puppeteer o jsPDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="balance_${clientRut}_${date}.html"`
      }
    })

  } catch (error) {
    console.error('Error exporting PDF:', error)
    return NextResponse.json(
      { error: 'Failed to export PDF' },
      { status: 500 }
    )
  }
}