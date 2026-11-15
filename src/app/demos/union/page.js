'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, ShieldAlert, FileText, Lock, ArrowRight, ExternalLink, AlertOctagon, User, Hospital } from 'lucide-react';
import { recordInspection } from '../../../lib/store';

const PATIENTS = [
  { id: '101', mrn: 'MRN-840192', name: 'Eleanor Vance', dob: '1984-04-12', diagnosis: 'Acute Bronchitis', physician: 'Dr. M. Ross', room: '304-B', status: 'Admitted' },
  { id: '102', mrn: 'MRN-910344', name: 'Marcus Chen', dob: '1991-09-23', diagnosis: 'Type 2 Diabetes Mellitus', physician: 'Dr. K. Patel', room: 'Outpatient', status: 'Stable' },
  { id: '103', mrn: 'MRN-781105', name: 'Sophia Alvarez', dob: '1978-11-04', diagnosis: 'Cardiac Post-op Rehab', physician: 'Dr. L. Thorne', room: '412-A', status: 'Inpatient' },
  { id: '104', mrn: 'MRN-650218', name: 'David Miller', dob: '1965-02-17', diagnosis: 'Essential Hypertension', physician: 'Dr. M. Ross', room: '201-C', status: 'Observation' },
];

const UNION_PRESETS = [
  { label: 'Normal: MRN #101', id: '101', isMalicious: false, desc: 'Benign record lookup for Eleanor Vance' },
  { label: 'DB Fingerprint: 0 UNION SELECT 1, sqlite_version()...', id: '0 UNION SELECT 1, sqlite_version(), 3, 4, 5 --', isMalicious: true, desc: 'Exploits UNION SELECT to extract database server version' },
  { label: 'PHI Exfil: 0 UNION SELECT id, ssn || \':\' || pass...', id: "0 UNION SELECT 1, ssn || ':' || password, 3, 4, 5 FROM users --", isMalicious: true, desc: 'Dumps confidential credentials and SSNs across tables' },
  { label: 'Column Probe: 101 ORDER BY 8 --', id: '101 ORDER BY 8 --', isMalicious: true, desc: 'Determines column count via ORDER BY index injection' },
];

