"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadInvoice = exports.generateInvoice = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const generate_invoice_1 = __importDefault(require("../model/generate-invoice"));
const manage_invoices_1 = __importDefault(require("../model/manage-invoices"));
const PAGE_SIZE = 'A5'; //You should specifiy the invoice page size.
const LOGO_PATH = 'helper/imgs/logo.png'; //You insert the logo path like this.
const COMPANY_NAME = 'dyson'; //You should write the company name.
const COMPANY_SLOGAN = 'For trading'; //You should write the company slogan.
const S3APIVERSION = '2006-03-01'; //Keep it like this. DO NOT CHANGE IT.
const S3REGION = 'insert your region here'; //You should write where your s3 bucket is located.
const S3ACCESSKEYID = 'insert your access key here'; //You should write access key id for your/company aws account. BEST TO USE IT AS ENVIRONMENT VARIABLE.
const S3SECRETACCESSKEY = 'insert your secret access key here'; //You should write the secret access key for your/company aws account. BEST TO USE IT AS ENVIRONMENT VARIABLE.
const S3BUCKETNAME = 'insert your bucket name here'; //You should write the bucket name of your/company aws account. BEST TO USE IT AS ENVIRONMENT VARIABLE.
const generateInvoice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //You may deal with your database here to store/retrieve your items;
    const { status, existBillNo, listItems } = req.body; //To fetch the status of the payment 1- paid 2- returned;
    const billNo = Math.ceil(Math.random() * 10000000000); //To create a random unique bill number consists of 10 numbers.
    let items = [];
    if (existBillNo) {
        /**
         * If theres is existed bill number meaning that the invoice needed to be modified,
         * then you need to bring the purchased items from your database,
         * and update the items list that will be updated in the updated invoice pdf
         */
        //This is an example of dummy items retrieved from file called dummyItems to simulate database
        const retrievedItems = yield promises_1.default.readFile(process.cwd() + '/dummyItems.json', { encoding: 'utf8' });
        items = JSON.parse(retrievedItems);
    }
    else {
        /**
         * If there is no exist bill number meaning that the invoice will be generated for the first time,
         * then you need to arrange items list to be inserted in the invoice pdf.
         */
        if (listItems != undefined) {
            items = listItems;
        }
    }
    const invoice = new generate_invoice_1.default(PAGE_SIZE, LOGO_PATH, COMPANY_NAME, COMPANY_SLOGAN, existBillNo || billNo, new Date().toLocaleDateString(), status);
    const response = yield invoice.generateInvoice(items, S3APIVERSION, S3REGION, S3ACCESSKEYID, S3SECRETACCESSKEY, S3BUCKETNAME);
    return res.json(response);
});
exports.generateInvoice = generateInvoice;
const downloadInvoice = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //Here if you want to download the invoice
    const { billNo } = req.body;
    const s3Client = new manage_invoices_1.default(S3APIVERSION, S3REGION, S3ACCESSKEYID, S3SECRETACCESSKEY, S3BUCKETNAME);
    const downloadResponse = yield s3Client.downloadInvoice(res, billNo);
    return res.json(downloadResponse);
});
exports.downloadInvoice = downloadInvoice;
