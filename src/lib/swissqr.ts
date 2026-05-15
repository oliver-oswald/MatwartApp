export function generateSwissQRString(
    amount: number,
    debtorName: string,
    debtorStreet: string = '',
    debtorZip: string = '0000',
    debtorCity: string = 'Unknown'
): string {
    const iban = process.env.NEXT_PUBLIC_BANK_IBAN || 'CH9300000000000000000';
    const credName = process.env.NEXT_PUBLIC_BANK_NAME || 'Matwart Pfadi';
    const credStreet = process.env.NEXT_PUBLIC_BANK_STREET || 'Musterstrasse 1';
    const credZip = process.env.NEXT_PUBLIC_BANK_ZIP || '8000';
    const credCity = process.env.NEXT_PUBLIC_BANK_CITY || 'Zürich';

    // The SPC string format requires specific fields in a specific order separated by CRLF
    const lines = [
        'SPC',         // 1. QRType
        '0200',        // 2. Version
        '1',           // 3. Coding
        iban.replace(/\s/g, ''),          // 4. IBAN
        'K',           // 5. Creditor Address Type
        credName.substring(0, 70),   // 6. Name
        credStreet.substring(0, 70), // 7. Address
        credZip,       // 8. Postal code
        credCity,      // 9. City
        'CH',          // 10. Country
        '', '', '', '', '', '', '',  // 11-17. Ultimate Creditor
        amount.toFixed(2),           // 18. Amount
        'CHF',         // 19. Currency
        'K',           // 20. Debtor Address Type
        debtorName.substring(0, 70), // 21. Name
        debtorStreet.substring(0, 70),// 22. Address
        debtorZip,     // 23. Zip
        debtorCity,    // 24. City
        'CH',          // 25. Country
        'NON',         // 26. Reference Type (NON = no reference required)
        '',            // 27. Reference
        'Rechnung für Materialmiete', // 28. Unstructured message
        'EPD',         // 29. Trailer
        '',            // 30. Billing info
        ''             // Trailing CRLF
    ];

    return lines.join('\n'); // using \n as react-qr-code processes it better
}
