const invoiceTemplate = (
  amount: number,
  invoiceId: string,
  date: string,
  name: string,
  email: string,
  status: string,
) => `

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice</title>
</head>
<body style="background:#f4f6f8;padding:40px;font-family:Arial,Helvetica,sans-serif;">

  <div style="max-width:900px;margin:auto;background:#fff;padding:40px;border-radius:10px;">

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;border-bottom:2px solid #eee;padding-bottom:20px;">
      <div>
        <h1 style="margin:0;">INVOICE</h1>
        <p style="margin:5px 0;color:#555;font-size:14px;">
          Invoice #: <strong>${invoiceId}</strong>
        </p>
        <p style="margin:0;color:#555;font-size:14px;">
          Date: ${date.split('T')[0]}
        </p>
      </div>

      <div style="display:flex;align-items:center;">
        <div style="background:#0d2538;color:#fff;padding:15px 25px;border-radius:8px;font-weight:bold;">
          MDS AI
        </div>
      </div>
    </div>

    <!-- Billing Info -->
    <div style="display:flex;justify-content:space-between;margin-top:30px;">
      <div>
        <h3 style="margin-bottom:10px;">Billed To</h3>
        <p style="margin:3px 0;"><strong>${name}</strong></p>
        <p style="margin:3px 0;">MDS Coordinator</p>
        <p style="margin:3px 0;">${email}</p>
      </div>

      <div>
        <h3 style="margin-bottom:10px;">From</h3>
        <p style="margin:3px 0;"><strong>MDS AI Platform</strong></p>
        <p style="margin:3px 0;">Healthcare SaaS</p>
        <p style="margin:3px 0;">support@mdsai.com</p>
      </div>
    </div>

    <!-- Subscription Info -->
    <div style="margin-top:25px;background:#f9fafb;padding:15px;border-radius:8px;font-size:14px;">
      <p style="margin:5px 0;"><strong>Plan:</strong> MDS-AI™ Facility Plan</p>
      <p style="margin:5px 0;"><strong>Billing Cycle:</strong> Monthly</p>
      <p style="margin:5px 0;"><strong>Payment Method:</strong> VISA •••• 3434</p>
      <p style="margin:5px 0;">
        <strong>Status:</strong>
        <span style="color:green;font-weight:bold;">${status}</span>
      </p>
    </div>

    <!-- Invoice Table -->
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:30px;">
      <thead>
        <tr>
          <th style="background:#0d2538;color:#fff;padding:12px;text-align:left;">Description</th>
          <th style="background:#0d2538;color:#fff;padding:12px;text-align:left;">Period</th>
          <th style="background:#0d2538;color:#fff;padding:12px;text-align:center;">Qty</th>
          <th style="background:#0d2538;color:#fff;padding:12px;text-align:right;">Unit Price</th>
          <th style="background:#0d2538;color:#fff;padding:12px;text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;">
            MDS-AI Facility Subscription
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;">
            ${date.split('T')[0]}
          </td>
          <td style="padding:12px;text-align:center;border-bottom:1px solid #eee;">1</td>
          <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;">
            ${amount.toFixed(2)}
          </td>
          <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;">
            ${amount.toFixed(2)}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Totals -->
    <div style="width:40%;margin-left:auto;margin-top:25px;">
      <div style="display:flex;justify-content:space-between;padding:8px 0;">
        <span>Subtotal</span>
        <span>${amount.toFixed(2)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:8px 0;">
        <span>Tax (0%)</span>
        <span>$0.00</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;margin-top:10px;border-top:2px solid #000;font-size:18px;font-weight:bold;">
        <span>Total</span>
        <span>${amount.toFixed(2)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:40px;font-size:13px;color:#666;">
      <p style="margin:5px 0;">
        Thank you for using <strong>MDS AI</strong>.
      </p>
      <p style="margin:0;">
        This invoice was generated electronically and is valid without signature.
      </p>
    </div>

  </div>

</body>
</html>`;

export default invoiceTemplate;
