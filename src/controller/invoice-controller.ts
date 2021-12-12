import { NextFunction, Request, response, Response } from "express";
import fsPromise from "fs/promises";
import { DownloadInvoiceBodyRequestInterface, ItemsInterface, ResponseInterface, UploadInvoiceBodyRequestInterface } from "../interfaces";
import Invoice from "../model/generate-invoice";
import S3Invoice from "../model/manage-invoices";


const PAGE_SIZE:string = 'A5'; //You should specifiy the invoice page size.
const LOGO_PATH:string = 'helper/imgs/logo.png'; //You insert the logo path like this.
const COMPANY_NAME: string = 'dyson'; //You should write the company name.
const COMPANY_SLOGAN: string = 'For trading'; //You should write the company slogan.
const S3APIVERSION: string = '2006-03-01'; //Keep it like this. DO NOT CHANGE IT.
const S3REGION: string = 'me-south-1'; //You should write where your s3 bucket is located.
const S3ACCESSKEYID: string = ''; //You should write access key id for your/company aws account. BEST TO USE IT AS ENVIRONMENT VARIABLE.
const S3SECRETACCESSKEY: string = ''; //You should write the secret access key for your/company aws account. BEST TO USE IT AS ENVIRONMENT VARIABLE.
const S3BUCKETNAME: string = ''; //You should write the bucket name of your/company aws account. BEST TO USE IT AS ENVIRONMENT VARIABLE.


export const generateInvoice =  async (req: Request, res: Response, next: NextFunction): Promise <Response> => {
    try {
        //You may deal with your database here to store/retrieve your items;
        const {status, existBillNo, listItems}: UploadInvoiceBodyRequestInterface = req.body //To fetch the status of the payment 1- paid 2- returned;
        const billNo: number = Math.ceil(Math.random() * 10000000000);//To create a random unique bill number consists of 10 numbers.
        let items: ItemsInterface[] = [];
        let response: ResponseInterface;
        if(!status || !listItems) {
            response = {
                message: "Bill Status OR list items is missing",
                statusCode: 404
            }
            throw response;
        }else if(existBillNo){
            /**
             * If theres is existed bill number meaning that the invoice needed to be modified,
             * then you need to bring the purchased items from your database,
             * and update the items list that will be updated in the updated invoice pdf
             */
    
            //This is an example of dummy items retrieved from file called dummyItems to simulate database
            const retrievedItems = await fsPromise.readFile(process.cwd() + '/dummyItems.json', {encoding:'utf8'});
            items = JSON.parse(retrievedItems);
        }else{
            /**
             * If there is no exist bill number meaning that the invoice will be generated for the first time,
             * then you need to arrange items list to be inserted in the invoice pdf.
             */
            if(listItems != undefined){
                items = listItems;
            }
        }
        const invoice = new Invoice(PAGE_SIZE, LOGO_PATH, COMPANY_NAME, COMPANY_SLOGAN, existBillNo || billNo, new Date().toLocaleDateString(), status);
        response= await invoice.generateInvoice(items);
        return res.json(response);
    }catch(err: any) {
        return res.json(err);
    }
}

export const downloadInvoice = async (req: Request, res: Response, next: NextFunction): Promise<Response>  => {
    try {
        //Here if you want to download the invoice
        const {billNo}: DownloadInvoiceBodyRequestInterface = req.body;
        let respone: ResponseInterface;
        if(!billNo) {
            respone = {
                message: "Bill number is required",
                statusCode: 404
            }
            throw respone
        }
        respone = {
            message: "Correct",
            statusCode: 200
        }
        const s3Client = new S3Invoice(S3APIVERSION, S3REGION, S3ACCESSKEYID, S3SECRETACCESSKEY, S3BUCKETNAME);
        const downloadResponse = await s3Client.downloadInvoice(res, billNo);
        
        return res.json(respone);
    }catch(err) {
        return res.json(err);
    }
}