require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;
const FILE_PATH = process.env.FILE_PATH;

app.post('/register', async (req, res) => {
    const { nama, expire, ip } = req.body;
    const newData = `<-${nama}-${expire}-${ip}->\n`;

    try {
        // Dapatkan konten file saat ini dari GitHub
        const { data: fileData } = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });

        const sha = fileData.sha;

        // Tambahkan data baru ke konten file
        const updatedContent = fileData.content + newData;
        const encodedContent = Buffer.from(updatedContent).toString('base64');

        // Perbarui file di GitHub
        await axios.put(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            message: 'Update registration data',
            content: encodedContent,
            sha: sha
        }, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });

        res.status(200).send('Registrasi berhasil!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat registrasi.');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log('Server berjalan di port 3000');
});
