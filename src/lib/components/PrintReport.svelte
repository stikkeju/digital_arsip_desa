<script lang="ts">
	let {
		title = 'BUKU AGENDA SURAT',
		periode = 'Semua Waktu',
		columns = [],
		data = [],
		isPrinting = false
	}: {
		title?: string;
		periode?: string;
		columns?: { key: string; label: string }[];
		data?: any[];
		isPrinting?: boolean;
	} = $props();

	// Component will overlay the whole screen when active
</script>

{#if isPrinting}
	<div class="print-overlay">
		<div class="print-container">
			<!-- KOP SURAT -->
			<div class="kop-surat">
				<img src="/logo-tangerang.png" alt="Logo Kabupaten Tangerang" class="logo" />
				<div class="kop-text">
					<h2>PEMERINTAH KABUPATEN TANGERANG</h2>
					<h2>KECAMATAN MEKAR BARU</h2>
					<h1>KANTOR DESA KLUTUK</h1>
					<p>Jl. KH. Suhaemi Ds. Klutuk Kec. Mekar Baru Kab. Tangerang 15550</p>
				</div>
			</div>
			
			<div class="separator"></div>

			<!-- JUDUL DOKUMEN -->
			<div class="document-title">
				<h3>{title}</h3>
				<p>Periode: {periode}</p>
			</div>

			<!-- TABEL DATA -->
			<table class="print-table">
				<thead>
					<tr>
						<th class="col-no">No</th>
						{#each columns as col}
							<th>{col.label}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#if data.length === 0}
						<tr>
							<td colspan={columns.length + 1} class="text-center py-4">Tidak ada data untuk periode ini</td>
						</tr>
					{:else}
						{#each data as row, i}
							<tr>
								<td class="text-center">{i + 1}</td>
								{#each columns as col}
									<td>{row[col.key] || '-'}</td>
								{/each}
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>

			<!-- TANDA TANGAN (Opsional, di bawah tabel) -->
			<div class="signature-section">
				<div class="signature-box">
					<p>Mengetahui,</p>
					<p><strong>Kepala Desa Klutuk</strong></p>
					<br /><br /><br />
					<p>_______________________</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Overlay style for Screen Preview (if visible before print) */
	.print-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: white;
		z-index: 99999;
		overflow-y: auto;
		padding: 2rem;
		font-family: 'Times New Roman', Times, serif;
		color: black;
	}

	.print-container {
		max-width: 210mm; /* A4 width */
		margin: 0 auto;
		background: white;
	}

	/* KOP SURAT */
	.kop-surat {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
		text-align: center;
		position: relative;
	}

	.logo {
		width: 80px;
		height: auto;
		position: absolute;
		left: 0;
		top: 0;
	}

	.kop-text {
		flex: 1;
		padding: 0 90px; /* space for logo */
	}

	.kop-text h1 {
		font-size: 20pt;
		font-weight: bold;
		margin: 0;
		letter-spacing: 1px;
	}

	.kop-text h2 {
		font-size: 16pt;
		font-weight: bold;
		margin: 0;
	}

	.kop-text p {
		font-size: 11pt;
		margin: 4px 0 0 0;
	}

	/* SEPARATOR */
	.separator {
		border-top: 3px solid black;
		border-bottom: 1px solid black;
		height: 2px;
		margin-bottom: 1.5rem;
	}

	/* DOCUMENT TITLE */
	.document-title {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.document-title h3 {
		font-size: 14pt;
		font-weight: bold;
		text-decoration: underline;
		margin: 0 0 4px 0;
	}

	.document-title p {
		font-size: 11pt;
		margin: 0;
	}

	/* PRINT TABLE */
	.print-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 10pt;
		margin-bottom: 2rem;
	}

	.print-table th,
	.print-table td {
		border: 1px solid black;
		padding: 6px 8px;
		vertical-align: top;
		word-break: break-word; /* Wrap text logic */
	}

	.print-table th {
		background-color: #f3f4f6 !important; /* light gray, forced in print */
		-webkit-print-color-adjust: exact;
		color-adjust: exact;
		font-weight: bold;
		text-align: center;
	}

	.col-no {
		width: 5%;
	}

	.text-center {
		text-align: center;
	}

	/* SIGNATURE SECTION */
	.signature-section {
		display: flex;
		justify-content: flex-end;
		margin-top: 2rem;
	}

	.signature-box {
		text-align: center;
		width: 250px;
	}

	.signature-box p {
		margin: 0 0 4px 0;
		font-size: 11pt;
	}

	/* CSS PRINT MEDIA QUERY */
	@media print {
		@page {
			size: A4 portrait;
			margin: 15mm;
		}

		body {
			background: white;
		}

		.print-overlay {
			position: static;
			padding: 0;
			overflow: visible;
		}

		.print-container {
			max-width: 100%;
			margin: 0;
		}

		/* Global override to hide non-printable stuff when printing */
		:global(body > *:not(main)) {
			display: none !important;
		}
		
		/* Important: we must hide the original content inside the Sveltekit app layout */
		:global(.app-layout-main) {
			display: none !important;
		}
	}
</style>
