import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

export default function App() {
  const [msg, setMsg] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      try {
        // 1) chiedi SAS token
        const { data } = await axios.get(`/api/upload?name=${encodeURIComponent(file.name)}`);
        // 2) carica il file sul Blob
        await axios.put(data.url, file, {
          headers: { 'x-ms-blob-type': 'BlockBlob', 'Content-Type': file.type || 'application/octet-stream' }
        });
        setMsg(`✔️ ${file.name} caricato`);
      } catch (err) {
        console.error(err);
        setMsg(`❌ Errore caricamento ${file.name}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="App">
      <h2>Upload sicuro su Azure Blob</h2>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Rilascia qui…</p> : <p>Trascina o clicca per scegliere un file</p>}
      </div>
      {msg && <p>{msg}</p>}
      <a href="/.auth/logout">Logout</a>
    </div>
  );
}
