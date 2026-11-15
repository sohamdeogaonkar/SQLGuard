'use client';

import { useState } from 'react';
import {
  FileText,
  Lock,
  Hospital,
  AlertOctagon,
  Search,
  User,
  HeartPulse,
  Stethoscope,
  ClipboardList,
  Calendar,
  Building,
} from 'lucide-react';
import { recordInspection } from '../../../lib/store';
import FloatingAttackBench from '../../../components/FloatingAttackBench';
import StageshowWindow from '../../../components/StageshowWindow';

const PATIENTS = [
  {
    id: '101',
    mrn: 'MRN-840192',
    name: 'Eleanor Vance',
    dob: '1984-04-12',
    sex: 'Female',
    bloodType: 'A+',
    allergies: 'Penicillin (Severe)',
    diagnosis: 'Acute Bronchitis (J20.9)',
    physician: 'Dr. Marcus Ross, MD',
    ward: 'North Wing 304-B',
    status: 'Admitted',
    triage: 'Routine',
    vitals: { bp: '122/82 mmHg', hr: '74 bpm', spo2: '98%', temp: '98.8 °F' },
  },
  {
    id: '102',
    mrn: 'MRN-910344',
    name: 'Marcus Chen',
    dob: '1991-09-23',
    sex: 'Male',
    bloodType: 'O+',
    allergies: 'No Known Drug Allergies (NKDA)',
    diagnosis: 'Type 2 Diabetes Mellitus (E11.9)',
    physician: 'Dr. Kavita Patel, MD',
    ward: 'Outpatient Clinic 12',
    status: 'Stable',
    triage: 'Routine',
    vitals: { bp: '118/76 mmHg', hr: '68 bpm', spo2: '99%', temp: '98.4 °F' },
  },
  {
    id: '103',
    mrn: 'MRN-781105',
    name: 'Sophia Alvarez',
    dob: '1978-11-04',
    sex: 'Female',
    bloodType: 'B-',
    allergies: 'Sulfa Drugs',
    diagnosis: 'Post-operative Cardiac Rehab (Z48.812)',
    physician: 'Dr. Lucas Thorne, MD',
    ward: 'Cardiac ICU 412-A',
    status: 'Inpatient',
    triage: 'Urgent',
    vitals: { bp: '134/88 mmHg', hr: '82 bpm', spo2: '96%', temp: '99.1 °F' },
  },
  {
    id: '104',
    mrn: 'MRN-650218',
    name: 'David Miller',
    dob: '1965-02-17',
    sex: 'Male',
    bloodType: 'A-',
    allergies: 'Latex, Aspirin',
    diagnosis: 'Essential Hypertension (I10)',
    physician: 'Dr. Marcus Ross, MD',
    ward: 'Cardiology 201-C',
    status: 'Observation',
    triage: 'Moderate',
    vitals: { bp: '142/92 mmHg', hr: '79 bpm', spo2: '97%', temp: '98.6 °F' },
  },
];

