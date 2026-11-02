import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { 
  Home, FileText, CheckSquare, User, BarChart2, LogOut, Plus, 
  Menu, X, Search, Upload, Eye, Check, XCircle, AlertCircle, FileDigit, Users, CheckCircle, Trophy, Medal, Award, Trash, Download, UserCog
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// --- MOCK DATA ---
const initialStudents = [
  { id: '1', id_murid: 'M001', nama: 'Ahmad bin Abu', kelas: 'Tahun 6', status: 'Aktif' },
  { id: '2', id_murid: 'M002', nama: 'Siti Aminah', kelas: 'Tahun 5', status: 'Aktif' },
  { id: '3', id_murid: 'M003', nama: 'Ali bin Muthu', kelas: 'Tahun 4', status: 'Aktif' },
];

const initialCertificates = [
  {
    id: 'c1', studentId: '1', programName: 'Kuiz STEM Kebangsaan', calendarYear: '2024', schoolYear: 'Tahun 6',
    category: 'Kelab dan Persatuan', level: 'Kebangsaan', achievement: 'Johan', status: 'Disahkan', date: '2024-03-12'
  },
  {
    id: 'c2', studentId: '2', programName: 'Perkhemahan Pengakap', calendarYear: '2024', schoolYear: 'Tahun 5',
    category: 'Unit Beruniform', level: 'Daerah', achievement: 'Penyertaan', status: 'Menunggu Pengesahan', date: '2024-05-20'
  }
];

const initialUsers = [
  { id: 'u1', username: 'admin', password: 'cba0021', nama: 'Admin', peranan: 'admin', status: 'Aktif' },
  { id: 'u2', username: 'pengesah', password: 'koko', nama: 'PK Koko/SU Koko', peranan: 'verifier', status: 'Aktif' },
  { id: 'u3', username: 'guru', password: 'guru', nama: 'Guru', peranan: 'teacher', status: 'Aktif' },
  { id: 'u4', username: 'Ibubapa', password: '123', nama: 'IbuBapa', peranan: 'parent', status: 'Aktif' }
];

const levelsWeight = {
  'Antarabangsa': 5,
  'Kebangsaan': 4,
  'Negeri': 3,
  'Daerah': 2,
  'Sekolah': 1
};

// --- CONTEXT ---
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null, 'parent', 'teacher', 'verifier', 'admin'
  const [students, setStudents] = useState(initialStudents);
  const [certificates, setCertificates] = useState(initialCertificates);
  const [availableYears, setAvailableYears] = useState(['2024', '2025', '2026', '2027']);
  const [usersList, setUsersList] = useState(initialUsers);

  const login = (role, name) => setUser({ role, name });
  const logout = () => setUser(null);

  const addCertificate = (cert) => {
    setCertificates([...certificates, { ...cert, id: Date.now().toString(), status: 'Menunggu Pengesahan' }]);
  };

  const addBulkCertificates = (newCerts) => {
    const certsWithIds = newCerts.map((cert, index) => ({
      ...cert,
      id: Date.now().toString() + index,
      status: 'Menunggu Pengesahan'
    }));
    setCertificates(prev => [...prev, ...certsWithIds]);
  };

  const verifyCertificate = (id, status, reason = '') => {
    setCertificates(certs => certs.map(c => c.id === id ? { ...c, status, rejectReason: reason } : c));
  };

  const addStudents = (newStudents) => {
    setStudents(prev => [...prev, ...newStudents]);
  };

  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const addYear = (year) => {
    if (!availableYears.includes(year)) {
      setAvailableYears(prev => [...prev, year].sort());
    }
  };

  const addUser = (newUser) => {
    setUsersList(prev => [...prev, { ...newUser, id: Date.now().toString(), status: 'Aktif' }]);
  };

  const deleteUserFromList = (id) => {
    setUsersList(prev => prev.filter(u => u.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      user, login, logout, 
      students, addStudents, deleteStudent,
      certificates, addCertificate, addBulkCertificates, verifyCertificate,
      availableYears, addYear,
      usersList, addUser, deleteUserFromList
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- COMPONENTS ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// 1. DASHBOARD
const DashboardView = () => {
  const { students, certificates } = useContext(AppContext);
  
  const stats = {
    totalStudents: students.length,
    totalCerts: certificates.length,
    verified: certificates.filter(c => c.status === 'Disahkan').length,
    pending: certificates.filter(c => c.status === 'Menunggu Pengesahan').length,
    rejected: certificates.filter(c => c.status === 'Ditolak').length
  };

  const categoryData = useMemo(() => {
    const counts = {};
    certificates.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [certificates]);

  const COLORS = ['#123B75', '#38BDF8', '#F59E0B', '#10B981'];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Analitik</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Jumlah Murid', val: stats.totalStudents, icon: Users, color: 'bg-blue-100 text-blue-700' },
          { title: 'Sijil Disahkan', val: stats.verified, icon: CheckCircle, color: 'bg-green-100 text-green-700' },
          { title: 'Menunggu', val: stats.pending, icon: AlertCircle, color: 'bg-orange-100 text-orange-700' },
          { title: 'Ditolak', val: stats.rejected, icon: XCircle, color: 'bg-red-100 text-red-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${s.color}`}><s.icon size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{s.title}</p>
              <p className="text-2xl font-bold text-gray-800">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4 text-gray-700">Taburan Kategori Sijil</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold mb-4 text-gray-700">Peringkat Pencapaian</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <BarChart2 size={48} className="opacity-20" />
            <span className="ml-2">Carta Bar (Contoh)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. SUBMIT CERT
const SubmitCertView = () => {
  const { students, addCertificate, addBulkCertificates, availableYears, addYear } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('individu');
  
  const [formData, setFormData] = useState({
    studentId: '', calendarYear: new Date().getFullYear().toString(), schoolYear: 'Tahun 4',
    category: 'Kelab dan Persatuan', programName: '', date: '', level: 'Sekolah', achievement: 'Penyertaan'
  });
  const [newYearInput, setNewYearInput] = useState('');
  const [showAddYear, setShowAddYear] = useState(false);
  
  const [bulkData, setBulkData] = useState([]);
  const [bulkError, setBulkError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.programName) return;
    addCertificate(formData);
    setFormData({ ...formData, programName: '', date: '' });
    setSuccessMsg('Sijil individu berjaya didaftarkan!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddYear = () => {
    if (newYearInput && !isNaN(newYearInput)) {
      addYear(newYearInput);
      setFormData({...formData, calendarYear: newYearInput});
      setNewYearInput('');
      setShowAddYear(false);
    }
  };

  const downloadTemplate = () => {
    const headers = "ID_Murid,Nama_Program,Kategori,Peringkat,Pencapaian,Tahun_Kalendar\n";
    const sample = "M001,Pertandingan Catur MSSD,Sukan dan Permainan,Daerah,Johan,2024\n";
    const blob = new Blob([headers + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Template_Sijil_Pukal.csv";
    a.click();
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const parsedCerts = [];
      let error = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',');
        if (parts.length >= 6) {
          const idMurid = parts[0].trim();
          const student = students.find(s => s.id_murid === idMurid);
          
          if (!student) {
            error = `Ralat di baris ${i + 1}: Murid dengan ID '${idMurid}' tidak wujud dalam sistem.`;
            break;
          }

          parsedCerts.push({
            studentId: student.id,
            programName: parts[1].trim(),
            category: parts[2].trim(),
            level: parts[3].trim(),
            achievement: parts[4].trim(),
            calendarYear: parts[5].trim(),
            schoolYear: student.kelas 
          });
        } else {
          error = `Ralat format di baris ${i + 1}. Pastikan mempunyai 6 lajur berasingan.`;
          break;
        }
      }

      if (error) {
        setBulkError(error);
        setBulkData([]);
      } else if (parsedCerts.length > 0) {
        setBulkError('');
        setBulkData(parsedCerts);
      } else {
        setBulkError('Fail CSV tidak mengandungi data.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleBulkSubmit = () => {
    if (bulkData.length > 0) {
      addBulkCertificates(bulkData);
      bulkData.forEach(c => addYear(c.calendarYear));
      const count = bulkData.length;
      setBulkData([]);
      setSuccessMsg(`${count} sijil berjaya didaftarkan secara pukal!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#123B75] p-6 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2"><Plus size={24} /> Daftar Sijil Baharu</h2>
        <p className="text-blue-100 text-sm mt-1">Sila isi maklumat secara individu atau muat naik fail secara pukal.</p>
      </div>

      <div className="flex flex-col sm:flex-row border-b border-gray-200 bg-gray-50">
        <button 
          onClick={() => setActiveTab('individu')} 
          className={`flex-1 py-4 font-medium text-sm text-center transition-colors ${activeTab === 'individu' ? 'bg-white text-[#123B75] border-t-2 border-t-[#38BDF8] shadow-[0_2px_0_0_white] z-10' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Pendaftaran Individu
        </button>
        <button 
          onClick={() => setActiveTab('pukal')} 
          className={`flex-1 py-4 font-medium text-sm text-center transition-colors ${activeTab === 'pukal' ? 'bg-white text-[#123B75] border-t-2 border-t-[#38BDF8] shadow-[0_2px_0_0_white] z-10' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Pendaftaran Pukal (CSV)
        </button>
      </div>
      
      {successMsg && (
        <div className="mx-6 mt-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-2 font-medium">
          <CheckCircle size={20} /> {successMsg}
        </div>
      )}

      {activeTab === 'individu' ? (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Murid</label>
              <select required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#38BDF8] outline-none">
                <option value="">-- Pilih Murid --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.nama} ({s.id_murid})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Kalendar</label>
              <div className="flex gap-2">
                {showAddYear ? (
                  <div className="flex w-full gap-1">
                    <input type="number" placeholder="Contoh: 2028" value={newYearInput} onChange={e => setNewYearInput(e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" />
                    <button type="button" onClick={handleAddYear} className="px-3 bg-green-500 text-white rounded-lg"><Check size={18}/></button>
                    <button type="button" onClick={() => setShowAddYear(false)} className="px-3 bg-red-500 text-white rounded-lg"><X size={18}/></button>
                  </div>
                ) : (
                  <>
                    <select value={formData.calendarYear} onChange={e => setFormData({...formData, calendarYear: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                      {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowAddYear(true)} className="p-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg" title="Tambah Tahun Baharu">
                      <Plus size={20} className="text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Program/Pertandingan</label>
              <input required type="text" value={formData.programName} onChange={e => setFormData({...formData, programName: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" placeholder="Cth: Pertandingan Catur MSSD" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                <option>Kelab dan Persatuan</option>
                <option>Unit Beruniform</option>
                <option>Sukan dan Permainan</option>
                <option>Lain-lain</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peringkat</label>
                <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                  {Object.keys(levelsWeight).reverse().map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pencapaian</label>
                <select value={formData.achievement} onChange={e => setFormData({...formData, achievement: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none">
                  <option>Penyertaan</option>
                  <option>Johan</option>
                  <option>Naib Johan</option>
                  <option>Ketiga</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Muat Naik Salinan Sijil (PDF/JPG/PNG)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 font-medium">Klik untuk muat naik fail lampiran sijil</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-[#123B75] text-white rounded-lg hover:bg-blue-900 transition-colors shadow-md font-medium">
              Hantar Sijil
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">Arahan Pendaftaran Pukal:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Muat turun templat CSV yang disediakan.</li>
                <li>Jangan ubah tajuk (header) pada baris pertama.</li>
                <li>Pastikan <span className="font-bold">ID Murid</span> didaftarkan dahulu dalam Pengurusan Murid.</li>
              </ul>
            </div>
            <button onClick={downloadTemplate} className="whitespace-nowrap px-4 py-2 bg-white text-[#123B75] border border-blue-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2">
              <Download size={16} /> Muat Turun Templat
            </button>
          </div>

          <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer block">
            <Upload size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-700 font-bold">Klik untuk muat naik fail CSV sijil</p>
            <p className="text-xs text-gray-500 mt-1">Sistem akan memuat naik rekod secara pukal</p>
            <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
          </label>

          {bulkError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium flex gap-2">
              <AlertCircle size={18}/> {bulkError}
            </div>
          )}

          {bulkData.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-700">Pratonton Data ({bulkData.length} Sijil Ditemui)</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                    <tr>
                      <th className="p-3 font-semibold text-gray-600">ID Murid</th>
                      <th className="p-3 font-semibold text-gray-600">Program (Tahun)</th>
                      <th className="p-3 font-semibold text-gray-600">Kategori & Peringkat</th>
                      <th className="p-3 font-semibold text-gray-600">Pencapaian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkData.map((d, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{students.find(s => s.id === d.studentId)?.id_murid}</span>
                        </td>
                        <td className="p-3 font-medium text-gray-800">{d.programName} ({d.calendarYear})</td>
                        <td className="p-3 text-gray-600">{d.category} <br/><span className="text-xs font-bold text-blue-600">{d.level}</span></td>
                        <td className="p-3 text-gray-600">{d.achievement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end border-t border-gray-200">
                <button onClick={handleBulkSubmit} className="px-6 py-2.5 bg-[#123B75] text-white rounded-lg hover:bg-blue-900 transition-colors shadow-md font-medium flex items-center gap-2">
                  <Check size={18} /> Sahkan & Hantar Semua
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 3. VERIFICATION
const VerificationView = () => {
  const { certificates, students, verifyCertificate } = useContext(AppContext);
  const [selectedCert, setSelectedCert] = useState(null);
  const [modalType, setModalType] = useState(null); 
  const [rejectReason, setRejectReason] = useState('');

  const pendingCerts = certificates.filter(c => c.status === 'Menunggu Pengesahan');

  const handleDownload = (cert) => {
    const content = `MAKLUMAT SIJIL\n\nProgram: ${cert.programName}\nKategori: ${cert.category}\nPeringkat: ${cert.level}\nPencapaian: ${cert.achievement}\nTarikh: ${cert.date || 'Tiada Tarikh'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sijil_${cert.programName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Pengesahan Sijil</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-sm font-semibold text-gray-600">Murid</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Program & Kategori</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Peringkat & Pencapaian</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {pendingCerts.length > 0 ? pendingCerts.map(cert => {
                const student = students.find(s => s.id === cert.studentId);
                return (
                  <tr key={cert.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{student?.nama}</p>
                      <p className="text-xs text-gray-500">{student?.kelas}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{cert.programName}</p>
                      <p className="text-xs text-gray-500">{cert.category}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">{cert.level}</span>
                      <span className="inline-block ml-2 text-sm text-gray-600">{cert.achievement}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setSelectedCert(cert); setModalType('view'); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100" title="Lihat Sijil">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => verifyCertificate(cert.id, 'Disahkan')} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100" title="Sahkan">
                          <Check size={18} />
                        </button>
                        <button onClick={() => { setSelectedCert(cert); setModalType('reject'); }} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100" title="Tolak">
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">Tiada sijil menunggu pengesahan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View */}
      <Modal isOpen={modalType === 'view'} onClose={() => setModalType(null)} title="Semakan Sijil">
        {selectedCert && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <FileDigit size={48} className="text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm ml-2">Pratonton Fail</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <p className="text-gray-500 text-xs">Program</p>
                <p className="font-medium">{selectedCert.programName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Peringkat & Pencapaian</p>
                <p className="font-medium">{selectedCert.level} - {selectedCert.achievement}</p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => handleDownload(selectedCert)} className="flex items-center gap-2 px-4 py-2 text-white bg-[#38BDF8] rounded-lg hover:bg-sky-500 transition-colors">
                <Download size={18} /> Muat Turun
              </button>
              <button onClick={() => setModalType(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Tutup</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Reject */}
      <Modal isOpen={modalType === 'reject'} onClose={() => setModalType(null)} title="Tolak Sijil">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Sebab Penolakan <span className="text-red-500">*</span></label>
          <textarea 
            value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-400"
            rows="3" placeholder="Sila nyatakan sebab sijil ini ditolak..."
          ></textarea>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalType(null)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Batal</button>
            <button 
              onClick={() => {
                if(rejectReason) { verifyCertificate(selectedCert.id, 'Ditolak', rejectReason); setModalType(null); setRejectReason(''); }
              }} 
              disabled={!rejectReason}
              className="px-4 py-2 text-white bg-red-600 rounded-lg disabled:opacity-50"
            >Sah Tolak</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// 4. STUDENT PROFILE
const StudentProfileView = () => {
  const { students, certificates } = useContext(AppContext);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [activeTab, setActiveTab] = useState('Semua Sijil');

  const studentCerts = useMemo(() => certificates.filter(c => c.studentId === selectedStudent), [certificates, selectedStudent]);
  const filteredCerts = useMemo(() => {
    if (activeTab === 'Semua Sijil') return studentCerts;
    return studentCerts.filter(c => c.schoolYear === activeTab);
  }, [studentCerts, activeTab]);

  const handleDownload = (cert) => {
    const content = `MAKLUMAT SIJIL\n\nProgram: ${cert.programName}\nKategori: ${cert.category}\nPeringkat: ${cert.level}\nPencapaian: ${cert.achievement}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sijil_${cert.programName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Profil & Rekod Murid</h2>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
            className="w-full pl-10 p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#38BDF8]"
          >
            <option value="">-- Cari Murid --</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
          </select>
        </div>
      </div>

      {selectedStudent ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
              {students.find(s => s.id === selectedStudent)?.nama.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-800">{students.find(s => s.id === selectedStudent)?.nama}</h3>
              <p className="text-gray-500">{students.find(s => s.id === selectedStudent)?.id_murid} • {students.find(s => s.id === selectedStudent)?.kelas}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Jumlah Sijil</p>
                  <p className="text-lg font-bold text-[#123B75]">{studentCerts.length}</p>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                  <p className="text-xs text-green-600 font-medium">Disahkan</p>
                  <p className="text-lg font-bold text-green-700">{studentCerts.filter(c=>c.status==='Disahkan').length}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto pb-2">
              {['Semua Sijil', 'Tahun 4', 'Tahun 5', 'Tahun 6'].map(tab => (
                <button 
                  key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors ${activeTab === tab ? 'border-[#38BDF8] text-[#123B75]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >{tab}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCerts.length > 0 ? filteredCerts.map(cert => (
                <div key={cert.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow relative">
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${cert.status === 'Disahkan' ? 'bg-green-500' : cert.status === 'Ditolak' ? 'bg-red-500' : 'bg-orange-400'}`} title={cert.status}></div>
                  <div className="h-32 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                    <FileDigit size={40} className="text-gray-300" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-[#38BDF8] font-semibold mb-1">{cert.category} • {cert.calendarYear}</p>
                    <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{cert.programName}</h4>
                    <div className="mt-auto pt-3 flex items-end justify-between border-t border-gray-50">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600"><span className="font-medium">Peringkat:</span> {cert.level}</p>
                        <p className="text-xs text-gray-600"><span className="font-medium">Pencapaian:</span> {cert.achievement}</p>
                      </div>
                      <button onClick={() => handleDownload(cert)} className="p-2 text-white bg-[#123B75] rounded-lg hover:bg-blue-800 transition-colors shadow-sm" title="Muat Turun">
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                  <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                  <p>Tiada rekod sijil untuk paparan ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-20 text-center">
          <Users size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-xl font-bold text-gray-700">Pilih Murid</h3>
          <p className="text-gray-500 mt-2">Sila buat carian atau pilih nama murid dari senarai di atas.</p>
        </div>
      )}
    </div>
  );
};

// 5. RANKING VIEW
const RankingView = () => {
  const { students, certificates, availableYears } = useContext(AppContext);
  const [filterYear, setFilterYear] = useState(''); // Default: Semua Tahun
  const [filterClass, setFilterClass] = useState(''); // Default: Semua Kelas

  const studentsWithStats = useMemo(() => {
    let activeCerts = certificates.filter(c => c.status === 'Disahkan');
    if (filterYear) activeCerts = activeCerts.filter(c => c.calendarYear === filterYear);
    
    let activeStudents = students;
    if (filterClass) activeStudents = activeStudents.filter(s => s.kelas === filterClass);

    return activeStudents.map(student => {
      const studentCerts = activeCerts.filter(c => c.studentId === student.id);
      
      const counts = { 'Antarabangsa': 0, 'Kebangsaan': 0, 'Negeri': 0, 'Daerah': 0, 'Sekolah': 0 };
      studentCerts.forEach(c => {
        if(counts[c.level] !== undefined) counts[c.level]++;
      });

      return {
        ...student,
        totalCerts: studentCerts.length,
        counts,
        certs: studentCerts
      };
    }).sort((a, b) => {
      // Sort by highest level cascade
      if (b.counts['Antarabangsa'] !== a.counts['Antarabangsa']) return b.counts['Antarabangsa'] - a.counts['Antarabangsa'];
      if (b.counts['Kebangsaan'] !== a.counts['Kebangsaan']) return b.counts['Kebangsaan'] - a.counts['Kebangsaan'];
      if (b.counts['Negeri'] !== a.counts['Negeri']) return b.counts['Negeri'] - a.counts['Negeri'];
      if (b.counts['Daerah'] !== a.counts['Daerah']) return b.counts['Daerah'] - a.counts['Daerah'];
      if (b.counts['Sekolah'] !== a.counts['Sekolah']) return b.counts['Sekolah'] - a.counts['Sekolah'];
      return 0; // tie
    });
  }, [students, certificates, filterYear, filterClass]);

  const top3 = studentsWithStats.slice(0, 3);
  const rest = studentsWithStats.slice(3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Prestasi & Ranking Murid</h2>
        <div className="flex gap-2">
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="p-2 border border-gray-200 rounded-lg outline-none bg-white shadow-sm">
            <option value="">Semua Tahun</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="p-2 border border-gray-200 rounded-lg outline-none bg-white shadow-sm">
            <option value="">Semua Kelas</option>
            <option value="Tahun 4">Tahun 4</option>
            <option value="Tahun 5">Tahun 5</option>
            <option value="Tahun 6">Tahun 6</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center mb-8">
        <h3 className="font-bold text-gray-700 mb-6">Top 3 Pencapaian Tertinggi</h3>
        <div className="flex justify-center items-end gap-2 md:gap-6 h-48 mt-8">
          {/* Posisi 2 */}
          {top3[1] && (
            <div className="flex flex-col items-center w-24 md:w-32">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2 font-bold text-gray-600">2</div>
              <p className="text-sm font-bold truncate w-full text-center">{top3[1].nama}</p>
              <div className="w-full bg-gray-200 h-24 rounded-t-lg flex items-center justify-center mt-2 shadow-inner">
                <Medal className="text-gray-400" size={32}/>
              </div>
            </div>
          )}
          {/* Posisi 1 */}
          {top3[0] && (
            <div className="flex flex-col items-center w-28 md:w-36 z-10">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2 font-bold text-yellow-600 border-2 border-yellow-400 shadow-md"><Trophy size={28}/></div>
              <p className="text-sm font-bold truncate w-full text-center">{top3[0].nama}</p>
              <div className="w-full bg-yellow-300 h-32 rounded-t-lg flex items-center justify-center mt-2 shadow-inner">
                <p className="font-black text-yellow-700 text-xl">1</p>
              </div>
            </div>
          )}
          {/* Posisi 3 */}
          {top3[2] && (
            <div className="flex flex-col items-center w-24 md:w-32">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 font-bold text-orange-600">3</div>
              <p className="text-sm font-bold truncate w-full text-center">{top3[2].nama}</p>
              <div className="w-full bg-orange-200 h-20 rounded-t-lg flex items-center justify-center mt-2 shadow-inner">
                <Award className="text-orange-500" size={32}/>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="font-bold text-gray-700 p-4 border-b border-gray-50">Senarai Lengkap Kedudukan Murid</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 w-16 text-center font-semibold text-gray-600">#</th>
                <th className="p-4 font-semibold text-gray-600">Nama Murid</th>
                <th className="p-4 font-semibold text-gray-600">Kelas</th>
                <th className="p-4 text-center font-semibold text-gray-600">Jumlah Sijil Disahkan</th>
                <th className="p-4 font-semibold text-gray-600">Maklumat Sijil</th>
              </tr>
            </thead>
            <tbody>
              {studentsWithStats.map((student, idx) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 text-center font-bold text-gray-400">{idx + 1}</td>
                  <td className="p-4 font-medium text-gray-800">{student.nama}</td>
                  <td className="p-4 text-gray-600">{student.kelas}</td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-3 py-1 bg-[#123B75] text-white rounded-full text-sm font-bold">{student.totalCerts}</span>
                  </td>
                  <td className="p-4">
                    {student.certs.length > 0 ? (
                      <div className="space-y-2">
                        {student.certs.map(cert => (
                          <div key={cert.id} className="text-xs bg-gray-50 p-2 rounded border border-gray-100">
                            <p className="font-bold text-gray-700">{cert.programName}</p>
                            <p className="text-gray-500">{cert.level} • {cert.achievement}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Tiada sijil disahkan</span>
                    )}
                  </td>
                </tr>
              ))}
              {studentsWithStats.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Tiada data murid untuk penapis ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 6. STUDENT MANAGEMENT (ADMIN)
const StudentManagementView = () => {
  const { students, addStudents, deleteStudent } = useContext(AppContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ id_murid: '', nama: '' });

  // Fungsi muat turun templat CSV murid yang mengandungi senarai ID & Nama Murid
  const downloadStudentTemplate = () => {
    let csvContent = "ID_Murid,Nama_Murid\n";
    if (students.length > 0) {
      students.forEach(s => {
        csvContent += `${s.id_murid},"${s.nama}"\n`;
      });
    } else {
      csvContent += "M001,Ahmad bin Abu\nM002,Siti Aminah\n";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Template_Murid_PAJSK.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n');
        const newEntries = lines.map((line, index) => {
          const parts = line.split(',');
          if (parts.length >= 2) {
            return {
              id: Date.now().toString() + index,
              id_murid: parts[0].trim(),
              nama: parts[1].replace(/"/g, '').trim(),
              kelas: 'Belum Ditetapkan',
              status: 'Aktif'
            };
          }
          return null;
        }).filter(Boolean);
        
        if (newEntries.length > 0) {
          addStudents(newEntries);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    if (newStudent.id_murid && newStudent.nama) {
      addStudents([{
        id: Date.now().toString(),
        id_murid: newStudent.id_murid,
        nama: newStudent.nama,
        kelas: 'Belum Ditetapkan',
        status: 'Aktif'
      }]);
      setNewStudent({ id_murid: '', nama: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Pengurusan Murid</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={downloadStudentTemplate} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors shadow-sm">
            <Download size={18} /> Muat Turun Templat
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#123B75] text-white rounded-lg hover:bg-blue-900 transition-colors">
            <Plus size={18} /> Tambah Murid
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-[#38BDF8] text-white rounded-lg hover:bg-sky-500 transition-colors cursor-pointer shadow-sm">
            <Upload size={18} /> Muat Naik CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600">ID Murid</th>
                <th className="p-4 font-semibold text-gray-600">Nama Penuh</th>
                <th className="p-4 font-semibold text-gray-600 text-center w-24">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 text-gray-600 font-mono">{student.id_murid}</td>
                  <td className="p-4 font-medium text-gray-800">{student.nama}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => deleteStudent(student.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Padam Murid">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="3" className="p-8 text-center text-gray-500">Tiada rekod murid.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Murid Manual */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Murid Secara Manual">
        <form onSubmit={handleAddManual} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Murid</label>
            <input required type="text" value={newStudent.id_murid} onChange={e => setNewStudent({...newStudent, id_murid: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#38BDF8]" placeholder="Cth: M005" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh</label>
            <input required type="text" value={newStudent.nama} onChange={e => setNewStudent({...newStudent, nama: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#38BDF8]" placeholder="Cth: Aminuddin Baki" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">Batal</button>
            <button type="submit" className="px-4 py-2 bg-[#123B75] text-white rounded-lg">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// 7. USER MANAGEMENT (ADMIN)
const UserManagementView = () => {
  const { usersList, addUser, deleteUserFromList } = useContext(AppContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', nama: '', peranan: 'parent' });

  const roleLabels = {
    'admin': 'Pentadbir PAJSK',
    'verifier': 'Guru Pengesah',
    'teacher': 'Guru Kelas',
    'parent': 'Ibu Bapa / Penjaga'
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    if (newUser.nama && newUser.peranan && newUser.username && newUser.password) {
      addUser(newUser);
      setNewUser({ username: '', password: '', nama: '', peranan: 'parent' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Pengurusan Pengguna</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#123B75] text-white rounded-lg hover:bg-blue-900 transition-colors shadow-sm">
            <Plus size={18} /> Tambah Pengguna
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600">ID Pengguna</th>
                <th className="p-4 font-semibold text-gray-600">Nama Pengguna</th>
                <th className="p-4 font-semibold text-gray-600">Peranan</th>
                <th className="p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-center w-24">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 text-gray-600 font-mono">{u.username}</td>
                  <td className="p-4 font-medium text-gray-800">{u.nama}</td>
                  <td className="p-4 text-gray-600">
                    <span className={`inline-block px-2 py-1 text-xs rounded-md font-medium ${
                      u.peranan === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.peranan === 'verifier' ? 'bg-[#38BDF8]/20 text-[#123B75]' :
                      u.peranan === 'teacher' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {roleLabels[u.peranan]}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">{u.status}</span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => deleteUserFromList(u.id)} 
                      disabled={u.peranan === 'admin'} // Halang padam admin
                      className={`p-2 rounded-lg transition-colors ${u.peranan === 'admin' ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`} 
                      title={u.peranan === 'admin' ? 'Tidak boleh padam Admin' : 'Padam Pengguna'}
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Tiada rekod pengguna.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Pengguna Manual */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Pengguna Baharu">
        <form onSubmit={handleAddManual} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh</label>
            <input required type="text" value={newUser.nama} onChange={e => setNewUser({...newUser, nama: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#38BDF8]" placeholder="Cth: Cikgu Nora" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Pengguna (Username)</label>
            <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#38BDF8]" placeholder="Cth: nora123" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan</label>
            <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#38BDF8]" placeholder="Masukkan kata laluan" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peranan Akses</label>
            <select required value={newUser.peranan} onChange={e => setNewUser({...newUser, peranan: e.target.value})} className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:border-[#38BDF8]">
              <option value="parent">Ibu Bapa / Penjaga</option>
              <option value="teacher">Guru Kelas / Penasihat</option>
              <option value="verifier">Guru Pengesah</option>
              <option value="admin">Pentadbir PAJSK</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">Batal</button>
            <button type="submit" className="px-4 py-2 bg-[#123B75] text-white rounded-lg shadow-sm">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// --- MAIN LAYOUT & ROUTING ---
const MainApp = () => {
  const { user, login, logout, usersList } = useContext(AppContext);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const foundUser = usersList.find(u => u.username === loginUsername && u.password === loginPassword);
    if (foundUser) {
      login(foundUser.peranan, foundUser.nama);
      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('ID Pengguna atau Kata Laluan tidak sah.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#123B75] rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[#123B75]">e-SIJIL PAJSK</h1>
            <p className="text-gray-500 text-sm mt-1">SK FELDA SG KEMAHAL</p>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Pengguna</label>
              <input 
                required 
                type="text" 
                value={loginUsername} 
                onChange={e => setLoginUsername(e.target.value)} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#38BDF8]" 
                placeholder="Contoh: admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan</label>
              <input 
                required 
                type="password" 
                value={loginPassword} 
                onChange={e => setLoginPassword(e.target.value)} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#38BDF8]" 
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full p-3 bg-[#123B75] text-white rounded-xl hover:bg-blue-900 transition-all font-bold shadow-md mt-4">
              Log Masuk
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800">
            <p className="font-bold mb-2">Maklumat Log Masuk Demonstrasi (Kata Laluan: 123):</p>
            <ul className="space-y-1">
              <li>• Pentadbir: <span className="font-semibold">admin</span></li>
              <li>• Guru Pengesah: <span className="font-semibold">pengesah</span></li>
              <li>• Guru Kelas: <span className="font-semibold">guru</span></li>
              <li>• Ibu Bapa: <span className="font-semibold">bapa</span></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'verifier', 'teacher'] },
    { id: 'submit', label: 'Hantar Sijil', icon: FileText, roles: ['parent', 'teacher', 'admin'] },
    { id: 'verify', label: 'Pengesahan Sijil', icon: CheckSquare, roles: ['verifier', 'admin'] },
    { id: 'profile', label: 'Profil Murid', icon: User, roles: ['parent', 'teacher', 'verifier', 'admin'] },
    { id: 'ranking', label: 'Prestasi & Ranking', icon: Trophy, roles: ['teacher', 'verifier', 'admin'] },
    { id: 'students', label: 'Pengurusan Murid', icon: Users, roles: ['admin'] },
    { id: 'users-manage', label: 'Pengurusan Pengguna', icon: UserCog, roles: ['admin'] },
  ].filter(m => m.roles.includes(user.role));

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <DashboardView />;
      case 'submit': return <SubmitCertView />;
      case 'verify': return <VerificationView />;
      case 'profile': return <StudentProfileView />;
      case 'ranking': return <RankingView />;
      case 'students': return <StudentManagementView />;
      case 'users-manage': return <UserManagementView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-64 bg-[#123B75] text-white flex-col fixed h-full z-10">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold flex items-center gap-2"><Award className="text-[#38BDF8]" /> e-SIJIL PAJSK</h1>
          <p className="text-xs text-blue-200 mt-1">SK FELDA SG KEMAHAL</p>
        </div>
        <div className="p-4 flex-1">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${activeMenu === item.id ? 'bg-[#38BDF8] text-white shadow-md' : 'text-blue-100 hover:bg-blue-800 hover:text-white'}`}
                >
                  <item.icon size={18} /> {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-sm font-bold">{user.name.charAt(0)}</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-blue-300 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-800 rounded-lg hover:bg-blue-900 transition-colors text-sm">
            <LogOut size={16} /> Log Keluar
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar Mobile */}
        <div className="md:hidden bg-[#123B75] text-white p-4 flex justify-between items-center sticky top-0 z-20 shadow-md">
          <h1 className="font-bold">e-SIJIL PAJSK</h1>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#123B75] text-white fixed top-[60px] left-0 right-0 bottom-0 z-20 overflow-y-auto">
            <ul className="p-4 space-y-2">
              {menuItems.map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => { setActiveMenu(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${activeMenu === item.id ? 'bg-[#38BDF8]' : 'hover:bg-blue-800'}`}
                  >
                    <item.icon size={18} /> {item.label}
                  </button>
                </li>
              ))}
              <li className="pt-4 border-t border-blue-800 mt-4">
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-blue-800">
                  <LogOut size={18} /> Log Keluar
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Page Content */}
        <div className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}