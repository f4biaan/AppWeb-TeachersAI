const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Ruta para sobrescribir el archivo CSV
app.post('/save-csv', (req, res) => {
  const csvData = req.body.csvData;
  const filePath = path.join(__dirname, 'public/results - first 5.csv');

  fs.writeFile(filePath, csvData, 'utf8', (err) => {
    if (err) {
      console.error('Error al escribir el archivo CSV:', err);
      return res.status(500).send('Error al escribir el archivo CSV');
    }
    res.send('Archivo CSV actualizado exitosamente');
  });
});

// Ruta para servir el archivo CSV actualizado
app.get('/get-csv', (req, res) => {
  const filePath = path.join(__dirname, 'public/results - first 5.csv');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo CSV:', err);
      return res.status(500).send('Error al leer el archivo CSV');
    }
    res.send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
