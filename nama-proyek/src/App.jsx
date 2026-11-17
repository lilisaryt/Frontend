import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/siswa";

const formAwal = {
  kode_siswa: "",
  nama_siswa: "",
  alamat_siswa: "",
  tgl_siswa: "",
  jurusan_siswa: ""
};

function App() {
  const [siswa, setSiswa] = useState([]);
  const [form, setForm] = useState(formAwal);
  const [modeEdit, setModeEdit] = useState(false);
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);

  async function ambilData() {
    try {
      setLoading(true);
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Tidak dapat mengambil data dari server");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("API daftar siswa harus mengembalikan array data siswa.");
      }

      setSiswa(data);
    } catch (error) {
      setPesan(
        `${error.message}. Pastikan backend dan MySQL sudah berjalan.`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    ambilData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((dataLama) => ({
      ...dataLama,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPesan("");

    const url = modeEdit
      ? `${API_URL}/${encodeURIComponent(form.kode_siswa)}`
      : API_URL;

    const method = modeEdit ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const hasil = await response.json();

      if (!response.ok) {
        throw new Error(hasil.message || "Operasi gagal");
      }

      setPesan(hasil.message || "Data berhasil disimpan");
      setForm(formAwal);
      setModeEdit(false);

      await ambilData();
    } catch (error) {
      setPesan(error.message);
    }
  }

  function pilihEdit(item) {
    setForm({
      kode_siswa: item.kode_siswa,
      nama_siswa: item.nama_siswa,
      alamat_siswa: item.alamat_siswa,
      tgl_siswa: String(item.tgl_siswa).slice(0, 10),
      jurusan_siswa: item.jurusan_siswa
    });

    setModeEdit(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function hapusData(kode) {
    const yakin = window.confirm(
      `Yakin ingin menghapus siswa ${kode}?`
    );

    if (!yakin) return;

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(kode)}`,
        {
          method: "DELETE"
        }
      );

      const hasil = await response.json();

      if (!response.ok) {
        throw new Error(hasil.message || "Gagal menghapus data");
      }

      setPesan(hasil.message || "Data berhasil dihapus");

      await ambilData();

      if (form.kode_siswa === kode) {
        batalEdit();
      }
    } catch (error) {
      setPesan(error.message);
    }
  }

  function batalEdit() {
    setForm(formAwal);
    setModeEdit(false);
    setPesan("");
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="eyebrow">APLIKASI AKADEMIK</p>
          <h1>Data Siswa</h1>
          <p className="subjudul">
            Kelola informasi siswa melalui aplikasi CRUD.
          </p>
        </div>

        <div className="total">
          <span>Total Siswa</span>
          <strong>{siswa.length}</strong>
        </div>
      </header>

      {pesan && <div className="pesan">{pesan}</div>}

      <section className="panel">
        <h2>
          {modeEdit ? "Edit Data Siswa" : "Tambah Data Siswa"}
        </h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Kode Siswa
            <input
              name="kode_siswa"
              value={form.kode_siswa}
              onChange={handleChange}
              placeholder="Contoh: S003"
              required
              disabled={modeEdit}
            />
          </label>

          <label>
            Nama Siswa
            <input
              name="nama_siswa"
              value={form.nama_siswa}
              onChange={handleChange}
              placeholder="Masukkan nama siswa"
              required
            />
          </label>

          <label>
            Alamat Siswa
            <input
              name="alamat_siswa"
              value={form.alamat_siswa}
              onChange={handleChange}
              placeholder="Masukkan alamat"
              required
            />
          </label>

          <label>
            Tanggal Siswa
            <input
              type="date"
              name="tgl_siswa"
              value={form.tgl_siswa}
              onChange={handleChange}
              required
            />
          </label>

          <label className="full">
            Jurusan Siswa
            <input
              name="jurusan_siswa"
              value={form.jurusan_siswa}
              onChange={handleChange}
              placeholder="Contoh: Teknik Informatika"
              required
            />
          </label>

          <div className="aksi-form full">
            <button type="submit" className="btn utama">
              {modeEdit ? "Simpan Perubahan" : "Tambah Siswa"}
            </button>

            {modeEdit && (
              <button
                type="button"
                className="btn sekunder"
                onClick={batalEdit}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="judul-tabel">
          <div>
            <h2>Daftar Siswa</h2>
            <p>Data diambil langsung dari database melalui REST API.</p>
          </div>

          <button className="btn sekunder" onClick={ambilData}>
            Muat Ulang
          </button>
        </div>

        {loading ? (
          <p className="kosong">Memuat data...</p>
        ) : siswa.length === 0 ? (
          <p className="kosong">Belum ada data siswa.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Alamat</th>
                  <th>Tanggal</th>
                  <th>Jurusan</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {siswa.map((item) => (
                  <tr key={item.kode_siswa}>
                    <td>{item.kode_siswa}</td>
                    <td>{item.nama_siswa}</td>
                    <td>{item.alamat_siswa}</td>
                    <td>{String(item.tgl_siswa).slice(0, 10)}</td>
                    <td>{item.jurusan_siswa}</td>
                    <td>
                      <div className="aksi-baris">
                        <button
                          className="btn edit"
                          onClick={() => pilihEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn hapus"
                          onClick={() => hapusData(item.kode_siswa)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>
        Praktik Full Stack Web Development · Node.js, Express, MySQL & React
      </footer>
    </main>
  );
}

export default App;