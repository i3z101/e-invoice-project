import PDFdocument from 'pdfkit';
import SVGtoPDF from "svg-to-pdfkit";
import fs from 'fs';
import fsPromise from 'fs/promises';
import QRCode from 'qrcode';
import S3Invoice from './manage-invoices';
import { ImageOptionsInterface, ItemsInterface, ResponseInterface, TextOptionsInterface } from '../interfaces';


class Invoice {
    private pageSize: string;
    private companyName: string;
    private slogan: string;
    private billNo: number;
    private logoPath: string;
    private billDate: string;
    private billStatus: string;
    private total: number = 0;
    private readonly FONT_PATH: string = "helper/fonts/";
    private readonly REGULAR: string = this.FONT_PATH + 'Lato-Regular.ttf';
    private readonly ITALIC: string = this.FONT_PATH + 'Lato-Italic.ttf';
    private readonly BOLD: string = this.FONT_PATH + 'Lato-Bold.ttf';
    private readonly BOLD_ITALIC: string = this.FONT_PATH + 'Lato-BoldItalic.ttf'; 
    private readonly COLOR: string = '#000957';
    private readonly FILE_PATH: string = `${process.cwd()}/invoices/`;
    private readonly MAX_ITEMS_PER_PAGE: number = 10;

    private doc: PDFKit.PDFDocument;
    
    constructor(pageSize: string, logoPath: string, companyName: string , slogan: string, billNo: number, billDate: string, billStatus: string) {
        this.pageSize = pageSize;
        this.logoPath = logoPath;
        this.companyName = companyName;
        this.slogan = slogan;
        this.billNo = billNo;
        this.billDate = billDate;
        this.billStatus = billStatus;
        this.doc = new PDFdocument({size: this.pageSize});
    }

    private generateInvoiceLogo = (fromX: number, fromY: number, imageOptions?: ImageOptionsInterface): void => {
        this.doc.image(this.logoPath, fromX, fromY, imageOptions)
    }

    private generateLine = (fromY: number, dash: boolean, dashLength?: number | any, space?: number | any): void => {
        if(!dash) {
            this.doc.lineCap('butt')
                .moveTo(10, fromY)
                .lineTo(400, fromY)
                .stroke();
        }else {
            this.doc.lineCap('butt')
            .moveTo(10, fromY)
            .lineTo(400, fromY)
            .dash(dashLength, {space: space})
            .stroke();
        }
    }

    private generateText = (fontSize: number, font: string,text:string, fromX: number, fromY: number, textOptions?: TextOptionsInterface): void => {
        this.doc.fontSize(fontSize)
            .font(font)
            .fillColor(this.COLOR)
            .text(text, fromX, fromY, textOptions);
    }

    private generateInvoiceTable = (): void => {

        this.generateText(15, this.BOLD_ITALIC, 'No', 30, 155);
        
        this.generateText(15, this.BOLD_ITALIC, 'Item', 80, 155, {
            width: 100
        });

        this.generateText(15, this.BOLD_ITALIC, 'Qnty', 180, 155);


        this.generateText(15, this.BOLD_ITALIC, 'Price', 270, 155);

    }

    private generateInvoiceHeader = (): void => {

        this.generateInvoiceLogo(50, 30, {width:100});
        
        this.generateText(25, this.BOLD, this.companyName, 0, 35, {
            align: 'right'
        });
        
        this.generateText(7, this.REGULAR, this.slogan, 0, 60, {
            align: 'right'
        })
        
        this.generateLine(75, false);
        
        this.generateText(12, this.BOLD_ITALIC, `Bill No: ${this.billNo}`, 50, 80 )
        
        this.generateText(12, this.REGULAR, 'Status:', 50, 105)
        
        this.generateText(14, this.BOLD, this.billStatus, 88, 105)
        
        this.generateText(13, this.ITALIC, `Date: ${this.billDate}`, 0, 80, {
            align:'right'
        } )
    }