export default function MedVaultEHR() {
  const [patientId, setPatientId] = useState('101');
  const [wafBlock, setWafBlock] = useState(null);

  const handleLookup = (customId) => {
    const val = typeof customId === 'string' ? customId : patientId;
    setPatientId(val);

    const event = recordInspection({
      targetApp: 'MedVault',
      targetHost: 'records.medvault-health.org',
      method: 'GET',
      endpoint: `/api/records/mrn?id=${encodeURIComponent(val)}`,
      clientIp: '192.0.2.89',
      field: 'id',
      payload: val,
    });

    if (event.verdict === 'BLOCKED') {
      setWafBlock(event);
    } else {
      setWafBlock(null);
    }
  };

  const selectedPatient = PATIENTS.find((p) => p.id === patientId.trim());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Clinical Compliance Header */}
      <div className="bg-teal-950 border-b border-teal-900/60 px-4 py-1.5 text-center text-[11px] font-mono text-teal-300">
        CONFIDENTIAL PATIENT DATA • HIPAA COMPLIANCE STRICT AUDIT POLICY ENGAGED • RESTRICTED ACCESS
      </div>

      {/* Hospital Portal Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-lg shadow-teal-600/20">
              <Hospital className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">MedVault EHR</span>
                <span className="rounded bg-teal-500/10 border border-teal-500/30 px-1.5 py-0.2 font-mono text-[10px] text-teal-400">
                  CLINICAL v6.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">St. Jude Regional Healthcare Network</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-xs font-mono text-teal-400">
              <Lock className="h-3 w-3" />
              PHI ENCRYPTION ACTIVE
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs text-amber-400 font-medium transition-colors"
            >
              Open SQLGuard Console <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Clinical EHR Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-6 flex-1">
        {/* Patient MRN Search Bar */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Patient Record Inquiry</h2>
              <p className="text-xs text-slate-400">Enter Medical Record Identifier to query inpatient / outpatient electronic charts.</p>
            </div>
            <span className="text-xs font-mono text-slate-500">Service: GET /api/records/mrn</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient ID (e.g. 101, 102)..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-teal-600 hover:bg-teal-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              Fetch Record
            </button>
          </form>
        </div>

        {/* WAF 403 Forbidden Interstitial */}
        {wafBlock ? (
          <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-red-400 uppercase tracking-wide">
                  SQLGuard WAF Intercept • HTTP 403 Forbidden
                </span>
                <h3 className="text-base font-bold text-white">HIPAA PHI Exfiltration Attempt Thwarted</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              An unauthorized SQL statement injection (UNION / Schema Enumeration) was intercepted. The database connection was aborted to prevent exfiltration of protected health information.
            </p>

            <div className="rounded bg-slate-950 p-3 font-mono text-[11px] text-slate-400 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-500 block">Incident Ref:</span>
                <span className="text-slate-200">{wafBlock.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Rule Triggered:</span>
                <span className="text-red-400 font-semibold">{wafBlock.mitigationRule}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Risk Score:</span>
                <span className="text-red-400 font-semibold">{wafBlock.riskScore}/100</span>
              </div>
              <div>
                <span className="text-slate-500 block">Audit Action:</span>
                <span className="text-teal-400 font-semibold">SECURITY_DROP</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleLookup('101')}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Reset to Standard Patient #101
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded bg-red-500 hover:bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white transition-colors"
              >
                Inspect Telemetry in SQLGuard <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ) : selectedPatient ? (
          /* Real Patient Clinical Card */
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold">
                  {selectedPatient.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedPatient.name}</h3>
                  <span className="font-mono text-xs text-teal-400">{selectedPatient.mrn}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 text-xs font-mono text-teal-400">
                  Status: {selectedPatient.status}
                </span>
                <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-300">
                  Room {selectedPatient.room}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Date of Birth</span>
                <span className="text-slate-200 font-medium">{selectedPatient.dob}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Primary Diagnosis</span>
                <span className="text-slate-200 font-medium">{selectedPatient.diagnosis}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Attending Physician</span>
                <span className="text-slate-200 font-medium">{selectedPatient.physician}</span>
              </div>
              <div>
                <span className="text-slate-500 block">WAF Inspection</span>
                <span className="text-emerald-400 font-medium">CLEAN_QUERY (200 OK)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs font-mono text-slate-500">
            No patient record found for identifier "{patientId}". Try ID 101, 102, 103, or 104.
          </div>
        )}

        {/* Clinical Directory Reference Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-3.5 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-semibold uppercase text-[11px]">Database Directory Preview (Read-Only)</span>
            <span className="text-slate-500">Table: `patient_records`</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/60 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">MRN</th>
                  <th className="px-4 py-2">Patient Name</th>
                  <th className="px-4 py-2">Diagnosis</th>
                  <th className="px-4 py-2">Physician</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {PATIENTS.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2 text-slate-400">{p.id}</td>
                    <td className="px-4 py-2 text-teal-400">{p.mrn}</td>
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2">{p.diagnosis}</td>
                    <td className="px-4 py-2">{p.physician}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleLookup(p.id)}
                        className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[11px] text-slate-200"
                      >
                        Load
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Testbench Drawer */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-teal-400" />
              UNION-Based Injection Vectors (Testbench)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Click to test database exfiltration vectors</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {UNION_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handleLookup(preset.id)}
                className={`text-left rounded-lg border p-2.5 transition-all text-xs ${
                  preset.isMalicious
                    ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-300'
                    : 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="font-mono font-semibold truncate text-[11px]">{preset.label}</div>
                <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-[11px] font-mono text-slate-500">
        St. Jude Health System • MedVault EHR Gateway • Secured by SQLGuard Edge WAF
      </footer>
    </div>
  );
}
