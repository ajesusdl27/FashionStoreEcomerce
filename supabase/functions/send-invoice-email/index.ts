// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceEmailRequest {
  invoice_id: string
  customer_email: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get request body
    const { invoice_id, customer_email }: InvoiceEmailRequest = await req.json()

    if (!invoice_id || !customer_email) {
      return new Response(
        JSON.stringify({ error: 'Missing invoice_id or customer_email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    if (!emailRegex.test(customer_email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for full access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch invoice with order details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        order:orders(
          id,
          order_number,
          customer_name,
          total_amount,
          created_at
        )
      `)
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      console.error('Invoice fetch error:', invoiceError)
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if PDF exists
    if (!invoice.pdf_url) {
      return new Response(
        JSON.stringify({ error: 'Invoice PDF not generated yet' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Download PDF from storage
    const pdfResponse = await fetch(invoice.pdf_url)
    if (!pdfResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Could not download invoice PDF' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    const pdfBuffer = await pdfResponse.arrayBuffer()
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)))

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format order number
    const orderNumber = invoice.order?.order_number
    const displayOrderNumber = orderNumber 
      ? `#A${orderNumber.toString().padLeft(6, '0')}`
      : `#${invoice.order?.id?.substring(0, 8).toUpperCase() || 'UNKNOWN'}`

    // Send email via Resend
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'FashionStore <onboarding@resend.dev>'
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [customer_email],
        subject: `📄 Factura ${invoice.invoice_number} - Pedido ${displayOrderNumber}`,
        html: generateInvoiceEmailHTML({
          invoiceNumber: invoice.invoice_number,
          orderNumber: displayOrderNumber,
          customerName: invoice.customer_fiscal_name,
          total: invoice.total,
        }),
        attachments: [
          {
            filename: `${invoice.invoice_number}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json()
      console.error('Resend API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invoice sent by email',
        email_id: emailResult.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-invoice-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Generate HTML email for invoice
function generateInvoiceEmailHTML(data: {
  invoiceNumber: string
  orderNumber: string
  customerName: string
  total: number
}): string {
  const formatCurrency = (amount: number) => `${amount.toFixed(2)} €`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background-color: #0a0a0a; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">
                    FASHIONSTORE
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; font-size: 24px; color: #0a0a0a;">
                    📄 Tu factura está lista
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                    Hola <strong>${data.customerName}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 30px 0; font-size: 16px; color: #333333; line-height: 1.6;">
                    Adjunto encontrarás la factura correspondiente a tu pedido. A continuación te resumimos los datos:
                  </p>
                  
                  <!-- Invoice Details Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 8px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">
                              <span style="color: #666666;">Nº Factura:</span>
                            </td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; text-align: right;">
                              <strong style="color: #0a0a0a;">${data.invoiceNumber}</strong>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">
                              <span style="color: #666666;">Pedido:</span>
                            </td>
                            <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee; text-align: right;">
                              <strong style="color: #0a0a0a;">${data.orderNumber}</strong>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <span style="color: #666666;">Total:</span>
                            </td>
                            <td style="padding: 8px 0; text-align: right;">
                              <strong style="color: #0a0a0a; font-size: 18px;">${formatCurrency(data.total)}</strong>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Attachment notice -->
                  <div style="background-color: #CCFF00; padding: 15px 20px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="margin: 0; font-size: 14px; color: #0a0a0a;">
                      📎 <strong>El PDF de tu factura está adjunto a este email.</strong>
                    </p>
                  </div>
                  
                  <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                    Si tienes alguna pregunta sobre tu factura, no dudes en contactarnos.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                  <p style="margin: 0 0 10px 0; font-size: 12px; color: #999999;">
                    Este email fue enviado por FashionStore
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #999999;">
                    © ${new Date().getFullYear()} FashionStore. Todos los derechos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}