    private generateInvoiceBody = (items: ItemsInterface[]): void => {
        const ITEMS_LENGTH = items.length;
        const PAGE_NUMBERS = Math.ceil(ITEMS_LENGTH / 11);
        let fromUp = 155;
        if(PAGE_NUMBERS == 1) {
            items.map((item, idx):void => {
                fromUp+=25;

                this.generateLine(fromUp, true, 1, 1);

                this.generateText(10, this.ITALIC, (idx+1).toString(), 30, fromUp+5);
                
                this.generateText(10, this.ITALIC, item.item, 80, fromUp+5, {
                    width: 100
                });
                
                this.generateText(10, this.ITALIC, `${item.qnty.toString()} X ${item.pricePerUnit}`, 180, fromUp+5);
                
                this.generateText(10, this.BOLD_ITALIC, `${(item.qnty * item.pricePerUnit).toFixed(2).toString()} SR`, 270, fromUp+5)
               
                this.total += item.qnty * item.pricePerUnit;
            });
        } else {
            items.map((item, idx)=> {
                fromUp+=25;

                this.generateLine(fromUp, true, 1, 1);

                this.generateText(10, this.ITALIC, (idx+1).toString(), 30, fromUp+5);
                
                this.generateText(10, this.ITALIC, item.item, 80, fromUp+5, {
                    width: 100
                });
                
                this.generateText(10, this.ITALIC, `${item.qnty.toString()} X ${item.pricePerUnit}`, 180, fromUp+5);
                
                this.generateText(10, this.BOLD_ITALIC, `${(item.qnty * item.pricePerUnit).toFixed(2).toString()} SR`, 270, fromUp+5)


                if((idx+1) % this.MAX_ITEMS_PER_PAGE == 0) {
                    fromUp = 155;

                    this.doc.addPage()

                    this.generateInvoiceLogo(50,30, {width:100});
                    
                    this.generateInvoiceHeader();

                    this.generateInvoiceTable();
                    
                    this.generateLine(560, true, 0.000001, 0);
                   
                    this.generateInvoiceLogo(50, 563, {width:20});
                    
                }
                this.total += item.qnty * item.pricePerUnit;
        })};
    }

    private generateQRCode = async (): Promise<string> => {
        const qrcode: string =  await QRCode.toString(`https://e-invoice-test.s3.me-south-1.amazonaws.com/${this.billNo}.pdf`, {type:'svg', width:120});
        return qrcode
    }

    private generateInvoiceFooter = async (): Promise<void> => {

        this.generateText(15, this.REGULAR, "Total:", 50, 450);

        this.generateText(16, this.BOLD, `${this.total.toFixed(2).toString()} SR`, 90, 450);

    }
    
    generateInvoice = async (items: ItemsInterface[], toS3: boolean = false, s3ApiVersion?: string, s3Region?: string, s3AccessKeyId?: string, s3SecretAccessKey?: string, s3BucketName?: string): Promise<ResponseInterface> => {
        try {
                const FULL_FILE_PATH: string = `${this.FILE_PATH}${this.billNo}.pdf` 
                let response: ResponseInterface;
                const stream: fs.WriteStream = fs.createWriteStream(FULL_FILE_PATH);
                this.doc.pipe(stream);
                this.generateInvoiceHeader();
                this.generateInvoiceTable();
                this.generateInvoiceBody(items);
                this.generateInvoiceFooter();
                SVGtoPDF(this.doc, await this.generateQRCode(), 150, 470);
                this.doc.end();
                if(toS3) {
                    if(s3ApiVersion  && s3Region  && s3AccessKeyId && s3SecretAccessKey && s3BucketName) {
                        const isInvoiceExist: boolean = fs.existsSync(FULL_FILE_PATH);
                        const s3Invoice = new S3Invoice(s3ApiVersion, s3Region, s3AccessKeyId, s3SecretAccessKey, s3BucketName);
                        if(isInvoiceExist) {
                            const invoice: fsPromise.FileReadOptions['buffer'] = await fsPromise.readFile(FULL_FILE_PATH);
                            response = await s3Invoice.uploadInvoice(invoice, this.billNo);
                            // We delete the generated invoice from our server since it is uploaded in the cloud.
                            await fsPromise.unlink(this.FILE_PATH + this.billNo + '.pdf')
                        }else {
                            response = {
                                message: 'No file has been found',
                                statusCode: 404
                            }
                            throw response
                        }
                        return response;
                    }
                }
                return {
                    message: "File created successfully",
                    statusCode: 201
                }
        }catch(err: any){
            return {
                message : err.message,
                statusCode: err.statusCode || 500
            }
        }
    }   
}


export default Invoice;