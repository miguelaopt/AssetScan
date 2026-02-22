import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportMachinesPDF(machines: any[]) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // Verde
    doc.text('AssetScan - Relatório de Máquinas', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 14, 28);

    // Table
    autoTable(doc, {
        startY: 35,
        head: [['Hostname', 'IP', 'OS', 'RAM (GB)', 'Status']],
        body: machines.map(m => [
            m.hostname,
            m.local_ip || 'N/A',
            `${m.os_name} ${m.os_version}`,
            (m.ram_total_mb / 1024).toFixed(1),
            m.is_online ? 'Online' : 'Offline',
        ]),
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 },
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Página ${i} de ${pageCount} | AssetScan v3.0`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    doc.save(`assetscan_machines_${Date.now()}.pdf`);
}