const UNION_PRESETS = [
  { label: 'Normal Lookup: MRN 101', id: '101', isMalicious: false, desc: 'Legitimate chart inquiry for Eleanor Vance' },
  { label: 'DB Fingerprint: 0 UNION SELECT...', id: '0 UNION SELECT 1, sqlite_version(), 3, 4, 5 --', isMalicious: true, desc: 'Discovers underlying database software version' },
  { label: 'PHI Exfiltration: 0 UNION SELECT...', id: "0 UNION SELECT 1, ssn || ':' || password, 3, 4, 5 FROM users --", isMalicious: true, desc: 'Attempts to extract patient social security numbers' },
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
    <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col justify-between p-2 sm:p-6 font-sans selection:bg-teal-500 selection:text-white">
      <StageshowWindow
        url="ehr.stjude-health.internal/records/patient-inquiry"
        title="MedVault EHR System"
        badge="HIPAA AUDIT ACTIVE"
        badgeTone="emerald"
        className="max-w-7xl w-full mx-auto my-auto min-h-[640px] flex flex-col"
      >
        {/* Top Clinical Header */}
        <div className="bg-teal-950/80 border-b border-teal-900/60 px-6 py-2 text-xs font-mono text-teal-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span>ST. JUDE HEALTH SYSTEM • CLINICAL INTRANET PORTAL</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-teal-400">
            <span>CONFIDENTIAL MEDICAL RECORDS • HIPAA AUDIT ACTIVE</span>
          </div>
        </div>

      {/* Hospital EHR Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-lg shadow-teal-600/20">
              <Hospital className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">MedVault EHR</span>
                <span className="rounded bg-teal-500/10 border border-teal-500/30 px-1.5 py-0.2 font-mono text-[10px] text-teal-400 font-semibold">
                  VERSION 6.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Department: Inpatient Internal Medicine</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-teal-400" />
              <span>Dr. Marcus Ross, MD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main EHR View */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-6 flex-1">
        {/* Patient MRN Search Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-teal-400" />
              <h2 className="text-sm font-semibold text-white">Patient Record Retrieval</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Query Target: `patient_records`</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient Record Number (e.g. 101, 102, 103, 104)..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 hover:bg-teal-500 px-6 py-2 text-xs font-semibold text-white shadow-lg shadow-teal-600/25 transition-all flex items-center justify-center gap-1.5"
            >
              <FileText className="h-4 w-4" />
              Load Clinical Chart
            </button>
          </form>
        </div>

        {/* WAF 403 Forbidden Interstitial (Hospital Firewall Block) */}
        {wafBlock ? (
          <div className="rounded-2xl border border-rose-500/40 bg-slate-900/95 p-8 shadow-2xl space-y-4 max-w-2xl mx-auto my-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5 pb-2 border-b border-slate-800">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <AlertOctagon className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wide">
                  HTTP 403 Forbidden • Security Intercept
                </span>
                <h3 className="text-base font-bold text-white">Database Schema Protection Protocol Engaged</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              An unauthorized query vector was intercepted by the medical network firewall. The execution was terminated before accessing confidential patient health information.
            </p>

            <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-400 border border-slate-800 space-y-1.5">
              <div className="flex justify-between">
                <span>Security Incident Ref:</span>
                <span className="text-slate-200">{wafBlock.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Client Origin IP:</span>
                <span className="text-slate-300">{wafBlock.clientIp}</span>
              </div>
              <div className="flex justify-between">
                <span>Audit Status:</span>
                <span className="text-rose-400 font-bold">TERMINATED_AT_EDGE</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleLookup('101')}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 text-xs font-semibold transition-colors"
              >
                ← Return to Patient Chart #101
              </button>
            </div>
          </div>
        ) : selectedPatient ? (
          /* Detailed Authentic Patient Chart */
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-lg">
                  {selectedPatient.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedPatient.name}</h3>
                    <span className="rounded bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-xs font-mono text-teal-400 font-semibold">
                      {selectedPatient.mrn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    DOB: {selectedPatient.dob} • Sex: {selectedPatient.sex} • Blood Type: {selectedPatient.bloodType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-teal-400 font-semibold">
                  Status: {selectedPatient.status}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                  {selectedPatient.ward}
                </span>
              </div>
            </div>

            {/* Clinical Vitals */}
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2 font-semibold">
                Recorded Vitals (Current Shift)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Blood Pressure</span>
                  <span className="text-slate-200 font-bold text-sm">{selectedPatient.vitals.bp}</span>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Heart Rate</span>
                  <span className="text-slate-200 font-bold text-sm">{selectedPatient.vitals.hr}</span>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Oxygen Saturation (SpO2)</span>
                  <span className="text-teal-400 font-bold text-sm">{selectedPatient.vitals.spo2}</span>
                </div>
                <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Temperature</span>
                  <span className="text-slate-200 font-bold text-sm">{selectedPatient.vitals.temp}</span>
                </div>
              </div>
            </div>

            {/* Diagnosis & Care Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Primary Diagnosis</span>
                <span className="text-white font-semibold mt-1 block">{selectedPatient.diagnosis}</span>
              </div>
              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Allergies</span>
                <span className="text-rose-400 font-semibold mt-1 block">{selectedPatient.allergies}</span>
              </div>
              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800">
                <span className="text-slate-500 block text-[10px] font-mono uppercase">Attending Physician</span>
                <span className="text-slate-200 font-semibold mt-1 block">{selectedPatient.physician}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center text-xs font-mono text-slate-500">
            No medical records located for ID "{patientId}". Enter valid patient identifier 101, 102, 103, or 104.
          </div>
        )}

        {/* Clinical Patient Registry Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-200 font-semibold uppercase text-[11px]">Department Inpatient Census</span>
            <span className="text-slate-500">Ward Unit: 4-North</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">ID</th>
                  <th className="px-4 py-2.5">MRN</th>
                  <th className="px-4 py-2.5">Patient Name</th>
                  <th className="px-4 py-2.5">Diagnosis</th>
                  <th className="px-4 py-2.5">Physician</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {PATIENTS.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-2.5 text-slate-400">{p.id}</td>
                    <td className="px-4 py-2.5 text-teal-400 font-semibold">{p.mrn}</td>
                    <td className="px-4 py-2.5 font-medium text-white">{p.name}</td>
                    <td className="px-4 py-2.5">{p.diagnosis}</td>
                    <td className="px-4 py-2.5">{p.physician}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleLookup(p.id)}
                        className="rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] text-slate-200 font-semibold transition-colors"
                      >
                        Open Chart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

        {/* Hospital Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 text-center text-[11px] font-mono text-slate-500">
          St. Jude Health System • Electronic Health Record System v6.4 • HIPAA Security Standard
        </footer>
      </StageshowWindow>

      {/* Floating Attack Bench (No Backlinks) */}
      <FloatingAttackBench
        themeColor="teal"
        title="MedVault Query Lab"
        presets={UNION_PRESETS}
        onSelect={(preset) => handleLookup(preset.id)}
      />
    </div>
  );
}
