import express from 'express';
import cors from 'cors';
import routes from './routes';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: 'Listening...'
    });
})

app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Listening on PORT ${port}`);
});