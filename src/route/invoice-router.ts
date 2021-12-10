import express, {NextFunction, Request, Response} from 'express';
import { generateInvoice, downloadInvoice } from '../controller/invoice-controller';



const router = express.Router();


router.post('/generate-invoice', generateInvoice)


router.get('/download-invoice', downloadInvoice)



export default router;