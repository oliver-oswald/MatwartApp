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

    // The SPC string format requires exactly 32-34 lines (fields)
    const lines = [
        'SPC',         // 1. QRType
        '0200',        // 2. Version
        '1',           // 3. Coding
        iban.replace(/\s/g, ''),          // 4. IBAN
        'S',           // 5. Creditor Address Type
        credName.substring(0, 70),   // 6. Name
        credStreet.substring(0, 70), // 7. Address
        '',            // 8. Building Number
        credZip,       // 9. Postal code
        credCity,      // 10. City
        'CH',          // 11. Country
        '', '', '', '', '', '', '',  // 12-18. Ultimate Creditor
        amount.toFixed(2),           // 19. Amount
        'CHF',         // 20. Currency
        'S',           // 21. Debtor Address Type
        debtorName.substring(0, 70), // 22. Name
        debtorStreet.substring(0, 70),// 23. Address
        '',            // 24. Building Number
        debtorZip,     // 25. Zip
        debtorCity,    // 26. City
        'CH',          // 27. Country
        'NON',         // 28. Reference Type
        '',            // 29. Reference
        'Rechnung für Materialmiete', // 30. Unstructured message
        'EPD',         // 31. Trailer
        '',            // 32. Additional Information
    ];

    return lines.join('\n'); // using \n as react-qr-code processes it better
}
