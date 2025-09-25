

function printInvoice(formType) {
    let data = {};

    if (formType === 'staff') {
        data.title = "STAFF SALARY INVOICE";
        data.Name = document.getElementById("staffName").value;
        data.ID = document.getElementById("staffID").value;
        data.Role = document.getElementById("jobRole").value;
        data.Account = document.getElementById("accountNumber").value;
        data.Bank = document.getElementById("bankName").value;
        data.Amount = document.getElementById("salaryAmount").value;
        data.Date = document.getElementById("paymentDate").value;
        data.Mode = document.getElementById("paymentMode").value;
    } else if (formType === 'member') {
        data.title = "MEMBER BILL INVOICE";
        data.Name = document.getElementById("memberName").value;
        data.ID = document.getElementById("memberID").value;
        data.Type = document.getElementById("membershipType").value;
        data.Amount = document.getElementById("memberAmount").value;
        data.Date = document.getElementById("memberDate").value;
    }

    let invoiceHTML = `
    <html>
    <head>
        <title>${data.title}</title>
        <style>
            body {
                font-family: 'Segoe UI', sans-serif;
                background: linear-gradient(135deg, #28a745, #78d78f);
                color: #333;
                padding: 40px;
            }
            .invoice-box {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 10px;
                padding: 30px;
                max-width: 650px;
                margin: auto;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
                border-top: 6px solid #28a745;
                position: relative;
                z-index: 1;
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 2px dashed #ddd;
            }
            .header h2 {
                color: #28a745;
                margin: 0;
            }
            .section {
                margin-top: 20px;
            }
            .row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 6px 10px;
                background: #f9f9f9;
                border-radius: 5px;
            }
            .row:nth-child(even) {
                background: #eefaf0;
            }
            .label {
                font-weight: 600;
                color: #555;
            }
            .value {
                font-weight: 500;
                color: #222;
            }
            .amount {
                font-size: 20px;
                font-weight: bold;
                color: #155724;
                text-align: right;
                margin-top: 15px;
            }
            .note {
                margin-top: 25px;
                font-weight: 600;
                color: #155724;
                background: #e9f7ef;
                border: 1px dashed #28a745;
                border-radius: 5px;
                padding: 10px;
                text-align: center;
            }
            .footer {
                text-align: center;
                font-size: 13px;
                color: #555;
                border-top: 1px solid #ccc;
                margin-top: 30px;
                padding-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="invoice-box">
            <div class="header">
                <h2>${data.title}</h2>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="section">
                <div class="row"><div class="label">Name</div><div class="value">${data.Name}</div></div>
                <div class="row"><div class="label">ID</div><div class="value">${data.ID}</div></div>`;

    if (formType === 'staff') {
        invoiceHTML += `
                <div class="row"><div class="label">Job Role</div><div class="value">${data.Role}</div></div>
                <div class="row"><div class="label">Account Number</div><div class="value">${data.Account}</div></div>
                <div class="row"><div class="label">Bank Name</div><div class="value">${data.Bank}</div></div>
                <div class="row"><div class="label">Salary Date</div><div class="value">${data.Date}</div></div>
                <div class="row"><div class="label">Payment Mode</div><div class="value">${data.Mode}</div></div>`;
    } else {
        invoiceHTML += `
                <div class="row"><div class="label">Membership Type</div><div class="value">${data.Type}</div></div>
                <div class="row"><div class="label">Billing Date</div><div class="value">${data.Date}</div></div>`;
    }

    invoiceHTML += `
                <div class="amount">Total: ₹${data.Amount}</div>
            </div>`;

    // Add payment confirmation note
    if (formType === 'staff') {
        invoiceHTML += `<div class="note">Your salary has been paid successfully.</div>`;
    } else {
        invoiceHTML += `<div class="note">Received payment for Gym Membership Fees.</div>`;
    }

    invoiceHTML += `
            <div class="footer">Thank you! This is a system-generated slip.</div>
        </div>
    </body>
    </html>`;

    let printWindow = window.open('', '', 'width=800,height=700');
    printWindow.document.open();
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}
