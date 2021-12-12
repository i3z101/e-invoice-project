import express, {Application} from 'express';
import InvoiceRouter from './route/invoice-router';
const app: Application = express();


app.use(express.json());

app.use('/api/v1', InvoiceRouter);

app.listen(5000, ()=> {
    console.log("Hello from server");
})

export default app;