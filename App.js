import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KUNCI_BARANG = '@inventarisku_barang';

export default function App() {
  const [halaman, setHalaman] = useState('home');
  const [barang, setBarang] = useState([]);
  const [nama, setNama] = useState('');
  const [stok, setStok] = useState('');
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    async function muatBarang() {
      try {
        const data = await AsyncStorage.getItem(KUNCI_BARANG);
        if (data !== null) {
          setBarang(JSON.parse(data));
        }
      } catch (error) {
        Alert.alert('Peringatan', 'Data barang gagal dimuat.');
      } finally {
        setSiap(true);
      }
    }

    muatBarang();
  }, []);

  useEffect(() => {
    async function simpanBarang() {
      if (!siap) return;

      try {
        await AsyncStorage.setItem(
          KUNCI_BARANG,
          JSON.stringify(barang)
        );
      } catch (error) {
        Alert.alert('Peringatan', 'Data barang gagal disimpan.');
      }
    }

    simpanBarang();
  }, [barang, siap]);

  function tambahBarang() {
    if (!nama.trim() || !stok.trim()) {
      Alert.alert('Perhatian', 'Nama dan stok harus diisi!');
      return;
    }

    if (!Number.isInteger(Number(stok)) || Number(stok) < 0) {
      Alert.alert('Perhatian', 'Stok harus berupa angka bulat minimal 0.');
      return;
    }

    setBarang((daftarLama) => [
      ...daftarLama,
      {
        id: Date.now().toString(),
        nama: nama.trim(),
        stok: Number(stok),
      },
    ]);

    setNama('');
    setStok('');
    setHalaman('daftar');
    Alert.alert('Berhasil', 'Barang berhasil ditambahkan.');
  }

  function hapusBarang(id) {
    setBarang((daftarLama) =>
      daftarLama.filter((item) => item.id !== id)
    );
  }

  function tombol(teks, aksi, warna = '#2563EB') {
    return (
      <TouchableOpacity
        style={[styles.tombol, { backgroundColor: warna }]}
        onPress={aksi}
      >
        <Text style={styles.teksTombol}>{teks}</Text>
      </TouchableOpacity>
    );
  }

  if (!siap) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.keterangan}>Memuat data barang...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.judul}>InventarisKu</Text>

      <View style={styles.menu}>
        {tombol('Beranda', () => setHalaman('home'))}
        {tombol('Daftar Barang', () => setHalaman('daftar'))}
        {tombol('Tambah Barang', () => setHalaman('tambah'))}
      </View>

      {halaman === 'home' && (
        <View style={styles.konten}>
          <Text style={styles.subjudul}>Beranda</Text>
          <Text style={styles.keterangan}>
            Selamat datang di aplikasi InventarisKu.
          </Text>
          <Text style={styles.kartu}>
            Total jenis barang: {barang.length}
          </Text>
          <Text style={styles.kartu}>
            Total stok: {barang.reduce((total, item) => total + item.stok, 0)}
          </Text>
          {tombol('Lihat Daftar Barang', () => setHalaman('daftar'))}
          {tombol('Tambah Barang Baru', () => setHalaman('tambah'))}
        </View>
      )}

      {halaman === 'daftar' && (
        <View style={styles.konten}>
          <Text style={styles.subjudul}>Daftar Barang</Text>
          <FlatList
            data={barang}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.keterangan}>
                Belum ada barang. Silakan tambahkan barang.
              </Text>
            }
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.namaBarang}>{item.nama}</Text>
                  <Text>Stok: {item.stok}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => hapusBarang(item.id)}
                  style={styles.hapus}
                >
                  <Text style={styles.teksTombol}>Hapus</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {tombol('Tambah Barang', () => setHalaman('tambah'))}
        </View>
      )}

      {halaman === 'tambah' && (
        <View style={styles.konten}>
          <Text style={styles.subjudul}>Tambah Barang</Text>

          <Text style={styles.label}>Nama barang</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Buku"
            value={nama}
            onChangeText={setNama}
          />

          <Text style={styles.label}>Jumlah stok</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 10"
            value={stok}
            onChangeText={setStok}
            keyboardType="number-pad"
          />

          {tombol('Simpan Barang', tambahBarang)}
          {tombol('Batal', () => setHalaman('daftar'), '#64748B')}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    paddingTop: 35,
  },
  judul: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#1D4ED8',
    textAlign: 'center',
    marginVertical: 18,
  },
  menu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tombol: {
    padding: 12,
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  teksTombol: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  konten: {
    flex: 1,
    padding: 18,
  },
  subjudul: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#172554',
  },
  keterangan: {
    fontSize: 16,
    marginVertical: 12,
    color: '#475569',
  },
  kartu: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 10,
    marginVertical: 6,
    fontSize: 16,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  namaBarang: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  hapus: {
    backgroundColor: '#DC2626',
    padding: 10,
    borderRadius: 7,
  },
});
