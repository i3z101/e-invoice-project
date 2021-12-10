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
const pdfkit_1 = __importDefault(require("pdfkit"));
const svg_to_pdfkit_1 = __importDefault(require("svg-to-pdfkit"));
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const qrcode_1 = __importDefault(require("qrcode"));
const manage_invoices_1 = __importDefault(require("./manage-invoices"));
class Invoice {
    constructor(pageSize, logoPath, companyName, slogan, billNo, billDate, billStatus) {
        this.total = 0;
        this.FONT_PATH = "helper/fonts/";
        this.REGULAR = this.FONT_PATH + 'Lato-Regular.ttf';
        this.ITALIC = this.FONT_PATH + 'Lato-Italic.ttf';
        this.BOLD = this.FONT_PATH + 'Lato-Bold.ttf';
        this.BOLD_ITALIC = this.FONT_PATH + 'Lato-BoldItalic.ttf';
        this.COLOR = '#000957';
        this.FILE_PATH = `${process.cwd()}/invoices/`;
        this.MAX_ITEMS_PER_PAGE = 10;
        this.generateInvoiceLogo = (fromX, fromY, imageOptions) => {
            this.doc.image(this.logoPath, fromX, fromY, imageOptions);
        };
        this.generateLine = (fromY, dash, dashLength, space) => {
            if (!dash) {
                this.doc.lineCap('butt')
                    .moveTo(10, fromY)
                    .lineTo(400, fromY)
                    .stroke();
            }
            else {
                this.doc.lineCap('butt')
                    .moveTo(10, fromY)
                    .lineTo(400, fromY)
                    .dash(dashLength, { space: space })
                    .stroke();
            }
        };
        this.generateText = (fontSize, font, text, fromX, fromY, textOptions) => {
            this.doc.fontSize(fontSize)
                .font(font)
                .fillColor(this.COLOR)
                .text(text, fromX, fromY, textOptions);
        };
        this.generateInvoiceTable = () => {
            this.generateText(15, this.BOLD_ITALIC, 'No', 30, 155);
            this.generateText(15, this.BOLD_ITALIC, 'Item', 80, 155, {
                width: 100
            });
            this.generateText(15, this.BOLD_ITALIC, 'Qnty', 180, 155);
            this.generateText(15, this.BOLD_ITALIC, 'Price', 270, 155);
        };
        this.generateInvoiceHeader = () => {
            this.generateInvoiceLogo(50, 30, { width: 100 });
            this.generateText(25, this.BOLD, this.companyName, 0, 35, {
                align: 'right'
            });
            this.generateText(7, this.REGULAR, this.slogan, 0, 60, {
                align: 'right'
            });
            this.generateLine(75, false);
            this.generateText(12, this.BOLD_ITALIC, `Bill No: ${this.billNo}`, 50, 80);
            this.generateText(12, this.REGULAR, 'Status:', 50, 105);
            this.generateText(14, this.BOLD, this.billStatus, 88, 105);
            this.generateText(13, this.ITALIC, `Date: ${this.billDate}`, 0, 80, {
                align: 'right'
            });
        };
        this.generateInvoiceBody = (items) => {
            const ITEMS_LENGTH = items.length;
            const PAGE_NUMBERS = Math.ceil(ITEMS_LENGTH / 11);
            let fromUp = 155;
            if (PAGE_NUMBERS == 1) {
                items.map((item, idx) => {
                    fromUp += 25;
                    this.generateLine(fromUp, true, 1, 1);
                    this.generateText(10, this.ITALIC, (idx + 1).toString(), 30, fromUp + 5);
                    this.generateText(10, this.ITALIC, item.item, 80, fromUp + 5, {
                        width: 100
                    });
                    this.generateText(10, this.ITALIC, `${item.qnty.toString()} X ${item.pricePerUnit}`, 180, fromUp + 5);
                    this.generateText(10, this.BOLD_ITALIC, `${(item.qnty * item.pricePerUnit).toFixed(2).toString()} SR`, 270, fromUp + 5);
                    this.total += item.qnty * item.pricePerUnit;
                });
            }
            else {
                items.map((item, idx) => {
                    fromUp += 25;
                    this.generateLine(fromUp, true, 1, 1);
                    this.generateText(10, this.ITALIC, (idx + 1).toString(), 30, fromUp + 5);
                    this.generateText(10, this.ITALIC, item.item, 80, fromUp + 5, {
                        width: 100
                    });
                    this.generateText(10, this.ITALIC, `${item.qnty.toString()} X ${item.pricePerUnit}`, 180, fromUp + 5);
                    this.generateText(10, this.BOLD_ITALIC, `${(item.qnty * item.pricePerUnit).toFixed(2).toString()} SR`, 270, fromUp + 5);
                    if ((idx + 1) % this.MAX_ITEMS_PER_PAGE == 0) {
                        fromUp = 155;
                        this.doc.addPage();
                        this.generateInvoiceLogo(50, 30, { width: 100 });
                        this.generateInvoiceHeader();
                        this.generateInvoiceTable();
                        this.generateLine(560, true, 0.000001, 0);
                        this.generateInvoiceLogo(50, 563, { width: 20 });
                    }
                    this.total += item.qnty * item.pricePerUnit;
                });
            }
            ;
        };
        this.generateQRCode = () => __awaiter(this, void 0, void 0, function* () {
            const qrcode = yield qrcode_1.default.toString(`https://e-invoice-test.s3.me-south-1.amazonaws.com/${this.billNo}.pdf`, { type: 'svg', width: 120 });
            return qrcode;
        });
        this.generateInvoiceFooter = () => __awaiter(this, void 0, void 0, function* () {
            this.generateText(15, this.REGULAR, "Total:", 50, 450);
            this.generateText(16, this.BOLD, `${this.total.toFixed(2).toString()} SR`, 90, 450);
        });
        this.generateInvoice = (items, s3ApiVersion, s3Region, s3AccessKeyId, s3SecretAccessKey, s3BucketName) => __awaiter(this, void 0, void 0, function* () {
            try {
                const FULL_FILE_PATH = `${this.FILE_PATH}${this.billNo}.pdf`;
                let response;
                const stream = fs_1.default.createWriteStream(FULL_FILE_PATH);
                this.doc.pipe(stream);
                this.generateInvoiceHeader();
                this.generateInvoiceTable();
                this.generateInvoiceBody(items);
                this.generateInvoiceFooter();
                (0, svg_to_pdfkit_1.default)(this.doc, yield this.generateQRCode(), 150, 470);
                this.doc.end();
                const isInvoiceExist = fs_1.default.existsSync(FULL_FILE_PATH);
                const s3Invoice = new manage_invoices_1.default(s3ApiVersion, s3Region, s3AccessKeyId, s3SecretAccessKey, s3BucketName);
                if (isInvoiceExist) {
                    const invoice = yield promises_1.default.readFile(FULL_FILE_PATH);
                    response = yield s3Invoice.uploadInvoice(invoice, this.billNo);
                    // We delete the generated invoice from our server since it is uploaded in the cloud.
                    yield promises_1.default.unlink(this.FILE_PATH + this.billNo + '.pdf');
                }
                else {
                    response = {
                        message: 'No file has been found',
                        statusCode: 404
                    };
                    throw response;
                }
                return response;
            }
            catch (err) {
                return {
                    message: err.message,
                    statusCode: err.statusCode || 500
                };
            }
        });
        this.pageSize = pageSize;
        this.logoPath = logoPath;
        this.companyName = companyName;
        this.slogan = slogan;
        this.billNo = billNo;
        this.billDate = billDate;
        this.billStatus = billStatus;
        this.doc = new pdfkit_1.default({ size: this.pageSize });
    }
}
exports.default = Invoice;
